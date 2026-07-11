---
name: voice-memos-organizer
description: Safely organize macOS Voice Memos libraries. Use when the user asks to read, transcribe, rename, title, summarize, clean up, delete blank/silent/low-value recordings, or otherwise batch-process Apple Voice Memos (.m4a/.qta) using SiliconFlow TeleAI/TeleSpeechASR while preserving backups and avoiding corrupting the CoreData database.
---

# Voice Memos Organizer

## Non-Negotiables

- Treat `~/Library/Group Containers/group.com.apple.VoiceMemos.shared/Recordings/CloudRecordings.db` as a live CoreData store.
- Never delete directly without a manifest, database backup, and moved-audio backup.
- Never write model-generated titles blindly. Generate candidates first, inspect samples, then write only high-confidence titles.
- Prefer deleting or keeping low-information recordings over giving them fake content titles.
- Use SiliconFlow ASR model `TeleAI/TeleSpeechASR` for transcription.
- For text title/note generation, prefer the user's own text-model environment variables: `DEEPSEEK_V4_API_KEY` / `DEEPSEEK_API_KEY`. Do not use SiliconFlow chat/title models unless the user explicitly sets `SILICONFLOW_TITLE_MODEL` or `SILICONFLOW_CHAT_MODEL`.
- `MINIMAX3_API_KEY` / `MINIMAX_API_KEY` may be used only when `MINIMAX_CHAT_API` and `MINIMAX_MODEL` are explicitly configured.
- If the API returns balance or quota errors, stop and report the exact error.
- Quit `VoiceMemos` and `voicememod` before database writes/deletes; reopen Voice Memos after verification.
- Public source build requires explicit confirmation flags for live writes: `--confirm-live-write`, `--confirm-delete`, or `--confirm-rename`.

## Scripts

- `scripts/process_voice_memos.py`
  - Inventory current Voice Memos records.
  - Segment local `.m4a` / `.qta` audio with `ffmpeg`.
  - Transcribe chunks with SiliconFlow `TeleAI/TeleSpeechASR`.
  - Produce `manifest.csv`, `results.compact.json`, `rename_plan.csv`, `notes.md`, and full transcripts.
- `scripts/generate_better_titles.py`
  - Generate better title candidates from transcript output directories.
  - Select only safe/high-confidence titles for write-back.
  - Apply selected title JSON to Voice Memos.
  - Delete candidate groups by title prefix with backups.

Read `references/workflow.md` before doing live cleanup or database writes.

## Standard Workflow

1. Inspect current library state:
   ```bash
   sqlite3 "$HOME/Library/Group Containers/group.com.apple.VoiceMemos.shared/Recordings/CloudRecordings.db" \
     "select count(*) from ZCLOUDRECORDING; select ZPATH from ZCLOUDRECORDING order by ZDATE desc limit 5;"
   ```

2. Transcribe local audio by extension. Run `.m4a` and `.qta` separately because Voice Memos may store both:
   ```bash
   OUT="$HOME/Documents/voice_memos整理/full_$(date +%Y%m%d_%H%M%S)"
   python3 scripts/process_voice_memos.py run --extensions m4a --out "$OUT" --asr-workers 24 --chat-workers 8 --ffmpeg-workers 4

   QTA="$HOME/Documents/voice_memos整理/qta_$(date +%Y%m%d_%H%M%S)"
   python3 scripts/process_voice_memos.py run --extensions qta --out "$QTA" --asr-workers 24 --chat-workers 8 --ffmpeg-workers 4
   ```

3. Generate title candidates without writing to Voice Memos:
   ```bash
   TITLES="$HOME/Documents/voice_memos整理/better_titles_$(date +%Y%m%d_%H%M%S)"
   python3 scripts/generate_better_titles.py generate --source-run "$OUT" --source-run "$QTA" --out "$TITLES"
   open -R "$TITLES/title_candidates.csv"
   ```

4. Inspect candidates. Reject rows with prefixes such as `零散沟通`, `低信息录音`, `工作事项沟通`, `云端未下载`, or `空白静音录音`.

5. Select and apply only good titles:
   ```bash
   python3 scripts/generate_better_titles.py select "$TITLES/title_candidates.compact.json" --min-confidence 0.55
   killall VoiceMemos >/dev/null 2>&1 || true
   killall voicememod >/dev/null 2>&1 || true
   python3 scripts/generate_better_titles.py apply "$TITLES/title_candidates_selected_apply.json" --confirm-live-write
   open /System/Applications/VoiceMemos.app
   ```

6. Delete low-value candidates only after dry-run review:
   ```bash
   python3 scripts/generate_better_titles.py delete-candidates "$TITLES/title_candidates.compact.json" \
     --prefix "零散沟通" --prefix "低信息录音" --prefix "工作事项沟通" --dry-run
   ```
   If the dry run matches the intended records:
   ```bash
   killall VoiceMemos >/dev/null 2>&1 || true
   killall voicememod >/dev/null 2>&1 || true
   python3 scripts/generate_better_titles.py delete-candidates "$TITLES/title_candidates.compact.json" \
     --prefix "零散沟通" --prefix "低信息录音" --prefix "工作事项沟通" --confirm-delete
   open /System/Applications/VoiceMemos.app
   ```

## Title Quality Rules

- Good titles are stable nouns: `电话记录写法`, `交付日期核对`, `项目材料顺序`, `结果文档核对`, `苏珊桑塔格论摄影导读`.
- Bad titles quote random speech: `嗯嗯嗯`, `好好好的`, `你不要不写电话记录` when a more stable phrase is possible.
- Low-information recordings should stay generic or be deleted; do not invent content.
- If a model call fails and outputs `待人工命名`, do not apply it. Rerun at lower concurrency or keep the original time title.

## Verification

After every write/delete:

```bash
sqlite3 "$HOME/Library/Group Containers/group.com.apple.VoiceMemos.shared/Recordings/CloudRecordings.db" \
  "pragma integrity_check; select count(*) from ZCLOUDRECORDING; select count(*) from ZCLOUDRECORDING where ZCUSTOMLABEL like '空白静音录音%';"
find "$HOME/Library/Group Containers/group.com.apple.VoiceMemos.shared/Recordings" -maxdepth 1 -type f \( -name '*.m4a' -o -name '*.qta' \) | awk -F. '{print $NF}' | sort | uniq -c
```

Report exact counts and backup paths in the final answer.
