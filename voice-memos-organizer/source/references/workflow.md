# Voice Memos Cleanup Workflow Notes

## Data Model

Default locations:

- Recordings folder: `~/Library/Group Containers/group.com.apple.VoiceMemos.shared/Recordings`
- Main database: `Recordings/CloudRecordings.db`
- Encrypted database: `Recordings/EncryptedCloudRecordings/EncryptedCloudRecordings.db`

Important table:

- `ZCLOUDRECORDING`
  - `Z_PK`: primary key
  - `ZDATE`: Apple timestamp
  - `ZDURATION`: seconds
  - `ZCUSTOMLABEL`: displayed title
  - `ZCUSTOMLABELFORSORTING`: sort title
  - `ZPATH`: local audio path, often `.m4a` or `.qta`, sometimes null

Apple CoreData triggers call private SQLite functions. When updating/deleting with Python sqlite, register no-op functions:

```python
con.create_function("NSCoreDataDATriggerUpdatedAffectedObjectValue", 5, lambda *args: None)
con.create_function("NSCoreDataDATriggerInsertUpdatedAffectedObjectValue", 5, lambda *args: None)
```

## Lessons From Prior Run

- `.m4a` is not the full library. Voice Memos may also store valid audio as `.qta`; `ffprobe` can read `.qta` as QuickTime media.
- `rg` over the SQLite file can find deleted-title byte remnants. Trust SQL queries over raw byte search.
- The UI may not refresh while `VoiceMemos` / `voicememod` is running. Quit/kill both before DB writes and reopen after verification.
- Do not judge success from UI alone; verify DB rows and local audio file counts.
- Never write every generated title. Earlier bad output included random spoken fragments; apply only selected high-confidence candidates.
- For low-information content, prefer generic labels (`零散沟通`, `低信息录音`) or deletion after review. Do not fabricate specific titles.
- SiliconFlow may return `HTTP 403 {"code":30001,"message":"Sorry, your account balance is insufficient"}`. Stop and ask the user to recharge or switch credentials.

## Safe Deletion Criteria

Safe deletion candidates are usually:

- Empty transcript after successful ASR.
- Very short transcript dominated by fillers (`嗯/哦/好/对`) and no durable content.
- Long recording with extremely low transcript density, after user confirms deletion policy.
- Candidate titles with prefixes explicitly approved by the user, such as `零散沟通`, `低信息录音`, `工作事项沟通`.

Before deleting:

1. Print target count grouped by prefix and extension.
2. Dry-run the target manifest.
3. Quit Voice Memos and `voicememod`.
4. Copy database files to backup.
5. Move audio files to backup, not Trash.
6. Delete DB rows.
7. Verify `pragma integrity_check`, counts by extension, and moved audio count.

The public source build refuses live deletion unless `--confirm-delete` is provided after the dry-run review.

## Title Selection Policy

Select titles for write-back only when:

- `confidence >= 0.55`
- extension is `m4a` or `qta`
- title does not start with one of:
  - `零散沟通`
  - `低信息录音`
  - `工作事项沟通`
  - `云端未下载`
  - `空白静音录音`
  - `待人工命名`

Keep original time titles for skipped rows.
