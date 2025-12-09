#!/usr/bin/env node

/**
 * Simple SSE Test Script
 *
 * Prerequisites:
 * 1. npm install eventsource
 * 2. Backend server running (npm run start:api)
 * 3. Replace PIGEON_ID with a valid user ID
 *
 * Usage: node test-sse-simple.js
 */

const fetch = require('node-fetch');

// ⚠️ REPLACE THIS WITH A VALID PIGEON ID
const PIGEON_ID = 'test-user-pigeon-id';
const BASE_URL = 'http://localhost:5001';

console.log('🧪 SSE Infrastructure Test\n');
console.log('========================================');
console.log(`Testing with Pigeon ID: ${PIGEON_ID}`);
console.log(`Base URL: ${BASE_URL}\n`);

// Test 1: Check if server is running
async function testServerHealth() {
  console.log('Test 1: Server Health Check');
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    if (response.ok) {
      console.log('✅ Server is running\n');
      return true;
    } else {
      console.log('❌ Server responded with error:', response.status, '\n');
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot connect to server:', error.message, '\n');
    return false;
  }
}

// Test 2: Test SSE connection using fetch (streaming)
async function testSSEConnection() {
  console.log('Test 2: SSE Connection');
  console.log('Attempting to connect to SSE endpoint...');

  try {
    const response = await fetch(`${BASE_URL}/api/sse/connect`, {
      headers: {
        'x-pigeon-id': PIGEON_ID,
      },
    });

    console.log('Response Status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));
    console.log('Cache-Control:', response.headers.get('cache-control'));
    console.log('Connection:', response.headers.get('connection'));

    if (response.status === 200 && response.headers.get('content-type') === 'text/event-stream') {
      console.log('✅ SSE endpoint accessible with correct headers\n');
      return true;
    } else if (response.status === 401) {
      console.log('❌ Authentication failed - Invalid Pigeon ID\n');
      console.log('   Please update PIGEON_ID in this script with a valid user ID\n');
      return false;
    } else {
      console.log('❌ Unexpected response\n');
      return false;
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message, '\n');
    return false;
  }
}

// Test 3: Test SSE status endpoint
async function testSSEStatus() {
  console.log('Test 3: SSE Status Endpoint');
  try {
    const response = await fetch(`${BASE_URL}/api/sse/status`, {
      headers: {
        'x-pigeon-id': PIGEON_ID,
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Status endpoint working');
      console.log('   Active connections:', data.data.totalActiveConnections);
      console.log('   User connected:', data.data.isConnected, '\n');
      return true;
    } else {
      console.log('❌ Status check failed:', data.error, '\n');
      return false;
    }
  } catch (error) {
    console.log('❌ Status check error:', error.message, '\n');
    return false;
  }
}

// Test 4: Test broadcast endpoint
async function testBroadcast() {
  console.log('Test 4: Test Broadcast');
  try {
    const response = await fetch(`${BASE_URL}/api/sse/test-broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pigeon-id': PIGEON_ID,
      },
      body: JSON.stringify({
        message: 'Test broadcast from test script',
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Broadcast endpoint working');
      console.log('   Result:', data.message);
      console.log('   Success:', data.success, '\n');
      return true;
    } else {
      console.log('❌ Broadcast failed:', data.error, '\n');
      return false;
    }
  } catch (error) {
    console.log('❌ Broadcast error:', error.message, '\n');
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('Starting SSE Infrastructure Tests...\n');

  const results = {
    serverHealth: await testServerHealth(),
    sseConnection: await testSSEConnection(),
    sseStatus: await testSSEStatus(),
    broadcast: await testBroadcast(),
  };

  console.log('========================================');
  console.log('Test Results Summary:\n');
  console.log(`Server Health:     ${results.serverHealth ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`SSE Connection:    ${results.sseConnection ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`SSE Status:        ${results.sseStatus ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Broadcast:         ${results.broadcast ? '✅ PASS' : '❌ FAIL'}`);

  const passCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;

  console.log(`\nTotal: ${passCount}/${totalCount} tests passed\n`);

  if (passCount === totalCount) {
    console.log('🎉 All tests passed! SSE infrastructure is working correctly.\n');
    console.log('Next steps:');
    console.log('1. Test with EventSource in browser console');
    console.log('2. Open DevTools Network tab to see event stream');
    console.log('3. Use test-broadcast endpoint to send events\n');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.\n');
  }

  process.exit(passCount === totalCount ? 0 : 1);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

// Run tests
runTests();
