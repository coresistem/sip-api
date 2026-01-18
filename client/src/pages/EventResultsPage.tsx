import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Trophy,
    Medal,
    Users,
    Download,
    Loader2,
    Filter
} from 'lucide-react';
import { api } from '../context/AuthContext';
import { toast } from 'react-toastify';

interface Result {
    rank: number;
    name: string;
    club: string;
    score: number;
    xCount: number;
    tenCount: number;
}

export default function EventResultsPage() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [eventName, setEventName] = useState('Event Results');

    // Data structure: { "Category Name": [Result, Result...] }
    const [leaderboard, setLeaderboard] = useState<Record<string, Result[]>>({});
    const [categories, setCategories] = useState<string[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('');

    useEffect(() => {
        if (id) {
            fetchData(id);
        }
    }, [id]);

    const fetchData = async (eventId: string) => {
        setLoading(true);
        try {
            // Parallel fetch: Event Details (for name) + Leaderboard
            const [eventRes, leaderboardRes] = await Promise.all([
                api.get(`/api/v1/events/${eventId}`),
                api.get(`/api/v1/events/${eventId}/leaderboard`)
            ]);

            setEventName(eventRes.data.data.name);

            const data = leaderboardRes.data.data || {};
            setLeaderboard(data);

            const cats = Object.keys(data);
            setCategories(cats);
            if (cats.length > 0) {
                setActiveCategory(cats[0]);
            }
        } catch (error) {
            console.error('Failed to fetch results:', error);
            toast.error('Failed to load results');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        // Implementation for download/export if needed
        toast.info('Export feature coming soon');
    };

    const getMedalIcon = (rank: number) => {
        if (rank === 1) return <Medal className="w-6 h-6 text-yellow-400" />;
        if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
        if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
        return <span className="w-6 h-6 flex items-center justify-center text-dark-400 font-bold">{rank}</span>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    const currentResults = activeCategory ? leaderboard[activeCategory] || [] : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold">
                        Event <span className="gradient-text">Results</span>
                    </h1>
                    <p className="text-dark-400 mt-1">{eventName}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    {/* Admin/EO specific controls could go here */}
                </div>
            </motion.div>

            {/* Category Tabs */}
            {categories.length > 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap gap-2"
                >
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === cat
                                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                                    : 'bg-dark-800 text-dark-400 hover:bg-dark-700 hover:text-white'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </motion.div>
            ) : (
                <div className="p-8 text-center bg-dark-800 rounded-xl border border-dark-700">
                    <Filter className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white">No Results Yet</h3>
                    <p className="text-dark-400 mt-2">Results have not been imported or published for this event.</p>
                </div>
            )}

            {/* Results Table */}
            {activeCategory && currentResults.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card overflow-hidden border border-dark-700/50"
                >
                    <div className="p-4 border-b border-dark-700 bg-dark-800/50">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-primary-400" />
                            {activeCategory}
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-dark-800/80 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 text-left font-medium text-dark-400">Rank</th>
                                    <th className="px-6 py-4 text-left font-medium text-dark-400">Athlete</th>
                                    <th className="px-6 py-4 text-left font-medium text-dark-400">Club</th>
                                    <th className="px-6 py-4 text-right font-medium text-dark-400">Score</th>
                                    <th className="px-6 py-4 text-right font-medium text-dark-400">10s</th>
                                    <th className="px-6 py-4 text-right font-medium text-dark-400">Xs</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-700">
                                {currentResults.map((result, idx) => (
                                    <tr
                                        key={idx}
                                        className={`group transition-colors ${result.rank <= 3 ? 'bg-gradient-to-r from-primary-500/5 to-transparent' : 'hover:bg-dark-800/50'
                                            }`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {getMedalIcon(result.rank)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-white group-hover:text-primary-400 transition-colors">
                                                {result.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-dark-400">
                                            {result.club}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-lg font-bold text-white tabular-nums">
                                            {result.score}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-dark-400 tabular-nums">
                                            {result.tenCount || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-dark-400 tabular-nums">
                                            {result.xCount || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
