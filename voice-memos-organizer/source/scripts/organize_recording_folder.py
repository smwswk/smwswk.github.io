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
import subprocess
import time
import urllib.error
import urllib.request
import uuid
from pathlib import Path

HOME = Path.home()
ASR_API = "https://api.siliconflow.cn/v1/audio/transcriptions"
SILICONFLOW_CHAT_API = "https://api.siliconflow.cn/v1/chat/completions"
ASR_MODEL = "TeleAI/TeleSpeechASR"
SILICONFLOW_TITLE_MODEL = os.environ.get("SILICONFLOW_TITLE_MODEL")
DEEPSEEK_TITLE_MODEL = os.environ.get("DEEPSEEK_MODEL", "deepseek-chat")
AUDIO_EXTS = {".mp3", ".aac", ".m4a", ".wav", ".qta"}
LOW_INFO_PREFIXES = ("低信息", "零散", "空白", "无效")


def log(msg):
    print(f"[{dt.datetime.now().strftime('%H:%M:%S')}] {msg}", flush=True)


def get_key():
    for name in ("SF_KEY", "SILICONFLOW_API_KEY"):
        value = os.environ.get(name)
        if value:
            return value
    p = HOME / ".config/siliconflow/api_key"
    if p.exists():
        return p.read_text(encoding="utf-8").strip()
    raise RuntimeError("missing SiliconFlow key")


def text_model_config():
    if SILICONFLOW_TITLE_MODEL:
        return {
            "provider": "siliconflow",
            "api": SILICONFLOW_CHAT_API,
            "model": SILICONFLOW_TITLE_MODEL,
            "key": get_key(),
        }
    deepseek_key = os.environ.get("DEEPSEEK_V4_API_KEY") or os.environ.get("DEEPSEEK_API_KEY")
    if deepseek_key:
        return {
            "provider": "deepseek",
            "api": os.environ.get("DEEPSEEK_CHAT_API", "https://api.deepseek.com/v1/chat/completions"),
            "model": DEEPSEEK_TITLE_MODEL,
            "key": deepseek_key,
        }
    minimax_key = os.environ.get("MINIMAX3_API_KEY") or os.environ.get("MINIMAX_API_KEY")
    minimax_api = os.environ.get("MINIMAX_CHAT_API")
    minimax_model = os.environ.get("MINIMAX_MODEL")
    if minimax_key and minimax_api and minimax_model:
        return {"provider": "minimax", "api": minimax_api, "model": minimax_model, "key": minimax_key}
    return None


def jsonl_append(path, obj):
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(obj, ensure_ascii=False) + "\n")
        f.flush()


def jsonl_map(path, key="id"):
    out = {}
    if not path.exists():
        return out
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.strip():
            obj = json.loads(line)
            out[obj[key]] = obj
    return out


def safe_slug(text, limit=36):
    text = re.sub(r"[\\/:*?\"<>|#\n\r\t]+", " ", text or "").strip()
    text = re.sub(r"\s+", "", text)
    text = re.sub(r"^[，。！？、,.!?]+", "", text)
    return (text[:limit] or "未命名").strip()


def compact_text(text, max_chars=9000):
    text = re.sub(r"\s+", " ", text or "").strip()
    if len(text) <= max_chars:
        return text
    return text[:4500] + "\n...\n" + text[-4500:]


def parse_datetime(stem):
    patterns = [
        r"(20\d{6})[_ -]?(\d{6})",
        r"(20\d{2})(\d{2})(\d{2})[_ -]?(\d{2})(\d{2})(\d{2})",
    ]
    m = re.search(patterns[0], stem)
    if m:
        return f"{m.group(1)}_{m.group(2)}"
    m = re.search(patterns[1], stem)
    if m:
        return f"{m.group(1)}{m.group(2)}{m.group(3)}_{m.group(4)}{m.group(5)}{m.group(6)}"
    return ""


def ffprobe_duration(path):
    try:
        raw = subprocess.check_output(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                str(path),
            ],
            text=True,
            stderr=subprocess.DEVNULL,
        ).strip()
        return float(raw or 0)
    except Exception:
        return 0.0


