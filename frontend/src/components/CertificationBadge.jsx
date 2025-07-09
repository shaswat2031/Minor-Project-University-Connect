import React from "react";
import { motion } from "framer-motion";
import { FaCertificate, FaStar, FaCrown, FaGem } from "react-icons/fa";

const CertificationBadge = ({
  certification,
  size = "md",
  showDetails = true,
}) => {
  const getBadgeConfig = (category, percentage) => {
    const configs = {
      React: { icon: "⚛️", color: "from-blue-500 to-cyan-400" },
      Java: { icon: "☕", color: "from-orange-500 to-red-500" },
      Python: { icon: "🐍", color: "from-green-500 to-teal-400" },
      JavaScript: { icon: "🚀", color: "from-yellow-500 to-orange-400" },
      "Data Structures": { icon: "🏗️", color: "from-purple-500 to-pink-500" },
      Algorithms: { icon: "🧮", color: "from-indigo-500 to-purple-500" },
      "Web Development": { icon: "🌐", color: "from-pink-500 to-rose-400" },
    };

    const baseConfig = configs[category] || {
      icon: "🏆",
      color: "from-gray-500 to-gray-600",
    };

    // Determine badge level based on percentage
    let badgeLevel, levelIcon, levelColor;
    if (percentage >= 95) {
      badgeLevel = "Platinum";
      levelIcon = FaGem;
      levelColor = "from-purple-400 to-pink-400";
    } else if (percentage >= 85) {
      badgeLevel = "Gold";
      levelIcon = FaCrown;
      levelColor = "from-yellow-400 to-orange-400";
    } else if (percentage >= 75) {
      badgeLevel = "Silver";
      levelIcon = FaStar;
      levelColor = "from-gray-300 to-gray-400";
    } else {
      badgeLevel = "Bronze";
      levelIcon = FaCertificate;
      levelColor = "from-amber-600 to-amber-700";
    }

    return { ...baseConfig, badgeLevel, levelIcon, levelColor };
  };

  const config = getBadgeConfig(
    certification.category,
    certification.percentage
  );
  const LevelIcon = config.levelIcon;

  const sizeClasses = {
    sm: "w-12 h-12 text-xl",
    md: "w-16 h-16 text-2xl",
    lg: "w-20 h-20 text-3xl",
    xl: "w-24 h-24 text-4xl",
  };

  return (
    <motion.div
      className="relative group"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Main Badge */}
      <div className={`relative ${sizeClasses[size]} mx-auto`}>
        {/* Badge Background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${config.color} rounded-full shadow-lg`}
        ></div>

        {/* Level Ring */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${config.levelColor} rounded-full p-1`}
        >
          <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">{config.icon}</span>
          </div>
        </div>

        {/* Level Icon */}
        <div className="absolute -top-2 -right-2 bg-gray-900 rounded-full p-1">
          <LevelIcon
            className={`text-sm bg-gradient-to-br ${config.levelColor} bg-clip-text text-transparent`}
          />
        </div>

        {/* Glow Effect */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${config.levelColor} rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300`}
        ></div>
      </div>

      {/* Badge Details */}
      {showDetails && (
        <div className="text-center mt-2">
          <div className="text-white font-semibold text-sm">
            {certification.category}
          </div>
          <div
            className={`text-xs bg-gradient-to-r ${config.levelColor} bg-clip-text text-transparent font-bold`}
          >
            {config.badgeLevel}
          </div>
          <div className="text-gray-400 text-xs">
            {certification.percentage.toFixed(1)}%
          </div>
        </div>
      )}

      {/* Tooltip on Hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-gray-700">
          <div className="font-semibold">
            {certification.category} Certification
          </div>
          <div className="text-gray-300">
            Score: {certification.score}/{certification.totalQuestions}
          </div>
          <div className="text-gray-300">
            Earned: {new Date(certification.earnedAt).toLocaleDateString()}
          </div>
          <div
            className={`bg-gradient-to-r ${config.levelColor} bg-clip-text text-transparent font-bold`}
          >
            {config.badgeLevel} Level
          </div>
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default CertificationBadge;
