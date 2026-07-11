#!/usr/bin/env python3
"""Benchmark SiliconFlow TeleSpeechASR concurrency with short WAV samples."""

from __future__ import annotations

import argparse
import concurrent.futures
import json
import os
import subprocess
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
    req = urllib.request.Request(API, data=b"".join(body), method="POST")
    req.add_header("Authorization", f"Bearer {key}")
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
    start = time.monotonic()
    try:
        with urllib.request.urlopen(req, timeout=600) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
        return {"ok": True, "chars": len(payload.get("text", "")), "elapsed": time.monotonic() - start}
    except urllib.error.HTTPError as exc:
        return {"ok": False, "error": f"HTTP {exc.code}", "elapsed": time.monotonic() - start}
    except Exception as exc:
        return {"ok": False, "error": type(exc).__name__, "elapsed": time.monotonic() - start}


def make_samples(source: Path, out_dir: Path, count: int) -> list[Path]:
    out_dir.mkdir(parents=True, exist_ok=True)
    existing = sorted(out_dir.glob("sample_*.wav"))
    if len(existing) >= count:
        return existing[:count]
    for old in out_dir.glob("sample_*.wav"):
        old.unlink()
    subprocess.run(
        [
            "ffmpeg", "-y", "-i", str(source), "-ar", "16000", "-ac", "1",
            "-f", "segment", "-segment_time", "60", "-c:a", "pcm_s16le",
            "sample_%03d.wav",
        ],
        cwd=out_dir,
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return sorted(out_dir.glob("sample_*.wav"))[:count]


def run_case(samples: list[Path], workers: int) -> dict:
    start = time.monotonic()
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
        results = list(pool.map(post, samples))
    errors = [r for r in results if not r["ok"]]
    return {
        "workers": workers,
        "chunks": len(samples),
        "ok": len(samples) - len(errors),
        "errors": len(errors),
        "elapsed_seconds": round(time.monotonic() - start, 2),
        "sample_error": errors[0].get("error", "") if errors else "",
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True, help="Audio/video file used to create 60s sample chunks")
    parser.add_argument("--count", type=int, default=32)
    parser.add_argument("--workers", default="16,24,32")
    parser.add_argument("--sample-dir", default="/tmp/asr_benchmark_samples")
    args = parser.parse_args()

    samples = make_samples(Path(args.source), Path(args.sample_dir), args.count)
    for workers in [int(x) for x in args.workers.split(",") if x.strip()]:
        print(json.dumps(run_case(samples, workers), ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
