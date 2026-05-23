# Optimize SEO Youtube Video From Link Video

Workspace for optimizing YouTube upload metadata from video links, transcripts, and user-provided scripts.

## Current Workflow

User provides:

- one or more YouTube video links
- video script or transcript
- temporary title
- optional notes or positioning

The assistant uses the project skill to produce:

- rewritten title
- description
- tags
- thumbnail text
- pinned comment for seeding and CTA
- optional local output file for audit and reuse

## Source Of Truth

- `Docs/PROJECT.md`: project summary and current state
- `Docs/YTO Workflow Spec.md`: operational workflow
- `Docs/YTO Requirements.md`: requirements and acceptance criteria
- `Docs/YTO Solution Architecture.md`: data model and storage decisions
- `Docs/YTO Skill Spec.md`: behavior required from the assistant skill
- `Docs/YTO Content Record Template.md`: template for one video optimization record
- `Docs/Legacy - Old Workflow 2026-04-28/`: old failed workflow docs kept for reference

## Active Folders

- `Docs/`: current and legacy documentation
- `Skills/youtube-optimize-from-link/`: link-first batch workflow skill
- `Skills/youtube-seo-bds/`: YouTube SEO metadata skill
- `Skills/youtube-sheet-reader/`: sheet/export context reading skill
- `Script/`: Google Apps Script helpers

Generated folders such as `output/`, `tmp/`, `Records/`, and `.trash/` are intentionally ignored so private working data is not published.

## Boundary

The assistant prepares optimization output and local records. The user reviews and publishes changes in YouTube Studio.
