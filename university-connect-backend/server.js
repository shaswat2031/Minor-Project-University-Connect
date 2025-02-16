const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Ensure the `certificates` folder exists
const certificatesDir = path.join(__dirname, "certificates");
if (!fs.existsSync(certificatesDir)) {
  fs.mkdirSync(certificatesDir);
}

// ✅ Import Routes
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const studentRoutes = require("./routes/studentRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const certificationRoutes = require("./routes/certificationRoutes");
const questionRoutes = require("./routes/questionRoutes"); // ✅ Question Routes

// ✅ Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/certification", certificationRoutes);
app.use("/api/questions", questionRoutes); // ✅ FIXED route for fetching questions

// ✅ Serve Certificates Publicly
app.use("/certificates", express.static(certificatesDir));

// ✅ MongoDB Connection Handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1); // Exit process with failure
  }
};
connectDB(); // 🔥 Connect to MongoDB

// ✅ Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
