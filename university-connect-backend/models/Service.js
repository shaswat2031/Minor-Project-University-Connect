const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  skills: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  instagram: String,
  whatsapp: String
}, { timestamps: true });

module.exports = mongoose.model("Service", serviceSchema);
