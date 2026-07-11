#!/usr/bin/env python3
import argparse
import concurrent.futures
import csv
import datetime as dt
import hashlib
import json
import os
import re
import shutil
import sqlite3
import subprocess
import sys
import time
import urllib.error
import urllib.request
import uuid
from pathlib import Path

HOME = Path.home()
RECORDINGS_DIR = HOME / "Library/Group Containers/group.com.apple.VoiceMemos.shared/Recordings"
DB_PATH = RECORDINGS_DIR / "CloudRecordings.db"
ENCRYPTED_DB_PATH = RECORDINGS_DIR / "EncryptedCloudRecordings/EncryptedCloudRecordings.db"
DEFAULT_OUT = HOME / "Documents/voice_memos整理"

ASR_API = "https://api.siliconflow.cn/v1/audio/transcriptions"
SILICONFLOW_CHAT_API = "https://api.siliconflow.cn/v1/chat/completions"
ASR_MODEL = "TeleAI/TeleSpeechASR"
SILICONFLOW_CHAT_MODEL = os.environ.get("SILICONFLOW_CHAT_MODEL")
DEEPSEEK_CHAT_MODEL = os.environ.get("DEEPSEEK_MODEL", "deepseek-chat")


def log(msg):
    print(f"[{dt.datetime.now().strftime('%H:%M:%S')}] {msg}", flush=True)


def get_key():
    for key in ("SF_KEY", "SILICONFLOW_API_KEY"):
        value = os.environ.get(key)
        if value:
            return value
    key_file = HOME / ".config/siliconflow/api_key"
    if key_file.exists():
        return key_file.read_text(encoding="utf-8").strip()
    raise RuntimeError("SiliconFlow API key not found")


def text_model_config():
    if SILICONFLOW_CHAT_MODEL:
        return {
            "provider": "siliconflow",
            "api": SILICONFLOW_CHAT_API,
            "model": SILICONFLOW_CHAT_MODEL,
            "key": get_key(),
        }
    deepseek_key = os.environ.get("DEEPSEEK_V4_API_KEY") or os.environ.get("DEEPSEEK_API_KEY")
    if deepseek_key:
        return {
            "provider": "deepseek",
            "api": os.environ.get("DEEPSEEK_CHAT_API", "https://api.deepseek.com/v1/chat/completions"),
            "model": DEEPSEEK_CHAT_MODEL,
            "key": deepseek_key,
        }
    minimax_key = os.environ.get("MINIMAX3_API_KEY") or os.environ.get("MINIMAX_API_KEY")
    minimax_api = os.environ.get("MINIMAX_CHAT_API")
    minimax_model = os.environ.get("MINIMAX_MODEL")
    if minimax_key and minimax_api and minimax_model:
        return {"provider": "minimax", "api": minimax_api, "model": minimax_model, "key": minimax_key}
    return None


def run(cmd):
    subprocess.run(cmd, check=True)


def jsonl_read(path):
    if not path.exists():
        return []
    out = []
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                out.append(json.loads(line))
    return out


def jsonl_append(path, obj):
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(obj, ensure_ascii=False) + "\n")
        f.flush()


def apple_ts_to_iso(value):
    if value is None:
        return ""
    base = dt.datetime(2001, 1, 1, tzinfo=dt.timezone.utc)
    return (base + dt.timedelta(seconds=float(value))).astimezone().isoformat(timespec="seconds")


def safe_slug(text, limit=48):
    text = re.sub(r"[\\/:*?\"<>|#\n\r\t]+", " ", text or "").strip()
    text = re.sub(r"\s+", " ", text)
    return text[:limit].strip() or "未命名录音"


def record_dir_name(row):
    base = Path(row["path"]).stem
    digest = hashlib.sha1(row["path"].encode("utf-8")).hexdigest()[:8]
    return f"{int(row['pk']):04d}_{base}_{digest}"


def load_manifest(extensions=None):
    extensions = tuple((extensions or ["m4a"]))
    where = " or ".join([f"ZPATH like '%.{ext}'" for ext in extensions])
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    rows = con.execute(
        f"""
        select Z_PK as pk, ZDATE as date, ZDURATION as duration,
               ZCUSTOMLABEL as label, ZPATH as path, ZUNIQUEID as unique_id
        from ZCLOUDRECORDING
        where {where}
        order by ZDATE
        """
    ).fetchall()
    con.close()
    items = []
    for row in rows:
        audio = RECORDINGS_DIR / row["path"]
        if not audio.exists():
            continue
        items.append(
            {
                "pk": row["pk"],
                "date_iso": apple_ts_to_iso(row["date"]),
                "duration": float(row["duration"] or 0),
                "old_label": row["label"] or "",
                "path": row["path"],
                "unique_id": row["unique_id"] or "",
                "audio_path": str(audio),
                "record_dir": record_dir_name(row),
            }
        )
    return items


