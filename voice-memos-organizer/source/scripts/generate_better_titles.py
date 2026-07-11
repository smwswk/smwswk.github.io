#!/usr/bin/env python3
import argparse
import concurrent.futures
import csv
import datetime as dt
import json
import os
import re
import shutil
import sqlite3
import time
import urllib.request
from pathlib import Path

HOME = Path.home()
RECORDINGS_DIR = HOME / "Library/Group Containers/group.com.apple.VoiceMemos.shared/Recordings"
DB_PATH = RECORDINGS_DIR / "CloudRecordings.db"
SILICONFLOW_CHAT_API = "https://api.siliconflow.cn/v1/chat/completions"
SILICONFLOW_TITLE_MODEL = os.environ.get("SILICONFLOW_TITLE_MODEL")
DEEPSEEK_TITLE_MODEL = os.environ.get("DEEPSEEK_MODEL", "deepseek-chat")
DEFAULT_SKIP_PREFIXES = ("零散沟通", "低信息录音", "工作事项沟通", "云端未下载", "空白静音录音")


def log(msg):
    print(f"[{dt.datetime.now().strftime('%H:%M:%S')}] {msg}", flush=True)


def get_key():
    for key in ("SF_KEY", "SILICONFLOW_API_KEY"):
        value = os.environ.get(key)
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


def safe_title(text, fallback="未命名录音"):
    text = re.sub(r"[\\/:*?\"<>|#\n\r\t]+", " ", text or "").strip()
    text = re.sub(r"\s+", "", text)
    return text[:18] or fallback


def apple_ts_to_iso(value):
    base = dt.datetime(2001, 1, 1, tzinfo=dt.timezone.utc)
    return (base + dt.timedelta(seconds=float(value or 0))).astimezone().isoformat(timespec="seconds")


def load_current_records():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    rows = con.execute(
        """
        select Z_PK as pk, ZDATE as date, ZDURATION as duration,
               ZCUSTOMLABEL as label, ZPATH as path, ZUNIQUEID as unique_id
        from ZCLOUDRECORDING
        order by ZDATE
        """
    ).fetchall()
    con.close()
    out = []
    for r in rows:
        path = r["path"] or ""
        ext = path.rsplit(".", 1)[-1].lower() if "." in path else ""
        out.append(
            {
                "pk": int(r["pk"]),
                "date_iso": apple_ts_to_iso(r["date"]),
                "duration": float(r["duration"] or 0),
                "old_label": r["label"] or "",
                "path": path,
                "ext": ext,
                "unique_id": r["unique_id"] or "",
            }
        )
    return out


def load_result_index(run_dir):
    p = run_dir / "results.compact.json"
    if not p.exists():
        return {}
    rows = json.loads(p.read_text(encoding="utf-8"))
    return {r["path"]: (run_dir / "records" / r["record_dir"] / "full_transcript.txt") for r in rows}


def default_source_runs():
    base = HOME / "Documents/voice_memos整理"
    if not base.exists():
        return []
    runs = []
    for child in base.iterdir():
        if (child / "results.compact.json").exists() and (child / "records").exists():
            runs.append(child)
    return sorted(runs, key=lambda p: p.stat().st_mtime, reverse=True)[:6]


def compact_text(text, max_chars=9000):
    text = re.sub(r"\s+", " ", text or "").strip()
    if len(text) <= max_chars:
        return text
    return text[:4500] + "\n...\n" + text[-4500:]


def filler_dominated(text):
    chars = re.findall(r"[\u4e00-\u9fff]", text or "")
    if not chars:
        return True
    filler = set("嗯哦啊呃呐呀嘛好对行额唔哎喂")
    return sum(ch in filler for ch in chars) / len(chars) >= 0.55


