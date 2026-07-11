#!/usr/bin/env python3
"""Offline validation for the quantum-speed-reading skill package."""

from __future__ import annotations

import os
import py_compile
import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REQUIRED_FILES = [
    "SKILL.md",
    "agents/openai.yaml",
    "scripts/asr_benchmark.py",
    "scripts/transcribe_global.py",
    "scripts/validate_skill.py",
]
REQUIRED_SKILL_TEXT = [
    "量子速读",
    "version: 2026.07.02",
    "小红书",
    "B站",
    "小宇宙",
    "公众号",
    "知乎",
    "understanding-based",
    "extractive sentence ranking",
    "full.txt",
    "article.md",
    "质量门禁",
    "一句话概括",
    "内容复原",
    "核心论点",
    "编辑层提炼",
    "review-only",
    "Do not write durable memory",
]


def fail(message: str) -> None:
    print(f"FAIL {message}")
    raise SystemExit(1)


def ok(message: str) -> None:
    print(f"OK   {message}")


def warn(message: str) -> None:
    print(f"WARN {message}")


def check_files() -> None:
    for rel in REQUIRED_FILES:
        path = ROOT / rel
        if not path.exists():
            fail(f"missing {rel}")
    ok("required files present")


def check_skill_text() -> None:
    text = (ROOT / "SKILL.md").read_text(encoding="utf-8")
    missing = [needle for needle in REQUIRED_SKILL_TEXT if needle not in text]
    if missing:
        fail("SKILL.md missing quality gates: " + ", ".join(missing))
    if "content_summary.py" in text and "不得作为最终" not in text and "Do not use" not in text:
        fail("SKILL.md mentions content_summary.py without forbidding it as final output")
    ok("SKILL.md quality gates present")


def check_python() -> None:
    for rel in ("scripts/asr_benchmark.py", "scripts/transcribe_global.py", "scripts/validate_skill.py"):
        py_compile.compile(str(ROOT / rel), doraise=True)
    ok("python scripts compile")


def check_help_without_api_key() -> None:
    env = dict(os.environ)
    env.pop("SF_KEY", None)
    env.pop("SILICONFLOW_API_KEY", None)
    env["HOME"] = "/tmp/quantum-speed-reading-no-key-home"
    for rel in ("scripts/asr_benchmark.py", "scripts/transcribe_global.py"):
        result = subprocess.run(
            [sys.executable, str(ROOT / rel), "--help"],
            env=env,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        if result.returncode != 0:
            fail(f"{rel} --help failed without API key: {result.stderr.strip()}")
    ok("script help works without API key")


def check_optional_tools() -> None:
    if shutil.which("ffmpeg"):
        ok("ffmpeg found")
    else:
        warn("ffmpeg not found; media cutting will require installing ffmpeg")


def main() -> None:
    check_files()
    check_skill_text()
    check_python()
    check_help_without_api_key()
    check_optional_tools()
    ok("quantum-speed-reading package is installable")


if __name__ == "__main__":
    main()
