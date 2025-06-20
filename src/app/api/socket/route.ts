
import { NextRequest, NextResponse } from 'next/server';
import { initSocket } from '@/lib/socket';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';

// Define a type for the server object if it's extended with 'io'
interface ExtendedHttpServer extends HTTPServer {
  io?: any; // Replace 'any' with 'SocketIOServer' type if available globally or passed
}
interface ExtendedNetSocket extends NetSocket {
  server: ExtendedHttpServer;
}
interface RequestWithSocket extends NextRequest {
  socket?: ExtendedNetSocket; // Optional socket property
}


export async function GET(req: RequestWithSocket) {
  // Try to get the HTTP server instance.
  // This is often challenging in serverless environments or standard Next.js App Router.
  // The `req.socket.server` pattern is more common in Pages Router or custom server setups.
  // For App Router, this might be undefined if not running in a Node.js server environment
  // where this property is explicitly set up.
  const httpServer = req.socket?.server as HTTPServer | undefined;

  if (httpServer) {
    // Attempt to initialize Socket.IO and attach it to the server
    const io = initSocket(httpServer);
    if (io) {
        console.log('[API Socket Route] Socket.IO initialized or already running.');
        // If Socket.IO is set up, it should handle its own requests for its path.
        // We must return a Response object as per App Router requirements.
        // This response is for the initial HTTP GET from the client (e.g., the fetch in ChatContext),
        // NOT for Socket.IO's internal polling requests.
        // Ideally, Socket.IO engine intercepts polling requests to its path before this handler sends JSON.
    } else {
        console.error('[API Socket Route] Failed to initialize Socket.IO server through initSocket.');
        return NextResponse.json({ error: 'Socket server critical setup error.' }, { status: 500 });
    }
  } else {
    // Fallback or warning if the HTTP server instance couldn't be accessed.
    // This means WebSockets might not work, and polling relies on Socket.IO server
    // being available globally and handling requests to its path.
    console.warn('[API Socket Route] HTTP server instance not directly accessible. Socket.IO relies on global instance or may have issues.');
    // Attempt to initialize with null, relying on global `io` instance logic in `initSocket`
    const io = initSocket(null); 
    if (!io) {
         console.error('[API Socket Route] Failed to initialize Socket.IO server (global attempt).');
         return NextResponse.json({ error: 'Socket server global setup error.' }, { status: 500 });
    }
  }

  // For App Router, a response MUST be returned.
  // This response is for the initial `fetch` call from the client to "wake up" this endpoint.
  // It's crucial that Socket.IO, if properly attached to the server, handles subsequent polling/websocket
  // requests to its path ('/api/socket') *before* this JSON response is sent for those specific requests.
  // If this JSON response is sent for Socket.IO's polling requests, "xhr poll error" will occur.
  return NextResponse.json({ 
    success: true, 
    message: "Socket API endpoint acknowledged. Socket.IO should now handle its specific transport requests if configured correctly." 
  });
}
