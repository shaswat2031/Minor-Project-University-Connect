const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://minor-project-university-connect-h83y.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://minor-project-university-connect-h83y.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware for parsing JSON
app.use(express.json());

// Ensure the `certificates` folder exists
const certificatesDir = path.join(__dirname, "certificates");
if (!fs.existsSync(certificatesDir)) {
  fs.mkdirSync(certificatesDir);
}
console.log("JWT_SECRET:", process.env.JWT_SECRET); // Debugging log

// ✅ Import Routes
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const studentRoutes = require("./routes/studentRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const certificationRoutes = require("./routes/certificationRoutes");
const questionRoutes = require("./routes/questionRoutes"); // ✅ Question Routes
const talentMarketplaceRoutes = require("./routes/talentMarketplace");
const chatRoutes = require("./routes/chatRoutes");
const adminRoutes = require("./routes/adminRoutes"); // ✅ Add admin routes

// ✅ Use Routes with better error handling
app.use("/api/auth", authRoutes);
app.use("/api/users", profileRoutes);
app.use(
  "/api/students",
  (req, res, next) => {
    console.log("Students route hit:", req.method, req.path);
    console.log(
      "Auth header:",
      req.headers.authorization ? "Present" : "Missing"
    );
    next();
  },
  studentRoutes
);
app.use("/api/services", serviceRoutes);
app.use("/api/certification", certificationRoutes);
app.use("/api/certifications", certificationRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/talent-marketplace", talentMarketplaceRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes); // ✅ Add admin routes

// ✅ Serve Certificates Publicly
app.use("/certificates", express.static(certificatesDir));

// Update MongoDB Connection Handling
const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    console.log("MongoDB URI:", process.env.MONGODB_URI ? "Set" : "Not set");

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    console.error("Full error:", err);
    process.exit(1);
  }
};

// Socket.IO authentication middleware
const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
};

// Socket.IO connection handling
io.use(authenticateSocket);

const connectedUsers = new Map();
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`User ${socket.userId} connected`);

  // Check if user is already connected and disconnect old connection
  const existingSocketId = connectedUsers.get(socket.userId);
  if (existingSocketId && existingSocketId !== socket.id) {
    const existingSocket = io.sockets.sockets.get(existingSocketId);
    if (existingSocket) {
      console.log(
        `Disconnecting existing connection for user ${socket.userId}`
      );
      existingSocket.disconnect();
    }
  }

  connectedUsers.set(socket.userId, socket.id);
  socket.join(socket.userId);

  // Get user info and mark as online
  socket.on("user-online", async (userInfo) => {
    try {
      const User = require("./models/User");
      const user = await User.findById(socket.userId);

      if (!user) {
        console.error("User not found in database:", socket.userId);
        socket.disconnect();
        return;
      }

      // Check if user is already marked as online
      const existingOnlineUser = onlineUsers.get(socket.userId);
      if (existingOnlineUser) {
        // Update existing online user info
        existingOnlineUser.socketId = socket.id;
        existingOnlineUser.lastSeen = new Date();
      } else {
        // Add new online user
        onlineUsers.set(socket.userId, {
          id: socket.userId,
          name: userInfo.name || user.name,
          socketId: socket.id,
          lastSeen: new Date(),
        });

        // Broadcast to all users that this user is online
        socket.broadcast.emit("user-status-change", {
          userId: socket.userId,
          name: userInfo.name || user.name,
          status: "online",
        });
      }

      // Send list of currently online users to the newly connected user
      const onlineUsersList = Array.from(onlineUsers.values()).filter(
        (user) => user.id !== socket.userId
      );
      socket.emit("online-users-list", onlineUsersList);

      console.log(
        `User ${socket.userId} (${userInfo.name || user.name}) is now online`
      );
    } catch (error) {
      console.error("Error handling user-online:", error);
      socket.disconnect();
    }
  });

  // Handle sending messages
  socket.on("send-message", async (data) => {
    try {
      const { receiverId, content, messageType = "text" } = data;
      const Message = require("./models/Message");
      const Conversation = require("./models/Conversation");
      const User = require("./models/User");

      // Validate input
      if (!receiverId || !content || !content.trim()) {
        socket.emit("message-error", { error: "Missing required fields" });
        return;
      }

      // Verify both users exist
      const [sender, receiver] = await Promise.all([
        User.findById(socket.userId),
        User.findById(receiverId),
      ]);

      if (!sender) {
        socket.emit("message-error", { error: "Sender not found" });
        return;
      }

      if (!receiver) {
        socket.emit("message-error", { error: "Receiver not found" });
        return;
      }

      // Create message
      const message = new Message({
        sender: socket.userId,
        receiver: receiverId,
        content: content.trim(),
        messageType,
      });

      await message.save();
      await message.populate("sender", "name");
      await message.populate("receiver", "name");

      // Update or create conversation
      let conversation = await Conversation.findOne({
        participants: { $all: [socket.userId, receiverId] },
      });

      if (!conversation) {
        conversation = new Conversation({
          participants: [socket.userId, receiverId],
          lastMessage: message._id,
          lastMessageAt: new Date(),
        });
      } else {
        conversation.lastMessage = message._id;
        conversation.lastMessageAt = new Date();
      }

      await conversation.save();

      // Send message to receiver if online
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        socket.to(receiverId).emit("receive-message", message);
      }

      // Send confirmation to sender
      socket.emit("message-sent", message);

      console.log(`Message sent from ${socket.userId} to ${receiverId}`);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("message-error", { error: "Failed to send message" });
    }
  });

  // Handle typing indicators
  socket.on("typing", (data) => {
    socket.to(data.receiverId).emit("user-typing", {
      senderId: socket.userId,
      isTyping: true,
    });
  });

  socket.on("stop-typing", (data) => {
    socket.to(data.receiverId).emit("user-typing", {
      senderId: socket.userId,
      isTyping: false,
    });
  });

  // Handle disconnect with better cleanup
  socket.on("disconnect", (reason) => {
    console.log(`User ${socket.userId} disconnected (${reason})`);

    // Only remove if this is the current socket for the user
    const currentSocketId = connectedUsers.get(socket.userId);
    if (currentSocketId === socket.id) {
      connectedUsers.delete(socket.userId);

      // Remove from online users and broadcast status change
      const userInfo = onlineUsers.get(socket.userId);
      if (userInfo) {
        onlineUsers.delete(socket.userId);
        socket.broadcast.emit("user-status-change", {
          userId: socket.userId,
          name: userInfo.name,
          status: "offline",
        });
      }
    }
  });
});

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  // Safely handle request body logging
  const safeBody = req.body ? { ...req.body } : {};
  if (safeBody.password) safeBody.password = "[REDACTED]";

  console.error("Request Body:", JSON.stringify(safeBody, null, 2));

  // Log request headers for debugging auth issues
  if (req.headers.authorization) {
    console.error(
      "Auth header present:",
      req.headers.authorization.substring(0, 20) + "..."
    );
  }

  // More specific error responses
  let statusCode = 500;
  let message = "Something went wrong";

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation error";
  } else if (err.name === "MongoNetworkError") {
    statusCode = 503;
    message = "Database connection error";
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  res.status(statusCode).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      url: req.url,
      method: req.method,
      name: err.name,
    }),
  });
});

// Add 404 handler
app.use((req, res) => {
  console.log("404 - Route not found:", req.method, req.path);
  res.status(404).json({ message: "Route not found" });
});

connectDB(); // 🔥 Connect to MongoDB

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}`);
  console.log(`🔑 JWT Secret: ${process.env.JWT_SECRET ? "Set" : "Not set"}`);
});
