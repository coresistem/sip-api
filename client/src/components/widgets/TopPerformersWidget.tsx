import React from 'react';
import { Trophy, Medal, User } from 'lucide-react';

interface Performer {
    id: string;
    name: string;
    score: number;
    trend: 'up' | 'down' | 'stable';
    rank: number;
    avatar?: string;
}

const TopPerformersWidget: React.FC = () => {
    // Mock Data
    const performers: Performer[] = [
        { id: '1', name: 'Rio Haryanto', score: 9.4, trend: 'up', rank: 1 },
        { id: '2', name: 'Diana Putri', score: 9.3, trend: 'stable', rank: 2 },
        { id: '3', name: 'Farhan Akbar', score: 9.2, trend: 'up', rank: 3 },
        { id: '4', name: 'Lena Marlia', score: 9.2, trend: 'down', rank: 4 },
        { id: '5', name: 'Taufik Hidayat', score: 9.1, trend: 'stable', rank: 5 },
    ];

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Trophy className="w-5 h-5 text-yellow-400" />;
            case 2: return <Medal className="w-5 h-5 text-gray-300" />;
            case 3: return <Medal className="w-5 h-5 text-amber-600" />;
            default: return <span className="w-5 h-5 flex items-center justify-center font-bold text-slate-500">{rank}</span>;
        }
    };

    return (
        <div className="card h-full min-h-[400px] flex flex-col p-4 bg-dark-800 border-dark-700">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Top Performers
                    </h3>
                    <p className="text-sm text-dark-400">Club Leaders this Week</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {performers.map((p) => (
                    <div
                        key={p.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-dark-900/50 border border-dark-700 hover:border-dark-600 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 flex justify-center">
                                {getRankIcon(p.rank)}
                            </div>

                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                                {p.avatar ? (
                                    <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-4 h-4 text-slate-400" />
                                )}
                            </div>

                            <div>
                                <h4 className="font-medium text-white text-sm">{p.name}</h4>
                                <span className="text-xs text-slate-500">Recurve 70m</span>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-lg font-bold text-primary-400">{p.score}</div>
                            <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1">
                                Avg Score
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-dark-700 text-center">
                <button className="text-xs text-primary-400 hover:text-primary-300 font-medium">
                    View Full Leaderboard
                </button>
            </div>
        </div>
    );
};

export default TopPerformersWidget;
