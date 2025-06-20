
import { NextRequest, NextResponse } from 'next/server';
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import type { Socket as NetSocket } from 'net';
import type { Message } from '@/lib/types';
import { saveMessage, getMessages, markMessagesAsRead } from '@/services/messages';

// Define a type for the server object if it's extended with 'io'
interface ExtendedHttpServer extends HTTPServer {
  io?: SocketIOServer;
}
interface ExtendedNetSocket extends NetSocket {
  server: ExtendedHttpServer;
}

// This is a global or module-scoped variable to hold the Socket.IO server instance.
// It helps ensure that we don't try to re-initialize it on every request if it already exists.
let ioServerInstance: SocketIOServer | undefined;


export async function GET(req: NextRequest) {
  // Attempt to get the underlying HTTP server. This is environment-dependent.
  // @ts-ignore _request is a private Next.js API, might break. More stable alternatives are hard in App Router.
  const httpServer: ExtendedHttpServer | undefined = (req as any)._server?.server || (req.socket as any)?.server;


  if (!httpServer) {
    console.error('[API Socket Route] HTTP server instance not found. Cannot attach Socket.IO.');
    // If the server instance cannot be found, we cannot proceed to attach Socket.IO
    return NextResponse.json({ error: 'Socket server setup failed: HTTP server not found.' }, { status: 500 });
  }

  if (!ioServerInstance) { // Check if global instance exists
    console.log('[API Socket Route] Initializing new Socket.IO server instance...');
    // Create a new Socket.IO server and attach it to the HTTP server
    const newIo = new SocketIOServer(httpServer, {
      path: '/api/socket', // Client will connect to this path
      addTrailingSlash: false,
      cors: {
        origin: "*", // Adjust in production for security
        methods: ["GET", "POST"]
      }
    });

    newIo.use((socket: Socket, next: (err?: Error) => void) => {
      const userId = socket.handshake.auth.userId;
      if (!userId) {
        console.error(`[Socket Auth Middleware] Failed: No userId in handshake.auth for socket ${socket.id}. Handshake auth:`, socket.handshake.auth);
        return next(new Error('Authentication error: userId missing'));
      }
      socket.data.userId = userId; // Store userId in socket data
      console.log(`[Socket Auth Middleware] Success: User ${userId} authenticated for socket ${socket.id}`);
      next();
    });

    newIo.on('connection', (socket: Socket) => {
      console.log(`[Socket Connection] Client connected: ${socket.id}, User ID: ${socket.data.userId}`);

      socket.on('join-room', async (roomId: string) => {
        const userId = socket.data.userId;
        if (!userId) {
          console.error(`[Socket Join Room] Auth error for socket ${socket.id} trying to join ${roomId}`);
          socket.emit('error', 'Authentication required to join room');
          return;
        }
        socket.join(roomId);
        console.log(`[Socket Join Room] Socket ${socket.id} (User: ${userId}) joined room ${roomId}`);
        try {
          const messages = await getMessages(roomId);
          socket.emit('load-messages', messages);
          console.log(`[Socket Join Room] Loaded ${messages.length} messages for room ${roomId} for user ${userId}`);
          await markMessagesAsRead(roomId, userId);
        } catch (error) {
          console.error(`[Socket Join Room] Error loading messages for room ${roomId}:`, error);
          socket.emit('error', 'Failed to load messages');
        }
      });

      socket.on('leave-room', (roomId: string) => {
        socket.leave(roomId);
        console.log(`[Socket Leave Room] Socket ${socket.id} (User: ${socket.data.userId}) left room ${roomId}`);
      });

      socket.on('send-message', async (data: { roomId: string; message: Message }) => {
        const senderId = socket.data.userId;
        if (!senderId) {
          console.error(`[Socket Send Message] Auth error for socket ${socket.id} trying to send to ${data.roomId}`);
          socket.emit('error', 'Authentication required to send message');
          return;
        }
        
        const messageToSave: Message = {
          ...data.message,
          roomId: data.roomId,
          senderId: senderId,
          timestamp: new Date(data.message.timestamp || Date.now()),
          read: false,
        };

        try {
          const savedMessage = await saveMessage(messageToSave);
          newIo.to(data.roomId).emit('receive-message', savedMessage);
          console.log(`[Socket Send Message] Message from ${senderId} broadcasted to room ${data.roomId}`);
        } catch (error) {
          console.error(`[Socket Send Message] Error saving/sending message for room ${data.roomId}:`, error);
          socket.emit('error', 'Failed to send message');
        }
      });

      socket.on('disconnect', (reason: string) => {
        console.log(`[Socket Disconnect] Client disconnected: ${socket.id} (User: ${socket.data.userId}), Reason: ${reason}`);
      });

      socket.on('error', (err: Error) => {
        console.error(`[Socket Error] Error on socket ${socket.id} (User: ${socket.data.userId}):`, err.message);
      });
    });

    ioServerInstance = newIo; // Store in global scope
    console.log('[API Socket Route] New Socket.IO server initialized and event handlers attached.');
  } else {
    console.log('[API Socket Route] Socket.IO server already initialized.');
  }

  // For App Router, we MUST return a NextResponse.
  // This response is intended for the initial client fetch to this path (if any).
  // For Socket.IO's own polling/websocket handshake requests, the Socket.IO engine
  // (now attached to `httpServer` via `ioServerInstance`) should ideally intercept and handle
  // these requests *before* this `NextResponse` is sent.
  // If this handler still ends up processing Socket.IO's specific transport requests
  // and sending this null response, "xhr poll error" might persist.
  return new NextResponse(null, { status: 200 });
}
