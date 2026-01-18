import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Gavel,
    Calendar,
    MapPin,
    Clock,
    ChevronRight,
    Loader2,
    Check,
    X,
    Award,
    FileText
} from 'lucide-react';
import { api } from '../../context/AuthContext';

interface JudgeStats {
    totalAssignments: number;
    upcomingEvents: number;
    completedEvents: number;
    certificationStatus: 'ACTIVE' | 'EXPIRED' | 'PENDING';
}

interface EventAssignment {
    id: string;
    eventName: string;
    eventType: 'REGIONAL' | 'PROVINCIAL' | 'NATIONAL' | 'OPEN';
    role: 'HEAD_JUDGE' | 'LINE_JUDGE' | 'DOS';
    date: string;
    venue: string;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED';
}

// Mock data
const MOCK_STATS: JudgeStats = {
    totalAssignments: 15,
    upcomingEvents: 3,
    completedEvents: 12,
    certificationStatus: 'ACTIVE'
};

const MOCK_ASSIGNMENTS: EventAssignment[] = [
    {
        id: '1',
        eventName: 'Kejuaraan Panahan Regional Bandung 2026',
        eventType: 'REGIONAL',
        role: 'HEAD_JUDGE',
        date: '2026-02-20',
        venue: 'GOR Panahan Bandung',
        status: 'PENDING'
    },
    {
        id: '2',
        eventName: 'Open Tournament Jakarta 2026',
        eventType: 'OPEN',
        role: 'LINE_JUDGE',
        date: '2026-03-15',
        venue: 'Gelora Bung Karno',
        status: 'ACCEPTED'
    },
    {
        id: '3',
        eventName: 'Kejuaraan Provinsi 2025',
        eventType: 'PROVINCIAL',
        role: 'DOS',
        date: '2025-11-10',
        venue: 'GOR Cikutra',
        status: 'COMPLETED'
    }
];

