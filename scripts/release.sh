#!/bin/bash

# Script to automate the entire release process with a two-phase approach
# to avoid SHA256 update paradox

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

# PHASE 1: Create the release without updating the formula
echo "========== PHASE 1: Creating Release =========="

# Update version numbers across the project
echo "🔄 Updating version numbers..."
./scripts/update-version.sh $NEW_VERSION

# Commit the version update
echo "💾 Committing version update..."
git add package.json
git commit -m "Bump version to v$NEW_VERSION"

# Create git tag
echo "🏷️  Creating git tag v$NEW_VERSION..."
git tag "v$NEW_VERSION"

# Push the tag (this creates the GitHub release source)
echo "🚀 Pushing tag..."
git push origin "v$NEW_VERSION"

# PHASE 2: Generate formula SHA256 from the tagged release
echo "========== PHASE 2: Updating Formula =========="

# Create releases directory if needed
mkdir -p releases

# Download the tagged archive directly from GitHub
echo "📦 Downloading release archive from GitHub..."
curl -L "https://github.com/mohitgupta07/cliphit/archive/refs/tags/v$NEW_VERSION.tar.gz" -o "releases/cliphit-$NEW_VERSION.tar.gz"

# Generate SHA256 hash
echo "🔑 Generating SHA256 hash..."
HASH=$(shasum -a 256 "releases/cliphit-$NEW_VERSION.tar.gz" | cut -d ' ' -f 1)

if [ -z "${HASH}" ]; then
  echo "Error: Failed to generate hash."
  exit 1
fi

echo "Generated SHA256 hash: ${HASH}"

# Update the formula file
echo "📝 Updating formula with new hash..."
sed -i '' "s/sha256 \".*\"/sha256 \"${HASH}\"/g" "cliphit.rb"

# Commit and push the formula update
echo "💾 Committing formula update..."
git add cliphit.rb
git add releases/cliphit-${NEW_VERSION}.tar.gz
git commit -m "Update formula for v$NEW_VERSION"
git push origin main

echo ""
echo "✅ Release v$NEW_VERSION completed successfully!"
echo ""
echo "The following actions were performed:"
echo "- Updated version number across all files"
echo "- Created git tag v$NEW_VERSION"
echo "- Downloaded release archive from GitHub"
echo "- Updated SHA256 hash in Homebrew formula"
echo "- Committed and pushed all changes"
echo ""
echo "You can now create a GitHub release at:"
echo "https://github.com/mohitgupta07/cliphit/releases/new?tag=v$NEW_VERSION" 