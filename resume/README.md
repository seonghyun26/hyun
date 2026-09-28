# CV compilation

Create the dedicated conda environment once, from the repository root:

```bash
conda env create -f resume/environment.yml
```

Edit `resume/Seonghyun_Park_CV.yaml`, then compile:

```bash
bash resume/make.sh
```

The script selects the `cv` environment automatically; activation is optional.
PDF, Typst, Markdown, HTML, and page previews are written to `resume/output/`.
Rendering takes place in a temporary directory using RenderCV's built-in
templates plus the overrides in `templates/classic/`. The publication
override gives publications the full text width without reserving a date column.
Education and experience retain their built-in date/location columns.
The old local template folders are not loaded.

## Formatting

- `SectionBeginning.j2.typ`: publication headings include an 8pt contribution-symbol legend.
- `EducationEntry.j2.typ`: degree labels use `#text(size: 11pt)`.
- `ExperienceEntry.j2.typ`: the company/position line uses `#text(size: 11pt)`.
- `PublicationEntry.j2.typ`: paper titles use `#text(size: 11pt)`.
- `Seonghyun_Park_CV.yaml` → `design.templates.publication_entry.main_column`:
  `JOURNAL (URL)` displays the venue before the clickable DOI/URL.
- `output/` files are generated; edit the source YAML or templates instead.

For interactive use:

```bash
conda activate cv
rendercv --version
```

The existing `resume` conda environment is independent of this environment.