export default function JudgeDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<JudgeStats | null>(null);
    const [assignments, setAssignments] = useState<EventAssignment[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, assignmentsRes] = await Promise.all([
                api.get('/judge/stats'),
                api.get('/judge/events')
            ]);
            // Map API response to expected format
            const statsData = statsRes.data;
            setStats({
                totalAssignments: statsData.assignedEvents + statsData.pendingAssignments || 0,
                upcomingEvents: statsData.pendingAssignments || 0,
                completedEvents: statsData.completedEvents || 0,
                certificationStatus: 'ACTIVE'
            });
            // Map events to assignments
            const eventsData = assignmentsRes.data || [];
            const mapped = eventsData.map((e: any) => ({
                id: e.id,
                eventName: e.name || e.eventName || 'Unknown Event',
                eventType: 'OPEN',
                role: 'LINE_JUDGE',
                date: e.date || new Date().toISOString().split('T')[0],
                venue: e.venue || 'TBD',
                status: e.assignmentStatus || 'PENDING'
            }));
            setAssignments(mapped.length > 0 ? mapped : MOCK_ASSIGNMENTS);
        } catch (error) {
            console.log('Using mock data');
            setStats(MOCK_STATS);
            setAssignments(MOCK_ASSIGNMENTS);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id: string) => {
        try {
            await api.post(`/judge/events/${id}/accept`);
            setAssignments(prev => prev.map(a =>
                a.id === id ? { ...a, status: 'ACCEPTED' } : a
            ));
        } catch (error) {
            // Fallback to local update
            setAssignments(prev => prev.map(a =>
                a.id === id ? { ...a, status: 'ACCEPTED' } : a
            ));
        }
    };

    const handleDecline = async (id: string) => {
        try {
            await api.post(`/judge/events/${id}/decline`);
            setAssignments(prev => prev.map(a =>
                a.id === id ? { ...a, status: 'DECLINED' } : a
            ));
        } catch (error) {
            // Fallback to local update
            setAssignments(prev => prev.map(a =>
                a.id === id ? { ...a, status: 'DECLINED' } : a
            ));
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-500/20 text-yellow-400';
            case 'ACCEPTED': return 'bg-green-500/20 text-green-400';
            case 'DECLINED': return 'bg-red-500/20 text-red-400';
            case 'COMPLETED': return 'bg-purple-500/20 text-purple-400';
            default: return 'bg-dark-700 text-dark-400';
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'HEAD_JUDGE': return 'bg-blue-500/20 text-blue-400';
            case 'LINE_JUDGE': return 'bg-green-500/20 text-green-400';
            case 'DOS': return 'bg-purple-500/20 text-purple-400';
            default: return 'bg-dark-700 text-dark-400';
        }
    };

    const getCertBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'EXPIRED': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            default: return 'bg-dark-700 text-dark-400';
        }
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
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl md:text-3xl font-display font-bold">
                    Judge <span className="gradient-text">Dashboard</span>
                </h1>
                <p className="text-dark-400 mt-1">
                    Manage your event assignments
                </p>
            </motion.div>

            {/* Stats & Certification */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
                <div className="card p-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                        <Gavel className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{stats?.totalAssignments}</div>
                    <div className="text-sm text-dark-400">Total Assignments</div>
                </div>
                <div className="card p-4">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-3">
                        <Clock className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{stats?.upcomingEvents}</div>
                    <div className="text-sm text-dark-400">Upcoming</div>
                </div>
                <div className="card p-4">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-3">
                        <Check className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{stats?.completedEvents}</div>
                    <div className="text-sm text-dark-400">Completed</div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <Award className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getCertBadge(stats?.certificationStatus || '')}`}>
                            {stats?.certificationStatus}
                        </span>
                    </div>
                    <div className="text-sm text-dark-400 mt-3">Certification</div>
                </div>
            </motion.div>

            {/* Assignments */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card"
            >
                <div className="p-4 border-b border-dark-700">
                    <h2 className="text-lg font-semibold text-white">Event Assignments</h2>
                    <p className="text-sm text-dark-400">Your judging assignments</p>
                </div>
                {assignments.length === 0 ? (
                    <div className="p-12 text-center">
                        <Gavel className="w-16 h-16 mx-auto mb-4 text-dark-600" />
                        <h3 className="text-lg font-medium text-white mb-2">No Assignments</h3>
                        <p className="text-dark-400">You don't have any event assignments yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-dark-700">
                        {assignments.map(assignment => (
                            <div key={assignment.id} className="p-4 hover:bg-dark-800/50 transition-colors">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                            <Gavel className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{assignment.eventName}</div>
                                            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-dark-400">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{new Date(assignment.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                </div>
                                                <span className="text-dark-600">•</span>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    <span>{assignment.venue}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-2">
                                            <span className={`px-2 py-1 text-xs font-medium rounded ${getRoleBadge(assignment.role)}`}>
                                                {assignment.role.replace('_', ' ')}
                                            </span>
                                            <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(assignment.status)}`}>
                                                {assignment.status}
                                            </span>
                                        </div>
                                        {assignment.status === 'PENDING' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAccept(assignment.id)}
                                                    className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDecline(assignment.id)}
                                                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                        {assignment.status !== 'PENDING' && (
                                            <ChevronRight className="w-5 h-5 text-dark-500" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Quick Links */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-4"
            >
                <button className="card p-4 hover:bg-dark-800/50 transition-colors text-left">
                    <Award className="w-8 h-8 text-purple-400 mb-2" />
                    <div className="font-medium text-white">Certification</div>
                    <div className="text-sm text-dark-400">View your credentials</div>
                </button>
                <button className="card p-4 hover:bg-dark-800/50 transition-colors text-left">
                    <Calendar className="w-8 h-8 text-blue-400 mb-2" />
                    <div className="font-medium text-white">Schedule</div>
                    <div className="text-sm text-dark-400">View event calendar</div>
                </button>
                <button className="card p-4 hover:bg-dark-800/50 transition-colors text-left">
                    <FileText className="w-8 h-8 text-green-400 mb-2" />
                    <div className="font-medium text-white">Reports</div>
                    <div className="text-sm text-dark-400">Past event reports</div>
                </button>
            </motion.div>
        </div>
    );
}
