const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// Get all conversations for a user
router.get("/conversations", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ message: "Invalid user authentication" });
    }

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "name email")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 });

    // Format conversations to include other user info with validation
    const formattedConversations = await Promise.all(
      conversations.map(async (conv) => {
        try {
          const otherUser = conv.participants.find(
            (participant) => participant._id.toString() !== userId
          );

          if (!otherUser) {
            console.warn("Conversation without valid other user:", conv._id);
            return null;
          }

          // Verify the other user still exists
          const userExists = await User.findById(otherUser._id);
          if (!userExists) {
            console.warn("Referenced user no longer exists:", otherUser._id);
            return null;
          }

          return {
            _id: conv._id,
            otherUser: {
              id: otherUser._id,
              name: otherUser.name,
              email: otherUser.email,
              isOnline: false, // Will be updated by socket events
            },
            lastMessage: conv.lastMessage,
            lastMessageAt: conv.lastMessageAt,
          };
        } catch (error) {
          console.error("Error processing conversation:", conv._id, error);
          return null;
        }
      })
    );

    // Filter out null conversations
    const validConversations = formattedConversations.filter(
      (conv) => conv !== null
    );

    res.json(validConversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get messages between two users
router.get("/messages/:userId", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    if (!currentUserId || !otherUserId) {
      return res.status(400).json({ message: "Invalid user IDs" });
    }

    // Verify both users exist
    const [currentUser, otherUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(otherUserId),
    ]);

    if (!currentUser) {
      return res.status(401).json({ message: "Current user not found" });
    }

    if (!otherUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    })
      .populate("sender", "name")
      .populate("receiver", "name")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Send a message (HTTP endpoint)
router.post("/send", authMiddleware, async (req, res) => {
  try {
    const { receiverId, content, messageType = "text" } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !content || !senderId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Verify both users exist
    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId),
    ]);

    if (!sender) {
      return res.status(401).json({ message: "Sender not found" });
    }

    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    // Create message
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
      messageType,
    });

    await message.save();
    await message.populate("sender", "name");
    await message.populate("receiver", "name");

    // Update or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
        lastMessage: message._id,
        lastMessageAt: new Date(),
      });
    } else {
      conversation.lastMessage = message._id;
      conversation.lastMessageAt = new Date();
    }

    await conversation.save();

    res.json({
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get unread message count for a user
router.get("/unread-count", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ message: "Invalid user authentication" });
    }

    // Count unread messages where the user is the receiver
    const unreadCount = await Message.countDocuments({
      receiver: userId,
      isRead: false,
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark messages as read
router.put("/mark-read/:userId", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    if (!currentUserId || !otherUserId) {
      return res.status(400).json({ message: "Invalid user IDs" });
    }

    // Mark all messages from otherUserId to currentUserId as read
    const updateResult = await Message.updateMany(
      {
        sender: otherUserId,
        receiver: currentUserId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    res.json({
      message: "Messages marked as read",
      modifiedCount: updateResult.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
