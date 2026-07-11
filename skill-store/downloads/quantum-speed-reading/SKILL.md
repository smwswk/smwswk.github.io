---
name: quantum-speed-reading
description: Use when the user asks to run 内容引擎, 量子速读, 量子速度, bulk content ingestion, high-throughput ASR, or to process many B站/小宇宙/小红书/公众号/知乎 items. Productized content engine with source scanning, platform routing, full-media ASR, quality gates, understanding-based summaries, and review-only memory candidates.
version: 2026.07.02
---

# 量子速读

## What this skill does

量子速读 is the product version of 内容引擎. It turns batches of videos, podcasts, articles, notes, and local media into:

- full transcripts or complete article text saved as `full.txt` or `article.md`;
- understanding-based summaries;
- highlights and quotable lines;
- project-relevant notes;
- memory candidates that stay in review until the user approves them.

The public product name is **量子速读**. If the user says **量子速度**, treat it as the same product unless they clearly mean another tool.

## When to use it

Use this skill when the user asks to:

- 跑内容引擎 / 跑一波 / 跑量子速读;
- clean a watch-later list or reminder list containing content links;
- batch-process B站, 小宇宙, 小红书, 公众号, 知乎, or local audio/video;
- convert a content backlog into summaries, highlights, and review candidates.

If the user only asks for a calendar/todo summary, do not run this skill. Use the relevant todo or calendar workflow.

## Source scan

Start by building a manifest. Each item should include:

```json
{
  "source": "reminders|watchlater|browser|manual|folder",
  "platform": "xhs|bilibili|wechat|zhihu|xiaoyuzhou|local",
  "title": "",
  "url": "",
  "type": "video|audio|article|image_note|unknown",
  "duration_seconds": null,
  "dir": ""
}
```

Default scan order:

1. User-provided links or files.
2. Reminder/todo items that contain content links, if the user's environment supports that.
3. B站 watch-later list, if login cookies are available.
4. Browser tabs for supported platforms, if the user asked to scan tabs.

Show the user the grouped scope before ingestion unless they already confirmed full processing.

## Platform routing

### 小红书

- Fetch mobile SSR metadata with an iPhone user agent.
- `type=video`: download mp4, cut audio, run ASR, merge `full.txt`.
- `type=normal`: use complete `desc`; if `desc` is only hashtags, download images and OCR or mark as needs supplement.
- Never summarize a video from title, meta description, or hashtags.

### B站

- Use the video URL or BVID to fetch metadata.
- Download audio, cut into `chunk_*.wav`, run ASR, merge `full.txt`.
- Official subtitles can help with chapter alignment, but they cannot replace ASR.
- If B站 download hits HTTP 412, lower download concurrency and add UA/Referer/sleep. Do not treat one 412 as a global login failure.

### 小宇宙

- Extract the current m4a URL from the episode page.
- Download audio, cut, run ASR, merge `full.txt`.
- Do not rely on stale cached media URLs.

### 公众号

- Fetch with Jina Reader first.
- If that fails, use an HTML-to-Markdown fetcher such as `url-md`.
- If both fail or the body is too short, mark the item as needs supplement instead of writing an empty summary.

### 知乎

- Prefer answer APIs for known answer URLs when available.
- For full reading or truncated answers, use a logged-in browser text capture.
- Do not close tabs that were not successfully captured.
- Mark anti-bot or short error pages as failed capture.

### Local audio/video

- Treat local files like platform media: cut, ASR, merge, then summarize.
- Preserve the original filename and a local source path in the manifest.

## ASR rules

This package ships generic ASR helpers for SiliconFlow TeleAI/TeleSpeechASR.

API key lookup order:

1. `SF_KEY`
2. `SILICONFLOW_API_KEY`
3. `~/.config/siliconflow/api_key`

Rules:

- Run all pending `chunk_*.wav` through one global queue.
- Start with 16 workers. Benchmark 16/24/32 only when the batch is large enough to justify it.
- Do not switch ASR providers silently. If TeleSpeechASR returns balance, quota, or API errors, report the exact error.
- Short videos can legitimately produce short transcripts. Flag them as short or low-density, but do not fake a long summary.

Known measurement from 2026-06-05:

| Workers | Chunks | Errors | Elapsed |
|---:|---:|---:|---:|
| 16 | 32 | 0 | 24.07s |
| 24 | 32 | 0 | 22.13s |
| 32 | 32 | 0 | 19.27s |

## Quality gate

Before writing a final summary, verify each media item has:

- source media;
- `chunk_*.wav`;
- matching `chunk_*.txt`;
- `full.txt`;
- no transcript chunk starting with `[ERROR]`.

For text items, verify:

- captured body is long enough to represent the source;
- the text is not a login page, anti-bot page, error page, or metadata-only shell.

If only download, cutting, or ASR has finished, label the state as:

```text
素材摄入完成，摘要待重跑
```

Do not present ingestion-only output as a finished product.

## Final summary standard

Final summaries must be understanding-based writing, not extractive sentence ranking.

Each item should include:

- 基础信息: title, author/channel, platform, type, duration or word count, source link, interaction data if available;
- 质量门禁: source completeness, ASR/chunk status, capture problems, and whether the item is suitable for memory review;
- 一句话概括: the source's main point, not the editor's judgment;
- 内容复原: what it says, how it unfolds, key examples/steps/details, what the reader should retain;
- 核心内容: topic-based sections, not transcript-fragment order;
- 核心论点与推导: claim, evidence/case, inference/conclusion;
- 高光亮点: moments with information gain or emotional memory;
- 金句/引述: short quotes only;
- 与用户相关: only when the connection is real;
- 编辑层提炼: value, limits, bias, soft-ad risk, reusable methods;
- 补采/失败项: failures and next actions.

Do not start the summary with a Markdown table. Use short metadata lines first.

## Memory and cleanup

- Summary output can include memory candidates, but they remain review-only.
- Do not write durable memory without explicit user approval.
- Do not mark reminders, browser tabs, or watch-later entries complete until the final summary has passed the quality gate.
- Never write directly to a reminders database. Use the user's normal app/API when cleanup is approved.
- B站 watch-later cleanup may require manual removal. Report that clearly.

## Package validation

Before uploading or selling the package, run:

```bash
python3 scripts/validate_skill.py
python3 scripts/asr_benchmark.py --help
python3 scripts/transcribe_global.py --help
```

These checks must pass without requiring an API key. Real ASR runs still require a configured key and `ffmpeg`.

## Shipped resources

- `scripts/asr_benchmark.py`: benchmark current TeleSpeechASR concurrency.
- `scripts/transcribe_global.py`: submit all pending chunks through one global worker pool and optionally merge `full.txt`.
- `scripts/validate_skill.py`: offline package and quality-gate self-check.
