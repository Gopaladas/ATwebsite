import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  Building,
  Edit2,
  Save,
  X,
  Camera,
} from "lucide-react";
import axios from "axios";
import { CLOUD_NAME, employeeURI, preset, userURI } from "../../../mainApi";

const EmployeeProfile = ({ profile, fetchProfile }) => {
  const fileRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);

  const [formData, setFormData] = useState({
    userName: "",
    phoneNumber: "",
    department: "",
    bio: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        userName: profile.userName || "",
        phoneNumber: profile.phoneNumber || "",
        department: profile.department || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  // ---------------- SAVE PROFILE ----------------
  const handleSave = async () => {
    try {
      await axios.put(`${employeeURI}/update-profile`, formData, {
        withCredentials: true,
      });

      setIsEditing(false);
      fetchProfile();
      alert("Profile updated successfully");
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  // ---------------- IMAGE UPLOAD ----------------
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoadingImage(true);

      // Upload to Cloudinary
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", preset); // 🔴 replace
      data.append("folder", "items"); // 🔴 replace

      const cloudRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        data
      );

      // Save image URL in backend
      await axios.patch(
        `${userURI}/update-image`,
        { imageUrl: cloudRes.data.secure_url },
        { withCredentials: true }
      );

      fetchProfile();
    } catch (err) {
      alert("Image update failed");
    } finally {
      setLoadingImage(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={profile.imageUrl}
                alt="profile"
                className="w-32 h-32 rounded-full border-4 border-white object-cover"
              />

              <button
                onClick={() => fileRef.current.click()}
                className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow"
              >
                <Camera className="w-4 h-4" />
              </button>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </div>

            <div className="text-white">
              <h2 className="text-2xl font-bold">{profile.userName}</h2>
              <p className="text-blue-100">
                {profile.department || "No department"}
              </p>
              <p className="text-blue-200">{profile.email}</p>
              <p className="mt-1 text-sm">
                Employee ID: {profile._id.slice(-8)}
              </p>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="p-8">
          <div className="flex justify-between mb-6">
            <h3 className="text-xl font-semibold">Personal Information</h3>

            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                isEditing ? "bg-green-600 text-white" : "bg-blue-600 text-white"
              }`}
            >
              {isEditing ? <Save size={16} /> : <Edit2 size={16} />}
              {isEditing ? "Save" : "Edit"}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* LEFT */}
            <div className="space-y-4">
              <Field
                icon={<User size={16} />}
                label="Full Name"
                editable={isEditing}
                value={formData.userName}
                onChange={(v) => setFormData({ ...formData, userName: v })}
              />

              <StaticField
                icon={<Mail size={16} />}
                label="Email"
                value={profile.email}
              />

              <Field
                icon={<Phone size={16} />}
                label="Phone"
                editable={isEditing}
                value={formData.phoneNumber}
                onChange={(v) => setFormData({ ...formData, phoneNumber: v })}
              />
            </div>

            {/* RIGHT */}
            <div className="space-y-4">
              <Field
                icon={<Building size={16} />}
                label="Department"
                editable={isEditing}
                value={formData.department}
                onChange={(v) => setFormData({ ...formData, department: v })}
              />

              <StaticField label="Role" value={profile.role} />

              <span
                className={`inline-block px-3 py-1 rounded-full text-sm ${
                  profile.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {profile.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {/* BIO */}
          <div className="mt-6">
            <label className="text-gray-500 block mb-1">Bio</label>
            {isEditing ? (
              <textarea
                className="w-full border rounded-lg p-3"
                rows={3}
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
              />
            ) : (
              <p className="bg-gray-50 p-3 rounded-lg">
                {profile.bio || "No bio added"}
              </p>
            )}
          </div>

          {isEditing && (
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    userName: profile.userName,
                    phoneNumber: profile.phoneNumber,
                    department: profile.department,
                    bio: profile.bio || "",
                  });
                }}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg"
              >
                <X size={16} /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------- Reusable Components ---------- */
const Field = ({ icon, label, editable, value, onChange }) => (
  <div>
    <label className="flex items-center gap-2 text-gray-500 mb-1">
      {icon} {label}
    </label>
    {editable ? (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border p-2 rounded-lg"
      />
    ) : (
      <p className="bg-gray-50 p-2 rounded-lg">{value || "N/A"}</p>
    )}
  </div>
);

const StaticField = ({ icon, label, value }) => (
  <div>
    <label className="flex items-center gap-2 text-gray-500 mb-1">
      {icon} {label}
    </label>
    <p className="bg-gray-50 p-2 rounded-lg">{value}</p>
  </div>
);

export default EmployeeProfile;