def write_manifest(out_dir, items):
    manifest = out_dir / "manifest.jsonl"
    manifest.unlink(missing_ok=True)
    for item in items:
        jsonl_append(manifest, item)
    with (out_dir / "manifest.csv").open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=list(items[0].keys()) if items else [])
        writer.writeheader()
        writer.writerows(items)


def ensure_chunks(item, out_dir, segment_seconds):
    rec_dir = out_dir / "records" / item["record_dir"]
    rec_dir.mkdir(parents=True, exist_ok=True)
    chunk_index = rec_dir / "chunks.jsonl"
    existing = sorted(rec_dir.glob("chunk_*.wav"))
    if existing and chunk_index.exists():
        return item["pk"], len(existing)

    tmp_pattern = str(rec_dir / "chunk_%04d.wav")
    cmd = [
        "ffmpeg",
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-i",
        item["audio_path"],
        "-ar",
        "16000",
        "-ac",
        "1",
        "-f",
        "segment",
        "-segment_time",
        str(segment_seconds),
        "-c:a",
        "pcm_s16le",
        tmp_pattern,
    ]
    run(cmd)
    chunks = sorted(rec_dir.glob("chunk_*.wav"))
    chunk_index.unlink(missing_ok=True)
    for chunk in chunks:
        jsonl_append(
            chunk_index,
            {
                "pk": item["pk"],
                "record_dir": item["record_dir"],
                "chunk": chunk.name,
                "chunk_path": str(chunk),
            },
        )
    return item["pk"], len(chunks)


def post_multipart(path, key):
    boundary = "----" + uuid.uuid4().hex
    body = []
    body.append(f"--{boundary}\r\n".encode())
    body.append(b'Content-Disposition: form-data; name="model"\r\n\r\n')
    body.append(ASR_MODEL.encode() + b"\r\n")
    body.append(f"--{boundary}\r\n".encode())
    fname = os.path.basename(path)
    body.append(f'Content-Disposition: form-data; name="file"; filename="{fname}"\r\n'.encode())
    body.append(b"Content-Type: audio/wav\r\n\r\n")
    with open(path, "rb") as f:
        body.append(f.read())
    body.append(b"\r\n")
    body.append(f"--{boundary}--\r\n".encode())
    data = b"".join(body)
    req = urllib.request.Request(ASR_API, data=data, method="POST")
    req.add_header("Authorization", f"Bearer {key}")
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=900) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            err = e.read().decode("utf-8", errors="replace")
            if e.code in (429, 500, 502, 503, 504) and attempt < 5:
                time.sleep(min(90, 5 * (attempt + 1) ** 2))
                continue
            return {"error": f"HTTP {e.code}: {err}"}
        except Exception as e:
            if attempt < 5:
                time.sleep(min(90, 5 * (attempt + 1) ** 2))
                continue
            return {"error": str(e)}
    return {"error": "exhausted retries"}


def transcribe_chunk(chunk_path, key):
    txt_path = chunk_path.with_suffix(".txt")
    if txt_path.exists():
        return str(chunk_path), "skip", txt_path.read_text(encoding="utf-8", errors="replace")
    res = post_multipart(str(chunk_path), key)
    text = res.get("text", "")
    status = "ok"
    if "error" in res:
        text = f"[ERROR] {res['error']}"
        status = "error"
    txt_path.write_text(text, encoding="utf-8")
    return str(chunk_path), status, text


def assemble_transcript(item, out_dir):
    rec_dir = out_dir / "records" / item["record_dir"]
    txts = sorted(rec_dir.glob("chunk_*.txt"))
    full = "\n".join(p.read_text(encoding="utf-8", errors="replace").strip() for p in txts).strip()
    (rec_dir / "full_transcript.txt").write_text(full + "\n", encoding="utf-8")
    return full


