#!/bin/bash

# Script to generate SHA256 hash for Homebrew formula
# This should be run after creating a release archive

set -e

# Extract version from package.json
VERSION=$(node -p "require('../package.json').version")
ARCHIVE_NAME="cliphit-${VERSION}.tar.gz"
FORMULA_FILE="cliphit.rb"

echo "Using version: ${VERSION}"

# Check if the archive exists
if [ ! -f "${ARCHIVE_NAME}" ]; then
  echo "Error: ${ARCHIVE_NAME} not found."
  echo "This script should be run after creating the release archive."
  echo ""
  echo "To create an archive for release, run:"
  echo "  yarn create-archive"
  exit 1
fi

# Generate SHA256 hash
HASH=$(shasum -a 256 "${ARCHIVE_NAME}" | cut -d ' ' -f 1)

if [ -z "${HASH}" ]; then
  echo "Error: Failed to generate hash."
  exit 1
fi

echo "Generated SHA256 hash: ${HASH}"

# Update the formula file
if [ -f "${FORMULA_FILE}" ]; then
  # Replace the placeholder with the actual hash
  sed -i '' "s/sha256 \".*\"/sha256 \"${HASH}\"/g" "${FORMULA_FILE}"
  echo "Updated ${FORMULA_FILE} with the new hash."
else
  echo "Error: ${FORMULA_FILE} not found."
  echo "Make sure you're running this script from the repository root."
  exit 1
fi

echo ""
echo "✅ SHA256 hash has been successfully generated and updated."
echo "You can now commit the changes and publish the release." 