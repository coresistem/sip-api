import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    Calendar,
    Plus,
    Clock,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Users,
    Filter,
    X
} from 'lucide-react';

type ViewMode = 'day' | 'week' | 'month';

interface ScheduleEvent {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    venue: string;
    category: 'training' | 'competition' | 'event' | 'meeting' | 'technique' | 'fitness' | 'mental';
    participants: number;
    description?: string;
}

// Category colors (Google Calendar style)
const categoryColors = {
    training: {
        bg: 'bg-blue-500',
        bgLight: 'bg-blue-500/20',
        border: 'border-blue-500',
        text: 'text-blue-400',
        label: 'Training'
    },
    competition: {
        bg: 'bg-red-500',
        bgLight: 'bg-red-500/20',
        border: 'border-red-500',
        text: 'text-red-400',
        label: 'Competition'
    },
    event: {
        bg: 'bg-green-500',
        bgLight: 'bg-green-500/20',
        border: 'border-green-500',
        text: 'text-green-400',
        label: 'Event'
    },
    meeting: {
        bg: 'bg-purple-500',
        bgLight: 'bg-purple-500/20',
        border: 'border-purple-500',
        text: 'text-purple-400',
        label: 'Meeting'
    },
    technique: {
        bg: 'bg-indigo-500',
        bgLight: 'bg-indigo-500/20',
        border: 'border-indigo-500',
        text: 'text-indigo-400',
        label: 'Technique'
    },
    fitness: {
        bg: 'bg-orange-500',
        bgLight: 'bg-orange-500/20',
        border: 'border-orange-500',
        text: 'text-orange-400',
        label: 'Fitness'
    },
    mental: {
        bg: 'bg-teal-500',
        bgLight: 'bg-teal-500/20',
        border: 'border-teal-500',
        text: 'text-teal-400',
        label: 'Mental'
    },
};

// Sample schedule data
const sampleSchedules: ScheduleEvent[] = [
    { id: '1', title: 'Morning Training', date: '2026-01-05', startTime: '06:00', endTime: '08:00', venue: 'Indoor Range', category: 'training', participants: 12 },
    { id: '2', title: 'Technique Session', date: '2026-01-05', startTime: '09:00', endTime: '11:00', venue: 'Main Field', category: 'training', participants: 8 },
    { id: '3', title: 'Provincial Championship', date: '2026-01-06', startTime: '08:00', endTime: '17:00', venue: 'Jakarta Sports Center', category: 'competition', participants: 45 },
    { id: '4', title: 'National Selection', date: '2026-01-08', startTime: '07:00', endTime: '18:00', venue: 'GBK Archery Range', category: 'competition', participants: 120 },
    { id: '5', title: 'Club Meeting', date: '2026-01-07', startTime: '14:00', endTime: '16:00', venue: 'Meeting Room', category: 'meeting', participants: 15 },
    { id: '6', title: 'Open Day Event', date: '2026-01-10', startTime: '08:00', endTime: '18:00', venue: 'Main Field', category: 'event', participants: 200 },
    { id: '7', title: 'Start Your Day (Cardio)', date: '2026-01-06', startTime: '06:00', endTime: '07:00', venue: 'Gym', category: 'fitness', participants: 10 },
    { id: '8', title: 'Parent Info Session', date: '2026-01-09', startTime: '10:00', endTime: '12:00', venue: 'Conference Room', category: 'meeting', participants: 25 },
    { id: '9', title: 'Bow Drill & Form', date: '2026-01-07', startTime: '16:00', endTime: '17:30', venue: 'Indoor Range', category: 'technique', participants: 12 },
    { id: '10', title: 'Visualization & Focus', date: '2026-01-08', startTime: '19:00', endTime: '20:00', venue: 'Zoom', category: 'mental', participants: 30 },
];

