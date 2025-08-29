import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://linkclub.netlify.app"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // WebRTC signaling events
  socket.on("call-offer", (data) => {
    const { targetUserId, offer, callType } = data;
    const targetSocketId = getReceiverSocketId(targetUserId);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit("call-offer", {
        fromUserId: userId,
        offer,
        callType
      });
      console.log('Call offer sent to target user');
    } else {
      console.log('Target user not online');
    }
  });

  socket.on("call-answer", (data) => {
    const { targetUserId, answer } = data;
    const targetSocketId = getReceiverSocketId(targetUserId);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit("call-answer", {
        fromUserId: userId,
        answer
      });
    }
  });

  socket.on("ice-candidate", (data) => {
    console.log('ICE candidate received on server:', data);
    const { targetUserId, candidate } = data;
    const targetSocketId = getReceiverSocketId(targetUserId);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit("ice-candidate", {
        fromUserId: userId,
        candidate
      });
    }
  });

  socket.on("call-rejected", (data) => {
    const { targetUserId } = data;
    const targetSocketId = getReceiverSocketId(targetUserId);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit("call-rejected", {
        fromUserId: userId
      });
    }
  });

  socket.on("call-ended", (data) => {
    const { targetUserId } = data;
    const targetSocketId = getReceiverSocketId(targetUserId);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit("call-ended", {
        fromUserId: userId
      });
    }
  });

  // Stream.io call invitation events
  socket.on("call-invitation", (data) => {
    const { targetUserId, callId, callType, callerInfo } = data;
    const targetSocketId = getReceiverSocketId(targetUserId);
    
    if (targetSocketId) {
      const callData = {
        callId,
        callType,
        caller: callerInfo,
        fromUserId: userId
      };
      io.to(targetSocketId).emit("incoming-call", callData);
    } else {
      socket.emit("call-failed", {
        reason: "User is offline"
      });
    }
  });

  socket.on("call-response", (data) => {
    const { targetUserId, callId, accepted } = data;
    const targetSocketId = getReceiverSocketId(targetUserId);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit("call-response", {
        callId,
        accepted,
        fromUserId: userId
      });
    }
  });


  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
