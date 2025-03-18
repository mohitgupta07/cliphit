#!/bin/bash

# Script to automate the entire release process

set -e

if [ $# -ne 1 ]; then
  echo "Usage: $0 <new_version>"
  echo "Example: $0 1.0.1"
  exit 1
fi

NEW_VERSION="$1"

# Validate version format
if ! [[ "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: Version must be in format X.Y.Z (e.g., 1.0.1)"
  exit 1
fi

echo "========================================"
echo "Starting release process for v$NEW_VERSION"
echo "========================================"

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
  echo "Error: You have uncommitted changes. Please commit or stash them before proceeding."
  exit 1
fi

# Update version numbers across the project
echo "🔄 Updating version numbers..."
./scripts/update-version.sh $NEW_VERSION

# Create git tag
echo "🏷️  Creating git tag v$NEW_VERSION..."
git tag "v$NEW_VERSION"

# Prepare the release (create archive and generate hash)
echo "📦 Preparing release files..."
yarn prepare-release

# Commit changes
echo "💾 Committing changes..."
git commit -am "Release v$NEW_VERSION"

# Push changes and tag
echo "🚀 Pushing changes and tag..."
git push origin main
git push origin "v$NEW_VERSION"

echo ""
echo "✅ Release v$NEW_VERSION completed successfully!"
echo ""
echo "The following actions were performed:"
echo "- Updated version number across all files"
echo "- Created git tag v$NEW_VERSION"
echo "- Generated release archive"
echo "- Updated SHA256 hash in Homebrew formula"
echo "- Committed and pushed changes"
echo ""
echo "You can now create a GitHub release at:"
echo "https://github.com/mohitgupta07/clippy/releases/new?tag=v$NEW_VERSION" 