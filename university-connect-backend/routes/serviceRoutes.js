const express = require("express");
const Service = require("../models/Service");

const router = express.Router();

// Create a new service (No authentication required)
router.post("/create", async (req, res) => {
    try {
      const { title, description, skills, price, instagram, whatsapp, userId } = req.body;
  
      // ✅ Check if userId exists
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized: User ID required" });
      }
  
      // ✅ Ensure all required fields are present
      if (!title || !description || !skills || !price) {
        return res.status(400).json({ message: "All required fields must be filled!" });
      }
  
      // ✅ Save service with userId
      const service = new Service({
        title,
        description,
        skills,
        price,
        instagram,
        whatsapp,
        userId, // ✅ Store userId
      });
  
      await service.save();
      res.status(201).json({ message: "✅ Service created successfully!", service });
    } catch (error) {
      console.error("❌ Error creating service:", error);
      res.status(500).json({ error: "Server error", details: error.message });
    }
  });
  
// Get all services
router.get("/", async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/update/:id", async (req, res) => {
    try {
      const { title, description, skills, price, instagram, whatsapp, userId } = req.body;
  
      // Find the service by ID
      const service = await Service.findById(req.params.id);
  
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
  
      // Ensure only the creator can update
      if (service.userId.toString() !== userId) {
        return res.status(403).json({ message: "Unauthorized to edit this service" });
      }
  
      // Update fields if provided
      service.title = title || service.title;
      service.description = description || service.description;
      service.skills = skills || service.skills;
      service.price = price || service.price;
      service.instagram = instagram || service.instagram;
      service.whatsapp = whatsapp || service.whatsapp;
  
      await service.save();
      res.json({ message: "Service updated successfully!", service });
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  

  router.delete("/delete/:id", async (req, res) => {
    try {
        const { userId } = req.query; // ✅ Get userId from query parameters (React should send it)
        
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User ID required" });
        }

        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        if (service.userId.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized to delete this service" });
        }

        await Service.findByIdAndDelete(req.params.id);
        res.json({ message: "✅ Service deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting service:", error);
        res.status(500).json({ error: "Server error", details: error.message });
    }
});


module.exports = router;
