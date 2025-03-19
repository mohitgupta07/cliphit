# ClipHit Makefile
# A convenient interface for the release process

# Get version from package.json
VERSION := $(shell node -e "console.log(require('./package.json').version)")

# Directories
RELEASES_DIR := releases

.PHONY: all install package archive release clean ensure-releases-dir

# Default target
all: install package

# Create releases directory if it doesn't exist
ensure-releases-dir:
	@mkdir -p $(RELEASES_DIR)

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	yarn install

# Package the app
package:
	@echo "🔨 Building and packaging application..."
	yarn package

# Create release archive
archive: ensure-releases-dir
	@echo "📁 Creating release archive for version $(VERSION)..."
	@if git rev-parse "v$(VERSION)" >/dev/null 2>&1; then \
		echo "Using git tag v$(VERSION) for archive creation..."; \
		git archive --format=tar.gz --prefix=cliphit-$(VERSION)/ -o $(RELEASES_DIR)/cliphit-$(VERSION).tar.gz "v$(VERSION)"; \
	else \
		echo "Git tag v$(VERSION) not found. Creating archive from current HEAD..."; \
		git archive --format=tar.gz --prefix=cliphit-$(VERSION)/ -o $(RELEASES_DIR)/cliphit-$(VERSION).tar.gz HEAD; \
	fi
	@echo "🔑 Generating SHA256 hash..."
	ARCHIVE_PATH="$(RELEASES_DIR)" ./scripts/generate-hash.sh
	@echo "✅ Archive $(RELEASES_DIR)/cliphit-$(VERSION).tar.gz created and hash updated in formula"

# Create a new release with specified version
release:
	@if [ "$(v)" = "" ]; then \
		echo "❌ Error: No version specified. Use 'make release v=X.Y.Z'"; \
		exit 1; \
	fi
	@echo "🚀 Creating release v$(v)..."
	./scripts/release.sh $(v)

# Auto-release using the current version in package.json
auto-release:
	@echo "🚀 Creating release v$(VERSION)..."
	./scripts/release.sh $(VERSION)

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf dist
	rm -f $(RELEASES_DIR)/cliphit-*.tar.gz

# Show help
help:
	@echo "ClipHit Makefile Commands:"
	@echo "--------------------------"
	@echo "make              - Install dependencies and package the app"
	@echo "make install      - Install dependencies"
	@echo "make package      - Package the application"
	@echo "make archive      - Create a release archive with current version"
	@echo "make release v=X.Y.Z - Create a full release with specified version"
	@echo "make auto-release - Create a release using the current version"
	@echo "make clean        - Clean build artifacts"
	@echo "make help         - Show this help message" 