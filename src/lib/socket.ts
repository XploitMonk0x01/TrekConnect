
import { Server as NetServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
// NextResponse import removed as it's not used for initSocket's core logic anymore
import {
  saveMessage,
  getMessages,
  markMessagesAsRead,
} from '@/services/messages'
import type { Message } from '@/lib/types'

let io: SocketIOServer | null = null;

// httpServerForAttachment should be the actual Node.js http.Server instance
export const initSocket = (httpServerForAttachment: NetServer | null) => {
  if (io) {
    console.log('[Socket Init] Socket.IO server already initialized.');
    // If io exists but engine isn't attached (e.g. after HMR), try re-attaching.
    // This check might be too aggressive if httpServerForAttachment is transient.
    if (httpServerForAttachment && io.engine && !(io.engine as any).server) {
        console.log('[Socket Init] Re-attaching engine to existing IO instance.');
        try {
            io.attach(httpServerForAttachment);
        } catch (e) {
            console.error('[Socket Init] Error re-attaching engine:', e);
        }
    }
    return io;
  }

  if (!httpServerForAttachment) {
    console.error('[Socket Init] Critical: HTTP server instance not available and Socket.IO not initialized. Cannot start Socket.IO.');
    return null; // Indicate failure to initialize
  }

  console.log('[Socket Init] Initializing new Socket.IO server instance.');
  // Attach Socket.IO to the provided HTTP server instance
  io = new SocketIOServer(httpServerForAttachment, {
    path: '/api/socket', // This is the path the client will connect to.
    addTrailingSlash: false,
    cors: {
      origin: "*", // Adjust in production for security
      methods: ["GET", "POST"]
    }
  });

  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      console.error(`[Socket Auth Middleware] Failed: No userId in handshake.auth for socket ${socket.id}. Handshake auth:`, socket.handshake.auth);
      return next(new Error('Authentication error: userId missing'));
    }
    socket.data.userId = userId;
    console.log(`[Socket Auth Middleware] Success: User ${userId} attempting to connect with socket ${socket.id}`);
    next();
  });

  io.on('connection', (socket) => {
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

    socket.on(
      'send-message',
      async (data: { roomId: string; message: Message }) => {
        const senderId = socket.data.userId;
        if (!senderId) {
          console.error(`[Socket Send Message] Auth error for socket ${socket.id} trying to send to ${data.roomId}`);
          socket.emit('error', 'Authentication required to send message');
          return;
        }
        if (data.message.senderId !== senderId) {
          console.warn(`[Socket Send Message] SenderId mismatch: socket user ${senderId}, message payload sender ${data.message.senderId}. Using socket user.`);
        }
        try {
          const messageToSave: Message = {
            ...data.message,
            roomId: data.roomId,
            senderId: senderId, 
            timestamp: new Date(data.message.timestamp || Date.now()),
            read: false, 
          };
          const savedMessage = await saveMessage(messageToSave);
          io?.to(data.roomId).emit('receive-message', savedMessage); // Use the global io here
          console.log(`[Socket Send Message] Message broadcasted to room ${data.roomId}`);
        } catch (error) {
          console.error(`[Socket Send Message] Error saving/sending message for room ${data.roomId}:`, error);
          socket.emit('error', 'Failed to send message');
        }
      }
    );

    socket.on('disconnect', (reason) => {
      console.log(`[Socket Disconnect] Client disconnected: ${socket.id} (User: ${socket.data.userId}), Reason: ${reason}`);
    });

    socket.on('error', (err) => {
      console.error(`[Socket Error] Error on socket ${socket.id} (User: ${socket.data.userId}):`, err.message);
    });
  });
  
  console.log('[Socket Init] New Socket.IO server initialized and event handlers attached.');
  return io;
};
