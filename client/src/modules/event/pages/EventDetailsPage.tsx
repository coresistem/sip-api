
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    MapPin,
    Trophy,
    CheckCircle,
    AlertCircle,
    Loader2,
    ArrowLeft,
    Clock,
    Target,
    BarChart3,
    ArrowRight
} from 'lucide-react';
import { api, useAuth } from '../../core/contexts/AuthContext';
import { toast } from 'react-toastify';
import Leaderboard from '../components/Leaderboard';

interface Category {
    id: string;
    division: string;
    ageClass: string;
    gender: string;
    distance: number;
    quota: number;
    fee: number;
    _count?: {
        registrations: number;
    };
}

interface EventDetails {
    id: string;
    name: string;
    type: string;
    startDate: string;
    endDate: string;
    venue: string;
    city: string;
    locationUrl?: string;
    description: string;
    status: string;
    categories: Category[];
    schedule: ScheduleItem[];
    registrations?: any[]; // To check if already registered
}

interface ScheduleItem {
    id: string;
    dayDate: string;
    startTime: string;
    endTime: string;
    activity: string;
    category?: string;
    notes?: string;
}

export default function EventDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [event, setEvent] = useState<EventDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState<string | null>(null); // storing categoryId being registered
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [activeTab, setActiveTab] = useState<'INFO' | 'RESULTS'>('INFO');
    const [activeLeaderboardCategory, setActiveLeaderboardCategory] = useState<string | null>(null);

    // Profile check state
    const [athleteProfile, setAthleteProfile] = useState<any>(null);
    const [profileCheckLoading, setProfileCheckLoading] = useState(false);

    useEffect(() => {
        if (id) {
            fetchEventDetails();
        }
    }, [id]);

    const fetchEventDetails = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/events/${id}`);
            if (res.data.success) {
                setEvent(res.data.data);
            }
        } catch (error) {
            console.error('Failed to load event:', error);
            toast.error('Failed to load event details');
            navigate('/events');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterClick = async (category: Category) => {
        if (!isAuthenticated) {
            toast.info('Please login to register');
            navigate('/login', { state: { from: `/events/${id}` } });
            return;
        }

        setSelectedCategory(category);
        setProfileCheckLoading(true);
        setShowConfirmModal(true);

        try {
            // Fetch fresh athlete profile to verify data completeness
            const res = await api.get(`/athletes/${user?.athleteId || 'me'}`);
            if (res.data.success) {
                setAthleteProfile(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            // Fallback: rely on Auth context user, but warn
        } finally {
            setProfileCheckLoading(false);
        }
    };

    const confirmRegistration = async () => {
        if (!selectedCategory || !event) return;

        setRegistering(selectedCategory.id);
        try {
            const res = await api.post('/events/register', {
                categoryId: selectedCategory.id
            });

            if (res.data.success) {
                toast.success('Registration successful!');
                setShowConfirmModal(false);
                fetchEventDetails(); // Refresh to update quota/status
            }
        } catch (error: any) {
            console.error('Registration failed:', error);
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setRegistering(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-dark-950">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (!event) return null;

    const isRegistered = event.registrations && event.registrations.length > 0;
    const registeredCategory = isRegistered ? event.categories.find(c => c.id === event.registrations![0].categoryId) : null;

    return (
        <div className="min-h-screen bg-dark-950 pb-20">
            {/* Hero Section */}
            <div className="relative h-64 md:h-80 bg-gradient-to-br from-dark-900 to-dark-800 overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent" />

                <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-8 relative z-10">
                    <button
                        onClick={() => navigate('/events')}
                        className="absolute top-6 left-4 p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${event.type === 'NATIONAL' ? 'bg-red-500/20 text-red-500' :
                                event.type === 'PROVINCIAL' ? 'bg-green-500/20 text-green-500' :
                                    'bg-blue-500/20 text-blue-500'
                                }`}>
                                {event.type}
                            </span>
                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-dark-700 text-dark-300">
                                {event.status.replace('_', ' ')}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
                            {event.name}
                        </h1>
                        <div className="flex flex-wrap gap-6 text-dark-300">
                            <div className="flex items-center gap-2">
                                <Calendar size={18} className="text-primary-500" />
                                <span>{new Date(event.startDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={18} className="text-primary-500" />
                                <span>{event.venue}, {event.city}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-8">
                {/* Tab Navigation */}
                <div className="flex items-center gap-1 p-1 bg-dark-900 border border-dark-800 rounded-xl mb-8 w-fit">
                    <button
                        onClick={() => setActiveTab('INFO')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'INFO' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-dark-400 hover:text-white'}`}
                    >
                        Event Information
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('RESULTS');
                            if (!activeLeaderboardCategory && event.categories.length > 0) {
                                setActiveLeaderboardCategory(event.categories[0].id);
                            }
                        }}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'RESULTS' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-dark-400 hover:text-white'}`}
                    >
                        <BarChart3 size={16} />
                        Live Results
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <AnimatePresence mode="wait">
                            {activeTab === 'INFO' ? (
                                <motion.div
                                    key="info"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-8"
                                >
                                    <section className="card p-6">
                                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                            <Trophy className="text-primary-500" size={20} />
                                            About Event
                                        </h2>
                                        <div className="prose prose-invert max-w-none text-dark-300 whitespace-pre-line">
                                            {event.description || "No description provided."}
                                        </div>
                                    </section>

                                    <section>
                                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                            <Target className="text-primary-500" size={20} />
                                            Competition Categories
                                        </h2>

                                        <div className="grid gap-4">
                                            {event.categories.map((cat) => (
                                                <div
                                                    key={cat.id}
                                                    className={`bg-dark-900 border ${isRegistered && registeredCategory?.id === cat.id ? 'border-green-500/50 bg-green-500/5' : 'border-dark-700'} rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-dark-600`}
                                                >
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="text-lg font-bold text-white">{cat.division}</h3>
                                                            <span className="px-2 py-0.5 bg-dark-700 text-dark-300 text-xs rounded">{cat.distance}m</span>
                                                        </div>
                                                        <p className="text-dark-400 text-sm">{cat.ageClass} • {cat.gender === 'MALE' ? 'Men' : cat.gender === 'FEMALE' ? 'Women' : 'Mixed Team'}</p>
                                                    </div>
                                                    {!isRegistered && (
                                                        <button onClick={() => handleRegisterClick(cat)} disabled={(cat._count?.registrations || 0) >= cat.quota} className="btn-primary min-w-[120px]">
                                                            {(cat._count?.registrations || 0) >= cat.quota ? 'Full' : 'Register'}
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Event Schedule */}
                                    {event.schedule && event.schedule.length > 0 && (
                                        <section>
                                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                                <Clock className="text-primary-500" size={20} />
                                                Event Schedule
                                            </h2>
                                            <div className="space-y-6">
                                                {Object.entries(
                                                    event.schedule.reduce((groups, item) => {
                                                        const date = item.dayDate.split('T')[0];
                                                        if (!groups[date]) groups[date] = [];
                                                        groups[date].push(item);
                                                        return groups;
                                                    }, {} as Record<string, ScheduleItem[]>)
                                                ).sort().map(([date, items]) => (
                                                    <div key={date} className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
                                                        <div className="bg-dark-800/50 px-5 py-3 font-bold text-white flex items-center gap-2 border-b border-dark-700">
                                                            <Calendar size={16} className="text-primary-400" />
                                                            {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                        </div>
                                                        <div className="divide-y divide-dark-700/50">
                                                            {items.map(item => (
                                                                <div key={item.id} className="p-4 flex items-start md:items-center gap-4 hover:bg-white/5 transition-colors">
                                                                    <div className="min-w-[100px] text-sm font-mono text-primary-300 pt-1 md:pt-0">
                                                                        {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                                                        {new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="font-medium text-white">{item.activity}</div>
                                                                        {(item.category || item.notes) && (
                                                                            <div className="text-sm text-dark-400 flex flex-wrap gap-2 mt-1">
                                                                                {item.category && <span className="bg-dark-800 px-2 rounded-sm text-xs border border-dark-700">{item.category}</span>}
                                                                                {item.notes && <span className="text-dark-500 italic">{item.notes}</span>}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="flex flex-wrap gap-2">
                                        {event.categories.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setActiveLeaderboardCategory(cat.id)}
                                                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${activeLeaderboardCategory === cat.id ? 'bg-primary-500/10 border-primary-500 text-primary-400' : 'bg-dark-900 border-dark-700 text-dark-400 hover:border-dark-600'}`}
                                            >
                                                {cat.division} {cat.ageClass}
                                            </button>
                                        ))}
                                    </div>
                                    {activeLeaderboardCategory && (
                                        <Leaderboard competitionId={event.id} categoryId={activeLeaderboardCategory} />
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="card p-6 sticky top-8">
                            <h3 className="font-bold text-white mb-4">Event Status</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-dark-400">Status</span>
                                    <span className="font-medium text-white">{event.status.replace('_', ' ')}</span>
                                </div>

                                {/* Management Actions */}
                                {(user?.role === 'SUPER_ADMIN' || user?.role === 'EO' || user?.role === 'JUDGE') && (
                                    <div className="mt-4 pt-4 border-t border-dark-700 space-y-2">
                                        <h4 className="text-[10px] font-bold text-dark-500 uppercase tracking-widest mb-3">Management</h4>
                                        <button
                                            onClick={() => navigate('/events/scoring')}
                                            className="w-full flex items-center justify-between p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 hover:bg-primary-500 hover:text-white transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Target size={18} />
                                                <span className="text-sm font-bold">Record Scores</span>
                                            </div>
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Registration Confirmation Modal */}
            <AnimatePresence>
                {showConfirmModal && selectedCategory && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="card w-full max-w-lg p-6 relative bg-dark-900 border border-dark-700 shadow-2xl"
                        >
                            <h2 className="text-xl font-bold text-white mb-6">Confirm Registration</h2>
                            <div className="bg-dark-800 rounded-lg p-4 mb-6 border border-dark-700">
                                <div className="flex items-center gap-4 mb-4 text-white">
                                    <h3 className="font-bold">{user?.name}</h3>
                                </div>
                                <div className="text-sm text-primary-400 font-bold">
                                    {selectedCategory.division} - {selectedCategory.ageClass}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowConfirmModal(false)} className="btn-ghost flex-1 py-3">Cancel</button>
                                <button onClick={confirmRegistration} disabled={!!registering} className="btn-primary flex-1 py-3">
                                    {registering ? 'Processing...' : 'Confirm & Pay'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
