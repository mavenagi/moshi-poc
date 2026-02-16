# Moshi Setup Guide

## Prerequisites

Before installing Moshi, ensure you have:

### Required
- **Python 3.10+** (3.12 recommended)
- **Rust toolchain** ([rustup.rs](https://rustup.rs/))
- **4GB+ RAM** minimum
- **24GB+ GPU VRAM** (for PyTorch bf16) OR **12GB GPU** (for int8)

### Optional but Recommended
- **CUDA Toolkit** (for GPU acceleration)
- **Git LFS** (for large model files)

### Platform-Specific

**Linux/Ubuntu:**
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Install CUDA (if using GPU)
# Follow: https://developer.nvidia.com/cuda-downloads
```

**macOS:**
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# MLX version works on M1/M2/M3 Macs without additional setup
```

## Installation Methods

### Method 1: Automated Setup (Recommended)

```bash
cd /root/.openclaw/workspace/moshi-poc
./scripts/setup-moshi.sh
```

This script will:
1. Clone Moshi repository
2. Build Rust server
3. Set up Python client
4. Download models (~2GB)

### Method 2: Manual Setup

#### Step 1: Clone Moshi
```bash
git clone https://github.com/kyutai-labs/moshi.git
cd moshi
```

#### Step 2: Build Rust Server (Production)
```bash
cd rust
cargo build --release --features cuda  # For NVIDIA GPU
# OR
cargo build --release --features metal  # For macOS Metal
```

#### Step 3: Install Python Client
```bash
cd ../client
python3 -m venv venv
source venv/bin/activate
pip install -e .
```

#### Step 4: Download Models
```bash
python -m moshi.models download
```

This downloads:
- Moshiko (male voice, bf16): ~7GB
- Moshika (female voice, bf16): ~7GB  
- Mimi codec: ~500MB

## Running Moshi

### Option 1: Rust Server (Recommended for Production)

```bash
cd rust
cargo run --features cuda --bin moshi-backend -r -- \
  --config moshi-backend/config.json standalone
```

**Using quantized model (int8, requires 12GB GPU):**
```bash
cargo run --features cuda --bin moshi-backend -r -- \
  --config moshi-backend/config-q8.json standalone
```

**Access web UI**: https://localhost:8998

⚠️ Browser will warn about self-signed certificate. Click "Advanced" → "Proceed to localhost"

### Option 2: PyTorch Server (Development)

```bash
cd moshi
python -m moshi.server --hf-repo kyutai/moshiko-pytorch-bf16
```

**Access web UI**: http://localhost:8998

**For remote GPU (with tunnel):**
```bash
# On remote server
python -m moshi.server --gradio-tunnel

# Or locally with SSH tunnel
ssh -L 8998:localhost:8998 user@remote-server
```

### Option 3: MLX (macOS only)

```bash
pip install moshi_mlx
python -m moshi_mlx.local -q 4  # 4-bit quantization
# OR
python -m moshi_mlx.local_web   # With web UI
```

## Configuration

### Select Different Model

**Moshiko (male voice):**
```bash
# Rust
--config moshi-backend/config.json

# PyTorch
--hf-repo kyutai/moshiko-pytorch-bf16
```

**Moshika (female voice):**
```bash
# Rust
# Edit config.json: "hf_repo": "kyutai/moshika-candle-q8"

# PyTorch
--hf-repo kyutai/moshika-pytorch-bf16
```

### GPU Memory Requirements

| Version | Memory | Notes |
|---------|--------|-------|
| bf16 (full) | 24GB | Best quality |
| int8 (quantized) | 12GB | Good quality |
| int4 (MLX) | 8GB | Mac only, acceptable quality |

## Testing Connection

Once server is running:

### Web UI Test
1. Open https://localhost:8998 (Rust) or http://localhost:8998 (PyTorch)
2. Click "Start" to allow microphone access
3. Say "Hello Moshi!"
4. Moshi should respond in real-time

### Command-Line Test
```bash
# In this repo
npm install
npm run test:connect
```

Should output:
```
✅ Connected successfully!
📤 Sending test message...
📥 Received message: ...
```

## Troubleshooting

### Issue: "Cannot connect to server"
**Solution**: Make sure server printed "standalone worker listening" before connecting

### Issue: "GPU out of memory"
**Solution**: Use quantized model (int8) or reduce batch size:
```bash
cargo run --features cuda --bin moshi-backend -r -- \
  --config moshi-backend/config-q8.json standalone
```

### Issue: "Microphone not working in web UI"
**Solution**: 
- For remote server: Use SSH tunnel, NOT direct HTTP
- For HTTPS warnings: Accept self-signed certificate
- Check browser permissions for microphone access

### Issue: "Rust compilation fails"
**Solution**: 
- Ensure CUDA/nvcc is in PATH
- Check Rust version: `rustc --version` (should be 1.70+)
- Try without GPU: Remove `--features cuda`

### Issue: "Moshi stops after 5 minutes"
**Expected behavior** on Rust/MLX (fixed buffer limitation)

**Workaround**: Use PyTorch version for longer sessions

### Issue: "Quality is poor"
**Possible causes**:
1. Using int4 quantization (too aggressive)
2. Poor microphone quality
3. High background noise
4. Network latency (if remote)

**Solutions**:
- Use bf16 or int8 models
- Use headset microphone
- Reduce background noise
- Use SSH tunnel for lower latency

## Performance Benchmarks

### Latency
- **Theoretical**: 160ms (80ms frame + 80ms model)
- **Measured (L4 GPU)**: ~200ms end-to-end
- **With network**: +50-100ms depending on connection

### Throughput
- **GPU (A100)**: ~10-15 concurrent sessions
- **GPU (L4)**: ~5-8 concurrent sessions  
- **CPU**: 1-2 sessions (not recommended)

### Resource Usage per Session
- **Memory**: ~1.5-2GB (bf16), ~800MB-1GB (int8)
- **GPU**: ~8-10 TFLOPS
- **Network**: ~12kbps (Mimi codec bandwidth)

## Next Steps

After successful setup:
1. Test basic conversation quality
2. Measure actual latency in your environment
3. Test with telephony audio (8kHz samples)
4. Evaluate background noise handling
5. Compare with other voice models

See [RESEARCH.md](./RESEARCH.md) for detailed testing plan and limitations.
