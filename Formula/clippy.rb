class Clippy < Formula
  desc "A clipboard history manager for macOS"
  homepage "https://github.com/yourusername/clippy"
  url "https://github.com/yourusername/clippy/releases/download/v1.0.0/clippy-1.0.0.tar.gz"
  sha256 "YOUR_SHA256_HASH_WILL_GO_HERE_AFTER_BUILDING"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
    
    # Move the app to the Applications directory
    prefix.install "Clippy.app"
  end

  def caveats
    <<~EOS
      Clippy.app was installed to:
        #{prefix}

      To link the app to your Applications folder, run:
        ln -sf "#{prefix}/Clippy.app" "/Applications/Clippy.app"
    EOS
  end

  test do
    assert_predicate "#{prefix}/Clippy.app", :exist?
  end
end 