def docx_text(path):
    try:
        return subprocess.check_output(
            ["textutil", "-convert", "txt", "-stdout", str(path)],
            text=True,
            stderr=subprocess.DEVNULL,
        )
    except Exception:
        return ""


def extract_transcript(text):
    if "转录全文" in text:
        return text.split("转录全文", 1)[1].strip()
    if "内容摘要" in text:
        return text.split("内容摘要", 1)[1].strip()
    return text.strip()


def scan(root):
    people_root = root / "按人物"
    if not people_root.exists():
        raise RuntimeError(f"missing directory: {people_root}")
    items = []
    for person_dir in sorted([p for p in people_root.iterdir() if p.is_dir()]):
        for audio in sorted([p for p in person_dir.iterdir() if p.suffix.lower() in AUDIO_EXTS]):
            docx = audio.with_suffix(".docx")
            rel = audio.relative_to(root)
            digest = hashlib.sha1(str(rel).encode("utf-8")).hexdigest()[:10]
            stamp = parse_datetime(audio.stem)
            items.append(
                {
                    "id": digest,
                    "person": person_dir.name,
                    "date_key": stamp,
                    "audio_path": str(audio),
                    "docx_path": str(docx) if docx.exists() else "",
                    "old_name": audio.name,
                    "old_stem": audio.stem,
                    "ext": audio.suffix.lower(),
                    "duration": ffprobe_duration(audio),
                    "rel_path": str(rel),
                }
            )
    return items


def run_cmd(cmd):
    subprocess.run(cmd, check=True)


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
    req = urllib.request.Request(ASR_API, data=b"".join(body), method="POST")
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


def transcribe_audio(item, rec_dir, key, segment_seconds=300):
    chunks_dir = rec_dir / "chunks"
    chunks_dir.mkdir(parents=True, exist_ok=True)
    if not list(chunks_dir.glob("chunk_*.wav")):
        run_cmd(
            [
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
                str(chunks_dir / "chunk_%04d.wav"),
            ]
        )
    parts = []
    for chunk in sorted(chunks_dir.glob("chunk_*.wav")):
        txt = chunk.with_suffix(".txt")
        if txt.exists():
            parts.append(txt.read_text(encoding="utf-8", errors="replace").strip())
            continue
        res = post_multipart(chunk, key)
        text = res.get("text", "")
        if "error" in res:
            text = f"[ERROR] {res['error']}"
        txt.write_text(text, encoding="utf-8")
        parts.append(text.strip())
    return "\n".join(parts).strip()


def write_docx_from_text(docx_path, audio_name, transcript):
    txt_path = docx_path.with_suffix(".txt")
    body = f"{audio_name}\n生成时间：{dt.datetime.now().strftime('%Y-%m-%d %H:%M')}\n音频文件：{audio_name}\n\n转录全文\n{transcript}\n"
    txt_path.write_text(body, encoding="utf-8")
    try:
        subprocess.run(["textutil", "-convert", "docx", "-output", str(docx_path), str(txt_path)], check=True)
        txt_path.unlink(missing_ok=True)
    except Exception:
        pass


def transcript_for(item, out_dir, key):
    rec_dir = out_dir / "records" / item["id"]
    rec_dir.mkdir(parents=True, exist_ok=True)
    transcript_path = rec_dir / "transcript.txt"
    if transcript_path.exists():
        return transcript_path.read_text(encoding="utf-8", errors="replace")
    if item["docx_path"]:
        text = extract_transcript(docx_text(Path(item["docx_path"])))
    else:
        text = transcribe_audio(item, rec_dir, key)
        docx_path = Path(item["audio_path"]).with_suffix(".docx")
        write_docx_from_text(docx_path, Path(item["audio_path"]).name, text)
        item["docx_path"] = str(docx_path)
    transcript_path.write_text(text + "\n", encoding="utf-8")
    return text


def filler_dominated(text):
    chars = re.findall(r"[\u4e00-\u9fff]", text or "")
    if not chars:
        return True
    filler = set("嗯哦啊呃呐呀嘛好对行额唔哎喂")
    return sum(ch in filler for ch in chars) / len(chars) >= 0.55


