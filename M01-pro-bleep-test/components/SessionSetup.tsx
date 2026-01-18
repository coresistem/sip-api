import React, { useState } from 'react';
import { Participant } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface SessionSetupProps {
  onStart: (participants: Participant[]) => void;
}

interface PersonDraft {
  id: string;
  name: string;
  role: 'candidate' | 'assessor';
  age?: number;
  gender?: 'male' | 'female';
  height?: number;
  weight?: number;
}

const SessionSetup: React.FC<SessionSetupProps> = ({ onStart }) => {
  // Roster State
  const [roster, setRoster] = useState<PersonDraft[]>([]);
  
  // Pairing State: candidateId -> assessorId
  const [pairings, setPairings] = useState<Record<string, string>>({});

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    role: 'candidate' as 'candidate' | 'assessor',
    age: 25,
    gender: 'male',
    height: 175,
    weight: 70
  });

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newPerson: PersonDraft = {
      id: uuidv4(),
      name: formData.name,
      role: formData.role,
      // Only keep metrics if candidate
      ...(formData.role === 'candidate' ? {
        age: Number(formData.age),
        gender: formData.gender as 'male' | 'female',
        height: Number(formData.height),
        weight: Number(formData.weight),
      } : {})
    };

    setRoster([...roster, newPerson]);
    
    // Reset Name but keep settings for quick entry
    setFormData(prev => ({ ...prev, name: '' }));
  };

  const handleRemovePerson = (id: string) => {
    setRoster(roster.filter(p => p.id !== id));
    // Clean up pairings
    const newPairings = { ...pairings };
    if (newPairings[id]) delete newPairings[id]; // if candidate was removed
    // if assessor was removed, find candidates assigned to them
    Object.keys(newPairings).forEach(key => {
        if(newPairings[key] === id) delete newPairings[key];
    });
    setPairings(newPairings);
  };

  const handleStartSession = () => {
    const candidates = roster.filter(p => p.role === 'candidate');
    
    if (candidates.length === 0) {
        alert("Please add at least one candidate.");
        return;
    }

    const participants: Participant[] = candidates.map(c => {
        const assessorId = pairings[c.id];
        const assessor = roster.find(p => p.id === assessorId);
        return {
            id: c.id,
            fullName: c.name,
            age: c.age || 25,
            gender: c.gender || 'male',
            height: c.height,
            weight: c.weight,
            testDate: new Date().toISOString(),
            assessorName: assessor ? assessor.name : undefined
        };
    });

    onStart(participants);
  };

  const assessors = roster.filter(p => p.role === 'assessor');
  const candidates = roster.filter(p => p.role === 'candidate');

  // Helper to get available assessors for a specific candidate row
  const getAvailableAssessors = (candidateId: string) => {
    return assessors.filter(assessor => {
        // Find if this assessor is assigned to ANY candidate
        const assignedCandidateId = Object.keys(pairings).find(key => pairings[key] === assessor.id);
        
        // Include if:
        // 1. Not assigned to anyone (assignedCandidateId is undefined)
        // 2. OR assigned to the current candidate (assignedCandidateId === candidateId) so it stays selected
        return !assignedCandidateId || assignedCandidateId === candidateId;
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
      
      {/* Left Column: Add Person Form */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700">
          <h2 className="text-xl font-bold mb-4 text-cyan-400 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
            Add to Roster
          </h2>
          <form onSubmit={handleAddPerson} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
              <input
                type="text"
                required
                className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:ring-1 focus:ring-cyan-500 outline-none"
                placeholder="Name"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
               <label className="block text-xs font-medium text-slate-400 mb-2">Role</label>
               <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="role" 
                        value="candidate"
                        checked={formData.role === 'candidate'}
                        onChange={() => setFormData({...formData, role: 'candidate'})}
                        className="accent-cyan-500"
                      />
                      <span className={formData.role === 'candidate' ? 'text-white' : 'text-slate-400'}>Candidate</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="role" 
                        value="assessor"
                        checked={formData.role === 'assessor'}
                        onChange={() => setFormData({...formData, role: 'assessor'})}
                        className="accent-cyan-500"
                      />
                      <span className={formData.role === 'assessor' ? 'text-white' : 'text-slate-400'}>Assessor</span>
                  </label>
               </div>
            </div>

            {/* Conditional fields for Candidate */}
            {formData.role === 'candidate' && (
                <div className="space-y-4 pt-2 border-t border-slate-700 animate-fadeIn">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Age</label>
                            <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm" />
                        </div>
                         <div>
                            <label className="block text-xs text-slate-400 mb-1">Gender</label>
                            <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm">
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="block text-xs text-slate-400 mb-1">Height (cm)</label>
                            <input type="number" value={formData.height} onChange={e => setFormData({...formData, height: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Weight (kg)</label>
                            <input type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm" />
                        </div>
                    </div>
                </div>
            )}

            <button type="submit" className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded transition-colors">
                Add Person
            </button>
          </form>
        </div>

        {/* List of Assessors */}
        <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Assessors Available ({assessors.length})</h3>
             {assessors.length === 0 ? (
                 <p className="text-slate-500 text-sm italic">No assessors added yet.</p>
             ) : (
                 <ul className="space-y-2">
                     {assessors.map(a => (
                         <li key={a.id} className="flex justify-between items-center bg-slate-700/50 px-3 py-2 rounded border border-slate-700">
                             <span className="text-white">{a.name}</span>
                             <button onClick={() => handleRemovePerson(a.id)} className="text-slate-400 hover:text-red-400">
                                 &times;
                             </button>
                         </li>
                     ))}
                 </ul>
             )}
        </div>
      </div>

      {/* Right Column: Assignments */}
      <div className="lg:col-span-8 flex flex-col h-full">
          <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700 flex-grow">
              <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                Candidate Roster
              </h2>
              
              {candidates.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed border-slate-700 rounded-xl">
                      <p className="text-slate-500">Add candidates to the roster to begin assignments.</p>
                  </div>
              ) : (
                  <>
                    <div className="overflow-x-auto mb-6">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-700 text-slate-400 text-sm">
                                    <th className="pb-3 pl-2 font-medium">Candidate</th>
                                    <th className="pb-3 font-medium">Stats</th>
                                    <th className="pb-3 font-medium">Assigned Assessor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {candidates.map(c => {
                                    const availableOptions = getAvailableAssessors(c.id);
                                    return (
                                        <tr key={c.id} className="group hover:bg-slate-700/30 transition-colors">
                                            <td className="py-4 pl-2">
                                                <div className="font-bold text-white">{c.name}</div>
                                                <button onClick={() => handleRemovePerson(c.id)} className="text-xs text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Remove
                                                </button>
                                            </td>
                                            <td className="py-4 text-sm text-slate-300">
                                                {c.gender}, {c.age}yo<br/>
                                                <span className="text-slate-500">{c.height}cm / {c.weight}kg</span>
                                            </td>
                                            <td className="py-4">
                                                <select 
                                                value={pairings[c.id] || ''} 
                                                onChange={(e) => setPairings({...pairings, [c.id]: e.target.value})}
                                                className={`bg-slate-900 border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-cyan-500 ${!pairings[c.id] ? 'border-orange-500/50 text-orange-200' : 'border-slate-600 text-white'}`}
                                                >
                                                    <option value="">-- Select Assessor --</option>
                                                    {availableOptions.map(a => (
                                                        <option key={a.id} value={a.id}>{a.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-slate-700 pt-6">
                        <button 
                            onClick={handleStartSession}
                            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-lg rounded-lg shadow-lg transition-transform hover:scale-[1.01]"
                        >
                            START SESSION ({candidates.length} Candidates)
                        </button>
                    </div>
                  </>
              )}
          </div>
      </div>
    </div>
  );
};

export default SessionSetup;