# Optimize SEO Youtube Video From Link Video

An AI-assisted workflow for turning YouTube video links, Shorts links, transcripts, or raw scripts into ready-to-paste YouTube metadata.

The project is currently tuned for Vietnamese real estate content in Da Nang, especially the `Doan Kim Nga BDS` channel workflow, but the structure can be adapted to other niches.

Vietnamese documentation: [README.vi.md](README.vi.md)

## What It Does

For each video, the workflow can produce:

- selected YouTube title
- alternative title options
- description
- tags under YouTube's practical character limit
- thumbnail text options
- pinned first comment
- quality checklist
- batch Markdown output with copy-friendly code blocks

The copy-heavy fields are written inside fenced `text` blocks so they keep formatting and can be copied quickly from modern Markdown viewers.

## Current Workflow

The user provides one or more of the following:

- YouTube video links or YouTube Shorts links
- a transcript or script
- the current video title
- project notes or positioning hints

The assistant workflow then:

1. Extracts the video ID.
2. Gets the current video title when possible.
3. Attempts to fetch transcript data.
4. Classifies short/no-dialogue videos cautiously.
5. Generates metadata through the YouTube SEO skill.
6. Saves batch output to `output/YYYY-MM-DD/batchX.md` in local use.
7. Removes temporary transcript files after processing.

Generated output folders are intentionally ignored by Git and are not published to this repository.

## Main Skills

- `Skills/youtube-optimize-from-link/`
  Link-first batch workflow. It processes one or more YouTube links, gathers available metadata/transcript context, calls the SEO skill, and saves a batch Markdown file.

- `Skills/youtube-seo-bds/`
  YouTube SEO metadata generator for Vietnamese real estate videos. It controls titles, descriptions, tags, thumbnail text, first comments, CTA blocks, quality checks, and copy block formatting.

- `Skills/youtube-sheet-reader/`
  Helper skill for reading context from sheet/export data when available.

## Important Behavior Added After Refactoring

Compared with the original workflow, the current version is more automated and safer for repeated use:

- It can start from YouTube links instead of requiring a prepared script first.
- It supports batch processing for multiple links.
- It saves results to dated batch files.
- It avoids blocking the workflow when a transcript is missing.
- It marks music/no-dialogue videos instead of inventing content.
- It wraps title, description, tags, and first comment in copyable code blocks.
- It removes common weak description openings such as "In this video..." style phrasing.
- It uses stricter quality checks for tag length, source accuracy, contact block, and output format.
- It keeps generated/private working data out of GitHub through `.gitignore`.

## Repository Layout

- `Docs/` - project notes, workflow specs, requirements, and legacy documentation
- `Script/` - Google Apps Script helpers
- `Skills/` - Codex/AI workflow skills
- `.gitignore` - excludes generated output, temporary files, records, trash, env files, and local exports

Ignored local folders:

- `output/`
- `tmp/`
- `Records/`
- `.trash/`

## Local Requirements

Depending on the workflow, the local environment may need:

- Python 3
- `yt-dlp`
- a transcript extraction setup supported by `Skills/youtube-seo-bds/scripts/get_transcript.py`
- access to any private project inventory used by your own local setup

Private project inventory paths should be configured locally and should not be committed to this repository.

## Boundary

This project prepares YouTube metadata. It does not publish directly to YouTube Studio. The user reviews the generated title, description, tags, thumbnail text, and pinned comment before publishing.
