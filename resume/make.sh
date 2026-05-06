#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CV_FILE="Seonghyun_Park_CV.yaml"
OUT_DIR="$SCRIPT_DIR/output"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

mkdir -p "$OUT_DIR"
cp "$SCRIPT_DIR/$CV_FILE" "$TMP_DIR/$CV_FILE"

# Use RenderCV with the full extras so the bundled Typst compiler is available.
# Render from a temporary directory so old local template folders (classic/, markdown/)
# do not shadow RenderCV's built-in templates and leave raw Jinja in the .typ file.
(
  cd "$TMP_DIR"
  uvx --from 'rendercv[full]==2.8' rendercv render "$CV_FILE" \
    --typst-path Seonghyun_Park_CV.typ \
    --pdf-path Seonghyun_Park_CV.pdf \
    --markdown-path Seonghyun_Park_CV.md \
    --html-path Seonghyun_Park_CV.html \
    --png-path Seonghyun_Park_CV.png
)

cp "$TMP_DIR"/Seonghyun_Park_CV.typ "$OUT_DIR"/
cp "$TMP_DIR"/Seonghyun_Park_CV.pdf "$OUT_DIR"/
cp "$TMP_DIR"/Seonghyun_Park_CV.md "$OUT_DIR"/
cp "$TMP_DIR"/Seonghyun_Park_CV.html "$OUT_DIR"/
cp "$TMP_DIR"/Seonghyun_Park_CV_*.png "$OUT_DIR"/
chmod 0644 "$OUT_DIR"/Seonghyun_Park_CV.* "$OUT_DIR"/Seonghyun_Park_CV_*.png
