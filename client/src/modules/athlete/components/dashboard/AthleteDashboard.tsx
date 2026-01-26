import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Target,
    Calendar,
    TrendingUp,
    Award,
    Clock,
    ChevronRight,
    Zap,
    Activity,
    Loader2,
    ArrowUpRight,
    ArrowDownRight,
    Minus
} from 'lucide-react';
import { api } from '../../../core/contexts/AuthContext';
import DailyWellnessModal from '../../features/science/components/DailyWellnessModal';
import ACWRChart from '../../features/science/components/ACWRChart';
import ShotDistributionChart from '../../features/science/components/ShotDistributionChart';
import ConsistencyTrend from '../../features/science/components/ConsistencyTrend';
import HeartRateChart from '../../features/science/components/HeartRateChart';
import LevelProgressBar from '../../features/gamification/components/LevelProgressBar';
import BadgeShowcase from '../../features/gamification/components/BadgeShowcase';

interface ScoreSession {
    id: string;
    sessionDate: string;
    distance: number;
    totalSum: number;
    arrowCount: number;
    average: number;
    tensCount: number;
}

interface UpcomingSchedule {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    venue?: string;
}

interface AthleteStats {
    totalSessions: number;
    totalArrows: number;
    averageScore: number;
    bestSession: number;
    improvement: number; // percentage
}

const AthleteDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [recentScores, setRecentScores] = useState<ScoreSession[]>([]);
    const [upcomingSchedules, setUpcomingSchedules] = useState<UpcomingSchedule[]>([]);
    const [stats, setStats] = useState<AthleteStats | null>(null);

    // ACWR & Wellness State
    const [acwrData, setAcwrData] = useState<any[]>([]);
    const [showWellnessModal, setShowWellnessModal] = useState(false);
    const [acwrRatio, setAcwrRatio] = useState<number | null>(null);
    const [shotAnalysis, setShotAnalysis] = useState<any>(null);
    const [scoreDist, setScoreDist] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'tech' | 'physio'>('overview');

    // Gamification State
    const [gamification, setGamification] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch User Profile to get ID
                const userRes = await api.get('/auth/me');
                const athleteId = userRes.data.data.athlete?.id;

                if (!athleteId) {
                    setLoading(false);
                    return;
                }

                const [scoresRes, schedulesRes, gamificationRes] = await Promise.all([
                    api.get('/scores/my-scores?limit=5'),
                    api.get('/schedules?upcoming=true&limit=3'),
                    api.get(`/athletes/${athleteId}/gamification`)
                ]);

                if (gamificationRes.data.success) {
                    setGamification(gamificationRes.data.data);
                }

                if (scoresRes.data.success) {
                    const scores = scoresRes.data.data || [];
                    setRecentScores(scores);

                    if (scores.length > 0) {
                        const totalArrows = scores.reduce((sum: number, s: ScoreSession) => sum + s.arrowCount, 0);
                        const avgScore = scores.reduce((sum: number, s: ScoreSession) => sum + s.average, 0) / scores.length;
                        const bestSession = Math.max(...scores.map((s: ScoreSession) => s.average));

                        let improvement = 0;
                        if (scores.length >= 2) {
                            const oldest = scores[scores.length - 1].average;
                            const newest = scores[0].average;
                            improvement = oldest > 0 ? ((newest - oldest) / oldest) * 100 : 0;
                        }

                        setStats({
                            totalSessions: scores.length,
                            totalArrows,
                            averageScore: avgScore,
                            bestSession,
                            improvement
                        });
                    }
                }

                if (schedulesRes.data.success) {
                    setUpcomingSchedules(schedulesRes.data.data || []);
                }

                // Fetch ACWR Data
                try {
                    const acwrRes = await api.get(`/analytics/acwr/${athleteId}`);
                    if (acwrRes.data.success) {
                        const { logs, acwr } = acwrRes.data.data;

                        const chartData = logs.map((log: any) => ({
                            date: new Date(log.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
                            acuteLoad: log.load,
                            chronicLoad: log.load, // Simplified for now
                            acwr: 0
                        }));

                        setAcwrData(chartData);
                        setAcwrRatio(acwr);

                        const today = new Date().toISOString().split('T')[0];
                        const hasLoggedToday = logs.some((l: any) => l.date === today);

                        if (!hasLoggedToday) {
                            setTimeout(() => setShowWellnessModal(true), 1500);
                        }
                    }

                    // Fetch Shot Analytics (using the my-progress endpoint logic primarily, but here we reuse the analytics route)
                    const progressRes = await api.get('/analytics/my-progress');
                    if (progressRes.data.success) {
                        setShotAnalysis(progressRes.data.data.shotAnalysis);
                        setScoreDist(progressRes.data.data?.scoreDistribution ? [progressRes.data.data.scoreDistribution] : []);
                    }

                } catch (e) {
                    console.error("Failed to load analytics", e);
                }

            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickAction
                    icon={Target}
                    label="Start Scoring"
                    color="primary"
                    onClick={() => navigate('/scoring')}
                />
                <QuickAction
                    icon={Activity}
                    label="Bleep Test"
                    color="emerald"
                    onClick={() => navigate('/training/bleep-test')}
                />
                <QuickAction
                    icon={Calendar}
                    label="View Schedule"
                    color="amber"
                    onClick={() => navigate('/schedules')}
                />
                <QuickAction
                    icon={Award}
                    label="My Profile"
                    color="purple"
                    onClick={() => navigate('/profile')}
                />
            </div>

            {/* Main Tabs */}
            <div className="flex gap-4 border-b border-dark-700">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === 'overview' ? 'text-primary-500' : 'text-dark-400 hover:text-white'}`}
                >
                    Overview
                    {activeTab === 'overview' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />}
                </button>
                <button
                    onClick={() => setActiveTab('tech')}
                    className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === 'tech' ? 'text-primary-500' : 'text-dark-400 hover:text-white'}`}
                >
                    Tech Analysis
                    {activeTab === 'tech' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />}
                </button>
                <button
                    onClick={() => setActiveTab('physio')}
                    className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === 'physio' ? 'text-primary-500' : 'text-dark-400 hover:text-white'}`}
                >
                    Physiology
                    {activeTab === 'physio' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />}
                </button>
            </div>

            {/* TAB CONTENT */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        {/* Gamification Progress */}
                        {gamification && (
                            <LevelProgressBar
                                level={gamification.level}
                                currentXP={gamification.xp}
                                nextLevelXP={gamification.nextLevelXP}
                                prevLevelXP={gamification.prevLevelXP}
                            />
                        )}

                        {/* Stats Cards */}
                        {stats && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <StatCard
                                    label="Avg Score"
                                    value={stats.averageScore.toFixed(1)}
                                    icon={Target}
                                    trend={stats.improvement}
                                />
                                <StatCard
                                    label="Best Session"
                                    value={stats.bestSession.toFixed(1)}
                                    icon={Award}
                                />
                                <StatCard
                                    label="Total Arrows"
                                    value={stats.totalArrows.toString()}
                                    icon={Zap}
                                />
                                <StatCard
                                    label="Sessions"
                                    value={stats.totalSessions.toString()}
                                    icon={TrendingUp}
                                />
                            </div>
                        )}

                        {/* Load Monitoring Section */}
                        {acwrRatio !== null && (
                            <div className="mb-6">
                                <ACWRChart data={acwrData} />
                            </div>
                        )}

                        {/* Badges */}
                        {gamification && (
                            <div className="mb-6">
                                <BadgeShowcase badges={gamification.badges} />
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'tech' && shotAnalysis && (
                    <motion.div
                        key="tech"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                            {/* Shot Distribution */}
                            <ShotDistributionChart data={scoreDist} />

                            {/* Consistency & Fatigue */}
                            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Tech Metrics</h3>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-dark-400">Group Consistency</span>
                                            <span className="text-sm font-bold text-emerald-400">{shotAnalysis.groupConsistency}/100</span>
                                        </div>
                                        <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                                style={{ width: `${shotAnalysis.groupConsistency}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-dark-400">End-Game Stamina</span>
                                            <span className={`text-sm font-bold ${Number(shotAnalysis.fatigueDropOff) > 5 ? 'text-red-400' : 'text-green-400'}`}>
                                                {Number(shotAnalysis.fatigueDropOff) > 0 ? '-' : '+'}{Math.abs(Number(shotAnalysis.fatigueDropOff))}% Drop
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs text-dark-500 mt-1">
                                            <span>First 3 Ends: {shotAnalysis.first3Avg}</span>
                                            <span>Last 3 Ends: {shotAnalysis.last3Avg}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Trend */}
                            <ConsistencyTrend data={shotAnalysis.xCountTrend} />
                        </div>
                    </motion.div>
                )}

                {activeTab === 'physio' && (
                    <motion.div
                        key="physio"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="grid grid-cols-1 gap-6">
                            <HeartRateChart data={acwrData} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <DailyWellnessModal
                isOpen={showWellnessModal}
                onClose={() => setShowWellnessModal(false)}
                onSave={() => {
                    // Optional: refresh data
                    setShowWellnessModal(false);
                }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Scores */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary-400" />
                            Recent Scores
                        </h3>
                        <button
                            onClick={() => navigate('/scoring')}
                            className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                        >
                            View All <ChevronRight size={14} />
                        </button>
                    </div>

                    {recentScores.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No scoring sessions yet</p>
                            <button
                                onClick={() => navigate('/scoring')}
                                className="mt-3 text-sm text-primary-400 hover:text-primary-300"
                            >
                                Start your first session →
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentScores.map((score) => (
                                <div
                                    key={score.id}
                                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
                                >
                                    <div>
                                        <div className="text-sm text-white font-medium">
                                            {score.distance}m Session
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {new Date(score.sessionDate).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-primary-400">
                                            {score.average.toFixed(1)}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {score.arrowCount} arrows • {score.tensCount} tens
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Upcoming Schedule */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-amber-400" />
                            Upcoming Training
                        </h3>
                        <button
                            onClick={() => navigate('/schedules')}
                            className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                        >
                            View All <ChevronRight size={14} />
                        </button>
                    </div>

                    {upcomingSchedules.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No upcoming training sessions</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {upcomingSchedules.map((schedule) => (
                                <div
                                    key={schedule.id}
                                    className="p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="text-sm text-white font-medium">
                                                {schedule.title}
                                            </div>
                                            {schedule.venue && (
                                                <div className="text-xs text-slate-400 mt-1">
                                                    📍 {schedule.venue}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-amber-400 flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(schedule.startTime).toLocaleTimeString('id-ID', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1">
                                                {new Date(schedule.startTime).toLocaleDateString('id-ID', {
                                                    weekday: 'short',
                                                    day: 'numeric',
                                                    month: 'short'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

// Quick Action Button Component
const QuickAction: React.FC<{
    icon: React.ElementType;
    label: string;
    color: 'primary' | 'emerald' | 'amber' | 'purple';
    onClick: () => void;
}> = ({ icon: Icon, label, color, onClick }) => {
    const colorClasses = {
        primary: 'from-primary-500/20 to-primary-600/20 border-primary-500/30 text-primary-400 hover:border-primary-400',
        emerald: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-400 hover:border-emerald-400',
        amber: 'from-amber-500/20 to-amber-600/20 border-amber-500/30 text-amber-400 hover:border-amber-400',
        purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400 hover:border-purple-400',
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`
                p-4 rounded-xl border bg-gradient-to-br transition-all
                flex flex-col items-center gap-2
                ${colorClasses[color]}
            `}
        >
            <Icon className="w-6 h-6" />
            <span className="text-sm font-medium">{label}</span>
        </motion.button>
    );
};

// Stat Card Component
const StatCard: React.FC<{
    label: string;
    value: string;
    icon: React.ElementType;
    trend?: number;
}> = ({ label, value, icon: Icon, trend }) => (
    <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
            <Icon className="w-5 h-5 text-slate-500" />
            {trend !== undefined && (
                <div className={`flex items-center text-xs ${trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-slate-400'
                    }`}>
                    {trend > 0 ? <ArrowUpRight size={14} /> : trend < 0 ? <ArrowDownRight size={14} /> : <Minus size={14} />}
                    {Math.abs(trend).toFixed(1)}%
                </div>
            )}
        </div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-xs text-slate-400">{label}</div>
    </div>
);

export default AthleteDashboard;
