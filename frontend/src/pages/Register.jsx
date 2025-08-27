import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  
  {/* Animated background orbs */}
  <div className="absolute w-[500px] h-[500px] bg-[#00fffc]/20 blur-3xl rounded-full top-1/4 left-1/3 animate-pulse"></div>
  <div className="absolute w-[400px] h-[400px] bg-[#ff00ff]/20 blur-3xl rounded-full bottom-1/4 right-1/3 animate-pulse"></div>

  {/* Registration Card */}
  <motion.div
    initial={{ opacity: 0, y: -40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="relative bg-[#131a2b]/80 p-8 rounded-xl shadow-2xl w-96 border border-[#00fffc] backdrop-blur-xl"
  >
    <motion.h2
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="text-3xl font-bold mb-4 text-center text-[#00fffc]"
    >
      Register
    </motion.h2>

    {/* Error/Success Messages */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      {error && (
        <motion.p 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-red-400 text-sm text-center mb-2 bg-red-500/10 p-2 rounded border-l-2 border-red-400"
        >
          {error}
        </motion.p>
      )}
      {success && (
        <motion.p 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-green-400 text-sm text-center mb-2 bg-green-500/10 p-2 rounded border-l-2 border-green-400"
        >
          {success}
        </motion.p>
      )}
    </motion.div>

    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      {[
        { type: "text", placeholder: "Full Name", value: name, setter: setName },
        { type: "email", placeholder: "Email", value: email, setter: setEmail },
        { type: "password", placeholder: "Password", value: password, setter: setPassword },
        { type: "password", placeholder: "Confirm Password", value: confirmPassword, setter: setConfirmPassword }
      ].map((field, index) => (
        <motion.input
          key={field.placeholder}
          type={field.type}
          placeholder={field.placeholder}
          className="w-full p-3 border border-[#00fffc]/50 bg-[#0a0f1d]/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#00fffc] focus:border-[#00fffc] transition-all duration-300 placeholder-gray-400"
          value={field.value}
          onChange={(e) => field.setter(e.target.value)}
          required
          whileFocus={{ 
            scale: 1.02,
            borderColor: "#00fffc"
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
        />
      ))}
      
      <motion.button
        type="submit"
        className="w-full bg-gradient-to-r from-[#00fffc] to-[#00e6e6] text-[#0a0f1d] font-semibold p-3 rounded-md hover:from-[#00e6e6] hover:to-[#00cccc] transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        disabled={loading}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.4 }}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Registering...
          </span>
        ) : "Register"}
      </motion.button>
    </motion.form>

    <motion.p 
      className="text-gray-400 text-sm text-center mt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.4 }}
    >
      Already have an account?{" "}
      <Link
                        to="/login"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Login
                      </Link>
    </motion.p>
  </motion.div>
</div>

  );
};

export default Register;
