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
import { getWorkouts, deleteWorkout, updateWorkout, getGoal, setGoal, logout } from "../services/api";

// Parse "YYYY-MM-DD" as local time (not UTC midnight) so weekday bucketing is timezone-safe.
const parseDate = (dateStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const weekdayOf = (dateStr) =>
  parseDate(dateStr).toLocaleDateString("en-US", { weekday: "short" });

const Dashboard = () => {
  const [workouts, setWorkouts] = useState([]);
  const [goal, setGoalValue] = useState(2500);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState("User");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", duration: "", calories: "", intensity: "low", notes: "", date: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("username");
    if (savedUser) setUser(savedUser);

    Promise.all([getWorkouts(), getGoal()])
      .then(([workoutsRes, goalRes]) => {
        setWorkouts(workoutsRes.data);
        setGoalValue(goalRes.data.weeklyGoal ?? 2500);
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          navigate("/login");
        } else {
          setError("Could not reach the backend. Is it running on port 8080?");
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleSetGoal = async () => {
    try {
      const res = await setGoal(Number(goal));
      setGoalValue(res.data.weeklyGoal);
      alert("Weekly goal updated!");
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate("/login");
      } else {
        alert("Could not save the goal. Is the backend running?");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      // Even if the server is down we still clear local state.
    }
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    navigate("/login");
  };

  // Calculate stats
  const totalCalories = workouts.reduce((sum, w) => sum + w.calories, 0);
  const totalTime = workouts.reduce((sum, w) => sum + w.duration, 0);

  // Weekly calories for chart
  const chartData = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => {
    const dayCalories = workouts
      .filter((w) => weekdayOf(w.date) === day)
      .reduce((sum, w) => sum + w.calories, 0);
    return { day, calories: dayCalories };
  });

  const startEdit = (workout) => {
    setEditingId(workout.id);
    setEditForm({
      title: workout.title,
      duration: workout.duration,
      calories: workout.calories,
      intensity: workout.intensity,
      notes: workout.notes || "",
      date: workout.date,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: "", duration: "", calories: "", intensity: "low", notes: "", date: "" });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveEdit = async (id) => {
    try {
      const res = await updateWorkout(id, {
        ...editForm,
        duration: Number(editForm.duration),
        calories: Number(editForm.calories),
      });
      setWorkouts((prev) => prev.map((w) => (w.id === id ? res.data : w)));
      cancelEdit();
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError("You can only edit your own workouts.");
      } else if (err.response && err.response.status === 401) {
        navigate("/login");
      } else {
        setError("Could not update the workout. Check the values.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this workout?")) return;
    try {
      await deleteWorkout(id);
      setWorkouts((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError("You can only delete your own workouts.");
      } else if (err.response && err.response.status === 401) {
        navigate("/login");
      } else {
        setError("Could not delete the workout.");
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading your workouts...</div>;
  }

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

      {error && <p className="text-red-500 mb-4">{error}</p>}

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
              workouts.map((workout) =>
                editingId === workout.id ? (
                  <div key={workout.id} className="bg-white shadow rounded-lg p-4 border-2 border-purple-300">
                    <div className="space-y-2">
                      <input
                        name="title"
                        value={editForm.title}
                        onChange={handleEditChange}
                        placeholder="Title"
                        className="w-full border rounded p-2"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          name="duration"
                          value={editForm.duration}
                          onChange={handleEditChange}
                          type="number"
                          placeholder="Duration (min)"
                          className="w-full border rounded p-2"
                        />
                        <input
                          name="calories"
                          value={editForm.calories}
                          onChange={handleEditChange}
                          type="number"
                          placeholder="Calories"
                          className="w-full border rounded p-2"
                        />
                      </div>
                      <input
                        name="date"
                        value={editForm.date}
                        onChange={handleEditChange}
                        type="date"
                        className="w-full border rounded p-2"
                      />
                      <select
                        name="intensity"
                        value={editForm.intensity}
                        onChange={handleEditChange}
                        className="w-full border rounded p-2"
                      >
                        <option value="low">Low</option>
                        <option value="moderate">Moderate</option>
                        <option value="high">High</option>
                      </select>
                      <textarea
                        name="notes"
                        value={editForm.notes}
                        onChange={handleEditChange}
                        placeholder="Notes"
                        className="w-full border rounded p-2"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(workout.id)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 bg-gray-300 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={workout.id} className="bg-white shadow rounded-lg p-4 flex justify-between">
                    <div>
                      <h3 className="font-semibold text-purple-700">{workout.title}</h3>
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
                        onClick={() => startEdit(workout)}
                        className="text-blue-500 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(workout.id)}
                        className="text-red-500 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              )
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
              onChange={(e) => setGoalValue(e.target.value)}
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
                    {workouts.filter((w) => weekdayOf(w.date) === day).length} workouts
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
                onClick={() => navigate("/log-workout", { state: { quick: "Cardio" } })}
              >
                Quick Cardio (20 min)
              </button>
              <button
                className="w-full py-2 bg-purple-100 text-purple-600 rounded"
                onClick={() => navigate("/log-workout", { state: { quick: "Strength" } })}
              >
                Strength Training (45 min)
              </button>
              <button
                className="w-full py-2 bg-blue-100 text-blue-600 rounded"
                onClick={() => navigate("/log-workout", { state: { quick: "Yoga" } })}
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