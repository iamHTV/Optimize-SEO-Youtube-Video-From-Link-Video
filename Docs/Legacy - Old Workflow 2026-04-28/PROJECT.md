---
created: 2026-04-13
updated: 2026-04-22 15:09
version: 2026-04-22 15:09
tags:
  - status/doing
  - topic/company/chccdn
  - type/project-moc
---

# YouTube Optimize

## Current State

- Root docs have been reduced so `Docs/` is the source of truth for specs.
- `YouTube Master` is now the data/reference layer.
- Apps Script owns ingest, sheet setup, and recurring sheet refresh.
- Optimize for private/scheduled videos now starts from direct video links, not from the sheet.

## Source Of Truth

- `Docs/YTO Solution Architecture.md`: architecture and per-flow solutions.
- `Docs/YTO Workflow Spec.md`: operating workflow.
- `Docs/YTO Requirements.md`: requirements and constraints.
- `Docs/YTO Skill Spec.md`: project skill behavior.

## Current Focus

1. Keep `YouTube Master` stable as a data/reference sheet.
2. Support direct-link optimize flow for private/scheduled videos.
3. Use local Markdown as the main working layer for optimize output.
4. Keep rescan confirmation for videos that exist in `YouTube Master`.

## Next Tasks

- Keep Apps Script focused on ingest and metadata refresh.
- Do not require manual sheet rows for private/scheduled optimize.
- Use direct video URLs from YouTube Studio as the operational input when API access is not available.
- Keep local Markdown as the place where optimization drafts are generated and reviewed.

## Done Means

- `YouTube Master` remains useful as metadata/reference storage.
- Private/scheduled optimize is no longer blocked by API access limitations.
- The user can start optimize directly from a YouTube Studio link.
- Detailed flow decisions stay in `Docs/`, not duplicated here.
