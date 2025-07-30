import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import connectDB from "./lib/db.js";
import { Server } from "socket.io";

//* Routers
import authRouter from "./routers/auth-router.js";
import messageRouter from "./routers/message-router.js";

const app = express();
const server = http.createServer(app);

//* Initialize Socket.IO Server
export const io = new Server(server, {
  cors: { origin: "*" },
});

//* Store online users
export const userSocketMap = {};
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  console.log(`User connected: ${userId}`);

  if (userId) userSocketMap[userId] = socket.id;

  // Emit online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${userId}`);
    delete userSocketMap[userId];

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

app.use(express.json({ limit: "4mb" }));
app.use(cors());

app.use("/api/status", (req, res) => {
  res.status(200).json({ status: "Server is running" });
});

//* Routers
app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);

connectDB();

if (process.env.NODE_ENV !== "production") {
  server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
}
