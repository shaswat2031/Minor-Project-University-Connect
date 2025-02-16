const mongoose = require("mongoose");
const Question = require("./models/Question");
const mockMCQs = require("./routes/mockData");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  await Question.insertMany(mockMCQs);
  console.log("✅ MCQs Added to Database");
  mongoose.connection.close();
}).catch((err) => console.error("❌ Error:", err));
