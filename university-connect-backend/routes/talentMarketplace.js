const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Service = require("../models/Service");

const router = express.Router();

// Create a new service
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { title, description, skills, price, instagram, whatsapp } = req.body;
    const userId = req.user.id;

    const service = new Service({
      user: userId,
      title,
      description,
      skills,
      price,
      instagram,
      whatsapp,
    });

    await service.save();
    res.status(201).json({ message: "Service created successfully!", service });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get all services
router.get("/", async (req, res) => {
  try {
    const services = await Service.find().populate("user", "name");
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get user's services
router.get("/my-services", authMiddleware, async (req, res) => {
  try {
    const services = await Service.find({ user: req.user.id });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update a service
router.put("/update/:id", authMiddleware, async (req, res) => {
  try {
    const { title, description, skills, price, instagram, whatsapp } = req.body;
    const service = await Service.findById(req.params.id);

    if (!service || service.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    service.title = title;
    service.description = description;
    service.skills = skills;
    service.price = price;
    service.instagram = instagram;
    service.whatsapp = whatsapp;

    await service.save();
    res.json({ message: "Service updated successfully!", service });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a service
router.delete("/delete/:id", authMiddleware, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (service.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Service.findByIdAndDelete(req.params.id); // Changed from service.remove()
    res.json({ message: "Service deleted successfully!" });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
