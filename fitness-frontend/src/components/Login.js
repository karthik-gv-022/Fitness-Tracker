import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/api";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", String(res.data.userId));
      localStorage.setItem("username", res.data.username);
      navigate("/dashboard");
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError("Invalid username or password.");
      } else {
        setError("Could not reach the server. Is the backend running?");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Section - Login Form */}
      <div className="w-1/2 flex flex-col justify-center items-center bg-[#1e1b3a] p-10">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-4xl">
              👤
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className="w-full mb-4 p-3 rounded-lg bg-[#2c2855] text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full mb-4 p-3 rounded-lg bg-[#2c2855] text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500"
            />
            {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-400">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-500 font-semibold hover:underline"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>

      {/* Right Section - Welcome Text */}
      <div className="w-1/2 flex flex-col items-center justify-center bg-gradient-to-r from-purple-800 via-indigo-800 to-blue-900 relative">
        <h1 className="text-5xl font-bold text-white mb-6">Welcome.</h1>
        <p className="text-purple-200 text-xl">Track your workouts. Stay consistent.</p>
      </div>
    </div>
  );
};

export default Login;