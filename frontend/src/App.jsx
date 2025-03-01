import { useEffect, useState } from "react";
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentConnect from "./pages/StudentConnect";
import Certifications from "./pages/Certifications";
import TalentMarketplace from "./pages/TalentMarketplace";
// import ProfileSetup from "./pages/ProfileSetup";
import Footer from "./components/Footer";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", checkAuth); // Detect token changes in localStorage
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
        <Route path="/students" element={isAuthenticated ? <StudentConnect /> : <Navigate to="/login" />} />
        {/* <Route path="/profile-setup" element={<ProfileSetup />} /> */}
        <Route path="/studentconnect" element={<StudentConnect />} />
        <Route path="/certifications" element={isAuthenticated ? <Certifications /> : <Navigate to="/login" />} />
        <Route path="/talent-marketplace" element={isAuthenticated ? <TalentMarketplace /> : <Navigate to="/login" />} />
      </Routes>
      <Footer/>
    </Router>
  );
};

export default App;
