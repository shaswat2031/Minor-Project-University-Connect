import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import React from "react";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim"; // Use slim version
import PropTypes from "prop-types";

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log(
        "Attempting login to:",
        `${import.meta.env.VITE_API_URL}/api/auth/login`
      );
      console.log("Environment variables:", {
        VITE_API_URL: import.meta.env.VITE_API_URL,
        MODE: import.meta.env.MODE,
        DEV: import.meta.env.DEV,
      });

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          email,
          password,
        },
        {
          timeout: 10000, // 10 second timeout
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Login Response:", res.data); // Debugging log

      const token = res.data.token;
      if (!token) {
        throw new Error("Token not received from server");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("userName", res.data.name);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: res.data.userId,
          name: res.data.name,
          email: res.data.email,
        })
      );

      setIsAuthenticated(true);
      navigate("/");
    } catch (err) {
      console.error("Login Error:", err);

      let errorMessage = "Login failed. Please try again.";

      if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        errorMessage =
          "Cannot connect to server. Please ensure the backend server is running on port 5000.";
        console.error("Network error - server might not be running");
      } else if (err.code === "ECONNREFUSED") {
        errorMessage = "Connection refused. Please start the backend server.";
      } else if (err.response) {
        errorMessage =
          err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage =
          "No response from server. Please check if the backend is running.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  // Particle Background Settings
  const particlesInit = useCallback(async (engine) => {
    try {
      console.log("Initializing tsparticles engine..."); // Corrected syntax
      if (engine && typeof engine.addShape === "function") {
        await loadSlim(engine); // Use loadSlim instead of loadFull
      }
    } catch (error) {
      console.error("Error initializing tsparticles engine:", error);
    }
  }, []);
  const particlesLoaded = useCallback((container) => {
    console.log("Particles loaded:", container);
  }, []);

  const particleOptions = {
    fullScreen: { enable: true, zIndex: -1 },
    particles: {
      number: { value: 80, density: { enable: true, area: 800 } },
      color: { value: ["#00fffc", "#ff00ff", "#ffcc00"] },
      shape: { type: "circle" },
      opacity: { value: 0.7, random: true },
      size: { value: { min: 1, max: 4 }, random: true },
      move: {
        enable: true,
        speed: { min: 0.5, max: 2.5 },
        direction: "none",
        random: true,
        straight: false,
        outModes: { default: "out" },
      },
      links: {
        enable: true,
        distance: 130,
        color: "#00fffc",
        opacity: 0.6,
        width: 1,
      },
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: "grab" },
        onClick: { enable: true, mode: "push" },
      },
      modes: {
        grab: { distance: 180, line_linked: { opacity: 0.8 } },
        push: { quantity: 4 },
      },
    },
    detectRetina: true,
  };

  return (
    <div className="relative w-full h-screen flex justify-center items-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1d] via-[#141e30] to-[#0a0f1d] animate-gradient"></div>

      {/* Fullscreen Particles */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={particleOptions}
        className="absolute inset-0 w-full h-full"
      />

      {/* Glowing Animated Rings */}
      <div className="absolute w-[500px] h-[500px] bg-[#00fffc]/20 blur-3xl rounded-full top-1/4 left-1/3 animate-pulse"></div>
      <div className="absolute w-[400px] h-[400px] bg-[#ff00ff]/20 blur-3xl rounded-full bottom-1/4 right-1/3 animate-pulse"></div>

      {/* Login Form Container */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative bg-[#131a2b]/80 p-8 rounded-xl shadow-2xl w-96 border border-[#00fffc] backdrop-blur-xl"
      >
        <h2 className="text-3xl font-bold mb-4 text-center text-[#00fffc]">
          Login
        </h2>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.input
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-[#00fffc] bg-transparent text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#00fffc]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            whileFocus={{ scale: 1.05 }}
          />
          <motion.input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-[#00fffc] bg-transparent text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#00fffc]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            whileFocus={{ scale: 1.05 }}
          />
          <motion.button
            type="submit"
            className="w-full bg-[#00fffc] text-[#0a0f1d] font-semibold p-3 rounded-md hover:bg-[#00e6e6] transition shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>
        </form>
        <p className="text-gray-400 text-sm text-center mt-4">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-[#00fffc] hover:underline">
            Register
          </a>
        </p>
      </motion.div>
    </div>
  );
};

Login.propTypes = {
  setIsAuthenticated: PropTypes.func.isRequired,
};

export default Login;
