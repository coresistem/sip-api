import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Trophy,
    Medal,
    Award,
    Star,
    Calendar,
    MapPin,
    Target,
    Loader2,
    Filter,
    ChevronDown
} from 'lucide-react';
import { api } from '../../core/contexts/AuthContext';

interface Achievement {
    id: string;
    title: string;
    eventName: string;
    eventType: 'REGIONAL' | 'PROVINCIAL' | 'NATIONAL' | 'INTERNATIONAL' | 'CLUB';
    date: string;
    venue: string;
    position: number; // 1 = gold, 2 = silver, 3 = bronze, 0 = participation
    category: string; // e.g., "Recurve - Senior - 70m"
    score?: number;
    maxScore?: number;
}



const getMedalColor = (position: number) => {
    switch (position) {
        case 1: return 'from-yellow-500 to-amber-600'; // Gold
        case 2: return 'from-gray-300 to-gray-400'; // Silver
        case 3: return 'from-orange-600 to-orange-700'; // Bronze
        default: return 'from-blue-500 to-blue-600'; // Participation
    }
};

const getMedalIcon = (position: number) => {
    switch (position) {
        case 1: return Trophy;
        case 2: return Medal;
        case 3: return Award;
        default: return Star;
    }
};

const getMedalLabel = (position: number) => {
    switch (position) {
        case 1: return 'GOLD';
        case 2: return 'SILVER';
        case 3: return 'BRONZE';
        default: return 'PARTICIPANT';
    }
};

const getEventTypeColor = (type: string) => {
    switch (type) {
        case 'INTERNATIONAL': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
        case 'NATIONAL': return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'PROVINCIAL': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        case 'REGIONAL': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        default: return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
};

export default function AchievementsPage() {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('ALL');
    const [filterOpen, setFilterOpen] = useState(false);

    useEffect(() => {
        const fetchAchievements = async () => {
            setLoading(true);
            try {
                const response = await api.get('/athletes/achievements');
                setAchievements(response.data || []);
            } catch (error) {
                console.error('Failed to fetch achievements:', error);
                setAchievements([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAchievements();
    }, []);

    const filteredAchievements = filterType === 'ALL'
        ? achievements
        : achievements.filter(a => a.eventType === filterType);

    // Statistics
    const goldCount = achievements.filter(a => a.position === 1).length;
    const silverCount = achievements.filter(a => a.position === 2).length;
    const bronzeCount = achievements.filter(a => a.position === 3).length;
    const totalEvents = achievements.length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

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
                        <span className="gradient-text">Achievements</span>
                    </h1>
                    <p className="text-dark-400 mt-1">
                        Your competition medals and achievements
                    </p>
                </div>

                {/* Filter */}
                <div className="relative">
                    <button
                        onClick={() => setFilterOpen(!filterOpen)}
                        className="flex items-center gap-2 px-4 py-2 bg-dark-800 rounded-lg border border-dark-700 hover:border-dark-600 transition-colors"
                    >
                        <Filter className="w-4 h-4" />
                        <span>{filterType === 'ALL' ? 'All Events' : filterType}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {filterOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-dark-800 rounded-lg border border-dark-700 shadow-xl z-10">
                            {['ALL', 'INTERNATIONAL', 'NATIONAL', 'PROVINCIAL', 'REGIONAL', 'CLUB'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => { setFilterType(type); setFilterOpen(false); }}
                                    className={`w-full px-4 py-2 text-left hover:bg-dark-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${filterType === type ? 'text-primary-400 bg-dark-700/50' : 'text-white'
                                        }`}
                                >
                                    {type === 'ALL' ? 'All Events' : type}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Medal Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
                <div className="card p-4 text-center bg-gradient-to-br from-yellow-500/10 to-amber-600/10 border-yellow-500/20">
                    <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                    <div className="text-2xl font-bold text-yellow-500">{goldCount}</div>
                    <div className="text-sm text-dark-400">Gold Medals</div>
                </div>
                <div className="card p-4 text-center bg-gradient-to-br from-gray-300/10 to-gray-400/10 border-gray-400/20">
                    <Medal className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <div className="text-2xl font-bold text-gray-400">{silverCount}</div>
                    <div className="text-sm text-dark-400">Silver Medals</div>
                </div>
                <div className="card p-4 text-center bg-gradient-to-br from-orange-600/10 to-orange-700/10 border-orange-600/20">
                    <Award className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                    <div className="text-2xl font-bold text-orange-500">{bronzeCount}</div>
                    <div className="text-sm text-dark-400">Bronze Medals</div>
                </div>
                <div className="card p-4 text-center bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
                    <Target className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold text-blue-500">{totalEvents}</div>
                    <div className="text-sm text-dark-400">Total Events</div>
                </div>
            </motion.div>

            {/* Achievement Cards */}
            <div className="space-y-4">
                {filteredAchievements.length === 0 ? (
                    <div className="card p-12 text-center border-dashed border-dark-600">
                        <Trophy className="w-16 h-16 mx-auto mb-4 text-dark-600" />
                        <h3 className="text-xl font-medium text-white mb-2">No Achievements Yet</h3>
                        <p className="text-dark-400">
                            Participate in competitions to earn medals and achievements!
                        </p>
                    </div>
                ) : (
                    filteredAchievements.map((achievement, index) => {
                        const MedalIcon = getMedalIcon(achievement.position);
                        return (
                            <motion.div
                                key={achievement.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="card p-4 hover:border-dark-600 transition-all group"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Medal Badge */}
                                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getMedalColor(achievement.position)} flex items-center justify-center shadow-lg flex-shrink-0`}>
                                        <MedalIcon className="w-8 h-8 text-white" />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                                                    {achievement.title}
                                                </h3>
                                                <p className="text-dark-400 mt-1">
                                                    {achievement.eventName}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded border ${getEventTypeColor(achievement.eventType)}`}>
                                                {achievement.eventType}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-dark-400">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(achievement.date).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                <span>{achievement.venue}</span>
                                            </div>
                                            {achievement.score && (
                                                <div className="flex items-center gap-1">
                                                    <Target className="w-4 h-4" />
                                                    <span>{achievement.score}/{achievement.maxScore} pts</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-xs text-dark-500 bg-dark-800 px-2 py-1 rounded">
                                                {achievement.category}
                                            </span>
                                            <span className={`text-xs font-bold px-2 py-1 rounded bg-gradient-to-r ${getMedalColor(achievement.position)} text-white`}>
                                                {getMedalLabel(achievement.position)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
