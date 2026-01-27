import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    TrendingUp,
    TrendingDown,
    Target,
    Award,
    Loader2,
    ChevronRight,
    BarChart3,
    Layout,
    Activity
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
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
} from '@dnd-kit/sortable';
import { useAuth, api } from '../../core/contexts/AuthContext';
import { useDashboardLayout } from '../../core/hooks/useDashboardLayout';
import { SortableResizableCard } from '../../core/components/Dashboard/SortableResizableCard';

interface AthletePerformance {
    id: string;
    name: string;
    avatarUrl?: string;
    avgScore: number;
    improvement: number;
    sessions: number;
    lastActive: string;
}

interface TeamStats {
    totalAthletes: number;
    avgTeamScore: number;
    totalSessions: number;
    topPerformer: string;
    improvingCount: number;
    decliningCount: number;
}

interface MonthlyData {
    month: string;
    avgScore: number;
    totalSessions: number;
}

// Mock data
const MOCK_ATHLETES: AthletePerformance[] = [
    { id: '1', name: 'Ahmad Santoso', avgScore: 8.5, improvement: 12.3, sessions: 24, lastActive: '2026-01-12' },
    { id: '2', name: 'Budi Pratama', avgScore: 8.2, improvement: 8.1, sessions: 20, lastActive: '2026-01-11' },
    { id: '3', name: 'Citra Dewi', avgScore: 7.9, improvement: -2.5, sessions: 18, lastActive: '2026-01-10' },
    { id: '4', name: 'Dian Permata', avgScore: 8.8, improvement: 15.2, sessions: 30, lastActive: '2026-01-12' },
    { id: '5', name: 'Eko Wijaya', avgScore: 7.5, improvement: 5.0, sessions: 15, lastActive: '2026-01-08' },
    { id: '6', name: 'Fani Nuraini', avgScore: 8.0, improvement: -1.2, sessions: 22, lastActive: '2026-01-11' },
];

const MOCK_MONTHLY: MonthlyData[] = [
    { month: 'Aug', avgScore: 7.2, totalSessions: 45 },
    { month: 'Sep', avgScore: 7.5, totalSessions: 52 },
    { month: 'Oct', avgScore: 7.8, totalSessions: 48 },
    { month: 'Nov', avgScore: 8.0, totalSessions: 55 },
    { month: 'Dec', avgScore: 8.2, totalSessions: 50 },
    { month: 'Jan', avgScore: 8.4, totalSessions: 35 },
];

const SKILL_DISTRIBUTION = [
    { name: 'Beginner', value: 3, color: '#ef4444' },
    { name: 'Intermediate', value: 8, color: '#f59e0b' },
    { name: 'Advanced', value: 5, color: '#22c55e' },
    { name: 'Elite', value: 2, color: '#3b82f6' },
];