def compact_transcript(text, max_chars=12000):
    text = re.sub(r"\s+", " ", text or "").strip()
    if len(text) <= max_chars:
        return text
    head = text[:6000]
    mid_start = max(0, len(text) // 2 - 1500)
    mid = text[mid_start : mid_start + 3000]
    tail = text[-3000:]
    return f"{head}\n...\n{mid}\n...\n{tail}"


def heuristic_summary(text, item):
    clean = re.sub(r"\s+", " ", text or "").strip()
    if not clean or clean.startswith("[ERROR]"):
        return {
            "title": "空白静音录音",
            "note": "转录为空或失败，保留原始时间标题待人工复核。",
            "keywords": [],
            "category": "其他",
        }
    words = re.findall(r"[\u4e00-\u9fff]{2,6}", clean)
    stop = {"然后", "就是", "这个", "那个", "我们", "你们", "他们", "因为", "所以", "但是", "一个", "现在", "还是", "可能", "觉得", "如果"}
    freq = {}
    for w in words:
        if w not in stop:
            freq[w] = freq.get(w, 0) + 1
    kws = [w for w, _ in sorted(freq.items(), key=lambda x: x[1], reverse=True)[:6]]
    minutes = float(item.get("duration") or 0) / 60
    if minutes >= 10 and len(clean) < 180:
        suffix = "".join(kws[:2])[:12] if kws else "少量人声"
        return {
            "title": safe_slug(f"低信息密度-{suffix}", 24),
            "note": f"录音时长约{minutes:.1f}分钟，但可识别文本很少，疑似静音、环境音或零散对话。片段：{clean[:90]}",
            "keywords": kws,
            "category": "其他",
        }
    first = re.split(r"[。！？!?；;]", clean, maxsplit=1)[0][:40]
    title_seed = "".join(kws[:2])[:18] or first or "语音备忘"
    title = safe_slug(title_seed, 18)
    return {"title": title, "note": clean[:120], "keywords": kws, "category": "其他"}


def chat_summary(text, item, key):
    text = compact_transcript(text)
    if not text or text.startswith("[ERROR]"):
        return heuristic_summary(text, item)
    config = text_model_config()
    if not config:
        result = heuristic_summary(text, item)
        result["note"] = (result.get("note") or "") + "（未配置文本模型，已使用启发式摘要。）"
        return result
    clean = re.sub(r"\s+", " ", text or "").strip()
    if float(item.get("duration") or 0) >= 600 and len(clean) < 180:
        return heuristic_summary(clean, item)
    prompt = f"""
你在整理用户自己的语音备忘录。请根据转录内容给出短标题和备注。
要求：
1. title: 中文，8-18字，按内容命名，不要日期、不要"录音"二字、不要引号。
2. note: 中文，40-90字，说明这条备忘录主要讲什么、可用于什么。
3. keywords: 3-6个中文关键词。
4. category: 从这些里面选一个：项目/播客/创作/摄影/生活/关系/学习/工具/其他。
只输出 JSON。

原文件时间标题：{item['old_label']}
时间：{item['date_iso']}
转录：
{text}
""".strip()
    data = json.dumps(
        {
            "model": config["model"],
            "messages": [
                {"role": "system", "content": "你只输出严格 JSON，不输出解释。"},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
            "max_tokens": 300,
        },
        ensure_ascii=False,
    ).encode("utf-8")
    req = urllib.request.Request(config["api"], data=data, method="POST")
    req.add_header("Authorization", f"Bearer {config['key']}")
    req.add_header("Content-Type", "application/json")
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                raw = json.loads(resp.read().decode("utf-8"))
            content = raw["choices"][0]["message"]["content"].strip()
            content = re.sub(r"^```(?:json)?|```$", "", content.strip(), flags=re.I | re.M).strip()
            obj = json.loads(content)
            return {
                "title": safe_slug(obj.get("title", ""), 24),
                "note": (obj.get("note") or "").strip()[:180],
                "keywords": obj.get("keywords") or [],
                "category": obj.get("category") or "其他",
            }
        except Exception:
            if attempt < 4:
                time.sleep(3 * (attempt + 1))
                continue
    return heuristic_summary(text, item)


def dedupe_titles(results):
    seen = {}
    for row in results:
        base = safe_slug(clean_title(row), 24)
        count = seen.get(base, 0) + 1
        seen[base] = count
        row["new_title"] = base if count == 1 else safe_slug(f"{base} {count}", 28)
    return results


def clean_title(row):
    title = row.get("new_title") or ""
    note = row.get("note") or ""
    text = re.sub(r"\s+", "", f"{title}{note}")
    if title.startswith("空白") or title.startswith("低信息密度"):
        return title
    if not text:
        return "空白静音录音"
    filler_chars = set("嗯哦啊呃呐呀嘛好对行额唔哎喂")
    chinese = re.findall(r"[\u4e00-\u9fff]", text)
    if chinese:
        filler_ratio = sum(ch in filler_chars for ch in chinese) / len(chinese)
        if filler_ratio >= 0.65:
            return "零散应答"
    if re.fullmatch(r"[嗯哦啊呃呐呀嘛好对行额唔哎喂0-9 ]+", title):
        return "零散应答"
    return title


def load_done_results(path):
    done = {}
    for row in jsonl_read(path):
        done[int(row["pk"])] = row
    return done


def write_outputs(out_dir, results):
    results = dedupe_titles(sorted(results, key=lambda r: r["date_iso"]))
    csv_path = out_dir / "rename_plan.csv"
    fields = [
        "pk",
        "date_iso",
        "duration",
        "old_label",
        "new_title",
        "category",
        "note",
        "keywords",
        "path",
    ]
    with csv_path.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for row in results:
            out = {k: row.get(k, "") for k in fields}
            out["keywords"] = "、".join(row.get("keywords") or [])
            writer.writerow(out)

    md = ["# 语音备忘录整理备注", ""]
    for row in sorted(results, key=lambda r: r["date_iso"], reverse=True):
        kws = "、".join(row.get("keywords") or [])
        minutes = round(float(row.get("duration") or 0) / 60, 1)
        md.append(f"## {row['new_title']}")
        md.append(f"- 时间：{row['date_iso']}")
        md.append(f"- 时长：{minutes} 分钟")
        md.append(f"- 原标题：{row['old_label']}")
        md.append(f"- 分类：{row.get('category', '其他')}")
        md.append(f"- 关键词：{kws}")
        md.append(f"- 备注：{row.get('note', '')}")
        md.append(f"- 文件：{row['path']}")
        md.append("")
    (out_dir / "notes.md").write_text("\n".join(md), encoding="utf-8")

    compact_path = out_dir / "results.compact.json"
    compact_path.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    return csv_path, out_dir / "notes.md", compact_path


def cmd_run(args):
    key = get_key()
    out_dir = args.out or (DEFAULT_OUT / dt.datetime.now().strftime("%Y%m%d_%H%M%S"))
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "records").mkdir(exist_ok=True)
    latest = DEFAULT_OUT / "latest"
    try:
        latest.unlink(missing_ok=True)
        latest.symlink_to(out_dir)
    except Exception:
        pass

    items = load_manifest(args.extensions)
    if args.pk:
        wanted = {int(x) for x in args.pk}
        items = [item for item in items if int(item["pk"]) in wanted]
    if args.limit:
        items = items[: args.limit]
    if not items:
        raise RuntimeError("no local .m4a voice memos found")
    write_manifest(out_dir, items)
    total_hours = sum(x["duration"] for x in items) / 3600
    log(f"manifest: {len(items)} recordings, {total_hours:.1f} hours, out={out_dir}")

    log("segmenting audio")
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.ffmpeg_workers) as ex:
        futs = [ex.submit(ensure_chunks, item, out_dir, args.segment_seconds) for item in items]
        for i, fut in enumerate(concurrent.futures.as_completed(futs), 1):
            pk, n = fut.result()
            if i % 20 == 0 or i == len(futs):
                log(f"segmented {i}/{len(futs)} latest_pk={pk} chunks={n}")

    chunks = []
    for item in items:
        rec_dir = out_dir / "records" / item["record_dir"]
        chunks.extend(sorted(rec_dir.glob("chunk_*.wav")))
    pending = [p for p in chunks if not p.with_suffix(".txt").exists()]
    log(f"ASR chunks: total={len(chunks)}, pending={len(pending)}, workers={args.asr_workers}")
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.asr_workers) as ex:
        futs = [ex.submit(transcribe_chunk, p, key) for p in pending]
        ok = err = 0
        for i, fut in enumerate(concurrent.futures.as_completed(futs), 1):
            _, status, _ = fut.result()
            ok += status in ("ok", "skip")
            err += status == "error"
            if i % 50 == 0 or i == len(futs):
                log(f"ASR {i}/{len(futs)} ok={ok} err={err}")

    results_path = out_dir / "results.jsonl"
    done = load_done_results(results_path)
    todo = [item for item in items if int(item["pk"]) not in done]
    config = text_model_config()
    model_label = f"{config['provider']}:{config['model']}" if config else "disabled"
    log(f"title/note generation: pending={len(todo)}, workers={args.chat_workers}, model={model_label}")

    def summarize_one(item):
        text = assemble_transcript(item, out_dir)
        summary = chat_summary(text, item, key)
        row = dict(item)
        row.update(
            {
                "new_title": summary["title"],
                "note": summary.get("note", ""),
                "keywords": summary.get("keywords", []),
                "category": summary.get("category", "其他"),
                "transcript_chars": len(text),
            }
        )
        rec_dir = out_dir / "records" / item["record_dir"]
        (rec_dir / "summary.json").write_text(json.dumps(row, ensure_ascii=False, indent=2), encoding="utf-8")
        return row

    with concurrent.futures.ThreadPoolExecutor(max_workers=args.chat_workers) as ex:
        futs = [ex.submit(summarize_one, item) for item in todo]
        for i, fut in enumerate(concurrent.futures.as_completed(futs), 1):
            row = fut.result()
            jsonl_append(results_path, row)
            if i % 20 == 0 or i == len(futs):
                log(f"summarized {i}/{len(futs)}")

    results = list(load_done_results(results_path).values())
    csv_path, notes_path, compact_path = write_outputs(out_dir, results)
    log(f"done outputs: {csv_path}, {notes_path}, {compact_path}")


