class CliphitTest < Formula
  desc "A clipboard history manager for macOS (test version)"
  homepage "https://github.com/mohitgupta07/cliphit"
  license "MIT"
  version "1.0.1"
  
  # Use HEAD for local development testing
  head do
    url "file:///Users/mohit.gupta/mohit/cliphit", :branch => "main"
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