export default function CoachAnalyticsPage() {
    const navigate = useNavigate();
    const { user, originalUser } = useAuth();
    const isSuperAdmin = originalUser?.role === 'SUPER_ADMIN';
    const canEdit = isSuperAdmin || true; // Let everyone personalize their own dashboard

    const [loading, setLoading] = useState(true);
    const [athletes, setAthletes] = useState<AthletePerformance[]>([]);
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [stats, setStats] = useState<TeamStats | null>(null);

    const {
        order: dashboardOrder,
        sizes: dashboardSizes,
        heights: dashboardHeights,
        isResizing,
        isInitialLoad,
        updateOrder,
        toggleSize,
        handleResize,
        saveAsDefault
    } = useDashboardLayout(
        `coach_analytics_${user?.id || 'default'}`,
        ['stats', 'trend', 'activity', 'skill', 'ranking'],
        {
            'stats': 12,
            'trend': 6,
            'activity': 6,
            'skill': 4,
            'ranking': 8
        },
        {
            'stats': 120,
            'trend': 400,
            'activity': 400,
            'skill': 400,
            'ranking': 400
        },
        'coach_analytics'
    );

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        if (!isSuperAdmin) return;
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = dashboardOrder.indexOf(active.id as string);
            const newIndex = dashboardOrder.indexOf(over.id as string);
            updateOrder(arrayMove(dashboardOrder, oldIndex, newIndex));
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Try to fetch real data
                const response = await api.get('/api/v1/coaches/analytics');
                if (response.data) {
                    setAthletes(response.data.athletes || MOCK_ATHLETES);
                    setMonthlyData(response.data.monthly || MOCK_MONTHLY);
                    setStats(response.data.stats || calculateStats(MOCK_ATHLETES));
                }
            } catch (error) {
                console.log('Using mock analytics data');
                setAthletes(MOCK_ATHLETES);
                setMonthlyData(MOCK_MONTHLY);
                setStats(calculateStats(MOCK_ATHLETES));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const calculateStats = (data: AthletePerformance[]): TeamStats => {
        const avgTeamScore = data.reduce((sum, a) => sum + a.avgScore, 0) / data.length;
        const improvingCount = data.filter(a => a.improvement > 0).length;
        const decliningCount = data.filter(a => a.improvement < 0).length;
        const topPerformer = data.reduce((top, a) => a.avgScore > top.avgScore ? a : top, data[0]);

        return {
            totalAthletes: data.length,
            avgTeamScore: parseFloat(avgTeamScore.toFixed(1)),
            totalSessions: data.reduce((sum, a) => sum + a.sessions, 0),
            topPerformer: topPerformer.name,
            improvingCount,
            decliningCount
        };
    };

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-2xl md:text-3xl font-display font-bold">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
                            Team Performance
                        </span> Analytics
                    </h1>
                    <p className="text-dark-400 mt-1">Track and manage your team's shooting performance</p>
                </motion.div>

                {isSuperAdmin && (
                    <button
                        onClick={() => {
                            if (window.confirm('Set this layout as the GLOBAL DEFAULT for all Coaches?')) {
                                saveAsDefault();
                                alert('Standard layout saved successfully!');
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-500/20 text-primary-400 border border-primary-500/30 rounded-xl hover:bg-primary-500/30 transition-all text-sm font-medium"
                    >
                        <Layout className="w-4 h-4" />
                        Set Standard Layout
                    </button>
                )}
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div className="lg:grid lg:grid-cols-12 gap-6 relative">
                    <SortableContext
                        items={dashboardOrder}
                        strategy={verticalListSortingStrategy}
                    >
                        {dashboardOrder.map((id) => {
                            switch (id) {
                                case 'stats':
                                    return (
                                        <SortableResizableCard key="stats" id="stats" canEdit={canEdit} colSpan={dashboardSizes['stats'] || 12} height={dashboardHeights['stats']} onToggleSize={toggleSize} onResize={handleResize} isResizing={isResizing}>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-full content-start">
                                                <StatCard label="Total Athletes" value={stats?.totalAthletes.toString() || '0'} icon={Users} color="bg-blue-500/20 text-blue-400" />
                                                <StatCard label="Team Average" value={stats?.avgTeamScore.toString() || '0'} icon={Target} color="bg-green-500/20 text-green-400" />
                                                <StatCard label="Improving" value={stats?.improvingCount.toString() || '0'} icon={TrendingUp} color="bg-emerald-500/20 text-emerald-400" />
                                                <StatCard label="Need Attention" value={stats?.decliningCount.toString() || '0'} icon={TrendingDown} color="bg-red-500/20 text-red-400" />
                                            </div>
                                        </SortableResizableCard>
                                    );
                                case 'trend':
                                    return (
                                        <SortableResizableCard key="trend" id="trend" canEdit={canEdit} colSpan={dashboardSizes['trend'] || 6} height={dashboardHeights['trend']} onToggleSize={toggleSize} onResize={handleResize} isResizing={isResizing}>
                                            <div className="card p-6 h-full flex flex-col">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div>
                                                        <h2 className="text-lg font-semibold text-white">Team Score Trend</h2>
                                                        <p className="text-sm text-dark-400">Average score over time</p>
                                                    </div>
                                                    <BarChart3 className="w-5 h-5 text-dark-400" />
                                                </div>
                                                <div className="flex-1 min-h-0">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <LineChart data={monthlyData}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                                            <XAxis dataKey="month" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                                            <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                                                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} labelStyle={{ color: '#fff' }} />
                                                            <Line type="monotone" dataKey="avgScore" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', r: 5 }} name="Average Score" />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </SortableResizableCard>
                                    );
                                case 'activity':
                                    return (
                                        <SortableResizableCard key="activity" id="activity" canEdit={canEdit} colSpan={dashboardSizes['activity'] || 6} height={dashboardHeights['activity']} onToggleSize={toggleSize} onResize={handleResize} isResizing={isResizing}>
                                            <div className="card p-6 h-full flex flex-col">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div>
                                                        <h2 className="text-lg font-semibold text-white">Training Activity</h2>
                                                        <p className="text-sm text-dark-400">Sessions per month</p>
                                                    </div>
                                                    <Activity className="w-5 h-5 text-dark-400" />
                                                </div>
                                                <div className="flex-1 min-h-0">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={monthlyData}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                                            <XAxis dataKey="month" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                                            <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} labelStyle={{ color: '#fff' }} />
                                                            <Bar dataKey="totalSessions" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Sessions" />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </SortableResizableCard>
                                    );
                                case 'skill':
                                    return (
                                        <SortableResizableCard key="skill" id="skill" canEdit={canEdit} colSpan={dashboardSizes['skill'] || 4} height={dashboardHeights['skill']} onToggleSize={toggleSize} onResize={handleResize} isResizing={isResizing}>
                                            <div className="card p-6 h-full flex flex-col">
                                                <h2 className="text-lg font-semibold text-white mb-4">Skill Distribution</h2>
                                                <div className="flex-1 min-h-0">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie data={SKILL_DISTRIBUTION} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5}>
                                                                {SKILL_DISTRIBUTION.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} labelStyle={{ color: '#fff' }} />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                                                    {SKILL_DISTRIBUTION.map(item => (
                                                        <div key={item.name} className="flex items-center gap-1 text-xs">
                                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                                                            <span className="text-dark-400">{item.name} ({item.value})</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </SortableResizableCard>
                                    );
                                case 'ranking':
                                    return (
                                        <SortableResizableCard key="ranking" id="ranking" canEdit={canEdit} colSpan={dashboardSizes['ranking'] || 8} height={dashboardHeights['ranking']} onToggleSize={toggleSize} onResize={handleResize} isResizing={isResizing}>
                                            <div className="card h-full flex flex-col overflow-hidden">
                                                <div className="p-4 border-b border-dark-700 flex items-center justify-between">
                                                    <div>
                                                        <h2 className="text-lg font-semibold text-white">Athlete Rankings</h2>
                                                        <p className="text-sm text-dark-400">By average score</p>
                                                    </div>
                                                    <Award className="w-5 h-5 text-yellow-500" />
                                                </div>
                                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                                    <div className="divide-y divide-dark-700">
                                                        {[...athletes].sort((a, b) => b.avgScore - a.avgScore).slice(0, 10).map((athlete, index) => (
                                                            <div
                                                                key={athlete.id}
                                                                className="p-4 flex items-center justify-between hover:bg-dark-800/50 transition-colors cursor-pointer"
                                                                onClick={() => navigate(`/athletes/${athlete.id}`)}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-500 text-black' :
                                                                        index === 1 ? 'bg-gray-400 text-black' :
                                                                            index === 2 ? 'bg-orange-600 text-white' :
                                                                                'bg-dark-700 text-dark-300'
                                                                        }`}>
                                                                        {index + 1}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-medium text-white">{athlete.name}</div>
                                                                        <div className="text-sm text-dark-400">{athlete.sessions} sessions</div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <div className="text-right">
                                                                        <div className="font-bold text-white">{athlete.avgScore}</div>
                                                                        <div className={`text-xs flex items-center gap-1 ${athlete.improvement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                                            {athlete.improvement >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                                            {Math.abs(athlete.improvement)}%
                                                                        </div>
                                                                    </div>
                                                                    <ChevronRight className="w-4 h-4 text-dark-500" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
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

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
    return (
        <div className="card p-4">
            <div className={`w-10 h-10 rounded-lg ${color.split(' ')[0]} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color.split(' ')[1]}`} />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-sm text-dark-400">{label}</div>
        </div>
    );
}
