import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Calendar,
    ChevronRight,
    Loader2,
    User,
    Bell,
    CreditCard,
    Activity,
    Award,
    Clock,
    Link as LinkIcon
} from 'lucide-react';
import { api } from '../../context/AuthContext';
import ChildLinkModal from './ChildLinkModal';

interface ChildData {
    id: string;
    name: string;
    avatarUrl?: string;
    archeryCategory: string;
    skillLevel: string;
    clubName?: string;
    lastScoreAvg?: number;
    totalSessions: number;
    upcomingTraining?: string;
}

interface PaymentItem {
    id: string;
    description: string;
    amount: number;
    dueDate: string;
    status: 'PENDING' | 'PAID' | 'OVERDUE';
}

interface NotificationItem {
    id: string;
    title: string;
    message: string;
    type: 'schedule' | 'payment' | 'achievement';
    createdAt: string;
    isRead: boolean;
}

const ParentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [children, setChildren] = useState<ChildData[]>([]);
    const [pendingPayments, setPendingPayments] = useState<PaymentItem[]>([]);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch linked children (athletes where parentId = current user)
                const childrenRes = await api.get('/athletes/my-children');
                if (childrenRes.data.success && childrenRes.data.data) {
                    const childData = childrenRes.data.data.map((a: any) => ({
                        id: a.id,
                        name: a.user?.name || 'Unknown',
                        avatarUrl: a.user?.avatarUrl,
                        archeryCategory: a.archeryCategory || 'Not set',
                        skillLevel: a.skillLevel || 'BEGINNER',
                        clubName: a.club?.name,
                        lastScoreAvg: 8.5, // Placeholder
                        totalSessions: a._count?.scores || 0,
                    }));
                    setChildren(childData);
                }

                // Fetch pending payments
                try {
                    const paymentsRes = await api.get('/finance/my-pending');
                    if (paymentsRes.data.success) {
                        setPendingPayments(paymentsRes.data.data.map((p: any) => ({
                            id: p.id,
                            description: p.description,
                            amount: p.amount,
                            dueDate: p.dueDate,
                            status: p.status
                        })));
                    }
                } catch (error) {
                    console.error('Failed to fetch payments', error);
                }

                // Fetch notifications
                try {
                    const notifRes = await api.get('/notifications?limit=5');
                    if (notifRes.data.success) {
                        setNotifications(notifRes.data.data.map((n: any) => ({
                            id: n.id,
                            title: n.title,
                            message: n.message,
                            type: n.type as 'schedule' | 'payment' | 'achievement',
                            createdAt: n.createdAt,
                            isRead: n.isRead
                        })));
                    }
                } catch (error) {
                    console.error('Failed to fetch notifications', error);
                    setNotifications([]);
                }

            } catch (err) {
                console.error('Failed to fetch parent dashboard data:', err);
                // Use placeholder data for demo
                setChildren([]);
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
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label="My Children"
                    value={children.length.toString()}
                    icon={Users}
                    color="primary"
                />
                <StatCard
                    label="Pending Payments"
                    value={pendingPayments.filter(p => p.status === 'PENDING').length.toString()}
                    icon={CreditCard}
                    color={pendingPayments.some(p => p.status === 'OVERDUE') ? 'red' : 'amber'}
                />
                <StatCard
                    label="Unread Notifications"
                    value={notifications.filter(n => !n.isRead).length.toString()}
                    icon={Bell}
                    color="purple"
                />
                <StatCard
                    label="Total Sessions"
                    value={children.reduce((sum, c) => sum + c.totalSessions, 0).toString()}
                    icon={Activity}
                    color="emerald"
                />
            </div>

            {/* My Children */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary-400" />
                        My Children
                    </h3>
                    <button
                        onClick={() => setIsLinkModalOpen(true)}
                        className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-primary-600/20 text-primary-400 hover:bg-primary-600/30 hover:text-primary-300 rounded-lg transition-colors border border-primary-500/30"
                    >
                        <LinkIcon size={14} />
                        Link Child
                    </button>
                </div>

                {children.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg mb-2">No linked children yet</p>
                        <p className="text-sm text-slate-500 max-w-md mx-auto">
                            Ask your club administrator to link your athlete child's account to yours.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {children.map((child) => (
                            <ChildCard key={child.id} child={child} />
                        ))}
                    </div>
                )}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Payments */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-amber-400" />
                            Pending Payments
                        </h3>
                        <button
                            onClick={() => navigate('/payments')}
                            className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                        >
                            View All <ChevronRight size={14} />
                        </button>
                    </div>

                    {pendingPayments.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No pending payments</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pendingPayments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                                >
                                    <div>
                                        <div className="text-sm text-white font-medium">
                                            {payment.description}
                                        </div>
                                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                            <Clock size={12} />
                                            Due: {new Date(payment.dueDate).toLocaleDateString('id-ID')}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-amber-400">
                                            Rp {payment.amount.toLocaleString('id-ID')}
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded ${payment.status === 'OVERDUE' ? 'bg-red-500/20 text-red-400' :
                                            payment.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400' :
                                                'bg-emerald-500/20 text-emerald-400'
                                            }`}>
                                            {payment.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Notifications */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Bell className="w-5 h-5 text-purple-400" />
                            Recent Notifications
                        </h3>
                        <button
                            onClick={() => navigate('/notifications')}
                            className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                        >
                            View All <ChevronRight size={14} />
                        </button>
                    </div>

                    {notifications.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No notifications</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notifications.slice(0, 5).map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`flex items-start gap-3 p-3 rounded-lg ${notif.isRead ? 'bg-slate-800/30' : 'bg-slate-800/50 border-l-2 border-primary-500'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${notif.type === 'schedule' ? 'bg-amber-500/20' :
                                        notif.type === 'payment' ? 'bg-emerald-500/20' :
                                            'bg-purple-500/20'
                                        }`}>
                                        {notif.type === 'schedule' ? <Calendar size={14} className="text-amber-400" /> :
                                            notif.type === 'payment' ? <CreditCard size={14} className="text-emerald-400" /> :
                                                <Award size={14} className="text-purple-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-white font-medium">{notif.title}</div>
                                        <div className="text-xs text-slate-400 mt-0.5 truncate">{notif.message}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            <ChildLinkModal
                isOpen={isLinkModalOpen}
                onClose={() => setIsLinkModalOpen(false)}
                onSuccess={() => {
                    // Refresh data
                    window.location.reload();
                }}
            />
        </div>
    );
};

// Child Card Component
const ChildCard: React.FC<{ child: ChildData }> = ({ child }) => {
    const navigate = useNavigate();

    return (
        <div
            className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-primary-500/30 transition-all cursor-pointer"
            onClick={() => navigate('/athletes')}
        >
            <div className="flex items-center gap-3 mb-3">
                {child.avatarUrl ? (
                    <img
                        src={child.avatarUrl}
                        alt={child.name}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
                        <User size={20} className="text-primary-400" />
                    </div>
                )}
                <div>
                    <div className="text-white font-medium">{child.name}</div>
                    <div className="text-xs text-slate-400">{child.clubName || 'No club'}</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-slate-900/50 rounded-lg p-2">
                    <div className="text-lg font-bold text-primary-400">
                        {child.lastScoreAvg?.toFixed(1) || '-'}
                    </div>
                    <div className="text-xs text-slate-500">Avg Score</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2">
                    <div className="text-lg font-bold text-emerald-400">
                        {child.totalSessions}
                    </div>
                    <div className="text-xs text-slate-500">Sessions</div>
                </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-400">{child.archeryCategory}</span>
                <span className={`px-2 py-0.5 rounded ${child.skillLevel === 'ELITE' ? 'bg-purple-500/20 text-purple-400' :
                    child.skillLevel === 'ADVANCED' ? 'bg-emerald-500/20 text-emerald-400' :
                        child.skillLevel === 'INTERMEDIATE' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-slate-500/20 text-slate-400'
                    }`}>
                    {child.skillLevel}
                </span>
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard: React.FC<{
    label: string;
    value: string;
    icon: React.ElementType;
    color: 'primary' | 'emerald' | 'amber' | 'purple' | 'red';
}> = ({ label, value, icon: Icon, color }) => {
    const iconColors = {
        primary: 'text-primary-400',
        emerald: 'text-emerald-400',
        amber: 'text-amber-400',
        purple: 'text-purple-400',
        red: 'text-red-400',
    };

    return (
        <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${iconColors[color]}`} />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-slate-400">{label}</div>
        </div>
    );
};

export default ParentDashboard;
