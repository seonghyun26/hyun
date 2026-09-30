# Original website by Martin Saveski

This site is built on Martin Saveski's Jekyll template, and all of the original design is his.

- Original repository: [msaveski/www_personal](https://github.com/msaveski/www_personal)
- Original author: [Martin Saveski](https://faculty.washington.edu/msaveski/)

This version is the personal academic website of **Seonghyun Park** (Ph.D. student, KAIST AI), live at
[seonghyun26.github.io/hyun](https://seonghyun26.github.io/hyun/). The profile photo transitions were
inspired by [ChaeYoung Huh](https://www.cyhuh.com/). Feel free to reuse it — if you do, an
[email](mailto:hyun26@kaist.ac.kr) would be lovely.

- [Updates guide](#updates-guide)
- [Ship it](#ship-it)
- [CV render](#cv-render)
- [External Libraries](#external-libraries)

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

Images live under `assets/img/` — `logo/`, `profile/`, `camera/`, and `project/<project>/` for a side
project's screenshots; paper thumbnails and PDFs under `assets/publications/`. A side project's longer
writeup is Markdown in `projects/`, pulled into the page by that project's `include:` key (via
`include_relative`, which reads the source tree; `_config.yml` excludes `projects` from the build so
the writeups are not also served as raw markdown).

## Ship it

Debug locally, then push — those are the only two things you need. The system Ruby is too old to build
this, so serve with Homebrew's Ruby:

```sh
PATH=/opt/homebrew/opt/ruby/bin:$PATH bundle exec jekyll serve
```

Then open <http://127.0.0.1:4000>, where the site rebuilds on every save. (`serve.sh` does the same
thing and adds live reload.) There is no test suite or linter.

Pushing to `main` publishes to GitHub Pages — `.github/workflows/jekyll-gh-pages.yml` builds and
deploys, and `baseurl` is injected at build time by `actions/configure-pages`, which is why it stays
commented out in `_config.yml`. Nothing is run by hand. A second workflow,
`.github/workflows/link-check.yml`, checks the site's outbound links on every push and weekly.
(`__deploy.sh` is a leftover from the original — it `scp`s to an MIT Media Lab account and is unused.)

## CV render

The CV is not written as a PDF — it is generated from YAML by
[RenderCV](https://github.com/rendercv/rendercv) (pinned to 2.8 in `resume/environment.yml`), which
typesets through [Typst](https://typst.app/) rather than LaTeX.

| | |
| --- | --- |
| Source | `resume/Seonghyun_Park_CV.yaml` — content, plus a `design:` block on the `classic` theme with per-entry template overrides |
| Build | `resume/make.sh`, which runs `rendercv render` inside the `cv` conda env |
| Output | `resume/output/Seonghyun_Park_CV.{pdf,typ,md,html}` and two page PNGs |

The site links only the PDF, from the Vita section of `index.html`:

```
/resume/output/Seonghyun_Park_CV.pdf
```

`_config.yml` excludes everything else under `resume/` from the build, so the toolchain — the conda
env, the templates, the source YAML — never reaches `_site`. The other files in `resume/output/` are
not excluded and are published alongside the PDF, though nothing links to them.

To update the CV: edit the YAML, run `resume/make.sh`, and commit the regenerated `output/`. The
website needs no change — it points at a fixed path.

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
