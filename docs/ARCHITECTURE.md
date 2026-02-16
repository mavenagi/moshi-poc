# Moshi Architecture & Integration Notes

## System Components

### 1. Moshi Model
- **Type**: Multi-stream Transformer language model (~7B parameters)
- **Capabilities**: 
  - Text generation with inner monologue
  - Multi-channel audio generation (speech + background)
  - Simultaneous listening and speaking (full-duplex)
- **Latency**: ~200ms theoretical (160ms model + 40ms codec)

### 2. Mimi Codec
- **Purpose**: Neural audio compression
- **Input**: 24kHz mono PCM16 audio
- **Output**: Compressed to ~1.1kbps
- **Latency**: 80ms (codec) + networking
- **Quality**: Better than traditional codecs at same bitrate

### 3. Server (Rust)
- **Location**: `moshi/rust`
- **Protocol**: WebSocket binary streaming
- **Port**: Default 8998
- **Features**:
  - Real-time audio streaming
  - Session management
  - Model inference orchestration

### 4. Client (Python/TypeScript)
- **Python**: Reference implementation in `moshi/client`
- **TypeScript**: Our POC implementation
- **Responsibilities**:
  - Audio capture and encoding
  - WebSocket communication
  - Audio playback

## Audio Pipeline

```
Microphone (8kHz telephony)
    ↓
Resample to 24kHz
    ↓
Encode with Mimi codec → 1.1kbps
    ↓
WebSocket → Moshi Server
    ↓
Moshi Model (inference)
    ↓
Multi-stream output (speech + background)
    ↓
Decode with Mimi codec
    ↓
Resample to 8kHz (for telephony)
    ↓
Speaker
```

## Full-Duplex Mechanism

Unlike turn-based systems (OpenAI Realtime, ElevenLabs), Moshi operates in **full-duplex mode**:

1. **Continuous listening**: Model processes incoming audio in real-time
2. **Continuous speaking**: Model generates speech while listening
3. **Interruption handling**: Can stop/adjust output based on user interruptions
4. **Natural overlap**: Handles simultaneous speech from both sides

### Turn-Taking Strategy
- Monitors user audio energy and speech patterns
- Yields floor when user starts speaking
- Can continue speaking if user is just giving feedback ("uh-huh", "yeah")

## Integration with Voice-Server

### Adapter Structure

```typescript
class MoshiVoiceModelAdapter implements IVoiceModelAdapter {
  private wsConnection: WebSocket;
  private audioEncoder: MimiEncoder;
  private audioDecoder: MimiDecoder;
  private resampler: AudioResampler; // 8kHz ↔ 24kHz
  
  async connect(config: VoiceModelConfig): Promise<void> {
    // Connect to Moshi WebSocket server
    // Initialize Mimi codec
    // Set up audio resampling
  }
  
  async sendAudio(chunk: Buffer): Promise<void> {
    // Resample 8kHz → 24kHz
    // Encode with Mimi
    // Send via WebSocket
  }
  
  onAudioReceived(callback: (audio: Buffer) => void): void {
    // Receive Mimi-encoded audio
    // Decode to PCM
    // Resample 24kHz → 8kHz
    // Deliver to callback
  }
  
  async disconnect(): Promise<void> {
    // Clean up WebSocket
    // Release codec resources
  }
}
```

### Event Mapping

| Moshi Event | Voice-Server Event |
|-------------|-------------------|
| Audio frame received | `audio-chunk` |
| Speech detected | `speech-started` |
| Speech ended | `speech-ended` |
| Connection established | `connected` |
| Connection closed | `disconnected` |
| Error | `error` |

### Challenges

#### 1. Audio Format Conversion
- **Problem**: Telephony uses 8kHz, Moshi expects 24kHz
- **Solution**: High-quality resampling library (e.g., libsamplerate, speex-resampler)
- **Impact**: Additional latency (~10-20ms)

#### 2. Full-Duplex Handling
- **Problem**: Voice-server currently expects turn-based interaction
- **Solution**: 
  - Add full-duplex mode to orchestrator
  - Continuous audio streaming on both channels
  - No explicit turn-taking signals

#### 3. Deployment Complexity
- **Problem**: Self-hosted requires GPU infrastructure
- **Solution**:
  - Containerize Moshi server (Docker/Kubernetes)
  - GPU node pool for model inference
  - Load balancing across multiple instances
  - Fallback to CPU if GPU unavailable (slower)

#### 4. Resource Management
- **Problem**: Model memory footprint (~14GB for bf16)
- **Solution**:
  - Model quantization (int8, int4)
  - Session pooling and recycling
  - Monitoring per-session memory

#### 5. Latency Optimization
- **Problem**: Additional hops add latency
- **Solution**:
  - Co-locate Moshi server with voice-server
  - Minimize buffering in audio pipeline
  - Use efficient WebSocket framing

## Performance Targets

### Latency Budget
- Telephony network: ~50-100ms
- Resampling: ~10-20ms
- Mimi encoding: ~40ms
- Network to Moshi: ~5-10ms
- Moshi inference: ~160ms
- Mimi decoding: ~40ms
- Resampling: ~10-20ms
- **Total**: ~315-390ms (acceptable for real-time conversation)

### Throughput
- Target: 50+ concurrent calls per GPU
- Memory: ~300MB per session
- CPU: Minimal (most work on GPU)

## Comparison with Other Voice Models

| Feature | Moshi | OpenAI Realtime | ElevenLabs | Phonic |
|---------|-------|-----------------|------------|--------|
| Full-duplex | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Self-hosted | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Latency | ~200ms | ~300ms | ~400ms | ~250ms |
| Cost | Hardware only | Per-minute | Per-character | Per-minute |
| Interruption | Natural | Manual | N/A | Manual |
| Open Source | ✅ Yes | ❌ No | ❌ No | ❌ No |

## Next Steps

1. ✅ Document architecture
2. ⏳ Set up local Moshi server
3. ⏳ Test WebSocket connection
4. ⏳ Implement audio streaming test
5. ⏳ Measure end-to-end latency
6. ⏳ Test interruption handling
7. ⏳ Create voice-server adapter design doc
8. ⏳ Prototype integration

## References

- **Moshi Paper**: [Moshi: a speech-text foundation model for real-time dialogue](https://arxiv.org/abs/2410.00037)
- **GitHub**: https://github.com/kyutai-labs/moshi
- **Demo**: https://moshi.chat
- **Mimi Codec Paper**: [High Fidelity Audio Compression with Improved RVQGAN](https://arxiv.org/abs/2306.06546)
