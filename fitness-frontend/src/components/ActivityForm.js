import React, { useState, useEffect } from 'react';
import { addActivity, updateActivity, getActivities } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';

function ActivityForm() {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const id = query.get('id');

  useEffect(() => {
    if (id) {
      getActivities()
        .then(res => {
          const activity = res.data.find(a => a.id === id);
          if (activity) {
            setName(activity.name);
            setDuration(activity.duration);
            setCalories(activity.calories);
          }
        })
        .catch(err => console.error(err));
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { name, duration, calories };
    if (id) {
      updateActivity(id, data).then(() => navigate('/')).catch(err => console.error(err));
    } else {
      addActivity(data).then(() => navigate('/')).catch(err => console.error(err));
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-purpleVibe">{id ? 'Edit' : 'Add'} Activity</h2>
        <div className="mb-4">
          <label className="block font-semibold mb-1 text-info">Name</label>
          <input className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purpleVibe" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1 text-info">Duration (mins)</label>
          <input type="number" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purpleVibe" value={duration} onChange={e => setDuration(e.target.value)} required />
        </div>
        <div className="mb-6">
          <label className="block font-semibold mb-1 text-info">Calories</label>
          <input type="number" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purpleVibe" value={calories} onChange={e => setCalories(e.target.value)} required />
        </div>
        <button type="submit" className="w-full bg-pinkVibe text-white py-3 rounded-xl hover:bg-purpleVibe transition duration-300">{id ? 'Update' : 'Add'} Activity</button>
      </form>
    </div>
  );
}

export default ActivityForm;
