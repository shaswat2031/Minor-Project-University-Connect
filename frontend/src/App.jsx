import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import React from 'react';
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentConnect from "./pages/StudentConnect";
import Certifications from "./pages/Certifications";
import TalentMarketplace from "./pages/TalentMarketplace";
import ProfileSetup from "./pages/ProfileSetup";
import Footer from "./components/Footer";
import UserProfile from "./pages/UserProfile";
import ProfilePage from "./pages/ProfilePage";
import MyProfile from "./pages/MyProfile";
import Privacy from "./pages/Privacy";
import Messages from "./pages/Messages"; // Import Messages component
import CodeRunner from "./pages/CodeRunner"; // Import CodeRunner component
import ResumeBuilder from "./pages/ResumeBuilder"; // Import ResumeBuilder component
import ChatButton from "./components/Chat/ChatButton";
import AdminPanel from "./pages/AdminPanel";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AIRoadmap from "./pages/AIRoadmap";
import NotFound from "./pages/NotFound";
import { ToastProvider } from "./components/Toast";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <ToastProvider>
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
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/code-runner"
              element={
                <ProtectedRoute>
                  <CodeRunner />
                </ProtectedRoute>
              }
            />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route
              path="/ai-roadmap"
              element={
                <ProtectedRoute>
                  <AIRoadmap />
                </ProtectedRoute>
              }
            />
            <Route
              path="/certifications"
              element={
                <ProtectedRoute>
                  <Certifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resume-builder"
              element={
                <ProtectedRoute>
                  <ResumeBuilder />
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
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/privacy" element={<Privacy />} />
            {/* Admin protected route */}
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminPanel />
                </AdminProtectedRoute>
              }
            />
            {/* Catch-all route for 404 - Must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />

          {/* Chat Button - only show when authenticated */}
          {isAuthenticated && <ChatButton />}
        </div>
      </Router>
    </ToastProvider>
  );
};

export default App;
