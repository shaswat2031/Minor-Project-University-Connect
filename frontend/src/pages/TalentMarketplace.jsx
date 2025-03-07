import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaWhatsapp, FaInstagram, FaEdit, FaTrash, FaPlus, FaMinus } from "react-icons/fa"; // Icons

const TalentMarketplace = () => {
  const [services, setServices] = useState([]);
  // Update the initial form state (remove instagram)
  const [form, setForm] = useState({ 
    title: "", 
    description: "", 
    skills: "", 
    price: "", 
    whatsapp: "" 
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
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(payload.id);
    }
  }, []);
  // Update the fetchServices function to properly populate user data
  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/talent-marketplace`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Services:", res.data); // For debugging
      setServices(res.data);
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
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
  if (isEditing) {
    await axios.put(
      `${import.meta.env.VITE_API_URL}/api/talent-marketplace/update/${editId}`, 
      form,
      config
    );
  } else {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/talent-marketplace/create`,
      form,
      config
    );
  }
  fetchServices();
  setForm({ title: "", description: "", skills: "", price: "", whatsapp: "" });
  setIsEditing(false);
  setShowForm(false);
  setError("");
  } catch (error) {
    console.error("Error saving service:", error.response?.data || error);
    setError(error.response?.data?.message || "Failed to save service. Please try again.");
  }
  };
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please log in.");
        return;
      }
  const response = await axios.delete(
    `${import.meta.env.VITE_API_URL}/api/talent-marketplace/delete/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  
  if (response.status === 200) {
    setServices(services.filter(service => service._id !== id));
    setError("");
  }
  } catch (error) {
    console.error("Error deleting service:", error);
    setError(error.response?.data?.message || "Failed to delete service. Please try again.");
  }
  };
  return (
    <div className="min-h-screen bg-[#111827] text-white p-8">
      <h1 className="text-5xl font-extrabold text-center mb-8 text-blue-400 tracking-wide">🎭 Talent Marketplace</h1>
  {/* Toggle Button for Form */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? <FaMinus /> : <FaPlus />}
          {showForm ? "Hide Form" : "Add Your Talent"}
        </button>
      </div>
  {/* Service Form */}
      {showForm && (
        <div className="max-w-2xl mx-auto bg-[#1F2937] shadow-xl rounded-xl p-8 mb-12 animate-fade-in">
          <h2 className="text-3xl font-semibold text-white text-center mb-6">
            {isEditing ? "Edit Service ✍️" : "Add Your Talent 🚀"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-4 bg-[#374151] rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500"
              required
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-4 bg-[#374151] rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Skills (comma separated)"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              className="w-full p-4 bg-[#374151] rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="number"
              placeholder="Price ($)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full p-4 bg-[#374151] rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="WhatsApp Number"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className="w-full p-4 bg-[#374151] rounded-lg border border-gray-600 text-white"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold text-lg rounded-lg hover:opacity-90 transition"
            >
              {isEditing ? "Update Service" : "Add Service"}
            </button>
          </form>
        </div>
      )}
  {/* Display Services */}
      <h2 className="text-4xl font-bold text-center text-blue-400 mt-12">📌 Available Talents</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {services.map((service) => (
          <div
            key={service._id}
            className="bg-[#1F2937] p-6 rounded-xl shadow-lg border border-gray-700 hover:shadow-2xl transition transform hover:-translate-y-2"
          >
            <h3 className="text-2xl font-bold text-blue-400">{service.title}</h3>
            <p className="text-gray-300 mt-2">{service.description}</p>
            <div className="mt-4 space-y-3">
              <p className="flex items-center gap-2">
                <span className="text-yellow-400">💡</span>
                <strong>Skills:</strong> {service.skills}
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-400">💰</span>
                <strong>Price:</strong> ${service.price}
              </p>
            </div>
            {/* In the services display section, conditionally render Instagram button */}
            <div className="mt-6 space-y-3">
              {/* WhatsApp Button */}
              <a
                href={`https://wa.me/${service.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500 text-white px-5 py-3 rounded-full hover:bg-green-600 transition"
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
                  className="flex items-center justify-center gap-2 bg-[#E1306C] text-white px-5 py-3 rounded-full hover:bg-[#C13584] transition"
                >
                  <FaInstagram className="text-xl" />
                  View on Instagram
                </a>
              )}
            </div>
            {/* In the service card, update the buttons section */}
            <div className="mt-6 space-y-3">
              {/* ... WhatsApp and Instagram buttons ... */}
            </div>
            {service.user && currentUserId && service.user._id === currentUserId && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setIsEditing(true) & setEditId(service._id) & setForm(service) & setShowForm(true)}
                  className="w-full flex items-center justify-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => handleDelete(service._id)}
                  className="w-full flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TalentMarketplace;