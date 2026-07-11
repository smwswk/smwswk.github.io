---
name: quota-footer
description: Use when a reply should end with a concise Codex quota footer such as “额度：5h 29%｜周 21%”. Reads local Codex OAuth auth.json, queries ChatGPT WHAM usage, and formats only the short footer unless details are requested.
---

# Quota Footer

## Purpose

Append a short quota footer to final replies:

```text
额度：5h 29%｜周 21%
```

Use this when the user asks for usage visibility, quota tracking, or wants every final reply to show remaining budget context.

## Default Behavior

1. Read OAuth token from `~/.codex/auth.json`.
2. Request `https://chatgpt.com/backend-api/wham/usage`.
3. Extract:
   - `rate_limit.primary_window.used_percent`
   - `rate_limit.secondary_window.used_percent`
4. Print only:
   ```text
   额度：5h {primary}%｜周 {secondary}%
   ```
5. If usage cannot be read, use:
   ```text
   额度：读取失败
   ```

Do not expand reset time, token source, errors, or raw JSON unless the user asks or the quota is near the limit.

## CLI

Run:

```bash
python3 scripts/quota_footer.py
```

The script prints one footer line suitable for appending to a final response.
