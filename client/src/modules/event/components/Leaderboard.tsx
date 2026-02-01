import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Users, Target } from 'lucide-react';
import { api } from '../../core/contexts/AuthContext';
import { toast } from 'react-toastify';

interface LeaderboardEntry {
    id: string;
    athleteId: string;
    qualificationScore: number;
    tenCount: number;
    xCount: number;
    athlete: {
        user: {
            name: string;
            avatarUrl: string | null;
        };
        club: {
            name: string;
        } | null;
    };
}

interface LeaderboardProps {
    competitionId: string;
    categoryId: string;
}

export default function Leaderboard({ competitionId, categoryId }: LeaderboardProps) {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (competitionId && categoryId) {
            fetchLeaderboard();
        }
    }, [competitionId, categoryId]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/scores/competition/${competitionId}/category/${categoryId}/leaderboard`);
            if (res.data.success) {
                setEntries(res.data.data);
            }
        } catch (error) {
            toast.error('Failed to load leaderboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {entries.length === 0 ? (
                <div className="text-center py-12 bg-dark-900 rounded-2xl border border-dark-800">
                    <Users className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                    <p className="text-dark-400">No results recorded yet for this category.</p>
                </div>
            ) : (
                <div className="overflow-hidden bg-dark-900 rounded-2xl border border-dark-800 shadow-xl">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-dark-850 border-b border-dark-800">
                                <th className="px-6 py-4 text-xs font-bold text-dark-400 uppercase tracking-widest w-16">Rank</th>
                                <th className="px-6 py-4 text-xs font-bold text-dark-400 uppercase tracking-widest">Athlete</th>
                                <th className="px-6 py-4 text-xs font-bold text-dark-400 uppercase tracking-widest text-center">10s</th>
                                <th className="px-6 py-4 text-xs font-bold text-dark-400 uppercase tracking-widest text-center">Xs</th>
                                <th className="px-6 py-4 text-xs font-bold text-dark-400 uppercase tracking-widest text-right">Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-800">
                            {entries.map((entry, index) => {
                                const rank = index + 1;
                                const isTop3 = rank <= 3;

                                return (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={entry.id}
                                        className={`hover:bg-dark-800/50 transition-colors ${isTop3 ? 'bg-primary-500/5' : ''}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full font-display font-bold">
                                                {rank === 1 ? <Medal className="w-6 h-6 text-yellow-400" /> :
                                                    rank === 2 ? <Medal className="w-6 h-6 text-slate-300" /> :
                                                        rank === 3 ? <Medal className="w-6 h-6 text-amber-600" /> :
                                                            <span className="text-dark-400">{rank}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center overflow-hidden">
                                                    {entry.athlete.user.avatarUrl ? (
                                                        <img src={entry.athlete.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Users className="w-5 h-5 text-dark-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white">{entry.athlete.user.name}</div>
                                                    <div className="text-xs text-dark-500">{entry.athlete.club?.name || 'Individual'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm font-medium text-dark-300">
                                            {entry.tenCount}
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm font-medium text-dark-300">
                                            {entry.xCount}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-lg font-display font-bold text-primary-400">
                                                {entry.qualificationScore}
                                            </div>
                                            <div className="text-[10px] text-dark-500 font-bold uppercase tracking-tighter">
                                                Avg {(entry.qualificationScore / 72).toFixed(2)}
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
