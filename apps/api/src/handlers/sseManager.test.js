/**
 * SSE Testing Guide
 * =================
 *
 * This file contains instructions and code snippets for testing the SSE infrastructure.
 *
 * PREREQUISITES:
 * 1. Backend server running (npm run start:api)
 * 2. Valid authentication (pigeonId cookie or header)
 *
 * TESTING METHODS:
 */

// ============================================================================
// METHOD 1: Browser DevTools Console
// ============================================================================

// Open browser console and run:
const eventSource = new EventSource('http://localhost:5001/api/sse/connect', {
  withCredentials: true, // Include cookies for authentication
});

eventSource.onopen = () => {
  console.log('✅ SSE Connection opened');
};

eventSource.onerror = (error) => {
  console.error('❌ SSE Connection error:', error);
};

eventSource.onmessage = (event) => {
  console.log('📨 Received event:', JSON.parse(event.data));
};

// Listen for specific event types (if using event: field in SSE)
eventSource.addEventListener('connected', (event) => {
  console.log('🔌 Connected event:', JSON.parse(event.data));
});

eventSource.addEventListener('test', (event) => {
  console.log('🧪 Test event:', JSON.parse(event.data));
});

// To close connection:
// eventSource.close();

// ============================================================================
// METHOD 2: Test Broadcast via API
// ============================================================================

// After establishing SSE connection, open another console tab and run:
fetch('http://localhost:5001/api/sse/test-broadcast', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Include cookies
  body: JSON.stringify({
    message: 'Hello from test broadcast!',
  }),
})
  .then((res) => res.json())
  .then((data) => console.log('Broadcast result:', data))
  .catch((err) => console.error('Broadcast error:', err));

// ============================================================================
// METHOD 3: Check Connection Status
// ============================================================================

fetch('http://localhost:5001/api/sse/status', {
  credentials: 'include',
})
  .then((res) => res.json())
  .then((data) => console.log('SSE Status:', data))
  .catch((err) => console.error('Status error:', err));

// ============================================================================
// METHOD 4: Node.js Test Script
// ============================================================================

/*
Create a test file: test-sse.js

const EventSource = require('eventsource');

const PIGEON_ID = 'your-pigeon-id-here'; // Replace with valid pigeonId

const eventSource = new EventSource('http://localhost:5001/api/sse/connect', {
  headers: {
    'x-pigeon-id': PIGEON_ID
  }
});

eventSource.onopen = () => {
  console.log('✅ SSE Connection opened');
};

eventSource.onerror = (error) => {
  console.error('❌ SSE Connection error:', error);
  eventSource.close();
  process.exit(1);
};

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('📨 Received event:', data);
  
  if (data.type === 'connected') {
    console.log('🎉 Successfully connected to SSE!');
    
    // Send test broadcast after 2 seconds
    setTimeout(() => {
      console.log('Sending test broadcast...');
      
      fetch('http://localhost:5001/api/sse/test-broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pigeon-id': PIGEON_ID
        },
        body: JSON.stringify({
          message: 'Test from Node.js script'
        })
      })
        .then(res => res.json())
        .then(result => console.log('📤 Broadcast result:', result))
        .catch(err => console.error('❌ Broadcast error:', err));
    }, 2000);
  }
};

// Keep the script running
process.on('SIGINT', () => {
  console.log('\n👋 Closing SSE connection...');
  eventSource.close();
  process.exit(0);
});

// Run: npm install eventsource && node test-sse.js
*/

// ============================================================================
// METHOD 5: cURL Testing
// ============================================================================

/*
Terminal command to test SSE connection:

curl -N -H "x-pigeon-id: YOUR_PIGEON_ID" http://localhost:5001/api/sse/connect

Expected output:
data: {"type":"connected","data":{"message":"SSE connection established","userId":"YOUR_PIGEON_ID","timestamp":"..."},"timestamp":"..."}

: heartbeat 1234567890
: heartbeat 1234567891
...

(Connection stays open, heartbeats every 30 seconds)
*/

// ============================================================================
// EXPECTED BEHAVIORS
// ============================================================================

/*
✅ Connection Opens:
- Headers: Content-Type: text/event-stream, Cache-Control: no-cache
- Initial "connected" event received
- Connection stays open indefinitely
- Heartbeat comments every 30 seconds

✅ Broadcast Events:
- Events arrive in real-time
- JSON format with type, data, timestamp
- Multiple broadcasts work correctly

✅ Disconnection Handling:
- Client closes: Server detects and cleans up
- Server restarts: Client attempts reconnect (browser auto-reconnects)
- User disconnects: Connection removed from manager

✅ Reconnection:
- Same user reconnects: Old connection closed, new one established
- No duplicate connections per user

❌ Common Issues:
1. 401 Unauthorized: Invalid/missing pigeonId
2. Connection closes immediately: Check CORS/proxy settings
3. No events received: Check SSE message format (must end with \n\n)
4. Memory leaks: Ensure connections are cleaned up on disconnect
*/

// ============================================================================
// DEVTOOLS NETWORK TAB VERIFICATION
// ============================================================================

/*
1. Open Chrome DevTools → Network tab
2. Filter by "EventStream" or search "sse/connect"
3. Look for:
   - Type: eventsource
   - Status: 200 (pending/streaming)
   - Initiator: EventSource
   - Size: (pending)
   - Time: (increasing, shows connection duration)

4. Click on the request:
   - Headers tab: Verify SSE headers
   - EventStream tab: See received events in real-time
   - Timing tab: Connection stays in "waiting" state

5. Test disconnect:
   - Close tab or call eventSource.close()
   - Server logs should show disconnect
   - Check SSE status shows connection removed
*/

// ============================================================================
// INTEGRATION TESTING CHECKLIST
// ============================================================================

/*
□ Single user connects successfully
□ Multiple users can connect simultaneously
□ User receives initial "connected" event
□ Heartbeats arrive every 30 seconds
□ Test broadcast reaches connected user
□ User doesn't receive events when disconnected
□ Reconnection closes old connection
□ Server handles client disconnect gracefully
□ Status endpoint shows accurate connection count
□ No memory leaks after many connect/disconnect cycles
□ Works with authentication middleware
□ CORS allows SSE connections
□ Proxy/load balancer doesn't buffer SSE
*/

module.exports = {
  // Export for potential automated testing
  testConfig: {
    endpoint: '/api/sse/connect',
    expectedHeaders: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
    heartbeatInterval: 30000,
    initialEventType: 'connected',
  },
};
