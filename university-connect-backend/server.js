require("dotenv").config();

// Add debug logging at the top
console.log("🔍 Environment Variables Check:");
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Set ✅" : "Not set ❌");
console.log(
  "MongoDB URI starts with:",
  process.env.MONGODB_URI
    ? process.env.MONGODB_URI.substring(0, 20) + "..."
    : "N/A"
);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");

// Import all routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require("./routes/profileRoutes");
const studentRoutes = require("./routes/studentRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const certificationRoutes = require("./routes/certificationRoutes");
const questionRoutes = require("./routes/questionRoutes");
const talentMarketplaceRoutes = require("./routes/talentMarketplace");
const chatRoutes = require("./routes/chatRoutes");
const adminRoutes = require("./routes/adminRoutes");
const aiRoadmapRoutes = require('./routes/aiRoadmapRoutes');
const checkAuthRoutes = require('./routes/check-auth');
const testRoutes = require('./routes/test-routes');

// Enhanced MongoDB connection function
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    console.log("🔌 Attempting to connect to MongoDB...");
    console.log(
      "🌐 MongoDB URI (first 30 chars):",
      process.env.MONGODB_URI.substring(0, 30) + "..."
    );

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000, // 45 second socket timeout
      maxPoolSize: 10,
      minPoolSize: 5,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);

    return conn;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.error("Full error:", error);
    throw error;
  }
};

// Import models at the top with error handling
let Message, Conversation, User;
try {
  Message = require("./models/Message");
  Conversation = require("./models/Conversation");
  User = require("./models/User");
  console.log("✅ Models loaded successfully");
} catch (error) {
  console.error("❌ Failed to load models:", error.message);
  throw new Error("Failed to load required models");
}

const app = express();
const server = http.createServer(app);

// Basic middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Request Body:', req.body);
  next();
});

// CORS configuration - Must be before routes
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://minor-project-university-connect-h83y.vercel.app",
    "https://uniconnect.prasadshaswat.tech"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Mount all routes
console.log('Mounting routes...');

// Auth routes
app.use('/api/auth', authRoutes);
console.log('✅ Auth routes mounted');

// Other routes with better logging
app.use('/api/profile', profileRoutes);
console.log('✅ Profile routes mounted at /api/profile');
app.use('/api/students', studentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/marketplace', talentMarketplaceRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/roadmap/gemini', aiRoadmapRoutes);
app.use('/api/check-auth', checkAuthRoutes); // Add auth checking route
app.use('/api/test', testRoutes); // Add test routes for debugging

console.log('✅ All routes mounted successfully');

// Log all requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// 404 handler
app.use((req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    res.status(404).json({ 
        message: `Route not found: ${req.method} ${req.url}`,
        timestamp: new Date().toISOString(),
        path: req.url,
        method: req.method
    });
});

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://minor-project-university-connect-h83y.vercel.app",
      "https://uniconnect.prasadshaswat.tech",
    ],
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Ensure the `certificates` folder exists
const certificatesDir = path.join(__dirname, "certificates");
if (!fs.existsSync(certificatesDir)) {
  fs.mkdirSync(certificatesDir);
}
console.log("JWT_SECRET:", process.env.JWT_SECRET); // Debugging log

// ✅ Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "University Connect Backend API is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ✅ Use Routes with better error handling
app.use("/api/auth", authRoutes);
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
app.use("/api/certification", certificationRoutes); // Keep this for backward compatibility
app.use("/api/questions", questionRoutes);
app.use("/api/talent-marketplace", talentMarketplaceRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes); // ✅ Add admin routes

// ✅ Serve Certificates Publicly
app.use("/certificates", express.static(certificatesDir));

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

      console.log(`Message send attempt: ${socket.userId} -> ${receiverId}`);
      console.log("Message content:", content);

      // Validate input
      if (!receiverId || !content || !content.trim()) {
        console.log("Missing required fields");
        socket.emit("message-error", { error: "Missing required fields" });
        return;
      }

      // Verify both users exist
      const [sender, receiver] = await Promise.all([
        User.findById(socket.userId),
        User.findById(receiverId),
      ]);

      if (!sender) {
        console.log("Sender not found:", socket.userId);
        socket.emit("message-error", { error: "Sender not found" });
        return;
      }

      if (!receiver) {
        console.log("Receiver not found:", receiverId);
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

      // Populate the message with sender and receiver info
      await message.populate("sender", "name");
      await message.populate("receiver", "name");

      console.log("Message saved successfully:", message._id);

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
      console.log("Conversation updated successfully");

      // Send message to receiver if online
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        // Emit to the specific socket ID of the receiver
        io.to(receiverSocketId).emit("receive-message", message);
        console.log(`Message sent to receiver socket: ${receiverSocketId}`);
      } else {
        console.log(`Receiver ${receiverId} is not online`);
      }

      // Send confirmation to sender
      socket.emit("message-sent", message);
      console.log(`Message confirmation sent to sender: ${socket.userId}`);
    } catch (error) {
      console.error("Error sending message:", error);
      console.error("Stack trace:", error.stack);
      socket.emit("message-error", { error: "Failed to send message" });
    }
  });

  // Handle typing indicators
  socket.on("typing", (data) => {
    const receiverSocketId = connectedUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("user-typing", {
        senderId: socket.userId,
        isTyping: true,
      });
    }
  });

  socket.on("stop-typing", (data) => {
    const receiverSocketId = connectedUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("user-typing", {
        senderId: socket.userId,
        isTyping: false,
      });
    }
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

// The 404 handler is already defined earlier in the file
// No need for duplicate handler here

const startServer = async () => {
  let retries = 5;

  while (retries > 0) {
    try {
      // Connect to MongoDB
      await connectDB();
      console.log('✅ MongoDB connected successfully');

      // Start server only after successful DB connection
      const PORT = process.env.PORT || 5000;
      
      // Start the HTTP server instead of just the Express app
      server.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(
          `🌐 Frontend URL: ${
            process.env.FRONTEND_URL || "http://localhost:3000"
          }`
        );
        console.log(
          `📡 API URL: ${process.env.API_URL || `http://localhost:${PORT}`}`
        );
        console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
        console.log('🔌 Socket.IO initialized');
      });

      // Handle server errors
      server.on('error', (error) => {
        console.error('💥 Server error:', error);
      });

      // Handle WebSocket events
      io.on('connection', (socket) => {
        console.log('🔌 New WebSocket connection:', socket.id);
        
        socket.on('disconnect', () => {
          console.log('🔌 Client disconnected:', socket.id);
        });
      });

      break; // Exit retry loop on success
    } catch (error) {
      retries--;
      console.error(`💥 Failed to start server. ${retries} retries left.`);
      console.error('Error details:', error);

      if (retries === 0) {
        console.error("🚫 Max retries reached. Could not start server.");
        throw new Error("Failed to start server after maximum retries");
      }

      console.log("⏳ Retrying in 5 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

// Handle process termination
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('💤 Server closed');
    mongoose.connection.close(false, () => {
      console.log('💤 MongoDB connection closed');
    });
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 UNCAUGHT EXCEPTION:', error);
  server.close(() => {
    console.log('Server closed due to uncaught exception');
  });
});

// Start the server
startServer();
