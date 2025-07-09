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

// ✅ Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", profileRoutes); // Maps /api/users to profileRoutes
app.use("/api/students", studentRoutes);
app.use("/api/services", serviceRoutes);
// Update route mapping
app.use("/api/certification", certificationRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/talent-marketplace", talentMarketplaceRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes); // ✅ Add admin routes

// ✅ Serve Certificates Publicly
app.use("/certificates", express.static(certificatesDir));

// Update MongoDB Connection Handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};
connectDB(); // 🔥 Connect to MongoDB

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

io.on("connection", (socket) => {
  console.log(`User ${socket.userId} connected`);
  connectedUsers.set(socket.userId, socket.id);

  // Join user to their personal room
  socket.join(socket.userId);

  // Handle sending messages
  socket.on("send-message", async (data) => {
    try {
      const { receiverId, content, messageType = "text" } = data;
      const Message = require("./models/Message");
      const Conversation = require("./models/Conversation");

      // Create message
      const message = new Message({
        sender: socket.userId,
        receiver: receiverId,
        content,
        messageType,
      });

      await message.save();
      await message.populate("sender", "name");
      await message.populate("receiver", "name");

      // Update conversation
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
      socket.to(receiverId).emit("receive-message", message);

      // Send confirmation to sender
      socket.emit("message-sent", message);
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

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User ${socket.userId} disconnected`);
    connectedUsers.delete(socket.userId);
  });
});

// ✅ Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
