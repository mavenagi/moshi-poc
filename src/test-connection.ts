#!/usr/bin/env ts-node
/**
 * Basic WebSocket connection test for Moshi server
 * 
 * Tests:
 * - Connect to local Moshi server
 * - Send/receive initial handshake
 * - Verify connection stability
 */

import WebSocket from 'ws';
import * as dotenv from 'dotenv';

dotenv.config();

const MOSHI_WS_URL = process.env.MOSHI_WS_URL || 'ws://localhost:8998';

async function testConnection() {
  console.log('🔌 Testing Moshi WebSocket connection...\n');
  console.log(`📡 Connecting to: ${MOSHI_WS_URL}`);
  
  return new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(MOSHI_WS_URL);
    let connected = false;
    
    const timeout = setTimeout(() => {
      if (!connected) {
        console.error('❌ Connection timeout (10s)');
        ws.close();
        reject(new Error('Connection timeout'));
      }
    }, 10000);
    
    ws.on('open', () => {
      connected = true;
      clearTimeout(timeout);
      console.log('✅ Connected successfully!');
      console.log('⏱️  Connection established');
      
      // Send test message
      console.log('\n📤 Sending test message...');
      ws.send(JSON.stringify({ type: 'ping' }));
    });
    
    ws.on('message', (data: Buffer) => {
      console.log('📥 Received message:');
      
      try {
        // Try parsing as JSON first
        const message = JSON.parse(data.toString());
        console.log(JSON.stringify(message, null, 2));
      } catch {
        // Binary data (audio frames)
        console.log(`   Binary data: ${data.length} bytes`);
      }
    });
    
    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error.message);
      clearTimeout(timeout);
      reject(error);
    });
    
    ws.on('close', (code, reason) => {
      console.log(`\n🔌 Connection closed: ${code} ${reason || '(no reason)'}`);
      clearTimeout(timeout);
      
      if (connected) {
        console.log('✅ Test completed successfully!');
        resolve();
      } else {
        reject(new Error('Connection closed before establishing'));
      }
    });
    
    // Close after receiving a few messages or 5 seconds
    setTimeout(() => {
      if (connected) {
        console.log('\n👋 Closing connection...');
        ws.close();
      }
    }, 5000);
  });
}

// Run the test
testConnection()
  .then(() => {
    console.log('\n✅ Connection test passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Connection test failed:', error.message);
    console.error('\n💡 Make sure Moshi server is running:');
    console.error('   cd moshi/rust');
    console.error('   cargo run --release');
    process.exit(1);
  });
