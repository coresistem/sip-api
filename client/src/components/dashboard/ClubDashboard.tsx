import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Calendar,
    DollarSign,
    TrendingUp,
    ChevronRight,
    Loader2,
    UserPlus,
    FileText,
    Settings,
    Package,
    PieChart
} from 'lucide-react';
import { api } from '../../context/AuthContext';

interface MemberStats {
    totalMembers: number;
    athletes: number;
    coaches: number;
    newThisMonth: number;
}

interface FinanceStats {
    monthlyRevenue: number;
    pendingPayments: number;
    overduePayments: number;
}

interface RecentActivity {
    id: string;
    type: 'member_joined' | 'payment_received' | 'schedule_created';
    message: string;
    timestamp: string;
}

const ClubDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [memberStats, setMemberStats] = useState<MemberStats | null>(null);
    const [financeStats, setFinanceStats] = useState<FinanceStats | null>(null);
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
    const [upcomingSchedules, setUpcomingSchedules] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch athletes count
                const athletesRes = await api.get('/athletes?limit=1');
                const athleteCount = athletesRes.data.pagination?.total || athletesRes.data.data?.length || 0;

                // Fetch schedules
                const schedulesRes = await api.get('/schedules?upcoming=true&limit=3');
                setUpcomingSchedules(schedulesRes.data.data || []);

                // Set member stats
                setMemberStats({
                    totalMembers: athleteCount + 2, // Athletes + coaches estimate
                    athletes: athleteCount,
                    coaches: 2, // Placeholder
                    newThisMonth: Math.min(3, athleteCount), // Placeholder
                });

                // Set finance stats (placeholders - would come from real API)
                setFinanceStats({
                    monthlyRevenue: 2500000,
                    pendingPayments: 5,
                    overduePayments: 2,
                });

                // Set recent activities (placeholders)
                setRecentActivities([
                    { id: '1', type: 'member_joined', message: 'Andi Pranata joined the club', timestamp: new Date().toISOString() },
                    { id: '2', type: 'payment_received', message: 'Monthly fee received from 3 athletes', timestamp: new Date().toISOString() },
                ]);

            } catch (err) {
                console.error('Failed to fetch club dashboard data:', err);
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
                    icon={Users}
                    label="Members"
                    color="primary"
                    onClick={() => navigate('/athletes')}
                />
                <QuickAction
                    icon={Calendar}
                    label="Schedules"
                    color="amber"
                    onClick={() => navigate('/schedules')}
                />
                <QuickAction
                    icon={DollarSign}
                    label="Finance"
                    color="emerald"
                    onClick={() => navigate('/finance')}
                />
                <QuickAction
                    icon={PieChart}
                    label="Reports"
                    color="purple"
                    onClick={() => navigate('/reports')}
                />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {memberStats && (
                    <>
                        <StatCard
                            label="Total Members"
                            value={memberStats.totalMembers.toString()}
                            icon={Users}
                            color="primary"
                        />
                        <StatCard
                            label="Athletes"
                            value={memberStats.athletes.toString()}
                            icon={Users}
                            color="emerald"
                        />
                    </>
                )}
                {financeStats && (
                    <>
                        <StatCard
                            label="Monthly Revenue"
                            value={`${(financeStats.monthlyRevenue / 1000000).toFixed(1)}M`}
                            icon={DollarSign}
                            color="amber"
                            subtitle="IDR"
                        />
                        <StatCard
                            label="Pending Payments"
                            value={financeStats.pendingPayments.toString()}
                            icon={FileText}
                            color={financeStats.pendingPayments > 0 ? 'amber' : 'slate'}
                        />
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Schedules */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
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
                            Manage <ChevronRight size={14} />
                        </button>
                    </div>

                    {upcomingSchedules.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No upcoming sessions</p>
                            <button
                                onClick={() => navigate('/schedules')}
                                className="mt-3 text-sm text-primary-400 hover:text-primary-300"
                            >
                                Create a session →
                            </button>
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
                                            <div className="text-xs text-slate-400 mt-1">
                                                {new Date(schedule.startTime).toLocaleDateString('id-ID', {
                                                    weekday: 'short',
                                                    day: 'numeric',
                                                    month: 'short'
                                                })} • {new Date(schedule.startTime).toLocaleTimeString('id-ID', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {schedule._count?.participants || 0} registered
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary-400" />
                            Recent Activity
                        </h3>
                    </div>

                    {recentActivities.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No recent activity</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentActivities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg"
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.type === 'member_joined' ? 'bg-emerald-500/20' :
                                            activity.type === 'payment_received' ? 'bg-amber-500/20' :
                                                'bg-primary-500/20'
                                        }`}>
                                        {activity.type === 'member_joined' ? <UserPlus size={14} className="text-emerald-400" /> :
                                            activity.type === 'payment_received' ? <DollarSign size={14} className="text-amber-400" /> :
                                                <Calendar size={14} className="text-primary-400" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm text-white">{activity.message}</div>
                                        <div className="text-xs text-slate-500">
                                            {new Date(activity.timestamp).toLocaleDateString('id-ID')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickLink
                    icon={UserPlus}
                    label="Add Athlete"
                    onClick={() => navigate('/athletes')}
                />
                <QuickLink
                    icon={Package}
                    label="Inventory"
                    onClick={() => navigate('/inventory')}
                />
                <QuickLink
                    icon={FileText}
                    label="Documents"
                    onClick={() => navigate('/files')}
                />
                <QuickLink
                    icon={Settings}
                    label="Club Settings"
                    onClick={() => navigate('/profile')}
                />
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
    color: 'primary' | 'emerald' | 'amber' | 'purple' | 'slate';
    subtitle?: string;
}> = ({ label, value, icon: Icon, color, subtitle }) => {
    const iconColors = {
        primary: 'text-primary-400',
        emerald: 'text-emerald-400',
        amber: 'text-amber-400',
        purple: 'text-purple-400',
        slate: 'text-slate-400',
    };

    return (
        <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${iconColors[color]}`} />
                {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-slate-400">{label}</div>
        </div>
    );
};

// Quick Link Button Component  
const QuickLink: React.FC<{
    icon: React.ElementType;
    label: string;
    onClick: () => void;
}> = ({ icon: Icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg flex items-center gap-3 transition-colors"
    >
        <Icon size={18} className="text-slate-400" />
        <span className="text-sm text-slate-300">{label}</span>
    </button>
);

export default ClubDashboard;