def heuristic(item, text):
    clean = re.sub(r"\s+", "", text or "")
    if not clean or clean.startswith("[ERROR]"):
        return {
            "title": "空白静音",
            "note": "没有可用转写内容，保留为待复核录音。",
            "category": "低信息",
            "confidence": 0.2,
            "low_value": True,
        }
    if len(clean) < 18 or filler_dominated(clean):
        return {
            "title": "低信息沟通",
            "note": clean[:80],
            "category": "低信息",
            "confidence": 0.35,
            "low_value": True,
        }
    return None


def classify_info(item, text, summary):
    clean = re.sub(r"\s+", "", text or "")
    title = summary.get("title") or ""
    category = summary.get("category") or ""
    confidence = float(summary.get("confidence") or 0)
    duration = float(item.get("duration") or 0)
    if not clean or clean.startswith("[ERROR]"):
        return {
            "info_value": "空白静音",
            "info_action": "删除候选",
            "info_reason": "无可识别文本或转写失败",
        }
    if len(clean) < 18 or filler_dominated(clean):
        return {
            "info_value": "低信息",
            "info_action": "删除候选",
            "info_reason": "文本过短或主要由语气词组成",
        }
    if duration >= 600 and len(clean) < 180:
        return {
            "info_value": "低信息",
            "info_action": "删除候选",
            "info_reason": "长录音但可识别文本很少",
        }
    if summary.get("low_value") or category == "低信息" or title.startswith(LOW_INFO_PREFIXES):
        return {
            "info_value": "低信息",
            "info_action": "保留不重命名",
            "info_reason": "模型或规则判断为低信息内容",
        }
    if title in {"待人工命名", "未命名"} or confidence < 0.55:
        return {
            "info_value": "待人工复核",
            "info_action": "暂不重命名",
            "info_reason": "标题置信度不足或模型未给出可用标题",
        }
    return {
        "info_value": "有意义",
        "info_action": "可重命名",
        "info_reason": "包含可概括事项或可复用内容",
    }


def ensure_info_fields(row):
    if row.get("info_value"):
        return row
    title = row.get("title") or ""
    category = row.get("category") or ""
    confidence = float(row.get("confidence") or 0)
    if title.startswith("空白"):
        row.update({"info_value": "空白静音", "info_action": "删除候选", "info_reason": "标题为空白静音"})
    elif row.get("low_value") or category == "低信息" or title.startswith(LOW_INFO_PREFIXES):
        row.update({"info_value": "低信息", "info_action": "保留不重命名", "info_reason": "低信息候选"})
    elif title in {"待人工命名", "未命名"} or confidence < 0.55:
        row.update({"info_value": "待人工复核", "info_action": "暂不重命名", "info_reason": "标题置信度不足"})
    else:
        row.update({"info_value": "有意义", "info_action": "可重命名", "info_reason": "包含可概括事项或可复用内容"})
    return row


def call_title_model(item, text, key):
    guard = heuristic(item, text)
    if guard:
        return guard
    config = text_model_config()
    if not config:
        return {
            "title": "待人工命名",
            "note": "未配置文本标题模型，已跳过模型命名。",
            "category": "其他",
            "confidence": 0.1,
            "low_value": False,
        }
    prompt = f"""
你在整理用户自己的电话录音资料库。目录已经按人物分好，请给这一条录音生成“文件名标题”和“索引备注”。

硬规则：
1. title 6-14 个汉字，最多 18 字；不要日期、不要人名、不要电话、不要“录音/通话”二字、不要标点。
2. 不要照抄开头寒暄、语气词、碎句；例如“喂喂”“嗯嗯”“你在哪呢”都不能当标题。
3. title 要概括真实事项，像文件标题：快递取件核对、停车地点确认、剪辑思路讨论、饭点安排、材料发货确认、论文指导沟通。
4. 如果几乎没有信息，title 用“低信息沟通”，low_value=true。
5. note 40-90 字，说明这条主要讲什么，不要夸张，不要编造。
6. 输出严格 JSON：{{"title":"...","note":"...","category":"家庭/出行/财务/健康/工作/播客/创作/生活安排/低信息/其他","confidence":0.0-1.0,"low_value":true/false}}

人物目录：{item['person']}
原文件名：{item['old_name']}
时长秒：{item['duration']:.1f}
转写：
{compact_text(text)}
""".strip()
    data = json.dumps(
        {
            "model": config["model"],
            "messages": [
                {"role": "system", "content": "你只输出严格 JSON，不输出解释。"},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.1,
            "max_tokens": 260,
        },
        ensure_ascii=False,
    ).encode("utf-8")
    req = urllib.request.Request(config["api"], data=data, method="POST")
    req.add_header("Authorization", f"Bearer {config['key']}")
    req.add_header("Content-Type", "application/json")
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=180) as resp:
                raw = json.loads(resp.read().decode("utf-8"))
            content = raw["choices"][0]["message"]["content"].strip()
            content = re.sub(r"^```(?:json)?|```$", "", content, flags=re.I | re.M).strip()
            obj = json.loads(content)
            title = safe_slug(obj.get("title"), 18)
            if not title or title.startswith(("喂", "嗯", "啊", "哦")) or filler_dominated(title):
                return heuristic(item, text) or {
                    "title": "低信息沟通",
                    "note": "模型标题质量不足，保留为低信息候选。",
                    "category": "低信息",
                    "confidence": 0.3,
                    "low_value": True,
                }
            return {
                "title": title,
                "note": (obj.get("note") or "").strip()[:140],
                "category": obj.get("category") or "其他",
                "confidence": float(obj.get("confidence") or 0.6),
                "low_value": bool(obj.get("low_value")) or title.startswith(LOW_INFO_PREFIXES),
            }
        except Exception as e:
            if attempt < 4:
                time.sleep(2 * (attempt + 1))
                continue
            return heuristic(item, text) or {
                "title": "待人工命名",
                "note": f"标题模型失败：{type(e).__name__}",
                "category": "其他",
                "confidence": 0.1,
                "low_value": False,
            }


def candidate_row(item, transcript, summary):
    row = dict(item)
    row.update(summary)
    row.update(classify_info(item, transcript, summary))
    row["transcript_chars"] = len(re.sub(r"\s+", "", transcript or ""))
    return row


def write_tables(out_dir, rows):
    rows = [ensure_info_fields(dict(r)) for r in rows]
    rows = sorted(rows, key=lambda r: (r["person"], r.get("date_key") or "", r["old_name"]))
    fields = [
        "id",
        "person",
        "date_key",
        "duration",
        "old_name",
        "title",
        "category",
        "info_value",
        "info_action",
        "info_reason",
        "confidence",
        "low_value",
        "note",
        "transcript_chars",
        "audio_path",
        "docx_path",
    ]
    with (out_dir / "title_candidates.csv").open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow({k: row.get(k, "") for k in fields})
    (out_dir / "title_candidates.compact.json").write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    write_index(out_dir / "录音整理索引.draft.md", rows, applied=False)


