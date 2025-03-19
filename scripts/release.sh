#!/bin/bash

# Script to automate the first phase of the release process
# The second phase (SHA256 updates) is now handled by GitHub Actions

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

# PHASE 1: Create the release (GitHub Actions will handle PHASE 2)
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

# Push the tag (this creates the GitHub release source and triggers the Actions workflow)
echo "🚀 Pushing tag..."
git push origin "v$NEW_VERSION"
git push origin main

echo ""
echo "✅ Release v$NEW_VERSION initiated successfully!"
echo ""
echo "The following actions were performed:"
echo "- Updated version number across all files"
echo "- Created git tag v$NEW_VERSION"
echo "- Pushed tag to GitHub"
echo ""
echo "GitHub Actions will now:"
echo "- Download the release archive"
echo "- Update the SHA256 hash in the formula"
echo "- Commit and push the changes"
echo ""
echo "You can monitor the progress at:"
echo "https://github.com/mohitgupta07/cliphit/actions"
echo ""
echo "Once complete, you can create a GitHub release at:"
echo "https://github.com/mohitgupta07/cliphit/releases/new?tag=v$NEW_VERSION" 