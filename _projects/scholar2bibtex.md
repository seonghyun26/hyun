**Scholar → BibTeX** — drag-select a paper title, hit a shortcut, and its BibTeX is on your clipboard. A Chromium extension (Manifest V3) that grabs the top Google Scholar result's citation without the manual *Cite → BibTeX → copy* dance.

<img class="modal-img-half" src="{{ site.baseurl }}/assets/side-projects/scholar2bibtex/preview.png" alt="Scholar → BibTeX popup" />

**How to use**

- **Select + shortcut** — highlight a title on any page and press `⌘⇧B` (macOS) / `Ctrl+Shift+B`.
- **Right-click** — or pick *Copy Scholar BibTeX for "…"* from the context menu.
- **Popup** — or type a title into the toolbar popup.

The lookup runs in a background Scholar tab; the toolbar badge shows progress (`...` running · `✓` copied · `!` failed). Nothing leaves the browser.

**Tech**: JavaScript · Chromium Extension (Manifest V3) · v1.0.5
