#!/usr/bin/env python3
"""
Script to generate the GitHub Actions workflow file for updating formula SHA256.
"""

import os

# Create the .github/workflows directory if it doesn't exist
os.makedirs('.github/workflows', exist_ok=True)

# Define the content of the workflow file
workflow_content = """name: Update Formula SHA256

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  update-formula:
    runs-on: macos-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Extract version from tag
        run: |
          echo "VERSION=${GITHUB_REF#refs/tags/v}" >> $GITHUB_ENV
          
      - name: Wait for release archive to be available
        run: |
          echo "Waiting for GitHub to make the release archive available..."
          sleep 60
          
      - name: Download release archive
        run: |
          mkdir -p releases
          curl -L "https://github.com/${{ github.repository }}/archive/refs/tags/v${{ env.VERSION }}.tar.gz" -o "releases/cliphit-${{ env.VERSION }}.tar.gz"
          echo "Downloaded archive to releases/cliphit-${{ env.VERSION }}.tar.gz"
          
      - name: Generate SHA256 and update formula
        run: |
          HASH=$(shasum -a 256 "releases/cliphit-${{ env.VERSION }}.tar.gz" | cut -d ' ' -f 1)
          echo "Generated SHA256: $HASH"
          
          # Update the formula file
          sed -i '' "s|sha256 \\".*\\"|sha256 \\"$HASH\\"|g" cliphit.rb
          
          # Update the URL to point to the correct version
          sed -i '' "s|v[0-9]\\+\\.[0-9]\\+\\.[0-9]\\+\\.tar\\.gz|v${{ env.VERSION }}.tar.gz|g" cliphit.rb
          
          # Update the comment about generating the hash
          sed -i '' "s|cliphit-[0-9]\\+\\.[0-9]\\+\\.[0-9]\\+\\.tar\\.gz|cliphit-${{ env.VERSION }}.tar.gz|g" cliphit.rb
          
          cat cliphit.rb
          
      - name: Commit and push changes
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add cliphit.rb
          git commit -m "Update formula hash for v${{ env.VERSION }}"
          git push origin main
          
      - name: Update Formula directory
        run: |
          cp cliphit.rb Formula/cliphit.rb
          git add Formula/cliphit.rb
          git commit -m "Update Formula directory for v${{ env.VERSION }}"
          git push origin main
"""

# Replace the GitHub Actions expression syntax properly
workflow_content = workflow_content.replace("${{ ", "$\\{\\{ ").replace(" }}", " \\}\\}")

# Write the workflow file
with open('.github/workflows/update-formula.yml', 'w') as f:
    f.write(workflow_content)

print("GitHub Actions workflow file has been generated at .github/workflows/update-formula.yml") 