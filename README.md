# ClipHit - Clipboard History Manager

ClipHit is a simple, lightweight clipboard history manager for macOS that allows you to access your clipboard history with ease.

![ClipHit Screenshot](https://via.placeholder.com/800x500/007aff/FFFFFF?text=ClipHit+Screenshot)

## Features

- Stores your clipboard history
- Quick access via global shortcut (Cmd+Shift+V)
- Search through your clipboard history
- Paste items with a single click
- System tray icon for easy access
- Persistent storage between app restarts

## Installation

### Via Homebrew (Recommended)

The easiest way to install ClipHit is through Homebrew:

```bash
# Tap the repository (only needed once)
brew tap mohitgupta07/cliphit ~/homebrew-cliphit

# Install ClipHit
brew install cliphit
```

After installation, you can find ClipHit in your Applications folder or launch it directly from the terminal:

```bash
open -a ClipHit
```

If the symlink to Applications wasn't created automatically (due to permission issues), you can create it manually:

```bash
ln -sf "$(brew --prefix)/opt/cliphit/ClipHit.app" "/Applications/ClipHit.app"
```

### Manual Installation

If you prefer not to use Homebrew, you can manually install ClipHit:

1. Download the latest release from the [Releases page](https://github.com/mohitgupta07/cliphit/releases)
2. Extract the archive
3. Drag ClipHit.app to your Applications folder

### Building from Source

If you want to build ClipHit from source:

```bash
# Clone the repository
git clone https://github.com/mohitgupta07/cliphit.git
cd cliphit

# Install dependencies
yarn install

# Start the app in development mode
yarn start

# Or package the app for production
yarn package
```

After packaging, you can find the app in the `dist` folder. Drag it to your Applications folder to install.

## Usage

1. Launch ClipHit from your Applications folder
2. The app will run in the background with an icon in your menu bar
3. Copy text as you normally would
4. Press `Cmd+Shift+V` to open the clipboard history window
5. Click on any item to paste it
6. Use the search bar to find specific items in your history

## Uninstallation

To uninstall ClipHit:

```bash
# If installed via Homebrew
brew uninstall cliphit

# Remove the tap if no longer needed
brew untap mohitgupta07/cliphit
```

## Troubleshooting

### Version Mismatch

If you encounter issues with version mismatches when installing via Homebrew, try:

```bash
# Update Homebrew
brew update

# Untap and retap the repository
brew untap mohitgupta07/cliphit
brew tap mohitgupta07/cliphit ~/homebrew-cliphit

# Install ClipHit
brew install cliphit
```

### Permission Issues

If you encounter permission issues during installation, try:

```bash
# Install without creating the Applications symlink
brew install cliphit || true

# Manually create the symlink
ln -sf "$(brew --prefix)/opt/cliphit/ClipHit.app" "/Applications/ClipHit.app"
```

## Creating a Release

There are two ways to create a release:

### Option 1: Automated Release (Recommended)

The easiest way to create a release is to use the automated release script:

```
yarn release X.Y.Z
```

This command will:
1. Update version numbers across all files
2. Create a git tag and push it to GitHub
3. Trigger a GitHub Actions workflow that will:
   - Download the release archive from GitHub
   - Update the SHA256 hash in the Homebrew formula
   - Commit and push the changes automatically

This automated approach ensures the SHA256 in the formula is always accurate with zero manual intervention.

### Option 2: Manual Release Process

If you prefer more control, you can follow these manual steps:

1. Update the version in `package.json`
2. Commit the change: `git commit -am "Bump version to vX.Y.Z"`
3. Create and push a git tag: `git tag vX.Y.Z && git push origin vX.Y.Z`
4. The GitHub Actions workflow will automatically handle the rest

## GitHub Actions Workflow

This project uses GitHub Actions to automate the Homebrew formula updates:

1. When a new tag is pushed, the workflow is triggered
2. It downloads the release archive from GitHub
3. Calculates the SHA256 hash
4. Updates the formula with the correct hash
5. Commits and pushes the changes

You can monitor the progress of these workflows in the Actions tab of the repository.

**Note**: For the GitHub Actions workflow to function properly, you need to set up a `PERSONAL_ACCESS_TOKEN` secret in your repository settings with sufficient permissions to push to the repository. See [GitHub Token Setup Documentation](docs/github-token-setup.md) for detailed instructions.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

Mohit Gupta - [GitHub](https://github.com/mohitgupta07) 