# Site Structure

Last reviewed: 2026-05-19

## What Is Live

GitHub Pages serves this repository from the root. Treat these as live production paths:

- `/` from `index.html`
- `/photo/`
- `/lit-visual/`
- `/wedding-ai-studio/`
- `/podcast/`
- `/ai-survey/`
- `/prompt-toolkit/`
- `/maze-game/`
- `/ninja-slash/`
- `/mist-town/`

Standalone project pages are plain static HTML. Prefer small direct edits over rebuilding the whole repo.

## What Is Legacy

These paths exist because the site previously used Hugo or automated gallery generation:

- `content/`
- `config.toml`
- `themes/`
- `public/`
- `resources/`
- `static/`

`public/` is generated output and is also historically tracked in git. Do not edit files under `public/` manually. If cleanup is needed, remove it from git tracking in a separate commit after confirming no external links depend on `/public/...`.

## Current Large Directories

The largest directories are:

- `public/` - generated Hugo output and duplicated photo assets.
- `static/` - legacy static assets.
- `photo/` - live gallery assets.
- `wedding-ai-studio/` - live portfolio assets.

The size is mostly image assets. Avoid moving or deleting image folders without link checks.

## Safe Maintenance Rules

- Add new project pages as a self-contained directory with `index.html` and local assets.
- Store AI visual project images as optimized `.webp` files in that project's `images/` folder.
- Keep homepage cards in `index.html`.
- Keep project index cards in the relevant section index, such as `lit-visual/index.html`.
- Do not hand-edit `public/` or `resources/`.
- Do not delete generated or legacy folders in the same commit as content updates.

## Optional Cleanup Plan

These are safe cleanup candidates, but should be done as a separate change:

1. Confirm GitHub Pages is configured to serve from root.
2. Check whether any public links use `/public/...`.
3. If no links depend on it, untrack generated output with `git rm --cached -r public resources`.
4. Keep local ignored copies if they are useful for Hugo rebuilds.
5. Commit that cleanup separately from homepage content changes.
