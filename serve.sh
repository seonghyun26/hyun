#!/bin/bash
# Local preview server for the personal website
# Run this to check changes before pushing to GitHub Pages

cd "$(dirname "$0")"

# Use Homebrew Ruby instead of macOS system Ruby
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"
export GEM_HOME="$HOME/.gem/ruby/$(ruby -e 'puts RUBY_VERSION')"
export PATH="$GEM_HOME/bin:$PATH"

# Install bundler if not available
if ! command -v bundle &> /dev/null; then
  echo "Installing bundler..."
  gem install bundler
fi

# Install dependencies if needed
if [ ! -f "Gemfile.lock" ] || ! bundle check &> /dev/null; then
  echo "Installing dependencies..."
  bundle install
fi

echo "Starting Jekyll server at http://localhost:4000"
echo "Press Ctrl+C to stop"
bundle exec jekyll serve --livereload
