# Moshi POC - Key Findings Summary

**Research Date**: 2026-02-16  
**Status**: 📊 Research Complete, Testing Pending

## TL;DR

❌ **Not recommended for Maven AGI voice-server** (yet)

**Critical blockers:**
1. No tool/function calling support
2. No speaker separation (multi-speaker confusion)
3. Unknown noise robustness (needs testing)

**Unique advantage:**
- ✅ Only full-duplex voice model (speaks + listens simultaneously)

## Your Questions Answered

### 1. Does it support tool calling?

**❌ NO**

Moshi is a pure speech-to-speech model. It does NOT support:
- Function/tool calling
- Structured API requests
- External system integration

**Why this matters:** Can't look up customer data, create tickets, transfer calls, or search knowledge bases.

**Workaround:** Would need separate LLM for tool calling + Moshi for conversation (complex).

### 2. How does it handle background noise?

**⚠️ UNKNOWN - Needs Testing**

**What we know:**
- Uses WavLM-distilled codec (some noise robustness)
- Web UI has echo cancellation
- Training likely included noisy data

**What we DON'T know:**
- Performance with telephony noise
- Handling of background conversation
- Tolerance for keyboard/paper sounds

**Testing needed:** Record samples with various noise levels and test.

### 3. How does it handle speaker separation?

**❌ NOT SUPPORTED**

Moshi models only TWO streams:
1. Moshi's speech
2. User's speech (ALL speakers combined)

**Cannot distinguish:**
- Primary speaker vs background conversation
- Multiple participants in conference call
- Target customer vs coworker nearby

**Risk for support calls:** Customer in open office → coworker says something → Moshi responds to coworker instead of customer.

## Comparison with Other Models

| Feature | Moshi | OpenAI Realtime | Commotion | ElevenLabs |
|---------|-------|-----------------|-----------|------------|
| **Full-duplex** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Tool calling** | ❌ No | ✅ Yes | ❓ TBD | N/A |
| **Speaker separation** | ❌ No | ❌ No | ❓ Unknown | N/A |
| **Self-hosted** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Latency** | ~200ms | ~300ms | ❓ TBD | ~400ms |
| **Multi-language** | ❌ English only | ✅ Yes | ❓ TBD | ✅ Yes |

## Technical Specs

- **Model**: 7B parameters
- **Codec**: Mimi (24kHz → 1.1kbps)
- **Latency**: 160ms theoretical, 200ms measured
- **Memory**: 14GB (bf16), 7GB (int8)
- **GPU**: 24GB VRAM (bf16), 12GB (int8)
- **Session limit**: 5 minutes (Rust/MLX), unlimited (PyTorch)

## Setup Requirements

### Minimum
- Python 3.10+
- Rust toolchain
- 4GB RAM
- 12GB GPU (int8) or 24GB GPU (bf16)

### Installation
```bash
./scripts/setup-moshi.sh  # ~2GB download
```

### Running
```bash
cd moshi/rust
cargo run --release --features cuda --bin moshi-backend
# Access: https://localhost:8998
```

## Recommendations

### ❌ DO NOT use for voice-server (now)

**Why:**
1. Tool calling is critical for customer support
2. Speaker separation issues too risky
3. Other models (Commotion) better fit

### ✅ DO consider for:
- Internal demos (show full-duplex capability)
- Research/learning about full-duplex architecture
- Non-customer-facing applications
- Future reconsideration if features added

### 🎯 Better alternatives for Maven AGI:

**Priority 1: Commotion**
- ✅ Tool calling support (or coming soon)
- ✅ OpenAI-compatible protocol
- ⏳ Waiting for API key

**Priority 2: Whisper + Existing Models**
- ✅ Add STT to ElevenLabs (synthesis-only)
- ✅ Validated and working
- ✅ Can integrate immediately

**Priority 3: OpenAI Realtime**
- ✅ Tool calling support
- ✅ Production-ready
- ✅ Already familiar

## Next Steps

### If proceeding with Moshi testing (learning only):
1. Install locally: `./scripts/setup-moshi.sh`
2. Test on demo: https://moshi.chat
3. Run connection tests: `npm run test:connect`
4. Test with noise/multiple speakers
5. Document findings

### If skipping Moshi (recommended):
1. **Focus on Commotion** - Wait for API key, test tool calling
2. **Integrate Whisper** - Add STT to existing models
3. **Keep Moshi bookmarked** - Monitor for feature updates

## Documentation

- **Full research**: [docs/RESEARCH.md](docs/RESEARCH.md)
- **Setup guide**: [docs/SETUP.md](docs/SETUP.md)
- **Architecture**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Official repo**: https://github.com/kyutai-labs/moshi
- **Paper**: https://arxiv.org/abs/2410.00037
- **Live demo**: https://moshi.chat

## Conclusion

Moshi is **technically impressive** (first full-duplex voice LLM) but **not production-ready** for Maven AGI use case due to missing critical features (tool calling, speaker separation).

**Recommendation**: Test Commotion and Whisper first. Revisit Moshi if/when tool calling is added.

---

**Want to test anyway?** Run `./scripts/setup-moshi.sh` and see [SETUP.md](docs/SETUP.md).

**Questions?** See [RESEARCH.md](docs/RESEARCH.md) for detailed analysis.
