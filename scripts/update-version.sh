#!/bin/bash

# Script to update version numbers across the project

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

echo "Updating version to $NEW_VERSION"

# Update package.json
echo "Updating package.json..."
# Using npm version to update package.json - this also creates a git tag
npm version $NEW_VERSION --no-git-tag-version

# Update version in index.html
echo "Updating index.html..."
sed -i '' "s/| v[0-9]\+\.[0-9]\+\.[0-9]\+/| v${NEW_VERSION}/g" src/index.html

# Update Homebrew formula
echo "Updating cliphit.rb..."
OLD_VERSION=$(grep -o 'refs/tags/v[0-9]\+\.[0-9]\+\.[0-9]\+' cliphit.rb | cut -d'v' -f2)
sed -i '' "s/refs\/tags\/v${OLD_VERSION}/refs\/tags\/v${NEW_VERSION}/g" cliphit.rb
sed -i '' "s/cliphit-${OLD_VERSION}.tar.gz/cliphit-${NEW_VERSION}.tar.gz/g" cliphit.rb

echo ""
echo "✅ Version updated to $NEW_VERSION across all files"
echo ""
echo "Next steps:"
echo "1. Review the changes"
echo "2. Create a git tag: git tag v$NEW_VERSION"
echo "3. Run: yarn prepare-release"
echo "4. Commit and push changes: git commit -am \"Release v$NEW_VERSION\" && git push origin main v$NEW_VERSION" 