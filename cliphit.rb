class Cliphit < Formula
  desc "A clipboard history manager for macOS"
  homepage "https://github.com/mohitgupta07/cliphit"
  url "https://github.com/mohitgupta07/cliphit/archive/refs/tags/v1.1.1.tar.gz"
  # SHA256 verification hash for v1.1.1
  sha256 "4c7addc7ea411c6f1f68eeb5205f95a37218c176b2034b948e3f6085355fb596"
  license "MIT"

  depends_on "node"
  depends_on "yarn"

  def install
    system "yarn", "install"
    system "yarn", "package"
    prefix.install "dist/ClipHit-darwin-x64/ClipHit.app"
    
    # Create symlink in system Applications folder automatically if user has permission
    system "ln", "-sf", "#{prefix}/ClipHit.app", "/Applications/ClipHit.app"
  end

  def post_install
    # In case the system command failed, remind user how to create the symlink
    unless File.exist?("/Applications/ClipHit.app")
      opoo "Could not create symlink in /Applications folder. You may need to run this manually:"
      puts "  ln -sf #{prefix}/ClipHit.app /Applications/ClipHit.app"
    end
  end

  def caveats
    <<~EOS
      ClipHit has been installed to:
        #{prefix}/ClipHit.app
      
      A symlink has been automatically created in your Applications folder.
      If the symlink wasn't created due to permissions, you can create it yourself with:
        ln -sf "#{prefix}/ClipHit.app" "/Applications/ClipHit.app"
    EOS
  end

  test do
    system "#{bin}/electron", "--version"
  end
end 