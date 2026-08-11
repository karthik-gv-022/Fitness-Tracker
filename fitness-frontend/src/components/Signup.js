import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [form, setForm] = useState({ username: "", password: "", confirm: "" });
  const navigate = useNavigate();

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle signup submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.username || !form.password || !form.confirm) {
      alert("All fields are required!");
      return;
    }

    if (form.password !== form.confirm) {
      alert("Passwords do not match!");
      return;
    }

    // Fetch users from localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if username exists
    const exists = users.find((u) => u.username === form.username);
    if (exists) {
      alert("Username already exists!");
      return;
    }

    // Save new user
    users.push({ username: form.username, password: form.password });
    localStorage.setItem("users", JSON.stringify(users));

    alert("Signup successful! Please login.");
    navigate("/"); // redirect to login page
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
              placeholder="Password"
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

            {/* Signup Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold hover:opacity-90 transition"
            >
              Sign Up
            </button>
          </form>

          {/* Link to Login */}
          <div className="text-center mt-4 text-gray-400">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/")}
              className="text-blue-400 hover:text-white"
            >
              Login
            </button>
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
