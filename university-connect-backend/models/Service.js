const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  skills: { type: String, required: true },
  price: { type: Number, required: true },
  instagram: { type: String },
  whatsapp: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Associate service with a user
});

module.exports = mongoose.model("Service", ServiceSchema);
