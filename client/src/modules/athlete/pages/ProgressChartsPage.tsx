import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Target,
    Loader2,
    Activity,
    Award
} from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Legend
} from 'recharts';
import { api } from '../../core/contexts/AuthContext';

// Types matching backend response
interface AnalyticsData {
    summary: {
        totalSessions: number;
        totalArrows: number;
        overallAverage: string;
        consistency: string;
        bestScore: number;
        attendanceCount: number;
    };
    progression: {
        date: string;
        average: number;
        total: number;
        distance: number;
    }[];
    byDistance: {
        distance: number;
        avgScore: string;
        sessions: number;
    }[];
    scoreDistribution: {
        name: string;
        value: number;
        fill: string;
    }[];
    skillAnalysis: {
        subject: string;
        A: number;
        fullMark: number;
    }[];
    recentScores: {
        date: string;
        total: number;
        average: string;
        distance: number;
    }[];
}


export default function ProgressChartsPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [period, setPeriod] = useState<'30' | '90' | '365'>('30');

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/analytics/my-progress?period=${period}`);
                if (response.data.success) {
                    setData(response.data.data);
                } else {
                    setData(null);
                }
            } catch (error) {
                console.error("Failed to fetch analytics", error);
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [period]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="card p-12 text-center border-dashed border-dark-600">
                <Target className="w-16 h-16 mx-auto mb-4 text-dark-600" />
                <h3 className="text-xl font-medium text-white mb-2">No Performance Data</h3>
                <p className="text-dark-400">
                    Start recording your scoring sessions to see your progress charts!
                </p>
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
                        <span className="gradient-text">Performance Analytics</span>
                    </h1>
                    <p className="text-dark-400 mt-1">
                        Track your progress and improve your game
                    </p>
                </div>

                <div className="flex bg-dark-800 rounded-lg p-1 border border-dark-700">
                    <button
                        onClick={() => setPeriod('30')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${period === '30' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' : 'text-dark-400 hover:text-white'}`}
                    >
                        Month
                    </button>
                    <button
                        onClick={() => setPeriod('90')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${period === '90' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' : 'text-dark-400 hover:text-white'}`}
                    >
                        Quarter
                    </button>
                    <button
                        onClick={() => setPeriod('365')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${period === '365' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' : 'text-dark-400 hover:text-white'}`}
                    >
                        Year
                    </button>
                </div>
            </motion.div>

            {/* Summary Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
                <div className="card p-4 bg-gradient-to-br from-dark-800 to-dark-900 border-dark-700">
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                            <Activity className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <h3 className="text-2xl font-bold">{data.summary.totalSessions}</h3>
                        <p className="text-sm text-dark-400 mt-1">Total Sessions</p>
                    </div>
                </div>

                <div className="card p-4 bg-gradient-to-br from-dark-800 to-dark-900 border-dark-700">
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                            <Target className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <h3 className="text-2xl font-bold">{Number(data.summary.totalArrows).toLocaleString()}</h3>
                        <p className="text-sm text-dark-400 mt-1">Arrows Shot</p>
                    </div>
                </div>

                <div className="card p-4 bg-gradient-to-br from-dark-800 to-dark-900 border-dark-700">
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <h3 className="text-2xl font-bold">{data.summary.overallAverage}</h3>
                        <p className="text-sm text-dark-400 mt-1">Average Score</p>
                    </div>
                </div>

                <div className="card p-4 bg-gradient-to-br from-dark-800 to-dark-900 border-dark-700">
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                            <Award className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">PB!</span>
                    </div>
                    <div className="mt-3">
                        <h3 className="text-2xl font-bold">{data.summary.bestScore}</h3>
                        <p className="text-sm text-dark-400 mt-1">Best Session</p>
                    </div>
                </div>
            </motion.div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Score Progression */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card p-6 border-dark-700 bg-dark-800/50"
                >
                    <h2 className="text-lg font-bold mb-6">Score Progression</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.progression}>
                                <defs>
                                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#6b7280"
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#6b7280"
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    domain={['auto', 'auto']}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="average"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fill="url(#scoreGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Score Distribution */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card p-6 border-dark-700 bg-dark-800/50"
                >
                    <h2 className="text-lg font-bold mb-6">Score Distribution</h2>
                    <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.scoreDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.scoreDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Performance by Distance */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="card p-6 border-dark-700 bg-dark-800/50"
                >
                    <h2 className="text-lg font-bold mb-6">Performance by Distance</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.byDistance}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis
                                    dataKey="distance"
                                    stroke="#6b7280"
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    tickFormatter={(val) => `${val}m`}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#6b7280"
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: '#374151', opacity: 0.4 }}
                                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="avgScore" name="Avg Score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Skill Analysis */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="card p-6 border-dark-700 bg-dark-800/50"
                >
                    <h2 className="text-lg font-bold mb-6">Skill Analysis</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.skillAnalysis}>
                                <PolarGrid stroke="#374151" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Skill Level"
                                    dataKey="A"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    fill="#3b82f6"
                                    fillOpacity={0.3}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
