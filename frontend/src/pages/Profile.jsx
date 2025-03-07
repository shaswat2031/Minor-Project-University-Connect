import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch profile data
    axios
      .get("http://localhost:5000/api/profile", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
        setLoading(false);
      });
  }, [token, navigate]);

  // Handle form submission (update profile)
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        "http://localhost:5000/api/profile",
        profile,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!profile) return <p>No profile found.</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">{editing ? "Edit Profile" : "My Profile"}</h2>
      {!editing ? (
        <>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Skills:</strong> {profile.skills.join(", ")}</p>
          <p><strong>Bio:</strong> {profile.bio}</p>
          <p><strong>Education:</strong> {profile.education}</p>
          <p><strong>LinkedIn:</strong> <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">{profile.linkedin}</a></p>
          <p><strong>Instagram:</strong> <a href={profile.instagram} target="_blank" rel="noopener noreferrer">{profile.instagram}</a></p>
          <button onClick={() => setEditing(true)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
            Edit Profile
          </button>
        </>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            value={profile.skills.join(", ")}
            onChange={(e) => setProfile({ ...profile, skills: e.target.value.split(",") })}
            className="w-full p-2 border rounded"
          />
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            value={profile.education}
            onChange={(e) => setProfile({ ...profile, education: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            value={profile.linkedin}
            onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            value={profile.instagram}
            onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">
            Save Profile
          </button>
        </form>
      )}
    </div>
  );
}; 

export default Profile;
