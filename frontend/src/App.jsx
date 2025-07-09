import React from "react";
import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentConnect from "./pages/StudentConnect";
import Certifications from "./pages/Certifications";
import TalentMarketplace from "./pages/TalentMarketplace";
import ProfileSetup from "./pages/ProfileSetup";
import Footer from "./components/Footer"; // Removed unused import
import UserProfile from "./pages/UserProfile"; // Import the UserProfile component
import ProfilePage from "./pages/ProfilePage"; // Import the ProfilePage component
import MyProfile from "./pages/MyProfile"; // Import the MyProfile component
import Privacy from "./pages/Privacy"; // Import the Privacy component
import ChatButton from "./components/Chat/ChatButton";
import AdminPanel from "./pages/AdminPanel";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Router>
      <div>
        <Navbar
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/" />
              ) : (
                <Login setIsAuthenticated={setIsAuthenticated} />
              )
            }
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/" /> : <Register />}
          />
          {/* Protected user routes */}
          <Route
            path="/my-profile"
            element={
              <ProtectedRoute>
                <MyProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-connect"
            element={
              <ProtectedRoute>
                <StudentConnect />
              </ProtectedRoute>
            }
          />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/profile/:id" element={<ProfilePage />} />{" "}
          {/* Add this route */}
          <Route
            path="/certifications"
            element={
              <ProtectedRoute>
                <Certifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/talent-marketplace"
            element={
              <ProtectedRoute>
                <TalentMarketplace />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={<UserProfile />} />{" "}
          {/* Add this route */}
          <Route path="/privacy" element={<Privacy />} /> {/* Add this route */}
          {/* Admin protected route */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminPanel />
              </AdminProtectedRoute>
            }
          />
        </Routes>
        <Footer />

        {/* Chat Button - only show when authenticated */}
        {isAuthenticated && <ChatButton />}
      </div>
    </Router>
  );
};

export default App;
