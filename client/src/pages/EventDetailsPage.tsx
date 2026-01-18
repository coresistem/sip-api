
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
    Target
} from 'lucide-react';
import { api, useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

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

            <div className="container mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Description */}
                    <section className="card p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Trophy className="text-primary-500" size={20} />
                            About Event
                        </h2>
                        <div className="prose prose-invert max-w-none text-dark-300 whitespace-pre-line">
                            {event.description || "No description provided."}
                        </div>
                        {event.locationUrl && (
                            <a
                                href={event.locationUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-4 inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm"
                            >
                                <MapPin size={16} />
                                View on Google Maps
                            </a>
                        )}
                    </section>

                    {/* Categories */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Target className="text-primary-500" size={20} />
                            Competition Categories
                        </h2>

                        {isRegistered && (
                            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                    <CheckCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-green-400">You are registered!</h3>
                                    <p className="text-sm text-green-500/80">
                                        Category: {registeredCategory?.division} - {registeredCategory?.ageClass} {registeredCategory?.gender}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="grid gap-4">
                            {event.categories.map((cat) => (
                                <div
                                    key={cat.id}
                                    className={`bg-dark-900 border ${isRegistered && registeredCategory?.id === cat.id ? 'border-green-500/50 bg-green-500/5' : 'border-dark-700'} rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-dark-600`}
                                >
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-bold text-white">
                                                {cat.division}
                                            </h3>
                                            <span className="px-2 py-0.5 bg-dark-700 text-dark-300 text-xs rounded">
                                                {cat.distance}m
                                            </span>
                                        </div>
                                        <p className="text-dark-400 text-sm">
                                            {cat.ageClass} • {cat.gender === 'MALE' ? 'Men' : cat.gender === 'FEMALE' ? 'Women' : 'Mixed Team'}
                                        </p>
                                        <div className="mt-2 flex items-center gap-4 text-xs font-medium">
                                            <span className="text-primary-400">
                                                IDR {cat.fee.toLocaleString('id-ID')}
                                            </span>
                                            <span className={`${(cat._count?.registrations || 0) >= cat.quota ? 'text-red-400' : 'text-dark-500'}`}>
                                                {cat._count?.registrations || 0} / {cat.quota} Seats
                                            </span>
                                        </div>
                                    </div>

                                    {!isRegistered && (
                                        <button
                                            onClick={() => handleRegisterClick(cat)}
                                            disabled={(cat._count?.registrations || 0) >= cat.quota}
                                            className="btn-primary min-w-[120px]"
                                        >
                                            {(cat._count?.registrations || 0) >= cat.quota ? 'Full' : 'Register'}
                                        </button>
                                    )}

                                    {isRegistered && registeredCategory?.id === cat.id && (
                                        <button className="btn-secondary min-w-[120px] cursor-default opacity-100">
                                            Registered
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
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-dark-400">Registration Closes</span>
                                <span className="font-medium text-white">
                                    {/* Calculated or specific field */}
                                    {new Date(event.startDate).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-dark-700">
                            <h4 className="font-medium text-white mb-2 text-sm">Need Help?</h4>
                            <p className="text-xs text-dark-400 mb-4">
                                Contact the organizer for questions about categories or eligibility.
                            </p>
                            <button className="w-full btn-ghost text-sm">
                                Contact Organizer
                            </button>
                        </div>
                    </div>
                </div>
            </div >

            {/* Registration Confirmation Modal */}
            <AnimatePresence>
                {
                    showConfirmModal && selectedCategory && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="card w-full max-w-lg p-6 relative bg-dark-900 border border-dark-700 shadow-2xl"
                            >
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="absolute top-4 right-4 text-dark-400 hover:text-white"
                                >
                                    <ArrowLeft size={20} className="rotate-180" /> {/* Close Icon equiv */}
                                </button>

                                <h2 className="text-xl font-bold text-white mb-1">Confirm Registration</h2>
                                <p className="text-dark-400 text-sm mb-6">
                                    Please review your participant details for IanSEO.
                                </p>

                                <div className="bg-dark-800 rounded-lg p-4 mb-6 border border-dark-700">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 font-bold text-xl">
                                            {user?.name?.charAt(0) || 'A'}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">{user?.name}</div>
                                            <div className="text-sm text-dark-400">{user?.email}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-dark-500 mb-1">Date of Birth</div>
                                            <div className="text-white font-medium">
                                                {profileCheckLoading ? 'Loading...' :
                                                    athleteProfile?.dateOfBirth ? new Date(athleteProfile.dateOfBirth).toLocaleDateString() :
                                                        <span className="text-red-400 flex items-center gap-1"><AlertCircle size={12} /> Missing</span>}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-dark-500 mb-1">Club</div>
                                            <div className="text-white font-medium">
                                                {profileCheckLoading ? 'Loading...' :
                                                    athleteProfile?.club?.name ||
                                                    <span className="text-amber-400 text-xs">Unattached (Individual)</span>}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-dark-500 mb-1">Category</div>
                                            <div className="text-primary-400 font-bold">
                                                {selectedCategory.division} - {selectedCategory.ageClass}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-dark-500 mb-1">Fee</div>
                                            <div className="text-white font-medium">
                                                IDR {selectedCategory.fee.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {athleteProfile && !athleteProfile.dateOfBirth && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3 mb-6">
                                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                        <div className="text-sm">
                                            <p className="font-medium text-red-400">Missing Profile Data</p>
                                            <p className="text-red-300/80 mt-1">
                                                Your Date of Birth is required for IanSEO registration. Please update your profile settings before continuing.
                                            </p>
                                            <button
                                                onClick={() => navigate('/profile')}
                                                className="mt-2 text-xs font-bold text-red-400 hover:text-red-300 underline"
                                            >
                                                Go to Profile Settings
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 mt-4">
                                    <button
                                        onClick={() => setShowConfirmModal(false)}
                                        className="btn-ghost flex-1 py-3"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmRegistration}
                                        disabled={registering || (athleteProfile && !athleteProfile.dateOfBirth)}
                                        className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                                    >
                                        {registering && <Loader2 className="animate-spin" size={18} />}
                                        Confirm & Pay
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >
        </div >
    );
}
