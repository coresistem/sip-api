import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User, Phone, Mail, CreditCard, Wrench, Calendar, ClipboardList, CheckCircle2, Clock
} from 'lucide-react';
import { api } from '@/modules/core/contexts/AuthContext';

interface ManpowerProfileSectionProps {
    user: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        sipId?: string;
    };
}

interface ManpowerData {
    role: string;
    specialization: string;
    dailyCapacity: number;
    isActive: boolean;
}

interface TaskSummary {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
}

export default function ManpowerProfileSection({ user }: ManpowerProfileSectionProps) {
    const [manpowerInfo, setManpowerInfo] = useState<ManpowerData | null>(null);
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState<TaskSummary>({ total: 0, pending: 0, inProgress: 0, completed: 0 });

    useEffect(() => {
        const fetchManpowerData = async () => {
            try {
                // Fetch manpower profile from jersey API (where manpower is managed)
                const res = await api.get(`/jersey/workers?email=${user.email}`);
                if (res.data.success && res.data.data.length > 0) {
                    setManpowerInfo(res.data.data[0]);
                }

                // Fetch tasks summary
                const tasksRes = await api.get('/jersey/tasks');
                if (tasksRes.data.success) {
                    const allTasks = tasksRes.data.data;
                    setTasks({
                        total: allTasks.length,
                        pending: allTasks.filter((t: any) => t.status === 'PENDING').length,
                        inProgress: allTasks.filter((t: any) => t.status === 'IN_PROGRESS').length,
                        completed: allTasks.filter((t: any) => t.status === 'COMPLETED').length,
                    });
                }
            } catch (error) {
                console.error('Failed to fetch manpower data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchManpowerData();
    }, [user.email]);

    return (
        <div className="space-y-6">
            {/* Manpower Information */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-violet-400" />
                        Manpower Profile
                    </h2>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${manpowerInfo?.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {manpowerInfo?.isActive ? 'Active' : 'Inactive'}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Person Name */}
                    <div>
                        <label className="label">Full Name</label>
                        <div className="input flex items-center gap-3 cursor-not-allowed opacity-70">
                            <User className="w-5 h-5 text-dark-400" />
                            <span>{user.name}</span>
                        </div>
                    </div>

                    {/* SIP ID */}
                    <div>
                        <label className="label">Manpower SIP ID</label>
                        <div className="input flex items-center gap-3 bg-dark-800/50 font-mono">
                            <CreditCard className="w-5 h-5 text-violet-400" />
                            <span className="text-violet-400">{user.sipId || 'Not generated'}</span>
                        </div>
                    </div>

                    {/* Specialization */}
                    <div>
                        <label className="label">Specialization</label>
                        <div className="input flex items-center gap-3 bg-dark-800/50">
                            <Wrench className="w-5 h-5 text-dark-400" />
                            <span>{manpowerInfo?.specialization || 'General'}</span>
                        </div>
                    </div>

                    {/* Capacity */}
                    <div>
                        <label className="label">Daily Capacity</label>
                        <div className="input flex items-center gap-3 bg-dark-800/50">
                            <Calendar className="w-5 h-5 text-dark-400" />
                            <span>{manpowerInfo?.dailyCapacity || 0} units/day</span>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="md:col-span-1">
                        <label className="label">Email</label>
                        <div className="input flex items-center gap-3 bg-dark-800/50">
                            <Mail className="w-5 h-5 text-dark-400" />
                            <span>{user.email}</span>
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="md:col-span-1">
                        <label className="label">Phone / WhatsApp</label>
                        <div className="input flex items-center gap-3 bg-dark-800/50">
                            <Phone className="w-5 h-5 text-dark-400" />
                            <span>{user.phone || 'Not set'}</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Task Overview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card"
            >
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-primary-400" />
                    Task Overview
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-dark-800/50 flex flex-col items-center">
                        <p className="text-2xl font-bold text-white">{tasks.total}</p>
                        <p className="text-xs text-dark-400 mt-1 uppercase tracking-wider font-semibold">Total Tasks</p>
                    </div>
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        </div>
                        <p className="text-xl font-bold text-emerald-400">{tasks.completed}</p>
                        <p className="text-[10px] text-emerald-400/70 uppercase tracking-widest font-bold">Completed</p>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                            <Clock className="w-5 h-5 text-blue-400" />
                        </div>
                        <p className="text-xl font-bold text-blue-400">{tasks.inProgress}</p>
                        <p className="text-[10px] text-blue-400/70 uppercase tracking-widest font-bold">In Progress</p>
                    </div>
                    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mb-2">
                            <Clock className="w-5 h-5 text-amber-400" />
                        </div>
                        <p className="text-xl font-bold text-amber-400">{tasks.pending}</p>
                        <p className="text-[10px] text-amber-400/70 uppercase tracking-widest font-bold">Pending</p>
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        onClick={() => window.location.href = '/jersey/tasks'}
                        className="w-full py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-all shadow-lg shadow-primary-500/20"
                    >
                        Go to Tasks Board
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