export default function SchedulesPage() {
    const { user } = useAuth();
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const [currentDate, setCurrentDate] = useState(new Date('2026-01-05'));
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['training', 'competition', 'event', 'meeting', 'technique', 'fitness', 'mental']);
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);

    const isClubOwner = user?.role === 'CLUB';

    // Filter schedules
    const filteredSchedules = sampleSchedules.filter(s => selectedCategories.includes(s.category));

    // Get dates for current view
    const getWeekDates = () => {
        const dates: Date[] = [];
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const getMonthDates = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const dates: Date[] = [];
        const startOffset = firstDay.getDay();

        // Previous month days
        for (let i = startOffset - 1; i >= 0; i--) {
            const d = new Date(year, month, -i);
            dates.push(d);
        }

        // Current month days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            dates.push(new Date(year, month, i));
        }

        // Next month days to fill grid
        const remaining = 42 - dates.length;
        for (let i = 1; i <= remaining; i++) {
            dates.push(new Date(year, month + 1, i));
        }

        return dates;
    };

    const weekDates = getWeekDates();
    const monthDates = getMonthDates();

    // Navigate
    const navigate = (direction: number) => {
        const newDate = new Date(currentDate);
        if (viewMode === 'day') newDate.setDate(currentDate.getDate() + direction);
        else if (viewMode === 'week') newDate.setDate(currentDate.getDate() + direction * 7);
        else newDate.setMonth(currentDate.getMonth() + direction);
        setCurrentDate(newDate);
    };

    const goToToday = () => setCurrentDate(new Date('2026-01-05'));

    const toggleCategory = (cat: string) => {
        if (selectedCategories.includes(cat)) {
            setSelectedCategories(selectedCategories.filter(c => c !== cat));
        } else {
            setSelectedCategories([...selectedCategories, cat]);
        }
    };

    const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

    const getEventsForDate = (date: Date) => {
        const dateStr = formatDateKey(date);
        return filteredSchedules.filter(e => e.date === dateStr);
    };

    const isToday = (date: Date) => {
        const today = new Date('2026-01-05');
        return date.toDateString() === today.toDateString();
    };

    const isCurrentMonth = (date: Date) => date.getMonth() === currentDate.getMonth();

    // Time slots for day view
    const timeSlots = Array.from({ length: 14 }, (_, i) => `${(i + 6).toString().padStart(2, '0')}:00`);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold">Training Schedules</h1>
                    <p className="text-dark-400">Manage training sessions and events</p>
                </div>
                {isClubOwner && (
                    <button className="btn btn-primary">
                        <Plus size={18} />
                        New Event
                    </button>
                )}
            </div>

            {/* Calendar Controls - Google Calendar Style */}
            <div className="card p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Left: Today + Navigation */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={goToToday}
                            className="px-4 py-2 text-sm font-medium border border-dark-600 rounded-lg hover:bg-dark-800 transition-colors"
                        >
                            Today
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-full hover:bg-dark-800 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => navigate(1)}
                            className="p-2 rounded-full hover:bg-dark-800 transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                        <h2 className="text-lg font-semibold ml-2">
                            {viewMode === 'day' && currentDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            {viewMode === 'week' && `${weekDates[0].toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })} – ${weekDates[6].toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                            {viewMode === 'month' && currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                        </h2>
                    </div>

                    {/* Right: View Mode + Filters */}
                    <div className="flex items-center gap-2">
                        {/* View Mode Dropdown */}
                        <div className="flex rounded-lg border border-dark-600 overflow-hidden">
                            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${viewMode === mode
                                        ? 'bg-primary-500 text-white'
                                        : 'hover:bg-dark-800'
                                        }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2 rounded-lg border transition-colors ${showFilters ? 'border-primary-500 bg-primary-500/20 text-primary-400' : 'border-dark-600 hover:bg-dark-800'
                                }`}
                        >
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {/* Category Filters */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-4 pt-4 border-t border-dark-700 flex flex-wrap gap-2">
                                {Object.entries(categoryColors).map(([key, value]) => (
                                    <button
                                        key={key}
                                        onClick={() => toggleCategory(key)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${selectedCategories.includes(key)
                                            ? `${value.bgLight} ${value.text} border ${value.border}`
                                            : 'bg-dark-800 text-dark-400 border border-dark-600'
                                            }`}
                                    >
                                        <span className={`w-2.5 h-2.5 rounded-full ${value.bg}`} />
                                        {value.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Calendar Grid */}
            <div className="card overflow-hidden">
                {/* Week View - Google Calendar Style */}
                {viewMode === 'week' && (
                    <div className="overflow-x-auto">
                        <div className="min-w-[800px]">
                            {/* Header */}
                            <div className="grid grid-cols-8 border-b border-dark-700">
                                <div className="p-2 text-center text-xs text-dark-400 border-r border-dark-700">
                                    Time
                                </div>
                                {weekDates.map((date, i) => (
                                    <div
                                        key={i}
                                        className={`p-3 text-center border-r border-dark-700 last:border-r-0 ${isToday(date) ? 'bg-primary-500/10' : ''
                                            }`}
                                    >
                                        <p className="text-xs text-dark-400">{date.toLocaleDateString('id-ID', { weekday: 'short' })}</p>
                                        <p className={`text-xl font-bold ${isToday(date) ? 'w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center mx-auto' : ''}`}>
                                            {date.getDate()}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Time Grid */}
                            <div className="max-h-[500px] overflow-y-auto">
                                {timeSlots.map((time) => (
                                    <div key={time} className="grid grid-cols-8 border-b border-dark-800 min-h-[60px]">
                                        <div className="p-2 text-xs text-dark-400 border-r border-dark-700 flex items-start">
                                            {time}
                                        </div>
                                        {weekDates.map((date, i) => {
                                            const dateStr = formatDateKey(date);
                                            const events = filteredSchedules.filter(
                                                e => e.date === dateStr && e.startTime.startsWith(time.slice(0, 2))
                                            );
                                            return (
                                                <div
                                                    key={i}
                                                    className="border-r border-dark-800 last:border-r-0 p-1 relative"
                                                >
                                                    {events.map((event) => {
                                                        const color = categoryColors[event.category];
                                                        return (
                                                            <button
                                                                key={event.id}
                                                                onClick={() => setSelectedEvent(event)}
                                                                className={`w-full text-left p-1.5 rounded text-xs ${color.bg} text-white hover:opacity-90 transition-opacity mb-1`}
                                                            >
                                                                <p className="font-medium truncate">{event.title}</p>
                                                                <p className="opacity-80 truncate">{event.startTime}</p>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Month View - Google Calendar Style */}
                {viewMode === 'month' && (
                    <div>
                        {/* Week day headers */}
                        <div className="grid grid-cols-7 border-b border-dark-700">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div key={day} className="p-2 text-center text-xs text-dark-400 font-medium">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7">
                            {monthDates.map((date, i) => {
                                const events = getEventsForDate(date);
                                return (
                                    <div
                                        key={i}
                                        className={`min-h-[100px] border-r border-b border-dark-800 p-1 ${!isCurrentMonth(date) ? 'bg-dark-900/50' : ''
                                            } ${isToday(date) ? 'bg-primary-500/5' : ''}`}
                                    >
                                        <p className={`text-sm mb-1 ${isToday(date)
                                            ? 'w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center'
                                            : isCurrentMonth(date) ? 'text-dark-300' : 'text-dark-500'
                                            }`}>
                                            {date.getDate()}
                                        </p>
                                        <div className="space-y-1">
                                            {events.slice(0, 3).map((event) => {
                                                const color = categoryColors[event.category];
                                                return (
                                                    <button
                                                        key={event.id}
                                                        onClick={() => setSelectedEvent(event)}
                                                        className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] ${color.bg} text-white truncate hover:opacity-90`}
                                                    >
                                                        {event.title}
                                                    </button>
                                                );
                                            })}
                                            {events.length > 3 && (
                                                <p className="text-[10px] text-dark-400 px-1">+{events.length - 3} more</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Day View */}
                {viewMode === 'day' && (
                    <div className="max-h-[600px] overflow-y-auto">
                        {timeSlots.map((time) => {
                            const dateStr = formatDateKey(currentDate);
                            const events = filteredSchedules.filter(
                                e => e.date === dateStr && e.startTime.startsWith(time.slice(0, 2))
                            );
                            return (
                                <div key={time} className="grid grid-cols-[80px_1fr] border-b border-dark-800 min-h-[60px]">
                                    <div className="p-3 text-sm text-dark-400 border-r border-dark-700 flex items-start">
                                        {time}
                                    </div>
                                    <div className="p-2">
                                        {events.map((event) => {
                                            const color = categoryColors[event.category];
                                            return (
                                                <button
                                                    key={event.id}
                                                    onClick={() => setSelectedEvent(event)}
                                                    className={`w-full text-left p-3 rounded-lg ${color.bg} text-white hover:opacity-90 transition-opacity mb-2`}
                                                >
                                                    <p className="font-semibold">{event.title}</p>
                                                    <p className="text-sm opacity-80 mt-1 flex items-center gap-2">
                                                        <Clock size={12} /> {event.startTime} - {event.endTime}
                                                    </p>
                                                    <p className="text-sm opacity-80 flex items-center gap-2">
                                                        <MapPin size={12} /> {event.venue}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Event Detail Modal */}
            <AnimatePresence>
                {selectedEvent && (
                    <motion.div
                        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedEvent(null)}
                    >
                        <motion.div
                            className="card max-w-md w-full"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded ${categoryColors[selectedEvent.category].bg}`} />
                                    <h3 className="text-xl font-bold">{selectedEvent.title}</h3>
                                </div>
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="p-1 hover:bg-dark-700 rounded transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-3 text-dark-300">
                                <div className="flex items-center gap-3">
                                    <Calendar size={18} className="text-dark-400" />
                                    <span>{new Date(selectedEvent.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock size={18} className="text-dark-400" />
                                    <span>{selectedEvent.startTime} - {selectedEvent.endTime}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin size={18} className="text-dark-400" />
                                    <span>{selectedEvent.venue}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Users size={18} className="text-dark-400" />
                                    <span>{selectedEvent.participants} participants</span>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-2">
                                <button className="btn btn-primary flex-1">Edit Event</button>
                                <button className="btn btn-ghost flex-1">Delete</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Category Legend */}
            <div className="card p-4">
                <p className="text-sm text-dark-400 mb-3">Category Legend</p>
                <div className="flex flex-wrap gap-4">
                    {Object.entries(categoryColors).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded ${value.bg}`} />
                            <span className="text-sm">{value.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
