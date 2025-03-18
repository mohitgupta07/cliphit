#!/bin/bash

# This script creates a simple icon for the ClipHit app
# In a real project, you would replace this with a proper icon

echo "Creating icon files..."

# Create the assets directory
mkdir -p assets

# Download a placeholder icon
echo "Downloading placeholder icons..."
curl -s -o assets/trayIconTemplate.png "https://placehold.co/32x32/000000/FFFFFF/png"
curl -s -o assets/icon.icns "https://placehold.co/1024x1024/007aff/FFFFFF/png"

echo "Icon files created. For a production app, you should replace these with proper icon files." 