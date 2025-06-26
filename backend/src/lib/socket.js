import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  // Find the socket ID associated with the given user ID
  return userSocketMap.get(userId);
}

// Store online users
const userSocketMap = new Map();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Store the user ID from the handshake query
  const userId = socket.handshake.query.userId;
  if (userId) {
    // Associate the socket ID with the user ID
    userSocketMap.set(userId, socket.id);
  }

  // Notify all clients about the online users
  io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    // Remove the user from the map when they disconnect
    if (userId) {
      userSocketMap.delete(userId);
    }
    // Notify all clients about the updated online users
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
  });
});

export { io, app, server };
