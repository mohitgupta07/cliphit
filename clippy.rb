class Clippy < Formula
  desc "A clipboard history manager for macOS"
  homepage "https://github.com/mohitgupta07/clippy"
  url "https://github.com/mohitgupta07/clippy/archive/refs/tags/v1.0.0.tar.gz"
  # The SHA256 hash should be generated when creating a release
  # To generate: `shasum -a 256 clippy-1.0.0.tar.gz`
  sha256 "f06f75fde5e27a8a0751476d3baaf9d05620c275e4bb2144709bd2527728169f" # Will be replaced during release process
  license "MIT"

  depends_on "node"
  depends_on "yarn"

  def install
    system "yarn", "install"
    system "yarn", "package"
    prefix.install "dist/Clippy-darwin-x64/Clippy.app"
  end

  def caveats
    <<~EOS
      Clippy has been installed to:
        #{prefix}/Clippy.app
      
      You can link it to your Applications folder:
        ln -sf "#{prefix}/Clippy.app" "/Applications/Clippy.app"
    EOS
  end

  test do
    system "#{bin}/electron", "--version"
  end
end 