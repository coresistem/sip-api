import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Calendar,
    Users,
    Trophy,
    MapPin,
    Clock,
    ChevronRight,
    Loader2,
    Plus,
    Settings,
    BarChart3
} from 'lucide-react';
import { api } from '../../context/AuthContext';

interface EventStats {
    totalEvents: number;
    activeEvents: number;
    totalParticipants: number;
    upcomingEvents: number;
}

interface Event {
    id: string;
    name: string;
    type: 'REGIONAL' | 'PROVINCIAL' | 'NATIONAL' | 'OPEN';
    status: 'DRAFT' | 'OPEN_REGISTRATION' | 'CLOSED' | 'ONGOING' | 'COMPLETED';
    startDate: string;
    endDate: string;
    venue: string;
    participantCount: number;
    maxParticipants: number;
}

// Mock data
const MOCK_STATS: EventStats = {
    totalEvents: 12,
    activeEvents: 2,
    totalParticipants: 450,
    upcomingEvents: 3
};

const MOCK_EVENTS: Event[] = [
    {
        id: '1',
        name: 'Kejuaraan Panahan Regional Bandung 2026',
        type: 'REGIONAL',
        status: 'OPEN_REGISTRATION',
        startDate: '2026-02-20',
        endDate: '2026-02-22',
        venue: 'GOR Panahan Bandung',
        participantCount: 85,
        maxParticipants: 200
    },
    {
        id: '2',
        name: 'Open Tournament Jakarta 2026',
        type: 'OPEN',
        status: 'DRAFT',
        startDate: '2026-03-15',
        endDate: '2026-03-17',
        venue: 'Gelora Bung Karno',
        participantCount: 0,
        maxParticipants: 300
    },
    {
        id: '3',
        name: 'Kejuaraan Provinsi 2025',
        type: 'PROVINCIAL',
        status: 'COMPLETED',
        startDate: '2025-11-10',
        endDate: '2025-11-12',
        venue: 'GOR Cikutra',
        participantCount: 150,
        maxParticipants: 150
    }
];

export default function EODashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<EventStats | null>(null);
    const [events, setEvents] = useState<Event[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, eventsRes] = await Promise.all([
                api.get('/eo/stats'),
                api.get('/eo/events')
            ]);
            setStats(statsRes.data?.data || MOCK_STATS);
            setEvents(eventsRes.data?.data?.length > 0 ? eventsRes.data.data : MOCK_EVENTS);
        } catch (error) {
            console.log('Using mock data');
            setStats(MOCK_STATS);
            setEvents(MOCK_EVENTS);
        } finally {
            setLoading(false);
        }
    };



    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-gray-500/20 text-gray-400';
            case 'OPEN_REGISTRATION': return 'bg-green-500/20 text-green-400';
            case 'CLOSED': return 'bg-yellow-500/20 text-yellow-400';
            case 'ONGOING': return 'bg-blue-500/20 text-blue-400';
            case 'COMPLETED': return 'bg-purple-500/20 text-purple-400';
            default: return 'bg-dark-700 text-dark-400';
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'REGIONAL': return 'bg-blue-500/20 text-blue-400';
            case 'PROVINCIAL': return 'bg-green-500/20 text-green-400';
            case 'NATIONAL': return 'bg-red-500/20 text-red-400';
            case 'OPEN': return 'bg-yellow-500/20 text-yellow-400';
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
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold">
                        Event <span className="gradient-text">Organizer</span>
                    </h1>
                    <p className="text-dark-400 mt-1">
                        Manage your archery competitions
                    </p>
                </div>
                <div className="flex gap-4">
                    <Link to="/events/new" className="btn-primary flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create Event
                    </Link>
                </div>
            </motion.div>

            {/* Stats Grid */}
            {stats && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                    <StatCard icon={Calendar} label="Total Events" value={stats.totalEvents} color="bg-blue-500/20 text-blue-400" />
                    <StatCard icon={Trophy} label="Active Events" value={stats.activeEvents} color="bg-green-500/20 text-green-400" />
                    <StatCard icon={Users} label="Total Participants" value={stats.totalParticipants} color="bg-purple-500/20 text-purple-400" />
                    <StatCard icon={Clock} label="Upcoming" value={stats.upcomingEvents} color="bg-yellow-500/20 text-yellow-400" />
                </motion.div>
            )}

            {/* Events List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card"
            >
                <div className="p-4 border-b border-dark-700 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-white">Your Events</h2>
                        <p className="text-sm text-dark-400">Manage and monitor competitions</p>
                    </div>
                </div>
                {events.length === 0 ? (
                    <div className="p-12 text-center">
                        <Trophy className="w-16 h-16 mx-auto mb-4 text-dark-600" />
                        <h3 className="text-lg font-medium text-white mb-2">No Events Yet</h3>
                        <p className="text-dark-400 mb-4">Create your first event to get started</p>
                        <button className="btn-primary">Create Event</button>
                    </div>
                ) : (
                    <div className="divide-y divide-dark-700">
                        {events.map(event => (
                            <Link to={`/events/${event.id}/manage`} key={event.id} className="block">
                                <div className="p-4 hover:bg-dark-800/50 transition-colors cursor-pointer">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                                <Trophy className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{event.name}</div>
                                                <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-dark-400">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>{new Date(event.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {new Date(event.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                    <span className="text-dark-600">•</span>
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        <span>{event.venue}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex gap-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeBadge(event.type)}`}>
                                                    {event.type}
                                                </span>
                                                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(event.status)}`}>
                                                    {event.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-white">{event.participantCount}/{event.maxParticipants}</div>
                                                <div className="text-xs text-dark-400">participants</div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-dark-500" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
                <QuickAction icon={Plus} label="New Event" color="bg-primary-500" />
                <QuickAction icon={Users} label="Participants" color="bg-green-500" />
                <QuickAction icon={BarChart3} label="Reports" color="bg-purple-500" />
                <QuickAction icon={Settings} label="Settings" color="bg-gray-500" />
            </motion.div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
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

function QuickAction({ icon: Icon, label, color }: { icon: React.ElementType; label: string; color: string }) {
    return (
        <button className="card p-4 hover:bg-dark-800/50 transition-colors text-left group">
            <div className={`w-10 h-10 rounded-lg ${color}/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-').replace('-500', '-400')}`} />
            </div>
            <div className="font-medium text-white">{label}</div>
        </button>
    );
}
