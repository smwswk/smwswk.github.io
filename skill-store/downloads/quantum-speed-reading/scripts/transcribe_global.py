#!/usr/bin/env python3
"""Transcribe all pending chunk_*.wav files below a root through one global queue."""

from __future__ import annotations

import argparse
import concurrent.futures
import json
import os
import time
import urllib.error
import urllib.request
import uuid
from pathlib import Path

API = "https://api.siliconflow.cn/v1/audio/transcriptions"
MODEL = "TeleAI/TeleSpeechASR"


def get_key() -> str:
    for key in ("SF_KEY", "SILICONFLOW_API_KEY"):
        value = os.environ.get(key)
        if value:
            return value
    path = Path.home() / ".config/siliconflow/api_key"
    if path.exists():
        return path.read_text().strip()
    raise RuntimeError("SiliconFlow API key not found")


def post(path: Path) -> dict:
    key = get_key()
    boundary = "----" + uuid.uuid4().hex
    body = [
        f"--{boundary}\r\n".encode(),
        b'Content-Disposition: form-data; name="model"\r\n\r\n',
        MODEL.encode() + b"\r\n",
        f"--{boundary}\r\n".encode(),
        f'Content-Disposition: form-data; name="file"; filename="{path.name}"\r\n'.encode(),
        b"Content-Type: audio/wav\r\n\r\n",
        path.read_bytes(),
        b"\r\n",
        f"--{boundary}--\r\n".encode(),
    ]
    data = b"".join(body)
    for attempt in range(4):
        req = urllib.request.Request(API, data=data, method="POST")
        req.add_header("Authorization", f"Bearer {key}")
        req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
        try:
            with urllib.request.urlopen(req, timeout=600) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            err = exc.read().decode("utf-8", errors="replace")
            if exc.code in (429, 500, 502, 503, 504) and attempt < 3:
                time.sleep(4 * (attempt + 1))
                continue
            return {"error": f"HTTP {exc.code}: {err}"}
        except Exception as exc:
            if attempt < 3:
                time.sleep(4 * (attempt + 1))
                continue
            return {"error": str(exc)}
    return {"error": "exhausted retries"}


def transcribe(path: Path) -> dict:
    out = path.with_suffix(".txt")
    if out.exists() and out.stat().st_size > 0:
        return {"chunk": str(path), "status": "skip"}
    result = post(path)
    text = result.get("text", "")
    if "error" in result:
        text = f"[ERROR] {result['error']}"
    out.write_text(text, encoding="utf-8")
    return {"chunk": str(path), "status": str(len(text))}


def merge_full_texts(root: Path) -> None:
    for directory in sorted({p.parent for p in root.rglob("chunk_*.txt")}):
        chunks = sorted(directory.glob("chunk_*.txt"))
        if chunks:
            (directory / "full.txt").write_text(
                "\n".join(p.read_text(encoding="utf-8", errors="ignore") for p in chunks),
                encoding="utf-8",
            )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("root", nargs="?", default=".")
    parser.add_argument("--workers", type=int, default=32)
    parser.add_argument("--merge", action="store_true")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    chunks = [p for p in sorted(root.rglob("chunk_*.wav")) if not p.with_suffix(".txt").exists()]
    print(f"pending chunks: {len(chunks)} workers: {args.workers}", flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = [pool.submit(transcribe, chunk) for chunk in chunks]
        for fut in concurrent.futures.as_completed(futures):
            print(json.dumps(fut.result(), ensure_ascii=False), flush=True)
    if args.merge:
        merge_full_texts(root)


if __name__ == "__main__":
    main()
