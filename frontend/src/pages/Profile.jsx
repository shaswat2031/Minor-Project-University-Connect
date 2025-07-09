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
      .get(`${import.meta.env.VITE_API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
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
      await axios.put(`${import.meta.env.VITE_API_URL}/api/profile`, profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      <h2 className="text-2xl font-bold">
        {editing ? "Edit Profile" : "My Profile"}
      </h2>
      {!editing ? (
        <>
          <p>
            <strong>Name:</strong> {profile.name}
          </p>
          <p>
            <strong>Skills:</strong> {profile.skills.join(", ")}
          </p>
          <p>
            <strong>Bio:</strong> {profile.bio}
          </p>
          <p>
            <strong>Education:</strong>{" "}
            {profile.education && Array.isArray(profile.education)
              ? profile.education.map((edu, index) => (
                  <span key={edu._id || index}>
                    {edu.degree && edu.institution
                      ? `${edu.degree} at ${edu.institution} (${
                          edu.year || "Year not specified"
                        })`
                      : "Education details incomplete"}
                    {index < profile.education.length - 1 ? ", " : ""}
                  </span>
                ))
              : "No education information provided"}
          </p>
          <p>
            <strong>LinkedIn:</strong>{" "}
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              {profile.linkedin}
            </a>
          </p>
          <p>
            <strong>Instagram:</strong>{" "}
            <a
              href={profile.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              {profile.instagram}
            </a>
          </p>
          <button
            onClick={() => setEditing(true)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
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
            onChange={(e) =>
              setProfile({ ...profile, skills: e.target.value.split(",") })
            }
            className="w-full p-2 border rounded"
          />
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            value={
              profile.education && Array.isArray(profile.education)
                ? profile.education
                    .map(
                      (edu) =>
                        `${edu.degree || ""} at ${edu.institution || ""} (${
                          edu.year || ""
                        })`
                    )
                    .join(", ")
                : ""
            }
            onChange={(e) =>
              setProfile({
                ...profile,
                education: e.target.value.split(",").map((item) => {
                  const parts = item.trim().split(" at ");
                  const degree = parts[0] || "";
                  const rest = parts[1] || "";
                  const institutionAndYear = rest.split(" (");
                  const institution = institutionAndYear[0] || "";
                  const year = institutionAndYear[1]
                    ? institutionAndYear[1].replace(")", "")
                    : "";
                  return { degree, institution, year };
                }),
              })
            }
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            value={profile.linkedin}
            onChange={(e) =>
              setProfile({ ...profile, linkedin: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            value={profile.instagram}
            onChange={(e) =>
              setProfile({ ...profile, instagram: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-green-500 text-white p-2 rounded"
          >
            Save Profile
          </button>
        </form>
      )}
    </div>
  );
};

export default Profile;
