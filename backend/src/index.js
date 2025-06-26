import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectToDatabase } from "./lib/db.js";
import { io, app, server } from "./lib/socket.js";

// Load environment variables from .env file
dotenv.config();

// Initialize express app
// Commnented out to avoid conflict with socket.io server
// const app = express();

app.use(express.json({ limit: "1mb" })); // Middleware to parse JSON bodies
app.use(cookieParser()); // Middleware to parse cookies
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // Allow cookies to be sent with requests
  })
); // Middleware to enable CORS

// Define routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const PORT = process.env.PORT;

// Replace the app.listen with server.listen to use socket.io
//
// app.listen(PORT, () => {
//   console.log("Server is running on http://localhost:5001");
//   connectToDatabase();
// });

server.listen(PORT, () => {
  console.log("Server is running on http://localhost:5001");
  connectToDatabase();
});
