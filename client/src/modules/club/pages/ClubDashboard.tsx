
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Building2, TrendingUp, AlertCircle, Calendar, Plus, ChevronRight } from 'lucide-react';
import { api, useAuth } from '../../core/contexts/AuthContext';
import StatsCard from '../../core/components/common/StatsCard';

export default function ClubDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalMembers: 0,
        activeSchedules: 0,
        pendingApprovals: 0,
        monthlyRevenue: 0
    });
    const [recentMembers, setRecentMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchClubData = async () => {
            try {
                const res = await api.get('/clubs/stats');
                const data = res.data.data;

                setStats({
                    totalMembers: data.totalMembers,
                    activeSchedules: data.activeSchedules,
                    pendingApprovals: data.pendingApprovals,
                    monthlyRevenue: data.monthlyRevenue
                });

                // Map recent members to UI format
                setRecentMembers(data.recentMembers.map((m: any) => ({
                    id: m.id,
                    name: m.user.name,
                    role: 'ATHLETE', // Default, logic might need check based on user role but athlete table implies athlete
                    status: 'ACTIVE', // Athletes in this table are active members usually
                    joined: new Date(m.createdAt).toLocaleDateString()
                })));

            } catch (error) {
                console.error('Failed to fetch club data', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user?.clubId) {
            fetchClubData();
        } else {
            setIsLoading(false); // No club assigned
        }
    }, [user]);

    if (!user?.clubId) {
        return (
            <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/20 text-orange-400 mb-4">
                    <Building2 size={32} />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">No Club Assigned</h2>
                <p className="text-dark-400 max-w-md mx-auto">
                    You are not currently assigned to any club. Please contact your administrator or create a new club.
                </p>
                <button className="mt-6 px-4 py-2 bg-primary-500 text-dark-900 font-bold rounded-lg hover:bg-primary-400 transition-colors">
                    Register New Club
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Club Dashboard</h1>
                    <p className="text-dark-400">Overview of your club performance</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/club/schedules')}
                        className="flex items-center gap-2 px-4 py-2 bg-dark-800 text-white rounded-lg hover:bg-dark-700 transition-colors"
                    >
                        <Calendar size={18} />
                        <span>Schedule</span>
                    </button>
                    <button
                        onClick={() => navigate('/club/members', { state: { activeTab: 'requests' } })}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-dark-900 font-bold rounded-lg hover:bg-primary-400 transition-colors"
                    >
                        <Plus size={18} />
                        <span>New Member</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Members"
                    value={stats.totalMembers}
                    icon={Users}
                    trend={{ value: 12, label: 'vs last month', isPositive: true }}
                    color="blue"
                />
                <StatsCard
                    title="Active Schedules"
                    value={stats.activeSchedules}
                    icon={Calendar}
                    color="purple"
                    actionLabel="View All"
                />
                <StatsCard
                    title="Pending Approvals"
                    value={stats.pendingApprovals}
                    icon={AlertCircle}
                    color="orange"
                    trend={{ value: 3, label: 'new requests', isPositive: false }}
                />
                <StatsCard
                    title="Monthly Revenue"
                    value={`Rp ${(stats.monthlyRevenue / 1000000).toFixed(1)}M`}
                    icon={TrendingUp}
                    color="emerald"
                    trend={{ value: 8.5, label: 'vs last month', isPositive: true }}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Recent Members */}
                <div className="lg:col-span-2 bg-dark-900/50 border border-dark-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-white">Recent Members</h3>
                        <button
                            onClick={() => navigate('/club/members')}
                            className="text-primary-400 text-sm font-medium hover:text-primary-300 transition-colors"
                        >
                            View All
                        </button>
                    </div>

                    <div className="space-y-4">
                        {recentMembers.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg group hover:bg-dark-800 transition-colors cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-blue-500/20 flex items-center justify-center text-primary-400 font-bold border border-white/5">
                                        {member.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white group-hover:text-primary-400 transition-colors">{member.name}</h4>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className={`px-1.5 py-0.5 rounded ${member.role === 'ATHLETE' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                                                }`}>
                                                {member.role}
                                            </span>
                                            <span className="text-dark-500">•</span>
                                            <span className="text-dark-400">Joined {member.joined}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${member.status === 'ACTIVE'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                        }`}>
                                        {member.status}
                                    </span>
                                    <ChevronRight size={16} className="text-dark-600 group-hover:text-white transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions / Alerts */}
                <div className="space-y-6">
                    {/* Membership Requests Alert */}
                    {stats.pendingApprovals > 0 && (
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Users size={64} className="text-orange-500" />
                            </div>
                            <h3 className="font-bold text-lg text-orange-100 mb-2">Pending Requests</h3>
                            <p className="text-orange-200/70 text-sm mb-4">
                                You have {stats.pendingApprovals} new membership requests waiting for approval.
                            </p>
                            <button
                                onClick={() => navigate('/club/members', { state: { activeTab: 'requests' } })}
                                className="w-full py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-400 transition-colors shadow-lg shadow-orange-900/20"
                            >
                                Review Requests
                            </button>
                        </div>
                    )}

                    {/* Quick Links */}
                    <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-6">
                        <h3 className="font-bold text-lg text-white mb-4">Management</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => navigate('/club/members')}
                                className="p-3 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors text-left group"
                            >
                                <Users size={20} className="text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-white block">Members</span>
                            </button>
                            <button className="p-3 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors text-left group">
                                <TrendingUp size={20} className="text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-white block">Finance</span>
                            </button>
                            <button className="p-3 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors text-left group">
                                <Building2 size={20} className="text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-white block">Inventory</span>
                            </button>
                            <button className="p-3 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors text-left group">
                                <AlertCircle size={20} className="text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-white block">Reports</span>
                            </button>
                            <button
                                onClick={() => navigate('/club/organization')}
                                className="p-3 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors text-left group"
                            >
                                <Users size={20} className="text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-white block">Organization</span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