def heuristic_title(text, duration):
    clean = re.sub(r"\s+", "", text or "")
    if not clean:
        return {
            "title": "空白静音录音",
            "category": "空白",
            "confidence": 0.2,
            "reason": "无可识别文本",
        }
    if len(clean) < 12 or filler_dominated(clean):
        return {
            "title": "零散沟通",
            "category": "零散",
            "confidence": 0.35,
            "reason": "文本过短或主要为语气词",
        }
    if duration >= 600 and len(clean) < 180:
        return {
            "title": "低信息录音",
            "category": "零散",
            "confidence": 0.35,
            "reason": "长录音但可识别文本很少",
        }
    return {}


def call_title_model(item, text, key):
    guard = heuristic_title(text, item["duration"])
    if guard:
        return guard
    config = text_model_config()
    if not config:
        return {
            "title": "待人工命名",
            "category": "其他",
            "confidence": 0.1,
            "reason": "未配置文本标题模型，已跳过模型命名。",
        }
    prompt = f"""
你在给用户自己的 Voice Memos 录音重新命名。请生成“可扫读、像文件标题”的中文标题。

硬规则：
1. title 6-14 个汉字，最多 18 个字；不要标点、不要引号、不要日期、不要“录音”二字。
2. 不许照抄“嗯/好/对/那个/然后”这种碎句；如果内容低信息，title 用“零散沟通”或“低信息录音”。
3. 项目/材料/交付/电话相关，要概括成稳定名词短语，例如：电话记录写法、交付日期核对、项目材料顺序、结果文档核对。
4. 个人想法/播客/摄影/生活，按真实主题命名。
5. 输出严格 JSON：{{"title":"...","category":"项目/材料/电话/播客/创作/生活/关系/学习/零散/其他","confidence":0.0-1.0,"reason":"一句话说明"}}

原标题：{item['old_label']}
时间：{item['date_iso']}
时长秒：{item['duration']:.1f}
转录：
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
            "max_tokens": 220,
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
            title = safe_title(obj.get("title"))
            if title in {"嗯嗯嗯", "好好好", "对对对"} or filler_dominated(title):
                return heuristic_title(text, item["duration"]) or {
                    "title": "零散沟通",
                    "category": "零散",
                    "confidence": 0.3,
                    "reason": "模型标题为语气词，已拦截",
                }
            return {
                "title": title,
                "category": obj.get("category") or "其他",
                "confidence": float(obj.get("confidence") or 0.6),
                "reason": (obj.get("reason") or "").strip()[:120],
            }
        except Exception as e:
            if attempt < 4:
                time.sleep(2 * (attempt + 1))
                continue
            guard = heuristic_title(text, item["duration"])
            return guard or {
                "title": "待人工命名",
                "category": "其他",
                "confidence": 0.1,
                "reason": f"标题模型失败：{type(e).__name__}",
            }


def dedupe(rows):
    seen = {}
    for row in rows:
        base = row["new_title"]
        seen[base] = seen.get(base, 0) + 1
        if seen[base] > 1:
            row["new_title"] = safe_title(f"{base}{seen[base]}")
    return rows


def cmd_generate(args):
    key = ""
    out_dir = args.out or (HOME / "Documents/voice_memos整理" / f"better_titles_{dt.datetime.now().strftime('%Y%m%d_%H%M%S')}")
    out_dir.mkdir(parents=True, exist_ok=True)
    indexes = {}
    source_runs = args.source_run or default_source_runs()
    for run_dir in source_runs:
        indexes.update(load_result_index(run_dir))
    if not indexes:
        raise RuntimeError("no transcript indexes found; pass --source-run <process_voice_memos output dir>")
    records = load_current_records()
    if args.limit:
        records = records[: args.limit]
    config = text_model_config()
    model_label = f"{config['provider']}:{config['model']}" if config else "disabled"
    log(f"current records: {len(records)}, transcript_runs={len(source_runs)}, model={model_label}, out={out_dir}")

    def work(item):
        transcript_path = indexes.get(item["path"])
        text = ""
        if transcript_path and transcript_path.exists():
            text = transcript_path.read_text(encoding="utf-8", errors="replace")
        title = call_title_model(item, text, key) if text else {
            "title": "云端未下载",
            "category": "其他",
            "confidence": 0.2,
            "reason": "无本地音频转录",
        }
        row = dict(item)
        row.update(
            {
                "new_title": title["title"],
                "category": title["category"],
                "confidence": title["confidence"],
                "reason": title["reason"],
                "transcript_chars": len(re.sub(r"\\s+", "", text)),
            }
        )
        return row

    done_path = out_dir / "title_candidates.jsonl"
    done = {}
    if done_path.exists():
        for line in done_path.read_text(encoding="utf-8").splitlines():
            if line.strip():
                obj = json.loads(line)
                done[int(obj["pk"])] = obj
    todo = [r for r in records if int(r["pk"]) not in done]
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as ex:
        futs = [ex.submit(work, item) for item in todo]
        for i, fut in enumerate(concurrent.futures.as_completed(futs), 1):
            row = fut.result()
            with done_path.open("a", encoding="utf-8") as f:
                f.write(json.dumps(row, ensure_ascii=False) + "\n")
            if i % 25 == 0 or i == len(futs):
                log(f"generated {i}/{len(futs)}")

    rows = list(done.values())
    rows.extend(json.loads(line) for line in done_path.read_text(encoding="utf-8").splitlines() if line.strip() and int(json.loads(line)["pk"]) not in done)
    rows = dedupe(sorted({int(r["pk"]): r for r in rows}.values(), key=lambda x: x["date_iso"]))
    compact = out_dir / "title_candidates.compact.json"
    compact.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    with (out_dir / "title_candidates.csv").open("w", newline="", encoding="utf-8-sig") as f:
        fields = ["pk", "date_iso", "duration", "ext", "old_label", "new_title", "category", "confidence", "reason", "transcript_chars", "path"]
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for row in rows:
            w.writerow({k: row.get(k, "") for k in fields})
    log(f"done: {compact}")


def cmd_apply(args):
    if not args.confirm_live_write:
        raise RuntimeError("refusing to write live Voice Memos database without --confirm-live-write")
    rows = json.loads(args.candidates.read_text(encoding="utf-8"))
    backup = args.candidates.parent / f"db_backup_before_title_apply_{dt.datetime.now().strftime('%Y%m%d_%H%M%S')}"
    backup.mkdir(exist_ok=True)
    for p in [DB_PATH, Path(str(DB_PATH) + "-wal"), Path(str(DB_PATH) + "-shm")]:
        if p.exists():
            shutil.copy2(p, backup / p.name)
    con = sqlite3.connect(DB_PATH)
    con.create_function("NSCoreDataDATriggerUpdatedAffectedObjectValue", 5, lambda *args: None)
    con.create_function("NSCoreDataDATriggerInsertUpdatedAffectedObjectValue", 5, lambda *args: None)
    with con:
        for row in rows:
            title = safe_title(row["new_title"])
            con.execute(
                "update ZCLOUDRECORDING set ZCUSTOMLABEL=?, ZCUSTOMLABELFORSORTING=?, Z_OPT=Z_OPT+1 where Z_PK=?",
                (title, title, int(row["pk"])),
            )
    con.close()
    log(f"applied {len(rows)} titles, backup={backup}")


def cmd_select(args):
    rows = json.loads(args.candidates.read_text(encoding="utf-8"))
    skip_prefixes = tuple(args.skip_prefix or DEFAULT_SKIP_PREFIXES)
    selected = []
    for row in rows:
        if row.get("ext") not in ("m4a", "qta"):
            continue
        title = row.get("new_title", "")
        if any(title.startswith(prefix) for prefix in skip_prefixes):
            continue
        if float(row.get("confidence") or 0) < args.min_confidence:
            continue
        selected.append(row)
    out = args.out or (args.candidates.parent / "title_candidates_selected_apply.json")
    out.write_text(json.dumps(selected, ensure_ascii=False, indent=2), encoding="utf-8")
    log(f"selected {len(selected)} titles -> {out}")


def cmd_delete_candidates(args):
    rows = json.loads(args.candidates.read_text(encoding="utf-8"))
    prefixes = tuple(args.prefix)
    target = [r for r in rows if any((r.get("new_title") or "").startswith(p) for p in prefixes)]
    if args.dry_run:
        log(f"dry-run targets={len(target)} prefixes={prefixes}")
        for row in target[:80]:
            print(f"{row.get('pk')}\t{row.get('date_iso')}\t{row.get('new_title')}\t{row.get('path')}")
        return
    if not args.confirm_delete:
        raise RuntimeError("refusing to delete Voice Memos candidates without --confirm-delete")

    backup = args.candidates.parent / "delete_candidate_backups" / dt.datetime.now().strftime("%Y%m%d_%H%M%S")
    audio_backup = backup / "audio"
    db_backup = backup / "db"
    audio_backup.mkdir(parents=True, exist_ok=True)
    db_backup.mkdir(parents=True, exist_ok=True)
    for p in [DB_PATH, Path(str(DB_PATH) + "-wal"), Path(str(DB_PATH) + "-shm")]:
        if p.exists():
            shutil.copy2(p, db_backup / p.name)

    con = sqlite3.connect(DB_PATH)
    con.create_function("NSCoreDataDATriggerUpdatedAffectedObjectValue", 5, lambda *args: None)
    con.create_function("NSCoreDataDATriggerInsertUpdatedAffectedObjectValue", 5, lambda *args: None)
    cur = con.cursor()
    failures = []
    for row in target:
        got = cur.execute("select ZPATH from ZCLOUDRECORDING where Z_PK=?", (int(row["pk"]),)).fetchone()
        if not got or (got[0] or "") != (row.get("path") or ""):
            failures.append((row.get("pk"), row.get("path"), got))
    if failures:
        con.close()
        raise RuntimeError(f"verification failed before delete: {failures[:5]} total={len(failures)}")

    manifest = backup / "deleted_candidates.csv"
    with manifest.open("w", newline="", encoding="utf-8-sig") as f:
        fields = ["pk", "date_iso", "duration", "ext", "old_label", "new_title", "category", "confidence", "reason", "transcript_chars", "path", "moved_to"]
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for row in target:
            moved = ""
            if row.get("path"):
                src = RECORDINGS_DIR / row["path"]
                if src.is_symlink():
                    con.close()
                    raise RuntimeError(f"refuse symlink: {src}")
                if src.exists():
                    dst = audio_backup / src.name
                    shutil.move(str(src), str(dst))
                    moved = str(dst)
            out = {k: row.get(k, "") for k in fields if k != "moved_to"}
            out["moved_to"] = moved
            writer.writerow(out)
    with con:
        cur.executemany("delete from ZCLOUDRECORDING where Z_PK=?", [(int(r["pk"]),) for r in target])
    con.close()
    log(f"deleted {len(target)} candidates, backup={backup}")


def main():
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("generate")
    p.add_argument("--out", type=Path)
    p.add_argument("--source-run", type=Path, action="append", help="process_voice_memos output dir containing results.compact.json and records/")
    p.add_argument("--workers", type=int, default=12)
    p.add_argument("--limit", type=int)
    p.set_defaults(func=cmd_generate)
    p = sub.add_parser("select")
    p.add_argument("candidates", type=Path)
    p.add_argument("--out", type=Path)
    p.add_argument("--min-confidence", type=float, default=0.55)
    p.add_argument("--skip-prefix", action="append")
    p.set_defaults(func=cmd_select)
    p = sub.add_parser("apply")
    p.add_argument("candidates", type=Path)
    p.add_argument("--confirm-live-write", action="store_true")
    p.set_defaults(func=cmd_apply)
    p = sub.add_parser("delete-candidates")
    p.add_argument("candidates", type=Path)
    p.add_argument("--prefix", action="append", required=True)
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--confirm-delete", action="store_true")
    p.set_defaults(func=cmd_delete_candidates)
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
