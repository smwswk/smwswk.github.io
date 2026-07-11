# Voice Memos Organizer

Open-source helper scripts for auditing, transcribing, titling, and safely cleaning Apple Voice Memos libraries on macOS.

The tool treats the Voice Memos CoreData database as live state. Public defaults are intentionally conservative:

- Inventory, transcription, candidate generation, and dry runs are the normal path.
- Writing titles to `CloudRecordings.db` requires `--confirm-live-write`.
- Deleting low-value candidates requires a dry run first and then `--confirm-delete`.
- Renaming exported recording folders requires `--confirm-rename`.
- Database and audio backups are created before destructive changes.

## Requirements

- macOS with Apple Voice Memos.
- Python 3.
- `ffmpeg` and `ffprobe` for segmenting and reading audio.
- SiliconFlow API key for `TeleAI/TeleSpeechASR`, via `SF_KEY`, `SILICONFLOW_API_KEY`, or `~/.config/siliconflow/api_key`.
- Optional text-title model via `DEEPSEEK_V4_API_KEY` / `DEEPSEEK_API_KEY`, or explicitly configured alternative environment variables.

## Main Scripts

- `scripts/process_voice_memos.py`
  - Reads the Voice Memos database.
  - Segments `.m4a` / `.qta`.
  - Transcribes with `TeleAI/TeleSpeechASR`.
  - Writes manifests, transcripts, summaries, and title plans.
- `scripts/generate_better_titles.py`
  - Generates and selects safer title candidates.
  - Can write selected titles only with explicit confirmation.
  - Can dry-run and then delete approved low-value groups with backups.
- `scripts/organize_recording_folder.py`
  - Works on exported recording folders arranged by person.
  - Generates transcripts, summaries, title candidates, and an index.
  - Can rename files only with explicit confirmation.

## Safe Workflow

```bash
OUT="$HOME/Documents/voice_memos_organizer/full_$(date +%Y%m%d_%H%M%S)"
python3 scripts/process_voice_memos.py run --extensions m4a --out "$OUT" --asr-workers 8 --chat-workers 4 --ffmpeg-workers 4

TITLES="$HOME/Documents/voice_memos_organizer/better_titles_$(date +%Y%m%d_%H%M%S)"
python3 scripts/generate_better_titles.py generate --source-run "$OUT" --out "$TITLES"
python3 scripts/generate_better_titles.py select "$TITLES/title_candidates.compact.json" --min-confidence 0.55
```

Before writing to Voice Memos, quit the app and background service:

```bash
killall VoiceMemos >/dev/null 2>&1 || true
killall voicememod >/dev/null 2>&1 || true
python3 scripts/generate_better_titles.py apply "$TITLES/title_candidates_selected_apply.json" --confirm-live-write
```

Before deleting low-value recordings, dry-run first:

```bash
python3 scripts/generate_better_titles.py delete-candidates "$TITLES/title_candidates.compact.json" \
  --prefix "零散沟通" --prefix "低信息录音" --dry-run
```

Then execute only when the dry-run manifest is correct:

```bash
python3 scripts/generate_better_titles.py delete-candidates "$TITLES/title_candidates.compact.json" \
  --prefix "零散沟通" --prefix "低信息录音" --confirm-delete
```

## License

MIT. You are responsible for verifying backups before modifying your own Voice Memos library.
