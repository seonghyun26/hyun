# Original website by Martin Saveski

This site is built on Martin Saveski's Jekyll template, and all of the original design is his.

- Original repository: [msaveski/www_personal](https://github.com/msaveski/www_personal)
- Original author: [Martin Saveski](https://faculty.washington.edu/msaveski/)

This version is the personal academic website of **Seonghyun Park** (Ph.D. student, KAIST AI), live at
[seonghyun26.github.io/hyun](https://seonghyun26.github.io/hyun/). The profile photo transitions were
inspired by [ChaeYoung Huh](https://www.cyhuh.com/). Feel free to reuse it — if you do, an
[email](mailto:hyun26@kaist.ac.kr) would be lovely.

## Updates guide

Change one of the files in `_data`, unless you are changing the look of the website:

| file | holds |
| --- | --- |
| `main_info.yaml` | name, title, email, social links |
| `profile.yaml` | the header photos and their switcher icons |
| `publications.yaml` | papers (`selected: y` puts one in the Selected tab) |
| `authors.yaml` | co-author homepages, auto-linked into every author list |
| `experience.yaml` | the CV timeline |
| `side_projects.yaml` | the project cards and their popups |
| `photos.yaml` | the Hobbies gallery |

Images live under `assets/img/` (`logo/`, `profile/`, `camera/`); paper thumbnails and PDFs under
`assets/publications/`; project screenshots under `assets/side-projects/`. Longer project writeups are
Markdown in `_includes/side-projects/`, pulled in by a project's `include:` key.

## Build & serve

The system Ruby is too old to build this, so serve with Homebrew's Ruby:

```sh
PATH=/opt/homebrew/opt/ruby/bin:$PATH bundle exec jekyll serve
```

Then open <http://127.0.0.1:4000>. There is no test suite or linter.

## Deploy

Pushing to `main` deploys to GitHub Pages via `.github/workflows/jekyll-gh-pages.yml`; `baseurl` is
injected at build time by `actions/configure-pages`, so it stays commented out in `_config.yml`.
Nothing needs to be run by hand. (`__deploy.sh` is a leftover from the original — it `scp`s to an MIT
Media Lab account and is not used here.)

`.github/workflows/link-check.yml` checks the site's outbound links.

## External Libraries

- Framework: [Jekyll](http://jekyllrb.com/)
- CSS
  - [Skeleton](http://getskeleton.com)
  - Tabs: [Skeleton Tabs](https://github.com/nathancahill/skeleton-tabs)
  - Experience: [Timeline](https://codepen.io/NilsWe/pen/FemfK)
  - Icons: [Font Awesome](http://fontawesome.io/) and [Academicons](https://jpswalsh.github.io/academicons/)
  - Type: [Raleway](https://fonts.google.com/specimen/Raleway)
- JS
  - [jQuery (3.1.1)](https://jquery.com/)
- CV: [RenderCV](https://github.com/rendercv/rendercv) builds `resume/output/Seonghyun_Park_CV.pdf`
  from `resume/Seonghyun_Park_CV.yaml`
