class Cliphit < Formula
  desc "A clipboard history manager for macOS"
  homepage "https://github.com/mohitgupta07/cliphit"
  url "https://github.com/mohitgupta07/cliphit/archive/refs/tags/v1.0.2.tar.gz"
  # The SHA256 hash should be generated when creating a release
  # To generate: `shasum -a 256 cliphit-1.0.2.tar.gz`
  sha256 "134115aee724fb14b9ae676bb36fdd2a6f26e9989af30a58265b0ed0f2f1c55e" # Will be replaced during release process
  license "MIT"

  depends_on "node"
  depends_on "yarn"

  def install
    system "yarn", "install"
    system "yarn", "package"
    prefix.install "dist/ClipHit-darwin-x64/ClipHit.app"
  end

  def caveats
    <<~EOS
      ClipHit has been installed to:
        #{prefix}/ClipHit.app
      
      You can link it to your Applications folder:
        ln -sf "#{prefix}/ClipHit.app" "/Applications/ClipHit.app"
    EOS
  end

  test do
    system "#{bin}/electron", "--version"
  end
end 