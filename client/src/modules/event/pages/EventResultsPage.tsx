import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Trophy,
    Medal,
    Users,
    Download,
    Loader2,
    Filter
} from 'lucide-react';
import { api } from '../../core/contexts/AuthContext';
import { toast } from 'react-toastify';

interface Result {
    rank: number;
    name: string;
    club: string;
    score: number;
    xCount: number;
    tenCount: number;
    registrationId?: string;
}

export default function EventResultsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(!!id);
    const [eventName, setEventName] = useState('Event Results');

    // Data structure: { "Category Name": [Result, Result...] }
    const [leaderboard, setLeaderboard] = useState<Record<string, Result[]>>({});
    const [categories, setCategories] = useState<string[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('');

    // Mock Events for List View
    const mockEvents = [
        { id: '1', name: 'Winter Archery Open 2025', date: 'Jan 15, 2026', location: 'Jakarta', status: 'Final' },
        { id: '2', name: 'Club Championship Series A', date: 'Jan 20, 2026', location: 'Bandung', status: 'Live' },
    ];

    useEffect(() => {
        if (id) {
            fetchData(id);
        } else {
            setLoading(false);
        }
    }, [id]);

    const fetchData = async (eventId: string) => {
        setLoading(true);
        try {
            // Parallel fetch: Event Details (for name) + Leaderboard
            // For now, if mock ID, just simulate data
            if (eventId === '1' || eventId === '2') {
                await new Promise(r => setTimeout(r, 1000));
                setEventName(eventId === '1' ? 'Winter Archery Open 2025' : 'Club Championship Series A');
                setLeaderboard({
                    'Recurve Men': [
                        { rank: 1, name: 'John Doe', club: 'Jaya Archery', score: 285, tenCount: 15, xCount: 5, registrationId: 'mock-reg-1' },
                        { rank: 2, name: 'Jane Smith', club: 'Focus Club', score: 280, tenCount: 12, xCount: 4, registrationId: 'mock-reg-2' },
                    ],
                    'Compound Women': [
                        { rank: 1, name: 'Alice Wonder', club: 'Elite Squad', score: 295, tenCount: 25, xCount: 10 },
                    ]
                });
                setCategories(['Recurve Men', 'Compound Women']);
                setActiveCategory('Recurve Men');
            } else {
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
            }
        } catch (error) {
            console.error('Failed to fetch results:', error);
            // toast.error('Failed to load results'); // Suppress for now
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

    // LIST VIEW (No ID)
    if (!id) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-display font-bold">
                            Event <span className="gradient-text">Results</span>
                        </h1>
                        <p className="text-dark-400 mt-1">Select an event to view official results.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mockEvents.map(event => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => navigate(`/event-results/${event.id}`)}
                            className="card p-6 cursor-pointer hover:border-primary-500/50 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`px-2 py-1 rounded text-xs font-bold ${event.status === 'Live' ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-green-500/20 text-green-500'}`}>
                                    {event.status}
                                </div>
                                <Trophy className="w-5 h-5 text-dark-600 group-hover:text-primary-500 transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 group-hover:text-primary-400 transition-colors">{event.name}</h3>
                            <div className="text-sm text-dark-400 space-y-1">
                                <p>{event.date}</p>
                                <p>{event.location}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
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
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/event-results')} className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                        <Filter className="w-5 h-5 rotate-90" /> {/* Using Filter as back icon placeholder or ChevronLeft if available */}
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-display font-bold">
                            {eventName}
                        </h1>
                        <p className="text-dark-400 mt-1">Official Results</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
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
                                    <th className="px-6 py-4 text-center font-medium text-dark-400">Certificate</th>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {result.registrationId ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/certificates/registration/${result.registrationId}/download`, '_blank');
                                                    }}
                                                    className="p-1.5 hover:bg-primary-500/20 text-primary-500 rounded-md transition-colors"
                                                    title="Download Certificate"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <span className="text-dark-600">-</span>
                                            )}
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
