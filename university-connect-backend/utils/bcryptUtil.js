// Utility to handle bcrypt with fallbacks
let bcrypt;

try {
  // Try bcryptjs first (pure JavaScript implementation)
  bcrypt = require("bcryptjs");
  console.log("✅ Using bcryptjs for password hashing");
} catch (error) {
  console.warn("⚠️ bcryptjs not available, trying bcrypt...");
  try {
    // Fallback to bcrypt (native implementation)
    bcrypt = require("bcrypt");
    console.log("✅ Using bcrypt for password hashing");
  } catch (bcryptError) {
    console.error("❌ Neither bcryptjs nor bcrypt are available");
    throw new Error(
      "No bcrypt implementation available. Please install bcryptjs or bcrypt."
    );
  }
}

// Standardize the API
const hashPassword = async (password, saltRounds = 12) => {
  try {
    if (bcrypt.hash) {
      return await bcrypt.hash(password, saltRounds);
    } else if (bcrypt.hashSync) {
      return bcrypt.hashSync(password, saltRounds);
    } else {
      throw new Error("No hash method available");
    }
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
};

const comparePassword = async (password, hash) => {
  try {
    if (bcrypt.compare) {
      return await bcrypt.compare(password, hash);
    } else if (bcrypt.compareSync) {
      return bcrypt.compareSync(password, hash);
    } else {
      throw new Error("No compare method available");
    }
  } catch (error) {
    console.error("Error comparing password:", error);
    throw error;
  }
};

module.exports = {
  hash: hashPassword,
  compare: comparePassword,
  // Export the original bcrypt object for direct access if needed
  bcrypt,
};
