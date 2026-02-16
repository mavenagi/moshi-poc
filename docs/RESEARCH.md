# Moshi Research - Key Questions

Research conducted: 2026-02-16  
Sources: GitHub repo, ArXiv paper, FAQ

## Executive Summary

Based on research of Moshi's architecture and documentation, here are the answers to your key questions:

### 1. Tool Calling / Function Calling
**Status: ❌ NOT SUPPORTED**

- **Finding**: Moshi does NOT currently support tool/function calling
- **Architecture reason**: Moshi is a pure speech-to-speech model that generates audio tokens directly from audio tokens
- **Inner Monologue**: While Moshi generates text tokens internally ("Inner Monologue") to improve quality, these are:
  - Used only for linguistic guidance during speech generation
  - Not exposed as structured tool calls
  - Not designed for API/function invocation

**What this means for voice-server:**
- Cannot use Moshi for voice agents that need to:
  - Look up customer data
  - Create tickets
  - Transfer calls
  - Search knowledge bases
  - Access external APIs

**Possible workarounds** (would require custom development):
1. Add post-processing layer to extract action intents from transcribed speech
2. Use hybrid approach: Moshi for conversation + separate LLM for tool calling
3. Wait for Kyutai to add tool calling support (not on roadmap)

### 2. Background Noise Handling
**Status: ⚠️ LIMITED / UNKNOWN**

**What we know:**
- Moshi uses **Mimi codec** which compresses 24kHz audio to 1.1kbps
- Codec uses **WavLM distillation** which has some noise robustness
- Training likely included some noisy data (standard practice)
- **No explicit noise cancellation or suppression documented**

**What we DON'T know** (needs testing):
- How well does it handle typical telephony noise (traffic, office, café)?
- Does it confuse background speech as user input?
- Can it filter out keyboard typing, paper rustling, etc.?
- Does echo cancellation in the web UI help significantly?

**Web UI echo cancellation:**
- The web client includes echo cancellation (mentioned in docs)
- This helps prevent Moshi from hearing its own voice
- But unclear how much it helps with other background noise

**Comparison to competitors:**
- **OpenAI Realtime**: Likely has better noise handling (they have more resources for preprocessing)
- **ElevenLabs**: Synthesis-only, so N/A
- **Commotion**: Unknown, but being a newer model might have better techniques

**Testing needed:**
1. Test with different SNR (signal-to-noise ratios)
2. Test with background conversation (multiple speakers)
3. Test with telephony-typical noise (PSTN artifacts, compression)
4. Compare quality with/without preprocessing

### 3. Speaker Separation (Target Speaker vs Background)
**Status: ❌ NOT EXPLICITLY SUPPORTED**

**Architecture analysis:**
- Moshi models **two streams**: user speech + Moshi speech
- It does NOT model multiple user streams
- No explicit speaker diarization or separation

**What this means:**
- If multiple people speak near the microphone, Moshi will hear **all of them as "user"**
- Cannot distinguish between:
  - Primary speaker (customer on phone)
  - Background conversation (coworker nearby)
  - Multiple participants in a conference call

**Potential issues for customer support:**
1. **Background conversation leak**: 
   - Customer in open office
   - Coworker says "Can you help me?"
   - Moshi might respond to coworker instead of customer

2. **Multi-speaker calls**:
   - Conference calls with multiple participants
   - Moshi can't track who said what
   - May get confused about context

3. **Audio mixing**:
   - All voices get mixed into single "user" stream
   - Moshi can't separate them back out

**Comparison to competitors:**
- **OpenAI Realtime**: Same limitation (single user stream)
- **Traditional ASR + LLM**: Can add speaker diarization as separate step
- **ElevenLabs**: Synthesis-only, so N/A

**Possible solutions:**
1. **Preprocessing with speaker separation model**:
   - Add Pyannote or similar before Moshi
   - Extract target speaker only
   - Feed clean audio to Moshi
   - **Downside**: Additional latency (~100-200ms)

2. **VAD (Voice Activity Detection) + proximity**:
   - Use directional microphone (if available)
   - Aggressive VAD to filter distant speakers
   - **Downside**: May cut off legitimate speech

