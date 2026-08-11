import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [workouts, setWorkouts] = useState([]);
  const [goal, setGoal] = useState(2500);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState("User");
  const navigate = useNavigate();

  useEffect(() => {
    const loadWorkouts = () => {
      const savedWorkouts = JSON.parse(localStorage.getItem("workouts")) || [];
      setWorkouts(savedWorkouts);

      const savedGoal = localStorage.getItem("weeklyGoal");
      if (savedGoal) setGoal(Number(savedGoal));

      const savedUser = localStorage.getItem("activeUser");
      if (savedUser) setUser(savedUser);
    };

    loadWorkouts();
    window.addEventListener("storage", loadWorkouts);

    return () => {
      window.removeEventListener("storage", loadWorkouts);
    };
  }, []);

  const handleSetGoal = () => {
    localStorage.setItem("weeklyGoal", goal);
    alert("Weekly goal updated!");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Calculate stats
  const totalCalories = workouts.reduce((sum, w) => sum + w.calories, 0);
  const totalTime = workouts.reduce((sum, w) => sum + w.duration, 0);

  // Weekly calories for chart
  const chartData = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
    (day) => {
      const dayCalories = workouts
        .filter(
          (w) =>
            new Date(w.date).toLocaleDateString("en-US", { weekday: "short" }) ===
            day
        )
        .reduce((sum, w) => sum + w.calories, 0);
      return { day, calories: dayCalories };
    }
  );

  // Delete workout
  const handleDelete = (index) => {
    const updated = workouts.filter((_, i) => i !== index);
    setWorkouts(updated);
    localStorage.setItem("workouts", JSON.stringify(updated));
  };

  // Edit workout (simple prompt version)
  const handleEdit = (index) => {
    const workout = workouts[index];
    const newTitle = prompt("Edit workout title:", workout.title);
    if (newTitle) {
      const updated = [...workouts];
      updated[index] = { ...workout, title: newTitle };
      setWorkouts(updated);
      localStorage.setItem("workouts", JSON.stringify(updated));
    }
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-50"} min-h-screen p-6`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-purple-600">
            Welcome, {user} 👋
          </h1>
          <p className="text-gray-500">Track your progress and stay motivated</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/log-workout")}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg"
          >
            + Log Workout
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-300 rounded-lg"
          >
            Logout
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-gray-500">This Week</p>
          <h2 className="text-2xl font-bold">{workouts.length} workouts</h2>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-gray-500">Total Time</p>
          <h2 className="text-2xl font-bold">{totalTime} min</h2>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-gray-500">Calories Burned</p>
          <h2 className="text-2xl font-bold">{totalCalories} kcal</h2>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-gray-500">Avg Intensity</p>
          <h2 className="text-2xl font-bold text-green-600">
            {workouts.length > 0 ? "Moderate" : "Low"}
          </h2>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-2">Weekly Calories Burned</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="calories" fill="#a855f7" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left - Recent Workouts */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4">Recent Workouts</h2>
          <div className="space-y-4">
            {workouts.length > 0 ? (
              workouts.map((workout, index) => (
                <div
                  key={index}
                  className="bg-white shadow rounded-lg p-4 flex justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-purple-700">
                      {workout.title}
                    </h3>
                    <p className="text-sm text-gray-500">{workout.date}</p>
                    <p className="text-gray-600">
                      {workout.duration} min • {workout.calories} cal •{" "}
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          workout.intensity === "high"
                            ? "bg-red-100 text-red-600"
                            : workout.intensity === "moderate"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {workout.intensity}
                      </span>
                    </p>
                    <p className="text-gray-500 italic mt-1">{workout.notes}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleEdit(index)}
                      className="text-blue-500 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="text-red-500 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No workouts logged yet.</p>
            )}
          </div>
        </div>

        {/* Right - Sidebar */}
        <div className="space-y-4">
          {/* Weekly Goal */}
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="font-semibold mb-2">Weekly Calorie Goal</h3>
            <input
              type="number"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />
            <button
              onClick={handleSetGoal}
              className="w-full py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded"
            >
              Set Goal
            </button>
          </div>

          {/* Weekly Activity */}
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="font-semibold mb-2">Weekly Activity</h3>
            <ul className="text-gray-600 space-y-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <li key={day} className="flex justify-between">
                  <span>{day}</span>
                  <span>
                    {
                      workouts.filter(
                        (w) =>
                          new Date(w.date).toLocaleDateString("en-US", {
                            weekday: "short",
                          }) === day
                      ).length
                    }{" "}
                    workouts
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Start */}
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="font-semibold mb-2">Quick Start</h3>
            <div className="space-y-2">
              <button
                className="w-full py-2 bg-pink-100 text-pink-600 rounded"
                onClick={() =>
                  navigate("/log-workout", { state: { quick: "Cardio" } })
                }
              >
                Quick Cardio (20 min)
              </button>
              <button
                className="w-full py-2 bg-purple-100 text-purple-600 rounded"
                onClick={() =>
                  navigate("/log-workout", { state: { quick: "Strength" } })
                }
              >
                Strength Training (45 min)
              </button>
              <button
                className="w-full py-2 bg-blue-100 text-blue-600 rounded"
                onClick={() =>
                  navigate("/log-workout", { state: { quick: "Yoga" } })
                }
              >
                Yoga Session (30 min)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