def cmd_apply_db(args):
    if not args.confirm_live_write:
        raise RuntimeError("refusing to write live Voice Memos database without --confirm-live-write")
    out_dir = args.out or (DEFAULT_OUT / "latest")
    if out_dir.is_symlink():
        out_dir = out_dir.resolve()
    compact_path = out_dir / "results.compact.json"
    if not compact_path.exists():
        raise RuntimeError(f"missing {compact_path}; run processing first")
    rows = json.loads(compact_path.read_text(encoding="utf-8"))
    if not rows:
        raise RuntimeError("empty results")

    backup_dir = out_dir / "db_backups"
    backup_dir.mkdir(exist_ok=True)
    stamp = dt.datetime.now().strftime("%Y%m%d_%H%M%S")
    for db in (DB_PATH, ENCRYPTED_DB_PATH):
        if db.exists():
            shutil.copy2(db, backup_dir / f"{db.name}.{stamp}.bak")
            for suffix in ("-wal", "-shm"):
                side = Path(str(db) + suffix)
                if side.exists():
                    shutil.copy2(side, backup_dir / f"{db.name}{suffix}.{stamp}.bak")
    log(f"database backups written to {backup_dir}")

    con = sqlite3.connect(DB_PATH)
    with con:
        for row in rows:
            title = safe_slug(row["new_title"], 28)
            con.execute(
                """
                update ZCLOUDRECORDING
                   set ZCUSTOMLABEL = ?,
                       ZCUSTOMLABELFORSORTING = ?,
                       Z_OPT = Z_OPT + 1
                 where Z_PK = ?
                """,
                (title, title, int(row["pk"])),
            )
    con.close()
    log(f"updated Voice Memos titles: {len(rows)} rows")


def main():
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="cmd", required=True)

    run_p = sub.add_parser("run")
    run_p.add_argument("--out", type=Path)
    run_p.add_argument("--limit", type=int)
    run_p.add_argument("--pk", action="append", type=int)
    run_p.add_argument("--extensions", nargs="+", default=["m4a"])
    run_p.add_argument("--segment-seconds", type=int, default=300)
    run_p.add_argument("--ffmpeg-workers", type=int, default=int(os.environ.get("FFMPEG_WORKERS", "6")))
    run_p.add_argument("--asr-workers", type=int, default=int(os.environ.get("ASR_WORKERS", "32")))
    run_p.add_argument("--chat-workers", type=int, default=int(os.environ.get("CHAT_WORKERS", "16")))
    run_p.set_defaults(func=cmd_run)

    apply_p = sub.add_parser("apply-db")
    apply_p.add_argument("--out", type=Path)
    apply_p.add_argument("--confirm-live-write", action="store_true")
    apply_p.set_defaults(func=cmd_apply_db)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