def cmd_run(args):
    key = get_key()
    root = args.root.resolve()
    out_dir = args.out or (root / ".recording_folder_runs" / dt.datetime.now().strftime("%Y%m%d_%H%M%S"))
    out_dir.mkdir(parents=True, exist_ok=True)
    items = scan(root)
    missing_items = [x for x in items if not x["docx_path"]]
    if args.skip_missing_docx:
        items = [x for x in items if x["docx_path"]]
    if args.limit:
        items = items[: args.limit]
    (out_dir / "manifest.json").write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
    (out_dir / "missing_docx.json").write_text(json.dumps(missing_items, ensure_ascii=False, indent=2), encoding="utf-8")
    log(
        f"scan: audio={len(items)}, skipped_missing_docx={len(missing_items) if args.skip_missing_docx else 0}, "
        f"missing_docx_total={len(missing_items)}, out={out_dir}"
    )

    transcripts_path = out_dir / "transcripts.done.jsonl"
    done_t = jsonl_map(transcripts_path)
    todo_t = [x for x in items if x["id"] not in done_t]
    log(f"transcript extraction/asr pending={len(todo_t)}, workers={args.transcript_workers}")
    transcript_cache = {}

    def transcript_work(item):
        text = transcript_for(item, out_dir, key)
        return {"id": item["id"], "docx_path": item.get("docx_path", ""), "transcript_chars": len(re.sub(r'\\s+', '', text))}

    with concurrent.futures.ThreadPoolExecutor(max_workers=args.transcript_workers) as ex:
        futs = [ex.submit(transcript_work, item) for item in todo_t]
        for i, fut in enumerate(concurrent.futures.as_completed(futs), 1):
            row = fut.result()
            jsonl_append(transcripts_path, row)
            if i % 50 == 0 or i == len(futs):
                log(f"transcripts {i}/{len(futs)}")

    done_t = jsonl_map(transcripts_path)
    for item in items:
        if item["id"] in done_t and done_t[item["id"]].get("docx_path"):
            item["docx_path"] = done_t[item["id"]]["docx_path"]

    candidates_path = out_dir / "title_candidates.jsonl"
    done = jsonl_map(candidates_path)
    todo = [x for x in items if x["id"] not in done]
    config = text_model_config()
    model_label = f"{config['provider']}:{config['model']}" if config else "disabled"
    log(f"title/note candidates pending={len(todo)}, workers={args.title_workers}, model={model_label}")

    def title_work(item):
        text_path = out_dir / "records" / item["id"] / "transcript.txt"
        text = text_path.read_text(encoding="utf-8", errors="replace") if text_path.exists() else transcript_for(item, out_dir, key)
        transcript_cache[item["id"]] = text
        summary = call_title_model(item, text, key)
        return candidate_row(item, text, summary)

    with concurrent.futures.ThreadPoolExecutor(max_workers=args.title_workers) as ex:
        futs = [ex.submit(title_work, item) for item in todo]
        for i, fut in enumerate(concurrent.futures.as_completed(futs), 1):
            row = fut.result()
            jsonl_append(candidates_path, row)
            if i % 50 == 0 or i == len(futs):
                log(f"titles {i}/{len(futs)}")

    rows = list(jsonl_map(candidates_path).values())
    write_tables(out_dir, rows)
    log(f"done candidates: {out_dir / 'title_candidates.csv'}")


def unique_path(path):
    if not path.exists():
        return path
    stem = path.stem
    suffix = path.suffix
    for i in range(2, 1000):
        candidate = path.with_name(f"{stem}_{i}{suffix}")
        if not candidate.exists():
            return candidate
    raise RuntimeError(f"cannot find unique path for {path}")


def new_stem(row):
    stamp = row.get("date_key") or re.sub(r"\W+", "", Path(row["old_name"]).stem)[:15]
    title = safe_slug(row.get("title"), 18)
    return safe_slug(f"{stamp}_{title}", 64)


