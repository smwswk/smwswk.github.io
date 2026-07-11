#!/usr/bin/env python3
import json
import urllib.request
from pathlib import Path


def find_token(data):
    for path in (
        ("tokens", "access_token"),
        ("access_token",),
        ("oauth_token",),
    ):
        cur = data
        for key in path:
            if not isinstance(cur, dict) or key not in cur:
                cur = None
                break
            cur = cur[key]
        if isinstance(cur, str) and cur:
            return cur
    return ""


def main():
    try:
        auth = json.loads((Path.home() / ".codex/auth.json").read_text())
        token = find_token(auth)
        if not token:
            raise RuntimeError("missing token")
        req = urllib.request.Request(
            "https://chatgpt.com/backend-api/wham/usage",
            headers={"Authorization": f"Bearer {token}", "User-Agent": "Codex CLI"},
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            usage = json.loads(resp.read().decode("utf-8"))
        primary = usage["rate_limit"]["primary_window"]["used_percent"]
        secondary = usage["rate_limit"]["secondary_window"]["used_percent"]
        print(f"额度：5h {primary}%｜周 {secondary}%")
    except Exception:
        print("额度：读取失败")


if __name__ == "__main__":
    main()
