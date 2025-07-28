import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { gsap } from "gsap";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { motion } from "framer-motion";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const headingRef = useRef(null);
  const messageRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    // Ensure all elements are visible first (fallback)
    const elements = [headingRef.current, messageRef.current, formRef.current];
    elements.forEach((el) => {
      if (el) {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }
    });

    // Check if elements exist before animating
    const elementsToAnimate = elements.filter(Boolean);
    if (elementsToAnimate.length === 0) {
      // If elements aren't ready, try again after a short delay
      setTimeout(() => {
        // Retry animation setup
        const retryElements = [
          headingRef.current,
          messageRef.current,
          formRef.current,
        ];
        retryElements.forEach((el) => {
          if (el) {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          }
        });
      }, 100);
      return;
    }

    try {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Heading - only animate if element exists
      if (headingRef.current) {
        tl.from(headingRef.current, {
          y: -50,
          opacity: 0,
          duration: 0.8,
          delay: 0.3,
        });
      }

      // Message (error/success) - only animate if element exists
      if (messageRef.current) {
        tl.from(messageRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.5,
        });
      }

      // Inputs - only animate if form exists
      if (formRef.current) {
        const inputs = Array.from(
          formRef.current.querySelectorAll("input") || []
        );
        if (inputs.length > 0) {
          tl.from(
            inputs,
            {
              y: 40,
              opacity: 0,
              duration: 0.6,
              stagger: 0.2,
              ease: "back.out(1.7)",
            },
            "-=0.3"
          );
        }

        // Submit button - only animate if button exists
        const button = formRef.current.querySelector("button");
        if (button) {
          tl.from(
            button,
            {
              y: 50,
              opacity: 0,
              duration: 0.7,
              ease: "elastic.out(1, 0.4)",
            },
            "-=0.4"
          );
        }
      }
    } catch (error) {
      console.warn("GSAP animation error:", error);
      // Ensure elements are visible even if animation fails
      elements.forEach((el) => {
        if (el) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        }
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        { name, email, password },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        }
      );

      setSuccess(
        "Registration successful! Please login with your credentials."
      );
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      let errorMessage = "Registration failed. Please try again.";
      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "Network error: Unable to connect to server.";
      } else {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
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
      {/* Background Gradient and Particles */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1d] via-[#141e30] to-[#0a0f1d] animate-gradient"></div>
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={particleOptions}
        className="absolute inset-0 w-full h-full"
      />
      <div className="absolute w-[500px] h-[500px] bg-[#00fffc]/20 blur-3xl rounded-full top-1/4 left-1/3 animate-pulse"></div>
      <div className="absolute w-[400px] h-[400px] bg-[#ff00ff]/20 blur-3xl rounded-full bottom-1/4 right-1/3 animate-pulse"></div>

      {/* Registration Card */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative bg-[#131a2b]/80 p-8 rounded-xl shadow-2xl w-96 border border-[#00fffc] backdrop-blur-xl"
      >
        <h2
          ref={headingRef}
          className="text-3xl font-bold mb-4 text-center text-[#00fffc] opacity-100"
          style={{ opacity: 1, transform: "translateY(0)" }}
        >
          Register
        </h2>

        <div
          ref={messageRef}
          style={{ opacity: 1, transform: "translateY(0)" }}
        >
          {error && (
            <p className="text-red-500 text-sm text-center mb-2">{error}</p>
          )}
          {success && (
            <p className="text-green-500 text-sm text-center mb-2">{success}</p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          ref={formRef}
          style={{ opacity: 1, transform: "translateY(0)" }}
        >
          <motion.input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 border border-[#00fffc] bg-transparent text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#00fffc] opacity-100"
            style={{ opacity: 1, transform: "translateY(0)" }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            whileFocus={{ scale: 1.05 }}
          />
          <motion.input
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-[#00fffc] bg-transparent text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#00fffc] opacity-100"
            style={{ opacity: 1, transform: "translateY(0)" }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            whileFocus={{ scale: 1.05 }}
          />
          <motion.input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-[#00fffc] bg-transparent text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#00fffc] opacity-100"
            style={{ opacity: 1, transform: "translateY(0)" }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            whileFocus={{ scale: 1.05 }}
          />
          <motion.input
            type="password"
            placeholder="Confirm Password"
            className="w-full p-3 border border-[#00fffc] bg-transparent text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#00fffc] opacity-100"
            style={{ opacity: 1, transform: "translateY(0)" }}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            whileFocus={{ scale: 1.05 }}
          />
          <motion.button
            type="submit"
            className="w-full bg-[#00fffc] text-[#0a0f1d] font-semibold p-3 rounded-md hover:bg-[#00e6e6] transition shadow-lg opacity-100"
            style={{ opacity: 1, transform: "translateY(0)" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </motion.button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-[#00fffc] hover:underline">
            Login
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
