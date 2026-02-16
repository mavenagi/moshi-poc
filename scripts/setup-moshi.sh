#!/bin/bash
set -e

echo "🚀 Setting up Moshi locally..."
echo

# Check prerequisites
echo "📋 Checking prerequisites..."
command -v git >/dev/null 2>&1 || { echo "❌ git is required but not installed."; exit 1; }
command -v cargo >/dev/null 2>&1 || { echo "❌ Rust/Cargo is required but not installed. Install from: https://rustup.rs/"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 is required but not installed."; exit 1; }

echo "✅ Prerequisites found"
echo

# Clone Moshi repository
if [ ! -d "moshi" ]; then
  echo "📦 Cloning Moshi repository..."
  git clone https://github.com/kyutai-labs/moshi.git
  echo "✅ Cloned successfully"
else
  echo "ℹ️  Moshi directory already exists, skipping clone"
fi
echo

# Build Rust server
echo "🔨 Building Moshi Rust server..."
cd moshi/rust
cargo build --release
echo "✅ Rust server built successfully"
cd ../..
echo

# Set up Python client
echo "🐍 Setting up Python client..."
cd moshi/client

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
  python3 -m venv venv
  echo "✅ Virtual environment created"
fi

# Activate and install
source venv/bin/activate
pip install --upgrade pip
pip install -e .
echo "✅ Python client installed"
cd ../..
echo

# Download models
echo "📥 Downloading Moshi models (~2GB)..."
cd moshi/client
source venv/bin/activate
python -m moshi.models download
echo "✅ Models downloaded"
cd ../..
echo

echo "🎉 Moshi setup complete!"
echo
echo "To start the server:"
echo "  cd moshi/rust"
echo "  cargo run --release"
echo
echo "Then run POC tests:"
echo "  npm run test:connect"
echo "  npm run test:stream"
