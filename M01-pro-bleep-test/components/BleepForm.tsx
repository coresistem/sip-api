import React, { useState } from 'react';
import { Participant } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface BleepFormProps {
  onStart: (participant: Participant) => void;
}

const BleepForm: React.FC<BleepFormProps> = ({ onStart }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    age: 25,
    gender: 'male',
    height: 175,
    weight: 70,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName) return;

    const participant: Participant = {
      id: uuidv4(),
      fullName: formData.fullName,
      age: Number(formData.age),
      gender: formData.gender as 'male' | 'female',
      height: Number(formData.height),
      weight: Number(formData.weight),
      notes: formData.notes,
      testDate: new Date().toISOString()
    };

    onStart(participant);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-md mx-auto bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
      <h2 className="text-2xl font-bold mb-6 text-cyan-400">New Session</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Full Name *</label>
          <input
            type="text"
            name="fullName"
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
            placeholder="Athlete Name"
            value={formData.fullName}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Age *</label>
            <input
              type="number"
              name="age"
              min="10"
              max="90"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
              value={formData.age}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Gender *</label>
            <select
              name="gender"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Height (cm)</label>
            <input
              type="number"
              name="height"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
              value={formData.height}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Weight (kg)</label>
            <input
              type="number"
              name="weight"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
              value={formData.weight}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
           <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
           <textarea
              name="notes"
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none resize-none"
              placeholder="Conditions, injuries, etc."
              value={formData.notes}
              onChange={handleChange}
           />
        </div>

        <button
          type="submit"
          className="w-full mt-6 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 rounded-lg transition-colors duration-200 shadow-lg"
        >
          Start Test Session
        </button>
      </form>
    </div>
  );
};

export default BleepForm;
