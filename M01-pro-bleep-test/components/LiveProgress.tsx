import React from 'react';

interface LiveProgressProps {
  progress: number; // 0 to 1
  level: number;
  shuttle: number;
  totalShuttlesInLevel: number;
  speed: number;
}

const LiveProgress: React.FC<LiveProgressProps> = ({ progress, level, shuttle, totalShuttlesInLevel, speed }) => {
  return (
    <div className="w-full bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
      <div className="flex justify-between items-end mb-4">
        <div className="text-center">
            <span className="block text-xs text-slate-400 uppercase tracking-wider">Level</span>
            <span className="text-4xl font-bold text-cyan-400">{level}</span>
        </div>
        <div className="text-center">
            <span className="block text-xs text-slate-400 uppercase tracking-wider">Shuttle</span>
            <span className="text-4xl font-bold text-white">{shuttle} <span className="text-xl text-slate-500">/ {totalShuttlesInLevel}</span></span>
        </div>
        <div className="text-center">
            <span className="block text-xs text-slate-400 uppercase tracking-wider">Speed</span>
            <span className="text-2xl font-bold text-emerald-400">{speed} <span className="text-sm text-slate-400">km/h</span></span>
        </div>
      </div>

      <div className="relative h-4 bg-slate-900 rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-100 ease-linear"
          style={{ width: `${Math.min(100, progress * 100)}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-2 text-xs text-slate-500">
        <span>Start Line</span>
        <span>20 Meters</span>
      </div>
    </div>
  );
};

export default LiveProgress;
