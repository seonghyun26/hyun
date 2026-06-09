# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

Personal academic website for Seonghyun Park (Ph.D. student, KAIST AI). Built with Jekyll, hosted via GitHub Pages at `seonghyun26.github.io/hyun/`.

## Build & Serve

```bash
jekyll serve        # Local dev server (default: http://localhost:4000)
```

No test suite or linter is configured.

## Architecture

This is a data-driven Jekyll site. The page layout and content are intentionally separated:

- **Content lives in `_data/*.yaml`** — almost all updates (adding a paper, updating experience, changing profile info) should be done by editing these YAML files, not the HTML.
  - `main_info.yaml` — name, title, email, profile pic path, social links (Google Scholar, GitHub, LinkedIn)
  - `publications.yaml` — list of papers with fields: `title`, `authors`, `venue`, `paper_pdf`, `thumbnail`, `url`, `selected` (y/n), and optional `page`, `slides`, `poster`, `video`, `code`, `data`
  - `experience.yaml` — CV timeline entries with `place`, `time`, `title`, `subtitle`, `category` ("work" or "school" — determines left/right placement on timeline)

- **`index.html`** — main page, uses Liquid templates to render data from `_data/`. Sections: Bio, Publications (with Selected/All tabs), CV timeline. The Projects section exists in markup but is commented out.

- **`_layouts/default.html`** — base layout. Includes header with profile pic + social icons, sticky navbar, footer. References `site.data.main_info` for all personal info.

- **`libs/custom/my_css.css`** and **`libs/custom/my_js.js`** — site-specific styles and scripts.

- **`assets/publications/`** — paper PDFs and `thumbnails/` for paper images. The `profile-pics/` directory is under `assets/`.

## Key Conventions

- Bold the author's own name in publication entries: `<b>Seonghyun Park</b>`
- Use `<sup>†</sup>` for equal contribution, `<sup>‡</sup>` for co-corresponding author
- Set `selected: y` on papers to show them in the "Selected" publications tab
- `baseurl` is set via `_config.yml` (currently commented out as `/~hyun`); all asset paths use `{{ site.baseurl }}` prepend
- Paper PDFs follow naming convention: `assets/publications/YYVENUE_ShortName.pdf`
- Thumbnails go in `assets/publications/thumbnails/`