3. **Training data requirements**:
   - Ensure telephony training data is single-speaker
   - Hope it generalizes to ignore background
   - **Downside**: No guarantees

## Critical Limitations for Maven AGI Use Case

### ❌ Dealbreakers
1. **No tool calling** - Cannot integrate with CRM, ticketing, knowledge base
2. **No speaker separation** - Risky for open office environments
3. **No multi-language** - English only (FAQ confirms)

### ⚠️ Concerns
1. **Unknown noise robustness** - Needs extensive testing
2. **5-minute conversation limit** (MLX/Rust versions) - Not suitable for long calls
3. **No fine-tuning** (yet) - Can't customize for specific use cases

### ✅ Advantages (despite limitations)
1. **Full-duplex** - Most natural conversation experience
2. **Low latency** (~200ms measured) - Better than most alternatives
3. **Self-hosted** - No per-call API costs, better privacy
4. **Open source** - Can inspect/modify if needed

## Recommendations

### Short-term (Current State)
**❌ Do NOT use Moshi for Maven AGI voice-server** (yet)

**Reasons:**
1. Lack of tool calling is a showstopper for customer support use case
2. Speaker separation issues are too risky for production
3. Unknown noise handling needs extensive validation

### Medium-term (If Kyutai Adds Features)
**✅ Reconsider if:**
1. Tool calling support is added
2. Speaker diarization capabilities are added
3. Noise handling is validated in production-like conditions

### Alternative Approach
**Use Moshi for different use case:**
- Internal demos / POC showing full-duplex capability
- Non-customer-facing applications (internal assistants)
- Research into full-duplex architectures
- Benchmark comparison with turn-based systems

## Testing Plan (If Proceeding)

Despite limitations, if you want to test Moshi as a learning exercise:

### Phase 1: Basic Setup ✅
- [x] Create moshi-poc repo
- [x] Document architecture
- [ ] Install Moshi locally
- [ ] Verify WebSocket connection

### Phase 2: Capability Testing
- [ ] Test basic conversation quality
- [ ] Measure actual latency
- [ ] Test interruption handling (full-duplex feature)
- [ ] Test with background noise (recorded samples)
- [ ] Test with multiple speakers in background
- [ ] Test 8kHz telephony audio compatibility

### Phase 3: Integration Exploration
- [ ] Design adapter for voice-server (as learning exercise)
- [ ] Prototype audio resampling (8kHz ↔ 24kHz)
- [ ] Test session limits (5-minute timeout workaround)
- [ ] Measure resource usage (memory, GPU, CPU)

### Phase 4: Documentation
- [ ] Document findings and limitations
- [ ] Compare with OpenAI/ElevenLabs/Commotion
- [ ] Recommendations for when to reconsider Moshi

## Additional Research Questions

1. **Acoustic environment requirements**:
   - What SNR is acceptable?
   - How much echo can it tolerate?
   - Does it work with headsets vs speakerphone?

2. **Scalability**:
   - How many concurrent sessions per GPU?
   - Can it run on CPU-only for cost savings?
   - Memory requirements per session?

3. **Quality vs Competitors**:
   - How does conversation naturalness compare?
   - Is full-duplex actually better for support calls?
   - Do interruptions cause confusion or work naturally?

## Sources

- **GitHub**: https://github.com/kyutai-labs/moshi
- **Paper**: https://arxiv.org/abs/2410.00037
- **FAQ**: https://github.com/kyutai-labs/moshi/blob/main/FAQ.md
- **Demo**: https://moshi.chat (test live)

## Next Steps

**Recommendation**: 
1. **Test Commotion first** - Wait for API key, it has tool calling support
2. **Validate Whisper integration** - Add STT capability to existing voice models
3. **Keep Moshi as backup** - Monitor for feature updates, test as learning exercise

**If you still want to test Moshi:**
1. Run `./scripts/setup-moshi.sh` to install
2. Test basic conversation on demo: https://moshi.chat
3. Evaluate noise/speaker handling subjectively
4. Document findings for future consideration

---

**Last Updated**: 2026-02-16  
**Researcher**: Kit 🦊  
**Confidence**: High (based on architecture analysis and docs)  
**Testing Status**: Not yet tested locally
