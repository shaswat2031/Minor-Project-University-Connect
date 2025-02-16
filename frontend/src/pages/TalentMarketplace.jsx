import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaWhatsapp, FaInstagram } from "react-icons/fa"; // Icons

const TalentMarketplace = () => {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", skills: "", price: "", instagram: "", whatsapp: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/services");
      setServices(res.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");

    if (!userId) {
      console.error("User ID not found. Please log in.");
      return;
    }

    try {
      const requestData = { ...form, userId };

      if (isEditing) {
        await axios.put(`http://localhost:5000/api/services/update/${editId}`, requestData);
      } else {
        await axios.post("http://localhost:5000/api/services/create", requestData);
      }

      fetchServices();
      setForm({ title: "", description: "", skills: "", price: "", instagram: "", whatsapp: "" });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving service:", error.response?.data || error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        console.error("User ID not found. Please log in.");
        return;
      }

      await axios.delete(`http://localhost:5000/api/services/delete/${id}?userId=${userId}`);
      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error.response?.data || error);
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] text-white p-8">
      <h1 className="text-5xl font-extrabold text-center mb-8 text-blue-400 tracking-wide">🎭 Talent Marketplace</h1>

      {/* Service Form */}
      <div className="max-w-2xl mx-auto bg-[#1F2937] shadow-xl rounded-xl p-8">
        <h2 className="text-3xl font-semibold text-white text-center mb-6">
          {isEditing ? "Edit Service ✍️" : "Add Your Talent 🚀"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full p-4 bg-[#374151] rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500" required />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full p-4 bg-[#374151] rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500" required />
          <input type="text" placeholder="Skills (comma separated)" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })}
            className="w-full p-4 bg-[#374151] rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500" required />
          <input type="number" placeholder="Price ($)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full p-4 bg-[#374151] rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500" required />
          <input type="text" placeholder="Instagram ID" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })}
            className="w-full p-4 bg-[#374151] rounded-lg border border-gray-600 text-white" />
          <input type="text" placeholder="WhatsApp Number" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            className="w-full p-4 bg-[#374151] rounded-lg border border-gray-600 text-white" />
          <button type="submit" className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold text-lg rounded-lg hover:opacity-90 transition">
            {isEditing ? "Update Service" : "Add Service"}
          </button>
        </form>
      </div>

      {/* Display Services */}
      <h2 className="text-4xl font-bold text-center text-blue-400 mt-12">📌 Available Talents</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {services.map((service) => (
          <div key={service._id} className="bg-[#1F2937] p-6 rounded-xl shadow-lg border border-gray-700 hover:shadow-2xl transition">
            <h3 className="text-2xl font-bold text-blue-400">{service.title}</h3>
            <p className="text-gray-300 mt-2">{service.description}</p>
            <div className="mt-4">
              <p><strong>💡 Skills:</strong> {service.skills}</p>
              <p><strong>💰 Price:</strong> ${service.price}</p>
              
              {/* WhatsApp Button */}
              <a href={`https://wa.me/${service.whatsapp}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500 text-white px-5 py-3 rounded-full mt-3 hover:bg-green-600 transition">
                <FaWhatsapp className="text-xl" />
                Chat on WhatsApp
              </a>

              {/* Instagram Button */}
              <a href={`https://instagram.com/${service.instagram}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#E1306C] text-white px-5 py-3 rounded-full mt-3 hover:bg-[#C13584] transition">
                <FaInstagram className="text-xl" />
                View on Instagram
              </a>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setIsEditing(true) & setEditId(service._id) & setForm(service)}
                className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition">Edit</button>
              <button onClick={() => handleDelete(service._id)}
                className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TalentMarketplace;
