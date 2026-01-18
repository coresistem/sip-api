
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings,
    Calendar as CalendarIcon,
    Users,
    FileText,
    Download,
    Save,
    ArrowLeft,
    Plus,
    Loader2,
    Trophy,
    Upload,
    MapPin,
    Trash2,
    LayoutList,
    Award,
    Target,
    DollarSign,
    Search
} from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import CertificateTemplate from '../components/certificates/CertificateTemplate';
import { api } from '../context/AuthContext';
import { useLocations } from '../hooks/useLocations'; // Import Hook
import { toast } from 'react-toastify';

interface EventForm {
    name: string;
    type: string;
    startDate: string;
    endDate: string;
    registrationDeadline: string;
    venue: string;
    address: string;
    city: string;
    locationUrl: string; // New Field
    description: string;
    maxParticipants: number;
    status: string;
}

const INITIAL_FORM: EventForm = {
    name: '',
    type: 'REGIONAL',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    venue: '',
    address: '',
    city: '',
    locationUrl: '',
    description: '',
    maxParticipants: 100,
    status: 'DRAFT'
};

export default function EventManagementPage() {
    const { id } = useParams(); // If present, we are in Edit/Manage mode
    const navigate = useNavigate();
    const isNew = !id;

    const [activeTab, setActiveTab] = useState<'settings' | 'rundown' | 'targets' | 'budget' | 'timeline' | 'registration' | 'participants' | 'results' | 'certificates'>('settings');
    const [_loading, setLoading] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<EventForm>(INITIAL_FORM);

    // --- Category Management State ---
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

    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [_showCategoryModal, setShowCategoryModal] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars
    const [_editingCategory, setEditingCategory] = useState<string | null>(null); // eslint-disable-line @typescript-eslint/no-unused-vars
    const [categoryForm, setCategoryForm] = useState({
        division: 'RECURVE',
        ageClass: 'GENERAL',
        gender: 'MALE',
        distance: 70,
        quota: 64,
        fee: 150000
    });

    const INITIAL_CATEGORY_FORM = {
        division: 'RECURVE',
        ageClass: 'GENERAL',
        gender: 'MALE',
        distance: 70,
        quota: 64,
        fee: 150000
    };

    // Location Hook
    const {
        provinces,
        cities,
        selectedProvince,
        setSelectedProvince,
        selectedCity,
        setSelectedCity,
        getCityName,
        isLoadingProvinces,
        isLoadingCities
    } = useLocations();

    // Sync City Name to Form when City ID changes
    useEffect(() => {
        if (selectedCity && cities.length > 0) {
            const cityName = getCityName(selectedCity);
            if (cityName) {
                updateForm('city', cityName);
            }
        }
    }, [selectedCity, cities, getCityName]);

    // For Participants Tab
    const [participants, _setParticipants] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-unused-vars
    const [_loadingParticipants, _setLoadingParticipants] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars

    useEffect(() => {
        if (!isNew && id) {
            fetchEventDetails();
        }
    }, [id]);

    const fetchEventDetails = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/eo/events/${id}`);
            if (res.data.success) {
                const data = res.data.data;
                setForm({
                    name: data.name,
                    type: data.type,
                    startDate: data.startDate.split('T')[0],
                    endDate: data.endDate.split('T')[0],
                    registrationDeadline: data.startDate.split('T')[0], // Fallback if missing
                    venue: data.venue,
                    address: data.address || '',
                    city: data.city,
                    locationUrl: data.locationUrl || '',
                    description: data.description || '',
                    maxParticipants: 100, // Default for now
                    status: data.status
                });
            }
        } catch (error) {
            console.error('Failed to fetch event:', error);
            toast.error('Failed to load event details');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (isNew) {
                const _res = await api.post('/eo/events', form); // Fixed: Removed /api/v1 prefix
                // Assuming response returns id, navigate to manage
                // For now, redirect to dashboard as verified in creation
                toast.success('Event Created');
                navigate('/events');
            } else {
                // Update Logic (Missing in controller currently, so placeholder)
                toast.info('Update feature coming soon');
            }
        } catch (error) {
            console.error('Save failed:', error);
            toast.error('Failed to save event');
        } finally {
            setSaving(false);
        }
    };

    const handleExport = async () => {
        if (!id) return;
        try {
            const response = await api.get(`/eo/events/${id}/export/ianseo`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ianseo_export_${id}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Export downloaded');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Export failed. Ensure there are confirmed registrations.');
        }
    };

    const updateForm = (field: keyof EventForm, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    // For Import
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importing, setImporting] = useState(false);

    // ... (existing useEffect and fetchEventDetails)

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

        const file = e.target.files?.[0];
        if (!file || !id) return;

        setImporting(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post(`/eo/events/${id}/import/ianseo`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                toast.success(res.data.message);
                fetchEventDetails(); // Refresh stats/data
            }
        } catch (error) {
            console.error('Import failed:', error);
            toast.error('Failed to import results');
        } finally {
            setImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };


    // --- Schedule Logic ---
    interface ScheduleItem {
        id: string;
        dayDate: string; // ISO string
        startTime: string; // ISO string
        endTime: string;   // ISO string
        activity: string;
        category: string | null;
        notes: string | null;
    }

    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [loadingSchedule, setLoadingSchedule] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [scheduleForm, setScheduleForm] = useState({
        dayDate: '',
        startTime: '08:00',
        endTime: '09:00',
        activity: '',
        category: '',
        notes: ''
    });

    const fetchSchedule = async () => {
        if (!id) return;
        setLoadingSchedule(true);
        try {
            const res = await api.get(`/eo/events/${id}/schedule`);
            if (res.data.success) {
                setSchedule(res.data.data);
            }
        } catch (error) {
            console.error('Fetch schedule error:', error);
        } finally {
            setLoadingSchedule(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'rundown' && !isNew) {
            fetchSchedule();
        }
    }, [activeTab, id]);

    const handleSaveSchedule = async () => {
        if (!id) return;
        try {
            // Combine Date + Time for API
            // Form format: dayDate (YYYY-MM-DD), startTime (HH:mm)
            const startDateTime = new Date(`${scheduleForm.dayDate}T${scheduleForm.startTime}:00`);
            const endDateTime = new Date(`${scheduleForm.dayDate}T${scheduleForm.endTime}:00`);

            await api.post(`/eo/events/${id}/schedule`, {
                dayDate: new Date(scheduleForm.dayDate),
                startTime: startDateTime,
                endTime: endDateTime,
                activity: scheduleForm.activity,
                category: scheduleForm.category,
                notes: scheduleForm.notes
            });
            toast.success('Schedule item added');
            setShowScheduleModal(false);
            fetchSchedule();
            // Reset crucial fields? maybe keep date for ease of entry
        } catch (error) {
            console.error('Save schedule error:', error);
            toast.error('Failed to save schedule item');
        }
    };

    const handleDeleteSchedule = async (itemId: string) => {
        if (!id) return;
        if (!confirm('Delete this item?')) return;
        try {
            await api.delete(`/eo/events/${id}/schedule/${itemId}`);
            toast.success('Item deleted');
            fetchSchedule();
        } catch (error) {
            console.error('Delete schedule error:', error);
            toast.error('Failed to delete item');
        }
    };


    // --- Category Logic ---
    const fetchCategories = async () => {
        if (!id) return;
        setLoadingCategories(true);
        try {
            const res = await api.get(`/eo/events/${id}/categories`);
            if (res.data.success) {
                setCategories(res.data.data);
            }
        } catch (error) {
            console.error('Fetch categories error:', error);
        } finally {
            setLoadingCategories(false);
        }
    };

    // Load categories when tab changes to registration
    useEffect(() => {
        if (activeTab === 'registration' && !isNew) {
            fetchCategories();
        }
    }, [activeTab, id]);

    const _handleSaveCategory = async () => {
        if (!id) return;
        try {
            if (_editingCategory) {
                await api.put(`/eo/events/${id}/categories/${_editingCategory}`, categoryForm);
                toast.success('Category updated');
            } else {
                await api.post(`/eo/events/${id}/categories`, categoryForm);
                toast.success('Category added');
            }
            setShowCategoryModal(false);
            fetchCategories();
        } catch (error) {
            console.error('Save category error:', error);
            toast.error('Failed to save category');
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        if (!id) return;
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            await api.delete(`/eo/events/${id}/categories/${categoryId}`);
            toast.success('Category deleted');
            fetchCategories();
        } catch (error) {
            console.error('Delete category error:', error);
            toast.error('Failed to delete category');
        }
    };


    // --- Target Layout Logic ---
    // ... (existing code)

    // --- Budget Logic ---
    interface BudgetEntry {
        id: string;
        category: 'INCOME' | 'EXPENSE';
        description: string;
        amount: number;
        quantity: number;
        tag?: string;
    }

    interface CategoryBudget extends Category {
        prizeFirst: number;
        prizeSecond: number;
        prizeThird: number;
        fee: number;
        quota: number;
    }

    const [budgetEntries, setBudgetEntries] = useState<BudgetEntry[]>([]);
    const [budgetCategories, setBudgetCategories] = useState<CategoryBudget[]>([]);
    const [_loadingBudget, setLoadingBudget] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [budgetForm, setBudgetForm] = useState({
        category: 'EXPENSE',
        description: '',
        amount: 0,
        quantity: 1,
        tag: 'Operational'
    });

    const fetchBudget = async () => {
        if (!id) return;
        setLoadingBudget(true);
        try {
            const res = await api.get(`/eo/events/${id}/budget`);
            if (res.data.success) {
                setBudgetEntries(res.data.data.entries);
                setBudgetCategories(res.data.data.categories);
            }
        } catch (error) {
            console.error('Fetch budget error:', error);
        } finally {
            setLoadingBudget(false);
        }
    };

    const handleSaveBudgetEntry = async () => {
        if (!id) return;
        try {
            await api.post(`/eo/events/${id}/budget`, budgetForm);
            toast.success('Entry added');
            setShowBudgetModal(false);
            fetchBudget();
        } catch (error) {
            console.error('Save budget error:', error);
            toast.error('Failed to save entry');
        }
    };

    const handleDeleteBudgetEntry = async (entryId: string) => {
        if (!id) return;
        if (!confirm('Delete this entry?')) return;
        try {
            await api.delete(`/eo/events/${id}/budget/${entryId}`);
            toast.success('Entry deleted');
            fetchBudget();
        } catch (error) {
            console.error('Delete budget error:', error);
            toast.error('Failed to delete entry');
        }
    };

    const handleUpdateCategoryBudget = async (catId: string, field: string, value: number) => {
        // Optimistic update for UI
        setBudgetCategories(prev => prev.map(c => c.id === catId ? { ...c, [field]: value } : c));

        // Debounce or save immediately? For now, we need an endpoint to update Category.
        // We already have updateCategory. We can reuse it.
        // But updateCategory expects full object? 
        // Let's create a specific update for budget fields or just use the generic one if it supports partial.
        // The endpoint `updateCategory` in controller uses `...data` so it supports partial updates.
        try {
            await api.put(`/eo/events/${id}/categories/${catId}`, { [field]: value });
        } catch (error) {
            console.error('Update category budget error:', error);
            toast.error('Failed to save category config');
        }
    };

    useEffect(() => {
        if (activeTab === 'budget' && !isNew) {
            fetchBudget();
        }
    }, [activeTab, id]);

    // --- Timeline / Gantt Logic ---
    interface TimelineItem {
        id: string;
        title: string;
        pic: string;
        startDate: string;
        endDate: string;
        status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
    }

    const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
    const [_loadingTimeline, setLoadingTimeline] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars
    const [showTimelineModal, setShowTimelineModal] = useState(false);
    const [timelineForm, setTimelineForm] = useState({
        title: '',
        pic: '',
        startDate: '',
        endDate: '',
        status: 'PENDING'
    });

    // Determine Timeline Range
    const getTimelineRange = () => {
        if (!timelineItems.length && !form.startDate) return [];
        // Default to D-10 to D+2 based on Event Start
        const eventStart = new Date(form.startDate);
        const start = new Date(eventStart);
        start.setDate(start.getDate() - 10);

        const end = form.endDate ? new Date(form.endDate) : new Date(eventStart);
        end.setDate(end.getDate() + 2);

        const dates = [];
        let curr = new Date(start);
        while (curr <= end) {
            dates.push(new Date(curr));
            curr.setDate(curr.getDate() + 1);
        }
        return dates;
    };

    const fetchTimeline = async () => {
        if (!id) return;
        setLoadingTimeline(true);
        try {
            const res = await api.get(`/eo/events/${id}/timeline`);
            if (res.data.success) {
                setTimelineItems(res.data.data);
            }
        } catch (error) {
            console.error('Fetch timeline error:', error);
        } finally {
            setLoadingTimeline(false);
        }
    };

    const handleSaveTimelineItem = async () => {
        if (!id) return;
        try {
            // ensure dates are valid
            if (!timelineForm.title || !timelineForm.startDate || !timelineForm.endDate) {
                return toast.error("Title and dates required");
            }

            await api.post(`/eo/events/${id}/timeline`, timelineForm);
            toast.success('Task added');
            setShowTimelineModal(false);
            fetchTimeline();
            // Reset form
            setTimelineForm({ title: '', pic: '', startDate: '', endDate: '', status: 'PENDING' });
        } catch (error) {
            console.error('Save timeline error:', error);
            toast.error('Failed to save task');
        }
    };

    const handleDeleteTimelineItem = async (itemId: string) => {
        if (!id) return;
        if (!confirm("Delete this task?")) return;
        try {
            await api.delete(`/eo/events/${id}/timeline/${itemId}`);
            fetchTimeline();
        } catch (e) { console.error(e); toast.error("Failed to delete"); }
    };

    useEffect(() => {
        if (activeTab === 'timeline' && !isNew) {
            fetchTimeline();
        }
    }, [activeTab, id]);


    // --- Target Layout Logic ---
    interface TargetAllocation {
        id: string;
        sessionId: string;
        categoryId: string;
        category: Category;
        targetStart: number;
        targetEnd: number;
        archersPerTarget: number;
    }

    interface Session {
        id: string;
        sessionNumber: number;
        name: string | null;
        startTime: string;
        endTime: string | null;
        allocations: TargetAllocation[];
    }

    const [sessions, setSessions] = useState<Session[]>([]);
    const [_loadingSessions, setLoadingSessions] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

    // Allocation Form State: { [categoryId]: { start, end, archers } }
    const [allocationUpdates, setAllocationUpdates] = useState<Record<string, { targetStart: number; targetEnd: number; archersPerTarget: number }>>({});

    // Session Form
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [sessionForm, setSessionForm] = useState({
        sessionNumber: 1,
        name: 'Qualification Day 1',
        startTime: '', // datetime-local
        endTime: ''    // datetime-local
    });

    const fetchSessions = async () => {
        if (!id) return;
        setLoadingSessions(true);
        try {
            const res = await api.get(`/eo/events/${id}/sessions`);
            if (res.data.success) {
                const sessionsData = res.data.data;
                setSessions(sessionsData);
                if (!activeSessionId && sessionsData.length > 0) {
                    setActiveSessionId(sessionsData[0].id);
                }
            }
        } catch (error) {
            console.error('Fetch sessions error:', error);
        } finally {
            setLoadingSessions(false);
        }
    };

    // Initialize/Reset Allocation Form when session changes
    useEffect(() => {
        if (activeSessionId && sessions.length > 0) {
            const session = sessions.find(s => s.id === activeSessionId);
            if (session) {
                const initialUpdates: Record<string, any> = {};
                session.allocations.forEach(a => {
                    initialUpdates[a.categoryId] = {
                        targetStart: a.targetStart,
                        targetEnd: a.targetEnd,
                        archersPerTarget: a.archersPerTarget
                    };
                });
                setAllocationUpdates(initialUpdates);
            }
        }
    }, [activeSessionId, sessions]);

    const handleSaveSession = async () => {
        if (!id) return;
        try {
            const payload = {
                ...sessionForm,
                sessionNumber: sessionForm.sessionNumber,
                startTime: new Date(sessionForm.startTime),
                endTime: sessionForm.endTime ? new Date(sessionForm.endTime) : null
            };
            await api.post(`/eo/events/${id}/sessions`, payload);
            toast.success('Session created');
            setShowSessionModal(false);
            fetchSessions();
        } catch (error) {
            console.error('Save session error:', error);
            toast.error('Failed to save session');
        }
    };

    const handleDeleteSession = async (sessionId: string) => {
        if (!id) return;
        if (!confirm('Delete this session?')) return;
        try {
            await api.delete(`/eo/events/${id}/sessions/${sessionId}`);
            toast.success('Session deleted');
            fetchSessions();
        } catch (error) {
            console.error('Delete session error:', error);
            toast.error('Failed to delete session');
        }
    };

    const handleSaveAllocations = async () => {
        if (!id || !activeSessionId) return;
        try {
            // Convert map to array
            const allocationsArray = Object.entries(allocationUpdates).map(([categoryId, data]) => ({
                categoryId,
                ...data
            })).filter(a => a.targetEnd > 0); // Only save valid allocations

            await api.post(`/eo/events/${id}/sessions/${activeSessionId}/allocations`, {
                allocations: allocationsArray
            });
            toast.success('Allocations saved');
            fetchSessions();
        } catch (error) {
            console.error('Save allocations error:', error);
            toast.error('Failed to save allocations');
        }
    };

    useEffect(() => {
        if (activeTab === 'targets' && !isNew) {
            fetchSessions();
            fetchCategories(); // We need categories for the dropdowns
        }
    }, [activeTab, id]);

    const tabs: { id: 'settings' | 'rundown' | 'targets' | 'budget' | 'timeline' | 'registration' | 'participants' | 'results' | 'certificates'; label: string; icon: any }[] = [
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'rundown', label: 'Rundown', icon: LayoutList },
        { id: 'targets', label: 'Targets', icon: Target },
        { id: 'budget', label: 'Budget', icon: DollarSign },
        { id: 'timeline', label: 'Timeline', icon: CalendarIcon },
        { id: 'registration', label: 'Registration', icon: FileText },
        { id: 'participants', label: 'Participants', icon: Users },
        { id: 'results', label: 'Results', icon: Trophy },
        { id: 'certificates', label: 'Certificates', icon: Award }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/events')}
                        className="p-2 hover:bg-dark-800 rounded-lg text-dark-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-display font-bold text-white">
                            {isNew ? 'Create New Event' : form.name}
                        </h1>
                        <p className="text-dark-400 text-sm">
                            {isNew ? 'Setup your competition details' : `${form.city} • ${form.startDate}`}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {!isNew && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${form.status === 'ONGOING' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                            'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                            }`}>
                            {form.status.replace('_', ' ')}
                        </span>
                    )}
                </div>
            </div>

            {/* Tabs */}
            {/* Tabs */}
            <div className="border-b border-dark-700 flex gap-6 overflow-x-auto">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => !isNew && setActiveTab(tab.id)}
                            disabled={isNew && tab.id !== 'settings'} // Lock other tabs if new
                            className={`flex items-center gap-2 pb-3 border-b-2 transition-colors whitespace-nowrap ${isActive ? 'border-primary-500 text-primary-400' :
                                'border-transparent text-dark-400 hover:text-white'
                                } ${isNew && tab.id !== 'settings' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Icon size={18} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>


            {/* Content */}
            <div className="card p-6">
                <AnimatePresence mode="wait">
                    {activeTab === 'settings' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6 max-w-4xl"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-white">Basic Info</h3>
                                    <div>
                                        <label className="block text-sm text-dark-400 mb-1">Event Name</label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={e => updateForm('name', e.target.value)}
                                            className="input w-full"
                                            placeholder="e.g. Bandung Open 2026"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-dark-400 mb-1">Province</label>
                                            <select
                                                value={selectedProvince}
                                                onChange={e => setSelectedProvince(e.target.value)}
                                                className="input w-full"
                                                disabled={isLoadingProvinces}
                                            >
                                                <option value="">Select Province</option>
                                                {provinces.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-dark-400 mb-1">City</label>
                                            <select
                                                value={selectedCity}
                                                onChange={e => setSelectedCity(e.target.value)}
                                                className="input w-full"
                                                disabled={!selectedProvince || isLoadingCities}
                                            >
                                                <option value="">Select City</option>
                                                {cities.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-dark-400 mb-1">Venue</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={form.venue}
                                                onChange={e => updateForm('venue', e.target.value)}
                                                className="input w-full"
                                                placeholder="Venue Name"
                                            />
                                            <button
                                                onClick={() => {
                                                    if (form.venue) {
                                                        const query = `${form.venue}, ${form.city}`;
                                                        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
                                                    } else {
                                                        toast.warn('Enter venue name first');
                                                    }
                                                }}
                                                className="p-3 bg-dark-800 text-dark-400 hover:text-white border border-dark-700 rounded-lg transition-colors"
                                                title="View on Google Maps"
                                            >
                                                <MapPin size={20} />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-dark-400 mb-1">Google Maps Link</label>
                                        <input
                                            type="text"
                                            value={form.locationUrl}
                                            onChange={e => updateForm('locationUrl', e.target.value)}
                                            className="input w-full"
                                            placeholder="https://maps.app.goo.gl/..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-white">Schedule</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-dark-400 mb-1">Start Date</label>
                                            <input
                                                type="date"
                                                value={form.startDate}
                                                onChange={e => updateForm('startDate', e.target.value)}
                                                className="input w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-dark-400 mb-1">End Date</label>
                                            <input
                                                type="date"
                                                value={form.endDate}
                                                onChange={e => updateForm('endDate', e.target.value)}
                                                className="input w-full"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-dark-400 mb-1">Description</label>
                                        <textarea
                                            value={form.description}
                                            onChange={e => updateForm('description', e.target.value)}
                                            className="input w-full h-24 resize-none"
                                            placeholder="Event details..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-dark-700">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    {isNew ? 'Create Event' : 'Save Changes'}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'targets' && (
                        <div className="space-y-6">
                            {/* Session Header */}
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Target Layout</h3>
                                    <p className="text-sm text-dark-400">Manage target assignments and quota estimations.</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setSessionForm({
                                            sessionNumber: sessions.length + 1,
                                            name: `Qualification Session ${sessions.length + 1}`,
                                            startTime: form.startDate ? `${form.startDate}T08:00` : '',
                                            endTime: form.startDate ? `${form.startDate}T11:00` : ''
                                        });
                                        setShowSessionModal(true);
                                    }}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    <Plus size={18} />
                                    New Session
                                </button>
                            </div>

                            {/* Session Tabs */}
                            {sessions.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto pb-2 border-b border-dark-700">
                                    {sessions.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => setActiveSessionId(s.id)}
                                            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeSessionId === s.id
                                                ? 'bg-dark-800 text-primary-400 border-b-2 border-primary-500'
                                                : 'text-dark-400 hover:text-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>Session {s.sessionNumber}</span>
                                                <small className="opacity-50">{s.name}</small>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Active Session Content */}
                            {activeSessionId && sessions.find(s => s.id === activeSessionId) ? (
                                (() => {
                                    const session = sessions.find(s => s.id === activeSessionId)!;

                                    // Matrix Status Calculation
                                    const maxTarget = 32;
                                    const targets = Array.from({ length: maxTarget }, (_, i) => i + 1);
                                    const targetStatus = new Array(maxTarget + 1).fill(null);

                                    // Use allocationUpdates for live preview
                                    Object.entries(allocationUpdates).forEach(([catId, data]) => {
                                        for (let t = data.targetStart; t <= data.targetEnd; t++) {
                                            if (t <= maxTarget) targetStatus[t] = catId;
                                        }
                                    });

                                    return (
                                        <div className="space-y-6">
                                            {/* Details Header */}
                                            <div className="bg-dark-800 p-4 rounded-lg flex justify-between items-center">
                                                <div className="text-sm text-dark-300">
                                                    <span className="font-bold text-white">{session.name}</span>
                                                    {' • '}
                                                    {new Date(session.startTime).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteSession(session.id)}
                                                    className="text-red-400 hover:text-red-300 p-2"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            {/* Visual Grid */}
                                            <div className="overflow-x-auto pb-4">
                                                <div className="flex gap-1 min-w-max">
                                                    {targets.map(t => {
                                                        const catId = targetStatus[t];
                                                        const cat = categories.find(c => c.id === catId);
                                                        return (
                                                            <div key={t} className="flex flex-col gap-1 w-10">
                                                                <div className="text-center text-[10px] text-dark-500 font-mono">T{t}</div>
                                                                <div
                                                                    className={`h-12 rounded border transition-colors ${catId
                                                                        ? 'bg-primary-500/20 border-primary-500/50'
                                                                        : 'bg-dark-800 border-dark-700'
                                                                        }`}
                                                                    title={cat ? `${cat.division} ${cat.ageClass}` : 'Free'}
                                                                >
                                                                    {catId && (
                                                                        <div className="h-full w-full flex items-center justify-center text-[8px] font-bold text-primary-300 -rotate-90">
                                                                            {cat?.division.substring(0, 1)}{cat?.ageClass.substring(0, 1)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>

                                            {/* Allocation Editor */}
                                            <div className="bg-dark-800 rounded-lg border border-dark-700 p-4">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h4 className="font-bold text-white">Category Assignments</h4>
                                                    <button
                                                        className="btn-primary"
                                                        onClick={handleSaveAllocations}
                                                    >
                                                        Save Allocations
                                                    </button>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="grid grid-cols-12 gap-4 text-xs font-bold text-dark-400 px-2 mb-2">
                                                        <div className="col-span-4">Category</div>
                                                        <div className="col-span-2">Start Target</div>
                                                        <div className="col-span-2">End Target</div>
                                                        <div className="col-span-2">Archers/T</div>
                                                        <div className="col-span-2 text-right">Quota / Left</div>
                                                    </div>
                                                    {categories.map(cat => {
                                                        const update = allocationUpdates[cat.id] || { targetStart: 0, targetEnd: 0, archersPerTarget: 4 };

                                                        const capacity = (update.targetEnd > 0 && update.targetEnd >= update.targetStart)
                                                            ? (update.targetEnd - update.targetStart + 1) * update.archersPerTarget
                                                            : 0;

                                                        // Use real participants count from backend
                                                        const registered = cat._count?.registrations || 0;
                                                        const left = capacity - registered;

                                                        return (
                                                            <div key={cat.id} className="grid grid-cols-12 gap-4 items-center p-2 hover:bg-dark-700/50 rounded-md transition-colors">
                                                                <div className="col-span-4 flex flex-col">
                                                                    <span className="text-sm font-medium text-white truncate">
                                                                        {cat.division} {cat.ageClass} {cat.gender}
                                                                    </span>
                                                                    <span className="text-xs text-dark-500">{cat.distance}m</span>
                                                                </div>
                                                                <div className="col-span-2">
                                                                    <input
                                                                        type="number"
                                                                        className="input w-full py-1 text-xs"
                                                                        value={update.targetStart || ''}
                                                                        onChange={e => setAllocationUpdates(prev => ({
                                                                            ...prev,
                                                                            [cat.id]: { ...update, targetStart: parseInt(e.target.value) || 0 }
                                                                        }))}
                                                                    />
                                                                </div>
                                                                <div className="col-span-2">
                                                                    <input
                                                                        type="number"
                                                                        className="input w-full py-1 text-xs"
                                                                        value={update.targetEnd || ''}
                                                                        onChange={e => setAllocationUpdates(prev => ({
                                                                            ...prev,
                                                                            [cat.id]: { ...update, targetEnd: parseInt(e.target.value) || 0 }
                                                                        }))}
                                                                    />
                                                                </div>
                                                                <div className="col-span-2">
                                                                    <input
                                                                        type="number"
                                                                        className="input w-full py-1 text-xs"
                                                                        value={update.archersPerTarget}
                                                                        onChange={e => setAllocationUpdates(prev => ({
                                                                            ...prev,
                                                                            [cat.id]: { ...update, archersPerTarget: parseInt(e.target.value) || 4 }
                                                                        }))}
                                                                    />
                                                                </div>
                                                                <div className="col-span-2 text-right text-xs">
                                                                    <div className="text-white font-bold">{capacity} Capacity</div>
                                                                    <div className={`${left < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                                        {left} Left
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()
                            ) : (
                                <div className="text-center py-12 text-dark-400">
                                    <Target className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                    No session selected. Create one to start assigning targets.
                                </div>
                            )}

                            {/* Session Modal */}
                            {showSessionModal && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                                    <div className="card w-full max-w-md p-6 bg-dark-900 border border-dark-700 space-y-4">
                                        <h3 className="font-bold text-white">New Session</h3>
                                        <input
                                            value={sessionForm.name}
                                            onChange={e => setSessionForm({ ...sessionForm, name: e.target.value })}
                                            placeholder="Session Name"
                                            className="input w-full"
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input type="datetime-local" className="input w-full" value={sessionForm.startTime} onChange={e => setSessionForm({ ...sessionForm, startTime: e.target.value })} />
                                            <input type="datetime-local" className="input w-full" value={sessionForm.endTime} onChange={e => setSessionForm({ ...sessionForm, endTime: e.target.value })} />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setShowSessionModal(false)} className="btn-ghost">Cancel</button>
                                            <button onClick={handleSaveSession} className="btn-primary">Create</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'budget' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Event Budgeting</h3>
                                    <p className="text-sm text-dark-400">Estimate Cost of Production, Income, and Profit.</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setBudgetForm({ category: 'EXPENSE', description: '', amount: 0, quantity: 1, tag: 'Operational' });
                                        setShowBudgetModal(true);
                                    }}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    <Plus size={18} />
                                    Add Item
                                </button>
                            </div>

                            {/* Summary Cards */}
                            {(() => {
                                // Calculate Totals
                                const totalBudgetIncome = budgetEntries.filter(e => e.category === 'INCOME').reduce((sum, e) => sum + (e.amount * e.quantity), 0);
                                const totalBudgetExpense = budgetEntries.filter(e => e.category === 'EXPENSE').reduce((sum, e) => sum + (e.amount * e.quantity), 0);

                                // Calculate Projected Income from Fees (Fee * Quota (Target)) or Registered?
                                // "Target Peserta (Minimal)" suggests we should use a "Target" number or Quota. I'll use Quota for now as "Capacity/Target".
                                const projectedFees = budgetCategories.reduce((sum, c) => sum + (c.fee * c.quota), 0);

                                // Calculate Projected Awards Expense (Prizes)
                                // Standard: 1st, 2nd, 3rd. Do we multiply by 1 (Individual) or Team size? 
                                // Assuming 1 per category instance (or 3 medals). 
                                // For now, sum(Prize1 + Prize2 + Prize3) * 1 (set of medals/money).
                                const projectedAwards = budgetCategories.reduce((sum, c) => sum + c.prizeFirst + c.prizeSecond + c.prizeThird, 0);

                                const totalIncome = totalBudgetIncome + projectedFees;
                                const totalExpense = totalBudgetExpense + projectedAwards;
                                const balance = totalIncome - totalExpense;

                                return (
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="card p-4 bg-dark-800 border-dark-700">
                                            <div className="text-sm text-dark-400">Total Income</div>
                                            <div className="text-2xl font-bold text-green-400">
                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalIncome)}
                                            </div>
                                            <div className="text-xs text-dark-500 mt-1">Fees: {new Intl.NumberFormat('id-ID').format(projectedFees)}</div>
                                        </div>
                                        <div className="card p-4 bg-dark-800 border-dark-700">
                                            <div className="text-sm text-dark-400">Total Expense</div>
                                            <div className="text-2xl font-bold text-red-400">
                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalExpense)}
                                            </div>
                                            <div className="text-xs text-dark-500 mt-1">Awards: {new Intl.NumberFormat('id-ID').format(projectedAwards)}</div>
                                        </div>
                                        <div className="card p-4 bg-dark-800 border-dark-700">
                                            <div className="text-sm text-dark-400">Balance</div>
                                            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-primary-400' : 'text-orange-400'}`}>
                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(balance)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Detailed Tables */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Income Column */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-white border-b border-dark-700 pb-2">Income</h4>

                                    {/* Fees Section */}
                                    <div className="bg-dark-800/50 rounded p-3">
                                        <h5 className="text-sm font-semibold text-primary-400 mb-2">Registration Fees (Projected)</h5>
                                        <div className="space-y-1">
                                            {budgetCategories.map(cat => (
                                                <div key={cat.id} className="flex justify-between text-xs">
                                                    <span className="text-dark-300">{cat.division} {cat.ageClass} ({cat.quota} pax)</span>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="number"
                                                            className="bg-transparent text-right w-20 border-b border-dark-700 focus:border-primary-500 outline-none"
                                                            value={cat.fee}
                                                            onChange={e => handleUpdateCategoryBudget(cat.id, 'fee', parseInt(e.target.value) || 0)}
                                                        />
                                                        <span className="w-20 text-right text-gray-400">
                                                            {new Intl.NumberFormat('id-ID').format(cat.fee * cat.quota)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Other Income */}
                                    <div className="bg-dark-800/50 rounded p-3">
                                        <h5 className="text-sm font-semibold text-green-400 mb-2">Other Income</h5>
                                        {budgetEntries.filter(e => e.category === 'INCOME').map(e => (
                                            <div key={e.id} className="flex justify-between items-center text-xs py-1 border-b border-dark-700/50">
                                                <div>
                                                    <span className="text-white">{e.description}</span>
                                                    <span className="text-dark-500 ml-2">x{e.quantity}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>{new Intl.NumberFormat('id-ID').format(e.amount * e.quantity)}</span>
                                                    <button onClick={() => handleDeleteBudgetEntry(e.id)} className="text-red-400 hover:text-red-300"><Trash2 size={12} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Expense Column */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-white border-b border-dark-700 pb-2">Expenses</h4>

                                    {/* Awards Section */}
                                    <div className="bg-dark-800/50 rounded p-3">
                                        <h5 className="text-sm font-semibold text-primary-400 mb-2">Awards Cost (Prizes)</h5>
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-4 gap-2 text-[10px] text-dark-500 uppercase font-bold text-right">
                                                <div className="text-left">Cat</div>
                                                <div>1st</div>
                                                <div>2nd</div>
                                                <div>3rd</div>
                                            </div>
                                            {budgetCategories.map(cat => (
                                                <div key={cat.id} className="grid grid-cols-4 gap-2 text-xs items-center">
                                                    <div className="truncate text-dark-300 pointer-events-none">{cat.division.substring(0, 3)} {cat.ageClass}</div>
                                                    <input type="number" className="input py-0 px-1 text-right text-[10px]" value={cat.prizeFirst} onChange={e => handleUpdateCategoryBudget(cat.id, 'prizeFirst', parseInt(e.target.value) || 0)} />
                                                    <input type="number" className="input py-0 px-1 text-right text-[10px]" value={cat.prizeSecond} onChange={e => handleUpdateCategoryBudget(cat.id, 'prizeSecond', parseInt(e.target.value) || 0)} />
                                                    <input type="number" className="input py-0 px-1 text-right text-[10px]" value={cat.prizeThird} onChange={e => handleUpdateCategoryBudget(cat.id, 'prizeThird', parseInt(e.target.value) || 0)} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Other Expenses */}
                                    <div className="bg-dark-800/50 rounded p-3">
                                        <h5 className="text-sm font-semibold text-red-400 mb-2">Operational & Other</h5>
                                        {budgetEntries.filter(e => e.category === 'EXPENSE').map(e => (
                                            <div key={e.id} className="flex justify-between items-center text-xs py-1 border-b border-dark-700/50">
                                                <div>
                                                    <span className="text-white">{e.description}</span>
                                                    <span className="text-dark-500 ml-2">x{e.quantity}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>{new Intl.NumberFormat('id-ID').format(e.amount * e.quantity)}</span>
                                                    <button onClick={() => handleDeleteBudgetEntry(e.id)} className="text-red-400 hover:text-red-300"><Trash2 size={12} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Budget Modal */}
                            {showBudgetModal && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                                    <div className="card w-full max-w-md p-6 bg-dark-900 border border-dark-700 space-y-4">
                                        <h3 className="font-bold text-white">Add Budget Item</h3>
                                        <div className="flex gap-2">
                                            <button
                                                className={`flex-1 py-2 rounded ${budgetForm.category === 'INCOME' ? 'bg-green-500/20 text-green-400 border border-green-500' : 'bg-dark-800 text-dark-400'}`}
                                                onClick={() => setBudgetForm({ ...budgetForm, category: 'INCOME' })}
                                            >Income</button>
                                            <button
                                                className={`flex-1 py-2 rounded ${budgetForm.category === 'EXPENSE' ? 'bg-red-500/20 text-red-400 border border-red-500' : 'bg-dark-800 text-dark-400'}`}
                                                onClick={() => setBudgetForm({ ...budgetForm, category: 'EXPENSE' })}
                                            >Expense</button>
                                        </div>

                                        <input
                                            value={budgetForm.description}
                                            onChange={e => setBudgetForm({ ...budgetForm, description: e.target.value })}
                                            placeholder="Description (e.g. Field Crew)"
                                            className="input w-full"
                                        />

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <label className="text-xs text-dark-500">Amount per Unit</label>
                                                <input
                                                    type="number"
                                                    className="input w-full"
                                                    value={budgetForm.amount}
                                                    onChange={e => setBudgetForm({ ...budgetForm, amount: parseInt(e.target.value) || 0 })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs text-dark-500">Quantity</label>
                                                <input
                                                    type="number"
                                                    className="input w-full"
                                                    value={budgetForm.quantity}
                                                    onChange={e => setBudgetForm({ ...budgetForm, quantity: parseInt(e.target.value) || 1 })}
                                                />
                                            </div>
                                        </div>

                                        <input
                                            value={budgetForm.tag}
                                            onChange={e => setBudgetForm({ ...budgetForm, tag: e.target.value })}
                                            placeholder="Tag (Optional)"
                                            className="input w-full"
                                        />

                                        <div className="flex justify-end gap-2 mt-4">
                                            <button onClick={() => setShowBudgetModal(false)} className="btn-ghost">Cancel</button>
                                            <button onClick={handleSaveBudgetEntry} className="btn-primary">Add</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'rundown' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Event Rundown</h3>
                                    <p className="text-sm text-dark-400">Manage the schedule of activities.</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setScheduleForm(prev => ({
                                            ...prev,
                                            dayDate: form.startDate || new Date().toISOString().split('T')[0]
                                        }));
                                        setShowScheduleModal(true);
                                    }}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    <Plus size={18} />
                                    Add Item
                                </button>
                            </div>

                            {loadingSchedule ? (
                                <div className="text-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500" />
                                </div>
                            ) : schedule.length === 0 ? (
                                <div className="text-center py-12 bg-dark-800 rounded-lg border border-dark-700">
                                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                    <p className="text-dark-400">No schedule items yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Group by Date */}
                                    {Object.entries(
                                        schedule.reduce((groups, item) => {
                                            const date = item.dayDate.split('T')[0];
                                            if (!groups[date]) groups[date] = [];
                                            groups[date].push(item);
                                            return groups;
                                        }, {} as Record<string, ScheduleItem[]>)
                                    ).sort().map(([date, items]) => (
                                        <div key={date} className="bg-dark-800 rounded-xl overflow-hidden border border-dark-700">
                                            <div className="bg-dark-700 px-4 py-3 font-bold text-white flex items-center gap-2">
                                                <CalendarIcon size={16} className="text-primary-400" />
                                                {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                            <div className="divide-y divide-dark-700/50">
                                                {items.map(item => (
                                                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-dark-700/30 transition-colors">
                                                        <div className="flex gap-4">
                                                            <div className="min-w-[120px] text-sm font-mono text-primary-300">
                                                                {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                                                {new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-white">{item.activity}</div>
                                                                <div className="text-sm text-dark-400 flex gap-3 mt-1">
                                                                    {item.category && <span className="bg-dark-700 px-2 rounded-sm text-xs">{item.category}</span>}
                                                                    {item.notes && <span className="text-dark-500 italic">{item.notes}</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteSchedule(item.id)}
                                                            className="text-dark-500 hover:text-red-400 p-2"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Certificates Tab */}
                    {activeTab === 'certificates' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Certificate Generation</h3>
                                    <p className="text-sm text-dark-400">Preview and download certificates for participants.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Panel: Participant List */}
                                <div className="card bg-dark-800 p-4 border-dark-700 h-[600px] flex flex-col">
                                    <h4 className="text-md font-bold text-white mb-4">Participants ({participants.length})</h4>
                                    <div className="relative mb-4">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Search name..."
                                            className="input w-full pl-10"
                                        />
                                    </div>
                                    <div className="overflow-y-auto flex-1 space-y-2">
                                        {participants.map(p => (
                                            <div key={p.id} className="p-3 rounded bg-dark-900 border border-dark-700 flex justify-between items-center">
                                                <div>
                                                    <div className="font-bold text-white text-sm">{p.user.name}</div>
                                                    <div className="text-xs text-dark-400">{p.category.division} - {p.category.gender}</div>
                                                </div>
                                                <PDFDownloadLink
                                                    document={
                                                        <CertificateTemplate
                                                            eventName={form.name}
                                                            athleteName={p.user.name}
                                                            category={p.category.ageClass}
                                                            division={p.category.division}
                                                            date={new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
                                                            clubName={p.user.clubName || 'Independent'}
                                                            qrCodeData={`https://sip.id/verify/${p.id}`} // Mock verification URL
                                                        />
                                                    }
                                                    fileName={`Certificate-${p.user.name}.pdf`}
                                                >
                                                    {({ blob: _blob, url: _url, loading, error: _error }) => (
                                                        <button
                                                            disabled={loading}
                                                            className="p-2 text-primary-400 hover:bg-dark-800 rounded transition-colors"
                                                            title="Download Certificate"
                                                        >
                                                            <Download size={16} />
                                                        </button>
                                                    )}
                                                </PDFDownloadLink>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Panel: Live Preview */}
                                <div className="lg:col-span-2 space-y-4">
                                    <div className="card bg-dark-800 p-6 border-dark-700 flex flex-col items-center justify-center min-h-[400px]">
                                        <div className="text-center space-y-4">
                                            <div className="bg-dark-900 p-8 rounded-lg border border-dark-600 w-full max-w-lg mx-auto aspect-[1.414/1] relative shadow-2xl">
                                                {/* Mock Preview - Visual representation of what the PDF looks like */}
                                                <div className="absolute inset-0 border-4 border-yellow-600 m-4 flex flex-col items-center justify-center p-4">
                                                    <div className="text-xs tracking-widest uppercase text-dark-400 mb-2">Certificate of Achievement</div>
                                                    <h2 className="text-xl font-bold text-white mb-4">{form.name}</h2>
                                                    <div className="text-sm text-dark-300">Proudly presented to</div>
                                                    <div className="text-2xl font-serif text-primary-400 my-4">Athlete Name</div>
                                                    <div className="text-xs text-dark-400">for outstanding performance</div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-dark-400 italic">
                                                * This preview is an approximation. The actual PDF will be high-resolution.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Bulk Actions */}
                                    <div className="card bg-dark-800 p-4 border-dark-700">
                                        <h4 className="text-md font-bold text-white mb-4">Bulk Actions</h4>
                                        <div className="flex gap-4">
                                            <button className="btn-secondary flex items-center gap-2" disabled>
                                                <Download size={16} />
                                                Download All Certificates (ZIP)
                                            </button>
                                            <button className="btn-secondary flex items-center gap-2" disabled>
                                                <Trophy size={16} />
                                                Download Winners Only
                                            </button>
                                        </div>
                                        <p className="text-xs text-yellow-500 mt-2">
                                            * Bulk download coming soon
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Schedule Modal */}
                    <AnimatePresence>
                        {showScheduleModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.95, opacity: 0 }}
                                    className="card w-full max-w-md p-6 relative bg-dark-900 border border-dark-700 shadow-2xl space-y-4"
                                >
                                    <h3 className="text-lg font-bold text-white">Add Schedule Item</h3>

                                    <div>
                                        <label className="block text-sm text-dark-400 mb-1">Date</label>
                                        <input
                                            type="date"
                                            value={scheduleForm.dayDate}
                                            onChange={e => setScheduleForm(prev => ({ ...prev, dayDate: e.target.value }))}
                                            className="input w-full"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-dark-400 mb-1">Start Time</label>
                                            <input
                                                type="time"
                                                value={scheduleForm.startTime}
                                                onChange={e => setScheduleForm(prev => ({ ...prev, startTime: e.target.value }))}
                                                className="input w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-dark-400 mb-1">End Time</label>
                                            <input
                                                type="time"
                                                value={scheduleForm.endTime}
                                                onChange={e => setScheduleForm(prev => ({ ...prev, endTime: e.target.value }))}
                                                className="input w-full"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-dark-400 mb-1">Activity / Subject</label>
                                        <input
                                            type="text"
                                            value={scheduleForm.activity}
                                            onChange={e => setScheduleForm(prev => ({ ...prev, activity: e.target.value }))}
                                            className="input w-full"
                                            placeholder="e.g. Qualification Session 1"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-dark-400 mb-1">Category (Optional)</label>
                                        <input
                                            type="text"
                                            value={scheduleForm.category}
                                            onChange={e => setScheduleForm(prev => ({ ...prev, category: e.target.value }))}
                                            className="input w-full"
                                            placeholder="e.g. Recurve Men"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-dark-400 mb-1">Notes (Optional)</label>
                                        <input
                                            type="text"
                                            value={scheduleForm.notes}
                                            onChange={e => setScheduleForm(prev => ({ ...prev, notes: e.target.value }))}
                                            className="input w-full"
                                            placeholder="e.g. 2 Series"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-2 pt-4">
                                        <button
                                            onClick={() => setShowScheduleModal(false)}
                                            className="btn-ghost"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveSchedule}
                                            className="btn-primary"
                                        >
                                            Add Item
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>


                    {activeTab === 'timeline' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Event Timeline</h3>
                                    <p className="text-sm text-dark-400">Manage tasks and schedule.</p>
                                </div>
                                <button
                                    onClick={() => setShowTimelineModal(true)}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    <Plus size={18} />
                                    Add Task
                                </button>
                            </div>

                            <div className="card bg-dark-800 border-dark-700 overflow-hidden flex flex-col h-[600px]">
                                {/* Timeline Header */}
                                <div className="flex border-b border-dark-600 bg-dark-900 sticky top-0 z-10">
                                    <div className="w-64 p-3 border-r border-dark-600 font-bold text-sm text-dark-300 shrink-0">Objectives</div>
                                    <div className="w-24 p-3 border-r border-dark-600 font-bold text-sm text-dark-300 text-center shrink-0">PIC</div>
                                    <div className="flex-1 overflow-x-auto">
                                        <div className="flex min-w-max">
                                            {getTimelineRange().map((date, i) => {
                                                const eventStart = new Date(form.startDate);
                                                // Calculate Diff in Days
                                                const diffTime = date.getTime() - eventStart.getTime();
                                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                const isDDay = diffDays === 0;

                                                return (
                                                    <div key={i} className={`w-10 border-r border-dark-700 p-1 text-center shrink-0 ${isDDay ? 'bg-primary-500/20' : ''}`}>
                                                        <div className={`text-[10px] font-bold ${isDDay ? 'text-primary-400' : 'text-dark-400'}`}>
                                                            {diffDays === 0 ? 'D-Day' : diffDays > 0 ? `D+${diffDays}` : `D${diffDays}`}
                                                        </div>
                                                        <div className="text-[10px] text-dark-500 leading-tight">
                                                            {date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline Body */}
                                <div className="overflow-auto flex-1">
                                    {timelineItems.length === 0 ? (
                                        <div className="p-8 text-center text-dark-500">No tasks yet.</div>
                                    ) : (
                                        timelineItems.map(item => (
                                            <div key={item.id} className="flex border-b border-dark-700/50 hover:bg-dark-700/30 group">
                                                <div className="w-64 p-2 border-r border-dark-700 text-sm flex justify-between items-center shrink-0">
                                                    <span className="truncate" title={item.title}>{item.title}</span>
                                                    <button onClick={() => handleDeleteTimelineItem(item.id)} className="opacity-0 group-hover:opacity-100 text-red-400"><Trash2 size={12} /></button>
                                                </div>
                                                <div className="w-24 p-2 border-r border-dark-700 text-xs text-center shrink-0 text-dark-400">{item.pic || '-'}</div>

                                                <div className="flex-1 overflow-hidden relative">
                                                    <div className="flex min-w-max h-full">
                                                        {getTimelineRange().map((date, i) => {
                                                            const isDDay = date.toDateString() === new Date(form.startDate).toDateString();
                                                            return (
                                                                <div key={i} className={`w-10 border-r border-dark-700/50 h-full shrink-0 ${isDDay ? 'bg-primary-500/5' : ''}`}></div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* The Bar */}
                                                    {(() => {
                                                        const range = getTimelineRange();
                                                        if (!range.length) return null;

                                                        const timelineStart = range[0].getTime();
                                                        const itemStart = new Date(item.startDate).getTime();
                                                        const itemEnd = new Date(item.endDate).getTime();

                                                        // Calculate Position
                                                        const oneDay = 1000 * 60 * 60 * 24;
                                                        const offsetDays = (itemStart - timelineStart) / oneDay;
                                                        const durationDays = ((itemEnd - itemStart) / oneDay) + 1;

                                                        if (offsetDays < 0 && (offsetDays + durationDays) < 0) return null; // Out of view left

                                                        return (
                                                            <div
                                                                className="absolute top-2 bottom-2 bg-blue-500/80 rounded border border-blue-400 text-[10px] text-white flex items-center px-2 truncate"
                                                                style={{
                                                                    left: `${Math.max(0, offsetDays) * 40}px`, // 40px is w-10
                                                                    width: `${Math.max(1, durationDays) * 40}px`
                                                                }}
                                                            >
                                                                {/* Optional Label inside bar */}
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Task Modal */}
                            {showTimelineModal && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                                    <div className="card w-full max-w-md p-6 bg-dark-900 border border-dark-700 space-y-4">
                                        <h3 className="font-bold text-white">Add Task</h3>

                                        <input
                                            value={timelineForm.title}
                                            onChange={e => setTimelineForm({ ...timelineForm, title: e.target.value })}
                                            placeholder="Task Title"
                                            className="input w-full"
                                        />

                                        <input
                                            value={timelineForm.pic}
                                            onChange={e => setTimelineForm({ ...timelineForm, pic: e.target.value })}
                                            placeholder="PIC (Person In Charge)"
                                            className="input w-full"
                                        />

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <label className="text-xs text-dark-500">Start Date</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="date"
                                                        className="input w-full"
                                                        value={timelineForm.startDate}
                                                        onChange={e => setTimelineForm({ ...timelineForm, startDate: e.target.value })}
                                                    />
                                                    <input
                                                        placeholder="D +/-"
                                                        className="input w-16 text-xs text-center px-1"
                                                        type="text"
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value);
                                                            if (!isNaN(val) && form.startDate) {
                                                                const d = new Date(form.startDate);
                                                                d.setDate(d.getDate() + val);
                                                                setTimelineForm(prev => ({ ...prev, startDate: d.toISOString().split('T')[0] }));
                                                            }
                                                        }}
                                                        title="Enter days relative to Event Start (e.g. -1 for D-1)"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs text-dark-500">End Date</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="date"
                                                        className="input w-full"
                                                        value={timelineForm.endDate}
                                                        onChange={e => setTimelineForm({ ...timelineForm, endDate: e.target.value })}
                                                    />
                                                    <input
                                                        placeholder="D +/-"
                                                        className="input w-16 text-xs text-center px-1"
                                                        type="text"
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value);
                                                            if (!isNaN(val) && form.startDate) {
                                                                const d = new Date(form.startDate);
                                                                d.setDate(d.getDate() + val);
                                                                setTimelineForm(prev => ({ ...prev, endDate: d.toISOString().split('T')[0] }));
                                                            }
                                                        }}
                                                        title="Enter days relative to Event Start (e.g. +1 for D+1)"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2 mt-4">
                                            <button onClick={() => setShowTimelineModal(false)} className="btn-ghost">Cancel</button>
                                            <button onClick={handleSaveTimelineItem} className="btn-primary">Save</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}


                    {activeTab === 'registration' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Competition Categories</h3>
                                    <p className="text-sm text-dark-400">Define divisions, classes, and distances for this event.</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingCategory(null);
                                        setCategoryForm(INITIAL_CATEGORY_FORM);
                                        setShowCategoryModal(true);
                                    }}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    <Plus size={18} />
                                    Add Category
                                </button>
                            </div>

                            {loadingCategories ? (
                                <div className="text-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500" />
                                </div>
                            ) : categories.length === 0 ? (
                                <div className="text-center py-12 bg-dark-800 rounded-lg border border-dark-700">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                    <p className="text-dark-400">No categories defined yet.</p>
                                    <button
                                        onClick={() => setShowCategoryModal(true)}
                                        className="text-primary-400 hover:text-primary-300 text-sm mt-2"
                                    >
                                        Create your first category
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {categories.map((cat) => (
                                        <div key={cat.id} className="bg-dark-800 p-4 rounded-lg border border-dark-700 flex justify-between items-center">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-white">
                                                        {cat.division} - {cat.ageClass} {cat.gender === 'FEMALE' ? 'Women' : cat.gender === 'MALE' ? 'Men' : 'Mixed'}
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-dark-700 rounded text-xs text-dark-300">
                                                        {cat.distance}m
                                                    </span>
                                                </div>
                                                <div className="text-sm text-dark-400 mt-1">
                                                    Quota: {cat.quota} • Fee: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(cat.fee)}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingCategory(cat.id);
                                                        setCategoryForm({
                                                            division: cat.division,
                                                            ageClass: cat.ageClass,
                                                            gender: cat.gender,
                                                            distance: cat.distance,
                                                            quota: cat.quota,
                                                            fee: cat.fee
                                                        });
                                                        setShowCategoryModal(true);
                                                    }}
                                                    className="p-2 hover:bg-dark-700 rounded-lg text-dark-400 hover:text-white"
                                                >
                                                    <Settings size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(cat.id)}
                                                    className="p-2 hover:bg-red-500/20 rounded-lg text-dark-400 hover:text-red-400"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'participants' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-white">Registered Athletes</h3>
                                <button
                                    onClick={handleExport}
                                    className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-500 border-green-500"
                                >
                                    <Download size={18} />
                                    Export IanSEO
                                </button>
                            </div>

                            {/* Placeholder List */}
                            <div className="bg-dark-800 rounded-lg p-4 border border-dark-700 text-center text-dark-400">
                                <p>Participant list preview will appear here.</p>
                                <p className="text-xs mt-2">Use the Export button to download full data.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'results' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-white">Competition Results</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => window.open(`/events/${id}/results`, '_blank')}
                                        className="btn-secondary flex items-center gap-2"
                                    >
                                        <Trophy size={18} />
                                        View Leaderboard
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept=".ods,.xlsx"
                                    />
                                    <button
                                        onClick={handleImportClick}
                                        disabled={importing}
                                        className="btn-primary flex items-center gap-2"
                                    >
                                        {importing ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                                        Import IanSEO Results
                                    </button>
                                </div>
                            </div>

                            <div className="bg-dark-800 rounded-lg p-8 border border-dark-700 text-center text-dark-400">
                                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50 text-amber-500" />
                                <h4 className="text-white font-medium mb-2">Import Qualification Scores</h4>
                                <p className="text-sm max-w-md mx-auto">
                                    Upload the IanSEO <code>.ods</code> file containing Qualification sheets (e.g., N9MQ_I).
                                    The system will automatically match scores to athletes using their SIP ID/Bib.
                                </p>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div >
        </div >
    );
}
