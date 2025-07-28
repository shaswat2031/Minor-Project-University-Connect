import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaWhatsapp,
  FaInstagram,
  FaEdit,
  FaTrash,
  FaPlus,
  FaMinus,
} from "react-icons/fa"; // Icons

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const TalentMarketplace = () => {
  const [services, setServices] = useState([]);
  // Update the initial form state (remove instagram)
  const [form, setForm] = useState({
    title: "",
    description: "",
    skills: "",
    price: "",
    whatsapp: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false); // Toggle form visibility
  const [error, setError] = useState(""); // Error handling
  // Add state for logged-in user ID
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    fetchServices();
    // Get current user ID from token
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserId(payload.id);
    }
  }, []);
  // Update the fetchServices function to properly populate user data
  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const res = await axios.get(
        `${API_BASE_URL}/api/talent-marketplace`,
        config
      );
      console.log("Services fetched:", res.data); // For debugging
      setServices(res.data);
      setError(""); // Clear any previous errors
    } catch (error) {
      console.error("Error fetching services:", error);
      setError("Failed to fetch services. Please try again.");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Authentication required. Please log in.");
      return;
    }

    // Validate form fields
    if (!form.title || !form.description || !form.skills || !form.price) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      if (isEditing) {
        await axios.put(
          `${API_BASE_URL}/api/talent-marketplace/update/${editId}`,
          form,
          config
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/api/talent-marketplace/create`,
          form,
          config
        );
      }

      // Reset form and refresh data
      fetchServices();
      setForm({
        title: "",
        description: "",
        skills: "",
        price: "",
        whatsapp: "",
      });
      setIsEditing(false);
      setEditId(null);
      setShowForm(false);
      setError("");
    } catch (error) {
      console.error("Error saving service:", error.response?.data || error);
      setError(
        error.response?.data?.message ||
          "Failed to save service. Please try again."
      );
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please log in.");
        return;
      }

      const response = await axios.delete(
        `${API_BASE_URL}/api/talent-marketplace/delete/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        setServices(services.filter((service) => service._id !== id));
        setError("");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      setError(
        error.response?.data?.message ||
          "Failed to delete service. Please try again."
      );
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setForm({
      title: "",
      description: "",
      skills: "",
      price: "",
      whatsapp: "",
    });
    setShowForm(false);
    setError("");
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#111827] text-white p-4 md:p-8">
      <h1 className="text-5xl font-extrabold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 tracking-wide">
        🎭 Talent Marketplace
      </h1>

      {/* Toggle Button for Form */}
      <div className="flex justify-center mb-10">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition duration-300 shadow-lg"
        >
          {showForm ? (
            <FaMinus className="animate-pulse" />
          ) : (
            <FaPlus className="animate-pulse" />
          )}
          {showForm ? "Hide Form" : "Add Your Talent"}
        </button>
      </div>

      {/* Service Form */}
      {showForm && (
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-[#1F2937] to-[#2D3748] shadow-2xl rounded-xl p-8 mb-12 border border-gray-700 animate-fadeIn">
          <h2 className="text-3xl font-semibold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-indigo-400">
            {isEditing ? "✨ Edit Service ✍️" : "✨ Add Your Talent 🚀"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-4 bg-[#374151] rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
              required
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full p-4 bg-[#374151] rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 min-h-[120px]"
              required
            />
            <input
              type="text"
              placeholder="Skills (comma separated)"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              className="w-full p-4 bg-[#374151] rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
              required
            />
            <input
              type="number"
              placeholder="Price ($)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full p-4 bg-[#374151] rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
              required
            />
            <input
              type="text"
              placeholder="WhatsApp Number"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className="w-full p-4 bg-[#374151] rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
            />
            {error && (
              <p className="text-red-400 text-sm bg-red-900/30 p-3 rounded-lg border border-red-800">
                {error}
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg rounded-lg hover:from-blue-600 hover:to-indigo-700 transform hover:scale-[1.02] transition duration-300 shadow-lg"
              >
                {isEditing ? "✅ Update Service" : "✅ Add Service"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold text-lg rounded-lg hover:from-gray-600 hover:to-gray-700 transform hover:scale-[1.02] transition duration-300 shadow-lg"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Display Services */}
      <h2 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 mt-12 mb-8">
        📌 Available Talents
      </h2>

      {services.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p className="text-2xl mb-4">No talents available yet</p>
          <p>Be the first to showcase your talent!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {services.map((service) => (
            <div
              key={service._id}
              className="bg-gradient-to-br from-[#1F2937] to-[#2D3748] p-6 rounded-xl shadow-lg border border-gray-700 hover:shadow-2xl transition transform hover:-translate-y-2 duration-300 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <h3 className="text-2xl font-bold text-blue-400 mb-3">
                {service.title}
              </h3>
              <p className="text-gray-300 mt-2 leading-relaxed">
                {service.description}
              </p>

              <div className="mt-5 space-y-3">
                <p className="flex items-center gap-2 bg-[#374151]/50 p-2 rounded-lg">
                  <span className="text-yellow-400 text-xl">💡</span>
                  <span className="font-semibold text-gray-200">Skills:</span>
                  <span className="text-gray-300">{service.skills}</span>
                </p>
                <p className="flex items-center gap-2 bg-[#374151]/50 p-2 rounded-lg">
                  <span className="text-green-400 text-xl">💰</span>
                  <span className="font-semibold text-gray-200">Price:</span>
                  <span className="text-gray-300">${service.price}</span>
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {/* WhatsApp Button */}
                <a
                  href={`https://wa.me/${service.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition duration-300 transform hover:scale-[1.02] shadow-md"
                >
                  <FaWhatsapp className="text-xl" />
                  Chat on WhatsApp
                </a>

                {/* Only show Instagram button if instagram exists */}
                {service.instagram && (
                  <a
                    href={`https://instagram.com/${service.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#E1306C] to-[#C13584] text-white px-5 py-3 rounded-lg hover:from-[#C13584] hover:to-[#8A3AB9] transition duration-300 transform hover:scale-[1.02] shadow-md"
                  >
                    <FaInstagram className="text-xl" />
                    View on Instagram
                  </a>
                )}
              </div>

              {service.user &&
                currentUserId &&
                (service.user._id === currentUserId ||
                  service.user === currentUserId) && (
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setEditId(service._id);
                        setForm({
                          title: service.title,
                          description: service.description,
                          skills: service.skills,
                          price: service.price,
                          whatsapp: service.whatsapp || "",
                        });
                        setShowForm(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-4 py-2 rounded-lg hover:from-yellow-600 hover:to-amber-700 transition duration-300 transform hover:scale-[1.02] shadow-md"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(service._id)}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition duration-300 transform hover:scale-[1.02] shadow-md"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                )}

              <div className="mt-4 text-xs text-gray-500 text-right">
                {service.user &&
                  service.user.name &&
                  `Posted by: ${service.user.name}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TalentMarketplace;
