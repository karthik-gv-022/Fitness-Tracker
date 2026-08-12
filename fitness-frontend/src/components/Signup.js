import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/api";

const Signup = () => {
  const [form, setForm] = useState({ username: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.username || !form.password || !form.confirm) {
      setError("All fields are required!");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const res = await register({ username: form.username, password: form.password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", String(res.data.userId));
      localStorage.setItem("username", res.data.username);
      navigate("/dashboard");
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setError("Username already exists.");
      } else {
        setError("Could not reach the server. Is the backend running?");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Section - Signup Form */}
      <div className="w-1/2 flex flex-col justify-center items-center bg-[#1e1b3a] p-10">
        <div className="w-full max-w-sm">
          {/* Avatar Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-4xl">
              ✍️
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className="w-full mb-4 p-3 rounded-lg bg-[#2c2855] text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
            />

            {/* Password */}
            <input
              type="password"
              name="password"
              placeholder="Password (min 6 characters)"
              value={form.password}
              onChange={handleChange}
              className="w-full mb-4 p-3 rounded-lg bg-[#2c2855] text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
            />

            {/* Confirm Password */}
            <input
              type="password"
              name="confirm"
              placeholder="Confirm Password"
              value={form.confirm}
              onChange={handleChange}
              className="w-full mb-4 p-3 rounded-lg bg-[#2c2855] text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
            />

            {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}

            {/* Signup Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          {/* Link to Login */}
          <div className="text-center mt-4 text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:text-white">
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Right Section - Welcome Text */}
      <div className="w-1/2 flex items-center justify-center bg-gradient-to-r from-green-700 via-teal-700 to-blue-800">
        <h1 className="text-5xl font-bold text-white">Create Account.</h1>
      </div>
    </div>
  );
};

export default Signup;