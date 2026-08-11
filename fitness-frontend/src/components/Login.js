import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const tourSteps = [
  {
    title: "Welcome to Fitness Tracker",
    description: "Monitor your daily activities and take control of your health.",
  },
  {
    title: "Track Your Steps",
    description: "Record your daily steps to stay active and motivated.",
  },
  {
    title: "Monitor Calories",
    description: "Keep an eye on your calorie intake and manage your diet.",
  },
  {
    title: "Sleep & Recovery",
    description: "Analyze your sleep patterns for better rest and recovery.",
  },
];

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [tourIndex, setTourIndex] = useState(-1); // -1 means tour is hidden
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.username === "user" && form.password === "12345") {
      localStorage.setItem("token", "demo-token");
      navigate("/dashboard");
    } else {
      const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
      const userExists = storedUsers.find(
        (user) => user.username === form.username && user.password === form.password
      );

      if (userExists) {
        localStorage.setItem("token", "demo-token");
        navigate("/dashboard");
      } else {
        alert("Invalid username or password! Try user / 12345");
      }
    }
  };

  const startTour = () => setTourIndex(0);
  const nextStep = () => setTourIndex((prev) => Math.min(prev + 1, tourSteps.length - 1));
  const prevStep = () => setTourIndex((prev) => Math.max(prev - 1, 0));
  const finishTour = () => setTourIndex(-1);

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
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:opacity-90 transition"
            >
              Login
            </button>
          </form>

          <div className="flex justify-between text-sm text-gray-400 mt-3">
            <label>
              <input type="checkbox" className="mr-2" /> Remember me
            </label>
            <button className="hover:text-white">Forgot password?</button>
          </div>

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

      {/* Right Section - Welcome Text + Tour */}
      <div className="w-1/2 flex flex-col items-center justify-center bg-gradient-to-r from-purple-800 via-indigo-800 to-blue-900 relative">
        <h1 className="text-5xl font-bold text-white mb-6">Welcome.</h1>

        {/* Get Started Button */}
        {tourIndex === -1 && (
          <button
            onClick={startTour}
            className="py-3 px-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition"
          >
            Get Started
          </button>
        )}

        {/* Guided Mini Tour Panel */}
        {tourIndex !== -1 && (
          <div className="bg-white rounded-xl p-6 shadow-lg max-w-md text-center animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">{tourSteps[tourIndex].title}</h2>
            <p className="mb-6 text-gray-700">{tourSteps[tourIndex].description}</p>
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                disabled={tourIndex === 0}
                className={`py-2 px-4 rounded-lg ${
                  tourIndex === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:opacity-90 transition"
                }`}
              >
                Previous
              </button>
              {tourIndex === tourSteps.length - 1 ? (
                <button
                  onClick={finishTour}
                  className="py-2 px-4 bg-pink-500 text-white rounded-lg hover:opacity-90 transition"
                >
                  Finish
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="py-2 px-4 bg-purple-600 text-white rounded-lg hover:opacity-90 transition"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
