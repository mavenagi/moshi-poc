# Moshi POC - Real-Time Conversational Voice AI

> ⏸️ **Status: On Hold**  
> After research, Moshi is not suitable for Maven AGI voice-server due to missing critical features (tool calling, speaker separation) and high infrastructure requirements (GPU, complex setup).  
> See [FINDINGS.md](./FINDINGS.md) for detailed analysis and recommendations.

Proof-of-concept for integrating [Kyutai's Moshi](https://github.com/kyutai-labs/moshi) real-time voice model with Maven AGI voice platform.

## What is Moshi?

Moshi is an open-source **full-duplex conversational AI** model developed by Kyutai labs:

- 🗣️ **Full-duplex**: Speaks and listens simultaneously (like real conversations)
- ⚡ **Ultra-low latency**: ~200ms theoretical latency for natural flow
- 🔓 **Open source**: Can run entirely locally, no API dependencies
- 🎭 **Natural turn-taking**: Handles interruptions and overlapping speech
- 🎙️ **Real-time streaming**: Processes audio as it arrives

## Why Moshi for Maven AGI?

Perfect fit for customer support voice agents:

- ✅ **Natural conversations**: Full-duplex feels more human
- ✅ **Cost control**: Self-hosted = no per-minute API costs
- ✅ **Privacy**: Keep sensitive customer data on-premises
- ✅ **Reliability**: No dependency on external API availability
- ✅ **Latency**: Lower theoretical latency than cloud alternatives

## Architecture

Moshi consists of:

1. **Moshi model**: Multi-stream Transformer language model
2. **Mimi codec**: Neural audio codec for compression (24kHz, 1.1kbps)
3. **Rust server**: WebSocket-based streaming server
4. **Python client**: Reference implementation

## POC Goals

1. ✅ Understand Moshi architecture and API
2. 🔄 Test local deployment and resource requirements
3. 🔄 Validate real-time audio streaming (8kHz telephony ↔ 24kHz Moshi)
4. 🔄 Measure actual latency in production-like conditions
5. 🔄 Test interruption handling and turn-taking
6. 🔄 Document integration path for voice-server

## Project Structure

```
moshi-poc/
├── docs/                    # Research and integration notes
├── src/
│   ├── test-connection.ts   # Basic WebSocket connection test
│   ├── test-streaming.ts    # Audio streaming test
│   └── test-interrupts.ts   # Interruption handling test
├── scripts/
│   └── setup-moshi.sh       # Local Moshi installation script
├── test-audio/              # Test audio files
└── README.md
```

## Setup

### Prerequisites

- Node.js 18+ (TypeScript tests)
- Python 3.9+ (Moshi client)
- Rust (Moshi server compilation)
- 4GB+ RAM (model memory)
- GPU recommended (faster inference)

### Install Moshi

```bash
# Clone Moshi repo
git clone https://github.com/kyutai-labs/moshi.git

# Install Rust server
cd moshi/rust
cargo build --release

# Install Python client
cd ../client
pip install -e .

# Download models (~2GB)
python -m moshi.models download
```

### Run POC Tests

```bash
# Install dependencies
npm install

# Test connection
npm run test:connect

# Test streaming
npm run test:stream

# Test interruptions
npm run test:interrupt
```

## Technical Specifications

### Audio Format

- **Input**: 24kHz mono PCM16 (Mimi codec)
- **Codec**: Neural compression to 1.1kbps
- **Telephony compatibility**: Need 8kHz ↔ 24kHz resampling

### Streaming Protocol

- **Transport**: WebSocket (binary frames)
- **Framing**: Mimi-encoded audio chunks
- **Bidirectional**: Simultaneous send/receive

### Model Variants

- **moshiko-pytorch-bf16**: Default model (~7B parameters)
- **Mini variants**: Smaller models for faster inference

## Integration Strategy

### Phase 1: Local Deployment (This POC)
- Test Moshi standalone
- Measure performance characteristics
- Validate telephony audio compatibility

### Phase 2: Voice-Server Adapter
- Create `MoshiVoiceModelAdapter` in voice-server
- Implement WebSocket client for Moshi server
- Handle audio resampling (8kHz ↔ 24kHz)
- Map Moshi events to voice-server events

### Phase 3: Production Deployment
- Containerize Moshi server
- Load balancing for multiple concurrent calls
- GPU optimization and resource management
- Monitoring and observability

## Key Questions to Answer

- [ ] What's the real-world latency (end-to-end)?
- [ ] How many concurrent calls per GPU/CPU?
- [ ] How well does it handle telephony audio quality?
- [ ] Does interruption handling work reliably?
- [ ] What's the memory footprint per session?
- [ ] Can we run it CPU-only for cost savings?

## Resources

- **Moshi GitHub**: https://github.com/kyutai-labs/moshi
- **Moshi Paper**: [arXiv:2410.00037](https://arxiv.org/abs/2410.00037)
- **Demo**: https://moshi.chat
- **Kyutai Labs**: https://kyutai.org

## Next Steps

1. Set up local Moshi installation
2. Run basic connection tests
3. Test audio streaming with telephony samples
4. Measure latency and resource usage
5. Document findings and integration recommendations

---

**Status**: ⏸️ On Hold (See [FINDINGS.md](./FINDINGS.md) for research results)
**Created**: 2026-02-16
**Owner**: dongshengbc
