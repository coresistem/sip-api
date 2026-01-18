import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Search,
    CheckCircle,
    XCircle,
    Loader2,
    Download
} from 'lucide-react';
import { api } from '../context/AuthContext';

interface Participant {
    id: string;
    athleteName: string;
    clubName: string;
    category: string;
    division: string;
    registeredAt: string;
    status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'WAITLIST';
    paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
}

interface RegistrationStats {
    total: number;
    confirmed: number;
    pending: number;
    rejected: number;
    capacity: number;
}

// Mock data
const MOCK_STATS: RegistrationStats = {
    total: 85,
    confirmed: 60,
    pending: 20,
    rejected: 5,
    capacity: 200
};

const MOCK_PARTICIPANTS: Participant[] = [
    { id: '1', athleteName: 'Ahmad Santoso', clubName: 'Klub Panahan Bandung', category: 'RECURVE', division: 'SENIOR', registeredAt: '2026-01-10', status: 'CONFIRMED', paymentStatus: 'PAID' },
    { id: '2', athleteName: 'Budi Prasetyo', clubName: 'Archery Club Jakarta', category: 'COMPOUND', division: 'SENIOR', registeredAt: '2026-01-11', status: 'PENDING', paymentStatus: 'UNPAID' },
    { id: '3', athleteName: 'Citra Dewi', clubName: 'Perpani Surabaya', category: 'RECURVE', division: 'JUNIOR', registeredAt: '2026-01-12', status: 'CONFIRMED', paymentStatus: 'PAID' },
    { id: '4', athleteName: 'Dian Permata', clubName: 'Klub Busur Yogya', category: 'BAREBOW', division: 'MASTER', registeredAt: '2026-01-09', status: 'PENDING', paymentStatus: 'UNPAID' },
    { id: '5', athleteName: 'Eko Wirawan', clubName: 'Panah Jaya Semarang', category: 'RECURVE', division: 'SENIOR', registeredAt: '2026-01-08', status: 'REJECTED', paymentStatus: 'REFUNDED' }
];

export default function EventRegistrationPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<RegistrationStats | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, participantsRes] = await Promise.all([
                api.get('/api/v1/eo/registrations/stats'),
                api.get('/api/v1/eo/registrations')
            ]);
            setStats(statsRes.data || MOCK_STATS);
            setParticipants(participantsRes.data?.length > 0 ? participantsRes.data : MOCK_PARTICIPANTS);
        } catch (error) {
            console.log('Using mock data');
            setStats(MOCK_STATS);
            setParticipants(MOCK_PARTICIPANTS);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = (id: string) => {
        setParticipants(prev => prev.map(p => p.id === id ? { ...p, status: 'CONFIRMED' } : p));
    };

    const handleReject = (id: string) => {
        setParticipants(prev => prev.map(p => p.id === id ? { ...p, status: 'REJECTED' } : p));
    };

    const filteredParticipants = participants.filter(p => {
        const matchesSearch = p.athleteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.clubName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
        const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-green-500/20 text-green-400';
            case 'PENDING': return 'bg-yellow-500/20 text-yellow-400';
            case 'REJECTED': return 'bg-red-500/20 text-red-400';
            case 'WAITLIST': return 'bg-blue-500/20 text-blue-400';
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
                        Event <span className="gradient-text">Registration</span>
                    </h1>
                    <p className="text-dark-400 mt-1">Manage participant registrations</p>
                </div>
                <button className="btn-secondary flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export List
                </button>
            </motion.div>

            {/* Stats */}
            {stats && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-5 gap-4"
                >
                    <div className="card p-4 bg-gradient-to-br from-primary-500/20 to-accent-500/20 border-primary-500/30">
                        <div className="text-sm text-primary-400">Capacity</div>
                        <div className="text-2xl font-bold text-white">{stats.total}/{stats.capacity}</div>
                        <div className="w-full bg-dark-700 rounded-full h-2 mt-2">
                            <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${(stats.total / stats.capacity) * 100}%` }} />
                        </div>
                    </div>
                    <div className="card p-4">
                        <div className="text-sm text-dark-400">Confirmed</div>
                        <div className="text-2xl font-bold text-green-400">{stats.confirmed}</div>
                    </div>
                    <div className="card p-4">
                        <div className="text-sm text-dark-400">Pending</div>
                        <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
                    </div>
                    <div className="card p-4">
                        <div className="text-sm text-dark-400">Rejected</div>
                        <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
                    </div>
                    <div className="card p-4">
                        <div className="text-sm text-dark-400">Available</div>
                        <div className="text-2xl font-bold text-white">{stats.capacity - stats.total}</div>
                    </div>
                </motion.div>
            )}

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col md:flex-row gap-4"
            >
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                        type="text"
                        placeholder="Search participants..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input pl-10 w-full"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['ALL', 'PENDING', 'CONFIRMED', 'REJECTED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === status
                                ? 'bg-primary-500 text-white'
                                : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['ALL', 'RECURVE', 'COMPOUND', 'BAREBOW'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${categoryFilter === cat
                                ? 'bg-accent-500 text-white'
                                : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Participants List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card"
            >
                {filteredParticipants.length === 0 ? (
                    <div className="p-8 text-center">
                        <Users className="w-12 h-12 mx-auto mb-3 text-dark-600" />
                        <p className="text-dark-400">No participants match your filters</p>
                    </div>
                ) : (
                    <div className="divide-y divide-dark-700">
                        {filteredParticipants.map(participant => (
                            <div key={participant.id} className="p-4 hover:bg-dark-800/50 transition-colors">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                                            {participant.athleteName.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{participant.athleteName}</div>
                                            <div className="text-sm text-dark-400">{participant.clubName}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right text-sm">
                                            <div className="text-white">{participant.category}</div>
                                            <div className="text-dark-400">{participant.division}</div>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(participant.status)}`}>
                                            {participant.status}
                                        </span>
                                        {participant.status === 'PENDING' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleConfirm(participant.id)}
                                                    className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleReject(participant.id)}
                                                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
