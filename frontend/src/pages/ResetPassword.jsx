import React, { useState } from "react";
import axios from "axios";
import { Lock, Key } from "lucide-react";
import { userURI } from "../mainApi";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      setLoading(true);
      const res = await axios.post(`${userURI}/resetPassword`, formData, {
        withCredentials: true,
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>

        {message && (
          <p className="text-center text-sm mb-4 text-green-600">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full border p-2 rounded-lg"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="otp"
            placeholder="Enter OTP"
            className="w-full border p-2 rounded-lg"
            value={formData.otp}
            onChange={handleChange}
            required
          />

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              type="password"
              name="password"
              placeholder="New Password"
              className="w-full border p-2 pl-9 rounded-lg"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="relative">
            <Key className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full border p-2 pl-9 rounded-lg"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