def cmd_apply_rename(args):
    if not args.dry_run and not args.confirm_rename:
        raise RuntimeError("refusing to rename files without --confirm-rename; run --dry-run first")
    run_dir = args.run_dir.resolve()
    rows = [ensure_info_fields(r) for r in json.loads((run_dir / "title_candidates.compact.json").read_text(encoding="utf-8"))]
    selected = [
        r for r in rows
        if float(r.get("confidence") or 0) >= args.min_confidence
        and r.get("title") not in {"待人工命名", "未命名"}
    ]
    if args.skip_low_value:
        selected = [r for r in selected if not r.get("low_value")]
    log(f"apply candidates selected={len(selected)} of {len(rows)} min_confidence={args.min_confidence}")
    if args.dry_run:
        for r in selected[:120]:
            print(f"{r['person']}\t{r['old_name']}\t=>\t{new_stem(r)}{r['ext']}")
        return

    backup_dir = run_dir / "rename_backups"
    backup_dir.mkdir(exist_ok=True)
    manifest = []
    for row in selected:
        audio = Path(row["audio_path"])
        if not audio.exists():
            continue
        target_audio = unique_path(audio.with_name(new_stem(row) + audio.suffix.lower()))
        target_docx = target_audio.with_suffix(".docx")
        old_docx = Path(row["docx_path"]) if row.get("docx_path") else audio.with_suffix(".docx")
        if old_docx.exists():
            target_docx = unique_path(target_docx)
        before = {
            "id": row["id"],
            "person": row["person"],
            "old_audio": str(audio),
            "new_audio": str(target_audio),
            "old_docx": str(old_docx) if old_docx.exists() else "",
            "new_docx": str(target_docx) if old_docx.exists() else "",
            "title": row.get("title", ""),
            "note": row.get("note", ""),
            "confidence": row.get("confidence", ""),
            "low_value": row.get("low_value", False),
        }
        if audio.resolve() != target_audio.resolve():
            audio.rename(target_audio)
        if old_docx.exists() and old_docx.resolve() != target_docx.resolve():
            old_docx.rename(target_docx)
        row["audio_path"] = str(target_audio)
        row["docx_path"] = str(target_docx) if target_docx.exists() else ""
        row["new_name"] = target_audio.name
        manifest.append(before)
    (backup_dir / f"rename_manifest_{dt.datetime.now().strftime('%Y%m%d_%H%M%S')}.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (run_dir / "applied_results.json").write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    write_index(run_dir / "录音整理索引.applied.md", rows, applied=True)
    root = args.root.resolve() if args.root else Path(rows[0]["audio_path"]).parents[2]
    index_path = root / "录音整理索引.md"
    if index_path.exists():
        shutil.copy2(index_path, root / f"录音整理索引.backup_{dt.datetime.now().strftime('%Y%m%d_%H%M%S')}.md")
    shutil.copy2(run_dir / "录音整理索引.applied.md", index_path)
    log(f"renamed {len(manifest)} file pairs; index={index_path}; backup_dir={backup_dir}")


def write_index(path, rows, applied):
    rows = [ensure_info_fields(dict(r)) for r in rows]
    rows = sorted(rows, key=lambda r: (r["person"], r.get("date_key") or "", r.get("new_name") or r["old_name"]))
    info_counts = {}
    for row in rows:
        info_counts[row.get("info_value") or "未分类"] = info_counts.get(row.get("info_value") or "未分类", 0) + 1
    info_summary = " | ".join(f"{k}{v}条" for k, v in sorted(info_counts.items()))
    lines = [
        "# 录音整理",
        f"更新时间：{dt.datetime.now().strftime('%Y-%m-%d %H:%M')}",
        f"文件总数：{len(rows)} 条 | 涉及人数：{len(set(r['person'] for r in rows))} 人",
        f"信息价值：{info_summary}",
        "",
        "---",
        "",
    ]
    by_person = {}
    for row in rows:
        by_person.setdefault(row["person"], []).append(row)
    for person, items in by_person.items():
        lines.append(f"## {person}（{len(items)}条）")
        lines.append("")
        current_month = None
        for row in items:
            date_key = row.get("date_key") or "未知时间"
            month = date_key[:6] if len(date_key) >= 6 else "未知月份"
            if month != current_month:
                current_month = month
                if month != "未知月份":
                    lines.append(f"### {month[:4]}-{month[4:6]}")
                else:
                    lines.append("### 未知月份")
                lines.append("")
            day = f"{date_key[4:6]}/{date_key[6:8]}" if len(date_key) >= 8 else "??/??"
            name = row.get("new_name") if applied else row.get("old_name")
            title = row.get("title") or "未命名"
            cat = row.get("category") or "其他"
            info = row.get("info_value") or "未分类"
            note = row.get("note") or ""
            low = "｜低信息" if row.get("low_value") else ""
            lines.append(f"- **{day}** 「{title}」 [{cat}｜{info}{low}]")
            if note:
                lines.append(f"  - 备注：{note}")
            lines.append(f"  - 文件：{name}")
        lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("run")
    p.add_argument("--root", type=Path, required=True)
    p.add_argument("--out", type=Path)
    p.add_argument("--limit", type=int)
    p.add_argument("--transcript-workers", type=int, default=12)
    p.add_argument("--title-workers", type=int, default=24)
    p.add_argument("--skip-missing-docx", action="store_true")
    p.set_defaults(func=cmd_run)
    p = sub.add_parser("apply-rename")
    p.add_argument("run_dir", type=Path)
    p.add_argument("--root", type=Path)
    p.add_argument("--min-confidence", type=float, default=0.55)
    p.add_argument("--skip-low-value", action="store_true")
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--confirm-rename", action="store_true")
    p.set_defaults(func=cmd_apply_rename)
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
