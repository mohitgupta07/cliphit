#!/bin/bash

# Set up colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== ClipHit Local Brew Tap Test ===${NC}"

# Get current directory
CURRENT_DIR=$(pwd)
echo -e "${BLUE}Current directory: ${CURRENT_DIR}${NC}"

# Get current branch name
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
echo -e "${BLUE}Current branch: ${BRANCH_NAME}${NC}"

# Step 1: Create a HEAD-only formula for testing
echo -e "${BLUE}Step 1: Creating HEAD-only formula file...${NC}"

cat > cliphit_test.rb << EOL
class CliphitTest < Formula
  desc "A clipboard history manager for macOS (test version)"
  homepage "https://github.com/mohitgupta07/cliphit"
  license "MIT"
  version "1.0.1"
  
  # Use HEAD for local development testing
  head do
    url "file://${CURRENT_DIR}", :branch => "${BRANCH_NAME}"
  end
  
  def install
    # Create a mock app structure
    app_dir = buildpath/"MockClipHit.app/Contents/MacOS"
    app_dir.mkpath
    (app_dir/"cliphit").write("#!/bin/bash\necho 'ClipHit Mock App'")
    system "chmod", "+x", "#{app_dir}/cliphit"
    prefix.install "MockClipHit.app"
    
    # Add a simple binary to test
    bin.mkpath
    (bin/"cliphit").write("#!/bin/bash\necho 'ClipHit CLI Mock'")
    system "chmod", "+x", "#{bin}/cliphit"
  end

  test do
    system "#{bin}/cliphit"
  end
end
EOL

echo -e "${GREEN}✓ Formula file created${NC}"

# Step 2: Install from local formula
echo -e "${BLUE}Step 2: Installing from local formula file...${NC}"
brew install --HEAD --verbose ./cliphit_test.rb

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ ClipHit Test successfully installed${NC}"
  echo -e "${BLUE}Testing the installation...${NC}"
  INSTALL_PATH=$(brew --prefix cliphit-test)
  echo -e "${GREEN}ClipHit Test installed at: ${INSTALL_PATH}${NC}"
  
  # Test running the binary
  echo -e "${BLUE}Running the binary:${NC}"
  cliphit
else
  echo -e "${RED}✗ Failed to install ClipHit Test${NC}"
fi

echo -e "${BLUE}=== Test Complete ===${NC}" 