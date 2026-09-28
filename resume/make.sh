#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONDA_BIN="${CONDA_EXE:-conda}"
if ! command -v "$CONDA_BIN" >/dev/null 2>&1; then
  echo "Conda is required. Install conda, then run:" >&2
  echo "  conda env create -f \"$SCRIPT_DIR/environment.yml\"" >&2
  exit 1
fi
CV_FILE="Seonghyun_Park_CV.yaml"
OUT_DIR="$SCRIPT_DIR/output"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

mkdir -p "$OUT_DIR"
cp "$SCRIPT_DIR/$CV_FILE" "$TMP_DIR/$CV_FILE"
cp -R "$SCRIPT_DIR/templates/classic" "$TMP_DIR/"

# The cv conda environment pins RenderCV with the bundled Typst compiler.
# Load the current template overrides in a temporary directory, falling back to
# built-in templates without the old local classic/ and markdown/ files.
(
  cd "$TMP_DIR"
  "$CONDA_BIN" run --no-capture-output -n cv rendercv render "$CV_FILE" \
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
