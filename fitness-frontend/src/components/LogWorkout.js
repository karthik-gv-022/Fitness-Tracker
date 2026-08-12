import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { logWorkout } from "../services/api";

const LogWorkout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State for workout form
  const [workout, setWorkout] = useState({
    title: "",
    duration: "",
    calories: "",
    intensity: "low",
    notes: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load quick start workout if passed from Dashboard
  useEffect(() => {
    if (location.state?.quick) {
      const quick = location.state.quick;
      if (quick === "Cardio") {
        setWorkout({
          title: "Quick Cardio",
          duration: 20,
          calories: 200,
          intensity: "moderate",
          notes: "Auto-filled quick cardio workout",
          date: new Date().toISOString().split("T")[0],
        });
      } else if (quick === "Strength") {
        setWorkout({
          title: "Strength Training",
          duration: 45,
          calories: 400,
          intensity: "high",
          notes: "Auto-filled strength training",
          date: new Date().toISOString().split("T")[0],
        });
      } else if (quick === "Yoga") {
        setWorkout({
          title: "Yoga Session",
          duration: 30,
          calories: 150,
          intensity: "low",
          notes: "Auto-filled yoga session",
          date: new Date().toISOString().split("T")[0],
        });
      }
    }
  }, [location.state]);

  const handleChange = (e) => {
    setWorkout({ ...workout, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!workout.title || !workout.duration || !workout.calories) {
      setError("Please fill in all required fields!");
      return;
    }

    setLoading(true);
    try {
      await logWorkout({
        ...workout,
        duration: Number(workout.duration),
        calories: Number(workout.calories),
      });
      navigate("/dashboard");
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError("Invalid workout. Check the values.");
      } else {
        setError("Could not save the workout. Is the backend running?");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-white flex items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-purple-700 mb-6">Log Workout</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="title">Workout Title</label>
            <input
              id="title"
              type="text"
              name="title"
              value={workout.title}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              placeholder="e.g. Morning Run"
              required
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="duration">Duration (minutes)</label>
            <input
              id="duration"
              type="number"
              name="duration"
              value={workout.duration}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              required
            />
          </div>

          {/* Calories */}
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="calories">Calories Burned</label>
            <input
              id="calories"
              type="number"
              name="calories"
              value={workout.calories}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              required
            />
          </div>

          {/* Intensity */}
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="intensity">Intensity</label>
            <select
              id="intensity"
              name="intensity"
              value={workout.intensity}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            >
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={workout.notes}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              placeholder="Optional notes"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              name="date"
              value={workout.date}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Buttons */}
          <div className="flex justify-between mt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Workout"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-6 py-2 bg-gray-300 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogWorkout;