import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Building2,
    Users,
    Trophy,
    MapPin,
    Calendar,
    ChevronRight,
    Loader2,
    Award,
    Target,
    UserCheck
} from 'lucide-react';
import { api } from '../../context/AuthContext';

interface RegionStats {
    totalClubs: number;
    totalAthletes: number;
    activeCompetitions: number;
    pendingApprovals: number;
    pendingCoachVerifications?: number;
}

interface ClubSummary {
    id: string;
    name: string;
    location: string;
    memberCount: number;
    status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
}

interface UpcomingEvent {
    id: string;
    name: string;
    date: string;
    location: string;
    participantCount: number;
}

// Mock data
const MOCK_STATS: RegionStats = {
    totalClubs: 45,
    totalAthletes: 1234,
    activeCompetitions: 3,
    pendingApprovals: 8,
    pendingCoachVerifications: 0
};

const MOCK_CLUBS: ClubSummary[] = [
    { id: '1', name: 'Klub Panahan Bandung', location: 'Bandung', memberCount: 85, status: 'ACTIVE' },
    { id: '2', name: 'Archery Club Jakarta', location: 'Jakarta', memberCount: 120, status: 'ACTIVE' },
    { id: '3', name: 'Perpani Surabaya', location: 'Surabaya', memberCount: 65, status: 'ACTIVE' },
    { id: '4', name: 'Klub Busur Yogya', location: 'Yogyakarta', memberCount: 45, status: 'PENDING' },
];

const MOCK_EVENTS: UpcomingEvent[] = [
    { id: '1', name: 'Regional Championship 2026', date: '2026-02-15', location: 'Bandung', participantCount: 150 },
    { id: '2', name: 'O2SN Provinsi', date: '2026-03-10', location: 'Jakarta', participantCount: 200 },
];

export default function PerpaniDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<RegionStats | null>(null);
    const [clubs, setClubs] = useState<ClubSummary[]>([]);
    const [events, setEvents] = useState<UpcomingEvent[]>([]);
    const [pendingCoaches, setPendingCoaches] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, clubsRes, eventsRes, coachesRes] = await Promise.all([
                api.get('/perpani/stats').catch(() => ({ data: null })),
                api.get('/perpani/clubs').catch(() => ({ data: [] })),
                api.get('/perpani/events').catch(() => ({ data: [] })),
                api.get('/coaches/pending').catch(() => ({ data: { data: [] } }))
            ]);
            setStats(statsRes.data?.data || statsRes.data || MOCK_STATS);
            setClubs(clubsRes.data?.length > 0 ? clubsRes.data : MOCK_CLUBS);
            setEvents(eventsRes.data?.length > 0 ? eventsRes.data : MOCK_EVENTS);
            setPendingCoaches(coachesRes.data?.data?.length || 0);
        } catch (error) {
            console.log('Using mock data');
            setStats(MOCK_STATS);
            setClubs(MOCK_CLUBS);
            setEvents(MOCK_EVENTS);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-500/20 text-green-400';
            case 'PENDING': return 'bg-yellow-500/20 text-yellow-400';
            case 'SUSPENDED': return 'bg-red-500/20 text-red-400';
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
                    Perpani <span className="gradient-text">Dashboard</span>
                </h1>
                <p className="text-dark-400 mt-1">
                    Regional archery federation overview
                </p>
            </motion.div>

            {/* Stats Grid */}
            {stats && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-5 gap-4"
                >
                    <StatCard icon={Building2} label="Total Clubs" value={stats.totalClubs} color="bg-blue-500/20 text-blue-400" />
                    <StatCard icon={Users} label="Athletes" value={stats.totalAthletes.toLocaleString()} color="bg-green-500/20 text-green-400" />
                    <StatCard icon={Trophy} label="Active Events" value={stats.activeCompetitions} color="bg-yellow-500/20 text-yellow-400" />
                    <StatCard icon={Award} label="Pending Approvals" value={stats.pendingApprovals} color="bg-red-500/20 text-red-400" />
                    <StatCard
                        icon={UserCheck}
                        label="Coach Verifications"
                        value={pendingCoaches}
                        color="bg-amber-500/20 text-amber-400"
                        onClick={() => navigate('/perpani/coach-verification')}
                    />
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Registered Clubs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card"
                >
                    <div className="p-4 border-b border-dark-700 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-white">Registered Clubs</h2>
                            <p className="text-sm text-dark-400">Member organizations</p>
                        </div>
                        <button className="text-sm text-primary-400 hover:underline">View All</button>
                    </div>
                    <div className="divide-y divide-dark-700">
                        {clubs.slice(0, 4).map(club => (
                            <div key={club.id} className="p-4 hover:bg-dark-800/50 transition-colors cursor-pointer">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                                            <Building2 className="w-5 h-5 text-primary-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{club.name}</div>
                                            <div className="text-sm text-dark-400 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {club.location}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className="font-bold text-white">{club.memberCount}</div>
                                            <div className="text-xs text-dark-400">members</div>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(club.status)}`}>
                                            {club.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Upcoming Events */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card"
                >
                    <div className="p-4 border-b border-dark-700 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-white">Upcoming Events</h2>
                            <p className="text-sm text-dark-400">Scheduled competitions</p>
                        </div>
                        <button className="text-sm text-primary-400 hover:underline">View Calendar</button>
                    </div>
                    {events.length === 0 ? (
                        <div className="p-8 text-center">
                            <Calendar className="w-12 h-12 mx-auto mb-3 text-dark-600" />
                            <p className="text-dark-400">No upcoming events</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-dark-700">
                            {events.map(event => (
                                <div key={event.id} className="p-4 hover:bg-dark-800/50 transition-colors cursor-pointer">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                                                <Trophy className="w-5 h-5 text-yellow-400" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{event.name}</div>
                                                <div className="text-sm text-dark-400 flex items-center gap-2">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    <span className="text-dark-600">•</span>
                                                    <MapPin className="w-3 h-3" />
                                                    {event.location}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-right">
                                                <div className="font-bold text-white">{event.participantCount}</div>
                                                <div className="text-xs text-dark-400">participants</div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-dark-500" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-5 gap-4"
            >
                <QuickAction icon={Building2} label="Approve Clubs" color="bg-blue-500" onClick={() => navigate('/club-approval')} />
                <QuickAction icon={UserCheck} label="Verify Coaches" color="bg-amber-500" onClick={() => navigate('/perpani/coach-verification')} badge={pendingCoaches > 0 ? pendingCoaches : undefined} />
                <QuickAction icon={Award} label="Issue Licenses" color="bg-green-500" onClick={() => navigate('/licensing')} />
                <QuickAction icon={Trophy} label="Create Event" color="bg-yellow-500" onClick={() => navigate('/events/new')} />
                <QuickAction icon={Target} label="View Reports" color="bg-purple-500" onClick={() => navigate('/enhanced-reports')} />
            </motion.div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color, onClick }: { icon: React.ElementType; label: string; value: string | number; color: string; onClick?: () => void }) {
    return (
        <div
            className={`card p-4 ${onClick ? 'cursor-pointer hover:bg-dark-800/50 transition-colors' : ''}`}
            onClick={onClick}
        >
            <div className={`w-10 h-10 rounded-lg ${color.split(' ')[0]} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color.split(' ')[1]}`} />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-sm text-dark-400">{label}</div>
        </div>
    );
}

function QuickAction({ icon: Icon, label, color, onClick, badge }: { icon: React.ElementType; label: string; color: string; onClick?: () => void; badge?: number }) {
    return (
        <button
            onClick={onClick}
            className="card p-4 hover:bg-dark-800/50 transition-colors text-left group relative"
        >
            {badge !== undefined && badge > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {badge}
                </span>
            )}
            <div className={`w-10 h-10 rounded-lg ${color}/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-').replace('-500', '-400')}`} />
            </div>
            <div className="font-medium text-white">{label}</div>
        </button>
    );
}

