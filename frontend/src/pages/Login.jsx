import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import React from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import PropTypes from "prop-types";
import { gsap } from "gsap";
import ProfileReminderPopup from "../components/common/ProfileReminderPopup";
import useProfileCompletion from "../hooks/useProfileCompletion";

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showProfileReminder, setShowProfileReminder] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  const navigate = useNavigate();
  const isProfileIncomplete = useProfileCompletion(loggedInUser);

  // GSAP refs
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const titleRef = useRef(null);
  const inputRefs = useRef([]);
  const buttonRef = useRef(null);
  const backgroundRef = useRef(null);
  const glowRef1 = useRef(null);
  const glowRef2 = useRef(null);

  useEffect(() => {
    // GSAP Timeline for entrance animations
    const tl = gsap.timeline();

    // Set initial states
    gsap.set(
      [
        formRef.current,
        titleRef.current,
        ...inputRefs.current,
        buttonRef.current,
      ],
      {
        opacity: 0,
        y: 50,
      }
    );

    gsap.set([glowRef1.current, glowRef2.current], {
      scale: 0,
      opacity: 0,
    });

    // Background fade in
    tl.from(backgroundRef.current, {
      opacity: 0,
      duration: 1,
      ease: "power2.out",
    })
      // Glow elements
      .to(
        [glowRef1.current, glowRef2.current],
        {
          scale: 1,
          opacity: 0.3,
          duration: 1.5,
          ease: "back.out(1.7)",
          stagger: 0.2,
        },
        "-=0.5"
      )
      // Form container
      .to(
        formRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "back.out(1.7)",
        },
        "-=1"
      )
      // Title
      .to(
        titleRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
        },
        "-=0.4"
      )
      // Inputs
      .to(
        inputRefs.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.1,
        },
        "-=0.3"
      )
      // Button
      .to(
        buttonRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.2"
      );

    // Continuous animations
    // gsap.to(glowRef1.current, {
    //   rotation: 360,
    //   duration: 20,
    //   ease: "none",
    //   repeat: -1,
    // });

    // gsap.to(glowRef2.current, {
    //   rotation: -360,
    //   duration: 25,
    //   ease: "none",
    //   repeat: -1,
    // });

    // // Floating animation for form
    // gsap.to(formRef.current, {
    //   y: -10,
    //   duration: 3,
    //   ease: "power1.inOut",
    //   yoyo: true,
    //   repeat: -1,
    // });
  }, []);

  const handleInputFocus = (index) => {
    gsap.to(inputRefs.current[index], {
      scale: 1.02,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleInputBlur = (index) => {
    gsap.to(inputRefs.current[index], {
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleButtonHover = () => {
    gsap.to(buttonRef.current, {
      scale: 1.05,
      boxShadow: "0 10px 25px rgba(0, 255, 252, 0.4)",
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleButtonLeave = () => {
    gsap.to(buttonRef.current, {
      scale: 1,
      boxShadow: "0 4px 15px rgba(0, 255, 252, 0.2)",
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Button loading animation
    gsap.to(buttonRef.current, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
    });

    try {
      console.log(
        "Attempting login to:",
        `${import.meta.env.VITE_API_URL}/api/auth/login`
      );

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          email,
          password,
        },
        {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

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

      const userData = {
        id: res.data.userId,
        name: res.data.name,
        email: res.data.email,
        education: res.data.education,
        skills: res.data.skills,
        careerGoals: res.data.careerGoals,
        profilePicture: res.data.profilePicture,
      };

      setLoggedInUser(userData);
      setIsAuthenticated(true);

      // Set flag for home page to show profile reminder
      sessionStorage.setItem('justLoggedIn', 'true');

      // Check profile completion
      const hasEducation = userData.education && userData.education.length > 0;
      const hasSkills = userData.skills && userData.skills.length > 0;
      const hasCareerGoals = userData.careerGoals && userData.careerGoals.trim() !== '';
      const hasProfilePicture = userData.profilePicture && userData.profilePicture.trim() !== '';
      
      const completedFields = [hasEducation, hasSkills, hasCareerGoals, hasProfilePicture].filter(Boolean).length;
      const isProfileIncomplete = completedFields < 2;

      // Success animation and navigation
      gsap.to(formRef.current, {
        scale: 1.05,
        duration: 0.3,
        ease: "back.out(1.7)",
        onComplete: () => {
          gsap.to(formRef.current, {
            opacity: 0,
            y: -50,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => {
              // Always go to home first, home will handle profile reminder
              navigate("/");
            },
          });
        },
      });

    } catch (err) {
      console.error("Login Error:", err);

      // Error animation
      gsap.to(formRef.current, {
        x: [-10, 10, -10, 10, 0],
        duration: 0.4,
        ease: "power2.out",
      });

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

  // Remove the profile reminder logic from login since it's now handled on home page
  const handleCloseProfileReminder = () => {
    setShowProfileReminder(false);
  };

  const handleGoToProfile = () => {
    setShowProfileReminder(false);
    navigate("/my-profile");
  };

  // Particle Background Settings
  const particlesInit = useCallback(async (engine) => {
    try {
      console.log("Initializing tsparticles engine...");
      if (engine && typeof engine.addShape === "function") {
        await loadSlim(engine);
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
    <div
      ref={containerRef}
      className="relative w-full h-screen flex justify-center items-center overflow-hidden"
    >
      {/* Animated Background */}
      <div
        ref={backgroundRef}
        className="absolute inset-0 bg-gradient-to-br from-[#0a0f1d] via-[#141e30] to-[#0a0f1d]"
      ></div>

      {/* Fullscreen Particles */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={particleOptions}
        className="absolute inset-0 w-full h-full"
      />

      {/* Glowing Animated Rings */}
      <div
        ref={glowRef1}
        className="absolute w-[500px] h-[500px] bg-[#00fffc]/20 blur-3xl rounded-full top-1/4 left-1/3"
      ></div>
      <div
        ref={glowRef2}
        className="absolute w-[400px] h-[400px] bg-[#ff00ff]/20 blur-3xl rounded-full bottom-1/4 right-1/3"
      ></div>

      {/* Login Form Container */}
      <div
        ref={formRef}
        className="relative bg-[#131a2b]/80 p-8 rounded-xl shadow-2xl w-96 border border-[#00fffc] backdrop-blur-xl"
      >
        <h2
          ref={titleRef}
          className="text-3xl font-bold mb-4 text-center text-[#00fffc]"
        >
          Login
        </h2>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={(el) => (inputRefs.current[0] = el)}
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-[#00fffc] bg-transparent text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#00fffc] transition-all duration-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => handleInputFocus(0)}
            onBlur={() => handleInputBlur(0)}
            required
          />
          <input
            ref={(el) => (inputRefs.current[1] = el)}
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-[#00fffc] bg-transparent text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#00fffc] transition-all duration-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => handleInputFocus(1)}
            onBlur={() => handleInputBlur(1)}
            required
          />
          <button
            ref={buttonRef}
            type="submit"
            className="w-full bg-[#00fffc] text-[#0a0f1d] font-semibold p-3 rounded-md transition shadow-lg"
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-gray-400 text-sm text-center mt-4">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Register
          </Link>
        </p>
      </div>

      {/* Profile Reminder Popup */}
      <ProfileReminderPopup
        isOpen={showProfileReminder}
        onClose={handleCloseProfileReminder}
        user={loggedInUser}
        onGoToProfile={handleGoToProfile}
      />
    </div>
  );
};

Login.propTypes = {
  setIsAuthenticated: PropTypes.func.isRequired,
};

export default Login;
