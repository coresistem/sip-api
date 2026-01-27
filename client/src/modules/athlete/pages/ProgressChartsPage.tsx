import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Target,
    Loader2,
    Activity,
    Award,
    Zap,
    Settings2
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
import { api, useAuth } from '../../core/contexts/AuthContext';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    rectSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Maximize2, Minimize2 } from 'lucide-react';
import { SortableResizableCard } from '../../core/components/Dashboard/SortableResizableCard';
import { useDashboardLayout } from '../../core/hooks/useDashboardLayout';

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

interface ChartItem {
    id: string;
    title: string;
}

export default function ProgressChartsPage() {
    const { user } = useAuth();
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'30' | '90' | '365'>('30');
    const [configHistory, setConfigHistory] = useState<any[]>([]);

    const {
        order: chartOrder,
        sizes: chartSizes,
        heights: chartHeights,
        isResizing,
        updateOrder,
        toggleSize,
        handleResize
    } = useDashboardLayout(
        'athlete_charts',
        ['progression', 'distribution', 'distance', 'skills', 'index-trend'],
        {
            'progression': 6,
            'distribution': 6,
            'distance': 6,
            'skills': 6,
            'index-trend': 12
        },
        {
            'progression': 320,
            'distribution': 320,
            'distance': 320,
            'skills': 320,
            'index-trend': 450
        }
    );

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        if (!isSuperAdmin) return;
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = chartOrder.indexOf(active.id as string);
            const newIndex = chartOrder.indexOf(over.id as string);
            updateOrder(arrayMove(chartOrder, oldIndex, newIndex));
        }
    };

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const [analyticsRes, configRes] = await Promise.all([
                    api.get(`/analytics/my-progress?period=${period}`),
                    api.get(`/config/history?period=${period}`)
                ]);

                if (analyticsRes.data.success) {
                    setData(analyticsRes.data.data);
                }
                if (configRes.data.success) {
                    setConfigHistory(configRes.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch analytics or config history", error);
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

    // If data is null, we'll show empty states within the layout instead of returning early
    const hasData = !!data;

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
                        <h3 className="text-2xl font-bold">{data?.summary.totalSessions ?? 0}</h3>
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
                        <h3 className="text-2xl font-bold">{Number(data?.summary.totalArrows ?? 0).toLocaleString()}</h3>
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
                        <h3 className="text-2xl font-bold">{data?.summary.overallAverage ?? '0.0'}</h3>
                        <p className="text-sm text-dark-400 mt-1">Average Score</p>
                    </div>
                </div>

                <div className="card p-4 bg-gradient-to-br from-dark-800 to-dark-900 border-dark-700">
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                            <Award className="w-5 h-5" />
                        </div>
                        {data && <span className="text-xs font-medium text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">PB!</span>}
                    </div>
                    <div className="mt-3">
                        <h3 className="text-2xl font-bold">{data?.summary.bestScore ?? 0}</h3>
                        <p className="text-sm text-dark-400 mt-1">Best Session</p>
                    </div>
                </div>
            </motion.div>

            {/* Charts Grid - Wrapped in DndContext */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <SortableContext
                        items={chartOrder}
                        strategy={rectSortingStrategy}
                    >
                        {chartOrder.map((chartId) => {
                            switch (chartId) {
                                case 'progression':
                                    return (
                                        <SortableResizableCard key="progression" id="progression" isSuperAdmin={isSuperAdmin} colSpan={chartSizes['progression'] || 6} height={chartHeights['progression']} onToggleSize={toggleSize} onResize={handleResize} isResizing={isResizing}>
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="card p-6 border-dark-700 bg-dark-800/50 h-full flex flex-col"
                                            >
                                                <h2 className="text-lg font-bold mb-6">Score Progression</h2>
                                                <div className="flex-1 w-full relative">
                                                    {data?.progression && data.progression.length > 0 ? (
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
                                                    ) : (
                                                        <div className="h-full flex items-center justify-center text-dark-500 text-sm italic">
                                                            No progression data available
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        </SortableResizableCard>
                                    );
                                case 'distribution':
                                    return (
                                        <SortableResizableCard key="distribution" id="distribution" isSuperAdmin={isSuperAdmin} colSpan={chartSizes['distribution'] || 6} height={chartHeights['distribution']} onToggleSize={toggleSize} onResize={handleResize} isResizing={isResizing}>
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 }}
                                                className="card p-6 border-dark-700 bg-dark-800/50 h-full flex flex-col"
                                            >
                                                <h2 className="text-lg font-bold mb-6">Score Distribution</h2>
                                                <div className="flex-1 w-full flex items-center justify-center relative">
                                                    {data?.scoreDistribution && data.scoreDistribution.length > 0 ? (
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
                                                    ) : (
                                                        <div className="text-dark-500 text-sm italic">No distribution data available</div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        </SortableResizableCard>
                                    );
                                case 'distance':
                                    return (
                                        <SortableResizableCard key="distance" id="distance" isSuperAdmin={isSuperAdmin} colSpan={chartSizes['distance'] || 6} height={chartHeights['distance']} onToggleSize={toggleSize} onResize={handleResize} isResizing={isResizing}>
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4 }}
                                                className="card p-6 border-dark-700 bg-dark-800/50 h-full flex flex-col"
                                            >
                                                <h2 className="text-lg font-bold mb-6">Performance by Distance</h2>
                                                <div className="flex-1 w-full relative">
                                                    {data?.byDistance && data.byDistance.length > 0 ? (
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
                                                    ) : (
                                                        <div className="h-full flex items-center justify-center text-dark-500 text-sm italic">
                                                            No distance data available
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        </SortableResizableCard>
                                    );
                                case 'skills':
                                    return (
                                        <SortableResizableCard key="skills" id="skills" isSuperAdmin={isSuperAdmin} colSpan={chartSizes['skills'] || 6} height={chartHeights['skills']} onToggleSize={toggleSize} onResize={handleResize} isResizing={isResizing}>
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5 }}
                                                className="card p-6 border-dark-700 bg-dark-800/50 h-full flex flex-col"
                                            >
                                                <h2 className="text-lg font-bold mb-6">Skill Analysis</h2>
                                                <div className="flex-1 w-full relative">
                                                    {data?.skillAnalysis && data.skillAnalysis.length > 0 ? (
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
                                                    ) : (
                                                        <div className="h-full flex items-center justify-center text-dark-500 text-sm italic">
                                                            No skill data available
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        </SortableResizableCard>
                                    );
                                case 'index-trend':
                                    return (
                                        <SortableResizableCard key="index-trend" id="index-trend" isSuperAdmin={isSuperAdmin} colSpan={chartSizes['index-trend'] || 12} height={chartHeights['index-trend']} onToggleSize={toggleSize} onResize={handleResize} isResizing={isResizing}>
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.6 }}
                                                className="card p-6 border-dark-700 bg-dark-800/50 relative overflow-hidden group/card h-full flex flex-col"
                                            >
                                                {/* Decorative Background Icon */}
                                                <div className="absolute -top-6 -right-6 p-8 opacity-5 group-hover/card:opacity-10 transition-opacity">
                                                    <Zap className="w-48 h-48 text-amber-500" />
                                                </div>

                                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 relative z-10 gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl text-amber-500 border border-amber-500/20 shadow-lg shadow-amber-500/10">
                                                            <Zap className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h2 className="text-xl font-bold text-white tracking-tight">Index Arrow Trend</h2>
                                                            <p className="text-xs text-dark-400 font-medium">Metric Index tracking equipment stability vs performance</p>
                                                        </div>
                                                    </div>

                                                    {configHistory.length > 0 && (
                                                        <div className="flex gap-4 px-4 py-2 bg-dark-900/50 rounded-lg border border-dark-700/50">
                                                            <div className="text-center">
                                                                <div className="text-[10px] uppercase tracking-wider text-dark-500 font-bold">Latest Index</div>
                                                                <div className="text-lg font-display font-bold text-amber-400">
                                                                    {configHistory[configHistory.length - 1].indexArrowScore.toFixed(2)}
                                                                </div>
                                                            </div>
                                                            <div className="w-px h-8 bg-dark-700 my-auto"></div>
                                                            <div className="text-center">
                                                                <div className="text-[10px] uppercase tracking-wider text-dark-500 font-bold">Avg Stability</div>
                                                                <div className="text-lg font-display font-bold text-white">
                                                                    {(configHistory.reduce((a, b) => a + b.indexArrowScore, 0) / configHistory.length).toFixed(2)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 w-full relative z-10">
                                                    {(configHistory.length > 0 ? configHistory : MOCK_HISTORY).length > 0 ? (
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <AreaChart data={configHistory.length > 0 ? configHistory : MOCK_HISTORY} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                                <defs>
                                                                    <linearGradient id="indexGradient" x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                                                    </linearGradient>
                                                                    <filter id="shadow" height="200%">
                                                                        <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
                                                                        <feOffset in="blur" dx="0" dy="4" result="offsetBlur" />
                                                                        <feMerge>
                                                                            <feMergeNode in="offsetBlur" />
                                                                            <feMergeNode in="SourceGraphic" />
                                                                        </feMerge>
                                                                    </filter>
                                                                </defs>
                                                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.3} />
                                                                <XAxis
                                                                    dataKey="createdAt"
                                                                    stroke="#4b5563"
                                                                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                                                                    tickFormatter={(date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                                    tickLine={false}
                                                                    axisLine={false}
                                                                    dy={10}
                                                                />
                                                                <YAxis
                                                                    stroke="#4b5563"
                                                                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                                                                    domain={['auto', 'auto']}
                                                                    tickLine={false}
                                                                    axisLine={false}
                                                                    tickFormatter={(val) => val.toFixed(1)}
                                                                />
                                                                <Tooltip
                                                                    cursor={{ stroke: '#f59e0b', strokeWidth: 1, strokeDasharray: '5 5' }}
                                                                    contentStyle={{
                                                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                                                        backdropFilter: 'blur(8px)',
                                                                        border: '1px solid rgba(245, 158, 11, 0.2)',
                                                                        borderRadius: '16px',
                                                                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                                                                        padding: '12px'
                                                                    }}
                                                                    itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
                                                                    labelStyle={{ color: '#9ca3af', marginBottom: '4px', fontSize: '11px' }}
                                                                    labelFormatter={(date) => new Date(date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                                                />
                                                                <Area
                                                                    type="monotone"
                                                                    dataKey="indexArrowScore"
                                                                    name="Index Score"
                                                                    stroke="#f59e0b"
                                                                    strokeWidth={4}
                                                                    fill="url(#indexGradient)"
                                                                    filter="url(#shadow)"
                                                                    animationDuration={2500}
                                                                    activeDot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                                                                />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    ) : (
                                                        <div className="h-full flex flex-col items-center justify-center text-dark-500 bg-dark-900/20 rounded-2xl border border-dashed border-dark-800">
                                                            <div className="p-4 bg-dark-800/50 rounded-full mb-4">
                                                                <Settings2 className="w-10 h-10 opacity-20" />
                                                            </div>
                                                            <p className="text-sm font-medium">No equipment configuration logs found for this period.</p>
                                                            <p className="text-xs text-dark-600 mt-1 text-center max-w-[200px]">Save your setup on the Scoring page to track Index Arrow stability.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        </SortableResizableCard>
                                    );
                                default:
                                    return null;
                            }
                        })}
                    </SortableContext>
                </div>
            </DndContext>
        </div>
    );
}
// Demo Mock Data
const MOCK_HISTORY = [
    { createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), indexArrowScore: 7.2 },
    { createdAt: new Date(Date.now() - 86400000 * 8).toISOString(), indexArrowScore: 7.5 },
    { createdAt: new Date(Date.now() - 86400000 * 6).toISOString(), indexArrowScore: 7.1 },
    { createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), indexArrowScore: 8.2 },
    { createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), indexArrowScore: 7.9 },
    { createdAt: new Date().toISOString(), indexArrowScore: 8.5 },
];
