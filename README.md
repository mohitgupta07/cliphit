# Clippy - Clipboard History Manager

Clippy is a simple, lightweight clipboard history manager for macOS that allows you to access your clipboard history with ease.

![Clippy Screenshot](https://via.placeholder.com/800x500/007aff/FFFFFF?text=Clippy+Screenshot)

## Features

- Stores your clipboard history
- Quick access via global shortcut (Cmd+Shift+V)
- Search through your clipboard history
- Paste items with a single click
- System tray icon for easy access
- Persistent storage between app restarts

## Installation

### Via Homebrew (recommended)

```bash
# Clone the repository
git clone https://github.com/mohitgupta07/clippy.git
cd clippy

# Install using Homebrew
brew install --build-from-source ./clippy.rb
```

### Running from Source

```bash
# Clone the repository
git clone https://github.com/mohitgupta07/clippy.git
cd clippy

# Install dependencies
yarn install

# Start the app
yarn start
```

### Packaging the App

```bash
# Package the app for macOS
yarn package
```

After packaging, you can find the app in the `dist` folder. Drag it to your Applications folder to install.

## Usage

1. Launch Clippy
2. The app will run in the background with an icon in your menu bar
3. Copy text as you normally would
4. Press `Cmd+Shift+V` to open the clipboard history window
5. Click on any item to paste it
6. Use the search bar to find specific items in your history

## Creating a Release

There are two ways to create a release:

### Option 1: Automated Release (Recommended)

The easiest way to create a release is to use the automated release script:

```
yarn release X.Y.Z
```

This single command will:
1. Update version numbers across all files
2. Create a git tag
3. Generate the release archive
4. Update the SHA256 hash in the Homebrew formula
5. Commit and push all changes

### Option 2: Manual Release Process

If you prefer more control, you can follow these manual steps:

1. Update the version number using the provided script:
   ```
   ./scripts/update-version.sh X.Y.Z
   ```
   This will update the version in package.json, index.html, and clippy.rb

2. Review the changes and create a git tag:
   ```
   git tag vX.Y.Z
   ```

3. Prepare the release (creates archive and updates SHA256 hash):
   ```
   yarn prepare-release
   ```

4. Commit and push the changes:
   ```
   git commit -am "Release vX.Y.Z" && git push origin main vX.Y.Z
   ```

> Note: Both methods will automatically ensure the Homebrew formula contains the correct SHA256 hash.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

[Mohit Gupta](https://github.com/mohitgupta07) 