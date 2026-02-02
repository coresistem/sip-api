
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
    Link,
    Instagram,
    Globe,
    Search,
    Check,
    AlertCircle,
    Tag,
    Image as ImageIcon,
    GitBranch, // Use GitBranch for Brackets
    BarChart3,
    Clock,
    Layers
} from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import CertificateTemplate from '../components/certificates/CertificateTemplate';
import CompetitionBracketView from '../components/CompetitionBracketView';
import CategoryGeneratorModal from '../components/CategoryGeneratorModal';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { api } from '../../core/contexts/AuthContext';
import { useLocations } from '../../core/hooks/useLocations';
import LocationPicker from '../../core/components/LocationPicker';
import { useLayoutTabs, TabItem } from '../../core/hooks/useLayoutTabs';
import { toast } from 'react-toastify';
import SearchableSelect from '../../core/components/ui/SearchableSelect';
import { countries } from '../../core/data/countries';
import { currencies } from '../../core/data/currencies';
import {
    INITIAL_FORM,
    CATEGORY_DIVISIONS,
    AGE_CLASSES,
    GENDERS,
    DISTANCES,
    CATEGORY_TEMPLATES,
    SCHEDULE_TEMPLATES
} from '../constants';
import { EventForm, CompetitionCategoryItem } from '../types';

// Local interfaces removed, using imports from ../types.ts

const STEPS = [
    { id: 1, title: 'General Info', icon: Trophy, description: 'Basic details & schedule' },
    { id: 2, title: 'Categories', icon: Users, description: 'Divisions & classes' },
    { id: 3, title: 'Details', icon: Settings, description: 'Rules & fees' },
    { id: 4, title: 'Preview', icon: ImageIcon, description: 'E-Flyer Preview' }
];

export default function EventManagementPage() {
    const { id } = useParams(); // If present, we are in Edit/Manage mode
    const navigate = useNavigate();
    const isNew = !id;

    type EventTabId = 'dashboard' | 'settings' | 'rundown' | 'targets' | 'budget' | 'timeline' | 'registration' | 'participants' | 'brackets' | 'results' | 'certificates';
    const [activeTab, setActiveTab] = useState<EventTabId>('dashboard');
    const [currentStep, setCurrentStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [newCategory, setNewCategory] = useState<CompetitionCategoryItem>({
        id: '',
        division: 'RECURVE',
        ageClass: 'Senior',
        gender: 'MALE',
        distance: '70m',
        quota: 0,
        fee: 0,
        qInd: true,
        eInd: true,
        qTeam: false,
        eTeam: false,
        qMix: false,
        eMix: false,
        isSpecial: false,
        categoryLabel: ''
    });
    const [_loading, setLoading] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<EventForm>(INITIAL_FORM);

    const getDaysRemaining = (date: Date | string | null) => {
        if (!date) return null;
        const d = typeof date === 'string' ? new Date(date) : date;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        d.setHours(0, 0, 0, 0);
        const diffTime = d.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getDeadlineStyles = (days: number | null) => {
        if (days === null) return { base: 'bg-primary-500', glow: 'shadow-[0_0_20px_rgba(14,165,233,0.4)]', text: 'text-black' };
        if (days >= 30) return { base: 'bg-emerald-500', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]', text: 'text-black' };
        if (days >= 20) return { base: 'bg-yellow-500', glow: 'shadow-[0_0_20px_rgba(234,179,8,0.4)]', text: 'text-black' };
        if (days >= 10) return { base: 'bg-orange-500', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.4)]', text: 'text-black' };
        if (days > 0) return { base: 'bg-red-500', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.4)]', text: 'text-white' };
        return { base: 'bg-dark-600', glow: '', text: 'text-dark-400' };
    };

    const currencySymbol = currencies.find(c => c.code === form.currency)?.symbol || form.currency;
    const daysLeft = getDaysRemaining(form.registrationDeadline);
    const deadlineStyles = getDeadlineStyles(daysLeft);

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
    const [_showCategoryModal, setShowCategoryModal] = useState(false);
    const [showGenerator, setShowGenerator] = useState(false);
    const [_editingCategory, setEditingCategory] = useState<string | null>(null);
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

    useEffect(() => {
        console.log('EventManagementPage Mounted', new Date().toISOString());
    }, []);

    // Sync City Name to Form when City ID changes
    useEffect(() => {
        if (selectedCity && cities.length > 0) {
            const cityName = getCityName(selectedCity);
            if (cityName) {
                updateForm('city', cityName);
            }
        }
    }, [selectedCity, cities, getCityName]);

    // Auto-select currency based on country
    useEffect(() => {
        if (form.country) {
            const currency = currencies.find(c => c.country === form.country) || currencies.find(c => c.code === 'USD');
            if (currency) {
                updateForm('currency', currency.code);
            }
        }
    }, [form.country]);

    // For Participants Tab
    const [participants, _setParticipants] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-unused-vars
    const [_loadingParticipants, _setLoadingParticipants] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars
    const [generatingCerts, setGeneratingCerts] = useState(false);
    const [certIncludeParticipants, setCertIncludeParticipants] = useState(true);

    const [eventStats, setEventStats] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState(false);

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
                    type: data.type || 'OPEN',
                    startDate: data.startDate?.split('T')[0] || '',
                    endDate: data.endDate?.split('T')[0] || '',
                    registrationDeadline: data.registrationDeadline?.split('T')[0] || '',
                    venue: data.venue || data.location || '',
                    address: data.address || '',
                    city: data.city || '',
                    province: data.province || '',
                    country: data.country || 'Indonesia',
                    locationUrl: data.locationUrl || '',
                    description: data.description || '',
                    rules: data.rules || '',
                    maxParticipants: data.maxParticipants || 500,
                    status: data.status || 'DRAFT',
                    level: data.level || 'CLUB',
                    fieldType: data.fieldType || 'OUTDOOR',
                    competitionCategories: data.categories || [],
                    currency: data.currency || 'IDR',
                    feeIndividual: data.feeIndividual || 0,
                    feeTeam: data.feeTeam || 0,
                    feeMixTeam: data.feeMixTeam || 0,
                    feeOfficial: data.feeOfficial || 0,
                    instagram: data.instagram || '',
                    website: data.website || '',
                    technicalHandbook: data.technicalHandbook || null,
                    eFlyer: data.eFlyer || null
                });
            }
        } catch (error) {
            console.error('Failed to fetch event:', error);
            toast.error('Failed to load event details');
        } finally {
            setLoading(false);
        }
    };

    const fetchEventStats = async () => {
        if (!id) return;
        setLoadingStats(true);
        try {
            const res = await api.get(`/eo/events/${id}/stats`);
            if (res.data.success) {
                setEventStats(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch event stats:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'dashboard' && !isNew) {
            fetchEventStats();
        }
    }, [activeTab, id]);

    const handleSaveCategory = () => {
        if (editingCategoryId) {
            // Update existing
            setForm(prev => ({
                ...prev,
                competitionCategories: prev.competitionCategories.map(cat =>
                    cat.id === editingCategoryId ? { ...newCategory, id: editingCategoryId } : cat
                )
            }));
            setEditingCategoryId(null);
        } else {
            // Add new
            setForm(prev => ({
                ...prev,
                competitionCategories: [
                    ...prev.competitionCategories,
                    { ...newCategory, id: Math.random().toString(36).substr(2, 9) }
                ]
            }));
        }

        // Reset form
        setNewCategory(prev => ({
            ...prev,
            id: '',
            isSpecial: false,
            categoryLabel: ''
        }));
    };

    const removeCategory = (id: string) => {
        setForm(prev => ({
            ...prev,
            competitionCategories: prev.competitionCategories.filter(c => c.id !== id)
        }));
        if (editingCategoryId === id) {
            setEditingCategoryId(null);
            setNewCategory({
                id: '',
                division: 'RECURVE',
                ageClass: 'Senior',
                gender: 'MALE',
                distance: '70m',
                quota: 0,
                fee: 0,
                qInd: true,
                eInd: true,
                qTeam: false,
                eTeam: false,
                qMix: false,
                eMix: false,
                isSpecial: false,
                categoryLabel: ''
            });
        }
    };

    const editCategory = (cat: CompetitionCategoryItem) => {
        setNewCategory(cat);
        setEditingCategoryId(cat.id);
    };

    const cancelEdit = () => {
        setEditingCategoryId(null);
        setNewCategory({
            id: '',
            division: 'RECURVE',
            ageClass: 'Senior',
            gender: 'MALE',
            distance: '70m',
            quota: 0,
            fee: 0,
            qInd: true,
            eInd: true,
            qTeam: false,
            eTeam: false,
            qMix: false,
            eMix: false,
            isSpecial: false,
            categoryLabel: ''
        });
    };

    const validateStep = (step: number) => {
        switch (step) {
            case 1:
                return !!form.name && !!form.startDate && !!form.endDate;
            case 2:
                return form.competitionCategories.length > 0;
            case 3:
                return true;
            case 4:
                return true;
            default:
                return false;
        }
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
        } else {
            toast.warning('Please fill in all required fields correctly before proceeding.');
        }
    };

    const handleSave = async () => {
        setSubmitting(true);
        try {
            const formData = { ...form };

            // 1. Handle File Uploads - Technical Handbook
            if (form.technicalHandbook instanceof File) {
                const fd = new FormData();
                fd.append('file', form.technicalHandbook);
                const uploadRes = await api.post('/uploads/document', fd);
                if (uploadRes.data.success) {
                    formData.technicalHandbook = uploadRes.data.data.url;
                }
            }

            // 2. Handle File Uploads - E-Flyer
            if (form.eFlyer instanceof File) {
                const fd = new FormData();
                fd.append('image', form.eFlyer);
                const uploadRes = await api.post('/uploads/image', fd);
                if (uploadRes.data.success) {
                    formData.eFlyer = uploadRes.data.data.url;
                }
            }

            if (isNew) {
                const res = await api.post('/eo/events', formData);
                if (res.data.success) {
                    toast.success('Event Created Successfully!');
                    navigate(`/events/manage/${res.data.data.id}`);
                }
            } else {
                const res = await api.patch(`/eo/events/${id}`, formData);
                if (res.data.success) {
                    toast.success('Event Updated Successfully!');
                    fetchEventDetails();
                }
            }
        } catch (error: any) {
            console.error('Save failed:', error);
            const msg = error.response?.data?.message || error.message || 'Failed to save event';
            toast.error(msg);
        } finally {
            setSubmitting(false);
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


    const handleGenerateCertificates = async () => {
        if (!id) return;
        if (!confirm('Generate certificates for all eligible participants? This may take a moment.')) return;

        setGeneratingCerts(true);
        try {
            const res = await api.post(`/certificates/generate-bulk/${id}`, {
                includeParticipants: certIncludeParticipants
            });
            if (res.data.success) {
                toast.success(res.data.message);
            }
        } catch (error: any) {
            console.error('Certificate generation failed:', error);
            toast.error(error.response?.data?.message || 'Failed to generate certificates');
        } finally {
            setGeneratingCerts(false);
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
        const curr = new Date(start);
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

    const defaultTabs: any[] = [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'rundown', label: 'Rundown', icon: LayoutList },
        { id: 'targets', label: 'Targets', icon: Target },
        { id: 'budget', label: 'Budget', icon: DollarSign },
        { id: 'timeline', label: 'Timeline', icon: CalendarIcon },
        { id: 'registration', label: 'Registration', icon: FileText },
        { id: 'participants', label: 'Participants', icon: Users },
        { id: 'brackets', label: 'Brackets', icon: GitBranch },
        { id: 'results', label: 'Results', icon: Trophy },
        { id: 'certificates', label: 'Certificates', icon: Award }
    ];

    const { tabs } = useLayoutTabs('event_management', defaultTabs);

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
                            onClick={() => !isNew && setActiveTab(tab.id as EventTabId)}
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
                    {activeTab === 'dashboard' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            {/* Stats Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="card p-5 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                            <Users size={20} />
                                        </div>
                                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg">Archers</span>
                                    </div>
                                    <div className="text-3xl font-bold text-white mb-1">
                                        {eventStats?.totalRegistrations || 0}
                                        <span className="text-sm text-dark-500 font-medium ml-1">/ {form.maxParticipants}</span>
                                    </div>
                                    <div className="text-xs text-dark-400">Total Registrations</div>
                                    <div className="mt-4 h-1.5 bg-dark-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-500"
                                            style={{ width: `${Math.min(100, ((eventStats?.totalRegistrations || 0) / form.maxParticipants) * 100)}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="card p-5 bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                            <Check size={20} />
                                        </div>
                                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">Confirmed</span>
                                    </div>
                                    <div className="text-3xl font-bold text-white mb-1">
                                        {eventStats?.confirmedRegistrations || 0}
                                    </div>
                                    <div className="text-xs text-dark-400">Paid & Verified</div>
                                    <div className="mt-4 flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Payments Verified</span>
                                    </div>
                                </div>

                                <div className="card p-5 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                                            <DollarSign size={20} />
                                        </div>
                                        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">Revenue</span>
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-1">
                                        {currencySymbol} {new Intl.NumberFormat('id-ID').format(eventStats?.totalRevenue || 0)}
                                    </div>
                                    <div className="text-xs text-dark-400">Estimated Total Revenue</div>
                                    <div className="mt-4 text-[10px] text-amber-500 font-bold uppercase tracking-wider">Incl. Pending: {currencySymbol} {new Intl.NumberFormat('id-ID').format(eventStats?.pendingRevenue || 0)}</div>
                                </div>

                                <div className="card p-5 bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                                            <Clock size={20} />
                                        </div>
                                        <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-lg">Timeline</span>
                                    </div>
                                    <div className="text-3xl font-bold text-white mb-1">
                                        {daysLeft !== null ? (daysLeft > 0 ? daysLeft : 'Closed') : '--'}
                                    </div>
                                    <div className="text-xs text-dark-400">Days Until Deadline</div>
                                    <div className="mt-4 h-1.5 bg-dark-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${deadlineStyles.base}`}
                                            style={{ width: `${Math.max(0, Math.min(100, (daysLeft || 0) * 3))}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Category Distribution */}
                                <div className="lg:col-span-2 card overflow-hidden">
                                    <div className="p-4 border-b border-dark-700 flex items-center justify-between bg-dark-900/50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-4 bg-primary-500 rounded-full" />
                                            <h3 className="font-bold text-white">Category Distribution</h3>
                                        </div>
                                        <button
                                            onClick={fetchEventStats}
                                            className="text-primary-400 hover:text-primary-300 transition-colors"
                                        >
                                            <Loader2 size={16} className={loadingStats ? 'animate-spin' : ''} />
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        {eventStats?.categoryStats?.length > 0 ? (
                                            <div className="space-y-4">
                                                {eventStats.categoryStats.map((cat: any, idx: number) => (
                                                    <div key={idx} className="space-y-2">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-white font-medium">{cat.name}</span>
                                                                <span className="text-[10px] text-dark-500 bg-dark-800 px-1.5 py-0.5 rounded border border-dark-700">{cat.distance}</span>
                                                            </div>
                                                            <div className="text-dark-400">
                                                                <span className="text-white font-bold">{cat.count}</span>
                                                                <span className="mx-1">/</span>
                                                                <span>{cat.quota || '∞'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${Math.min(100, (cat.count / (cat.quota || 100)) * 100)}%` }}
                                                                className={`h-full rounded-full ${(cat.count / (cat.quota || 100)) > 0.9 ? 'bg-red-500' :
                                                                    (cat.count / (cat.quota || 100)) > 0.7 ? 'bg-amber-500' : 'bg-primary-500'
                                                                    }`}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-12 text-center">
                                                <Users className="w-12 h-12 text-dark-700 mx-auto mb-3 opacity-20" />
                                                <p className="text-dark-500 text-sm">No registrations yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Recent Activity / Quick Actions */}
                                <div className="space-y-6">
                                    <div className="card">
                                        <div className="p-4 border-b border-dark-700 bg-dark-900/50">
                                            <h3 className="font-bold text-white flex items-center gap-2">
                                                <AlertCircle size={16} className="text-amber-400" />
                                                Next Milestones
                                            </h3>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                                    <FileText size={14} className="text-blue-400" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white">Registration Deadline</div>
                                                    <div className="text-[10px] text-dark-400">{form.registrationDeadline ? (form.registrationDeadline instanceof Date ? form.registrationDeadline.toLocaleDateString() : String(form.registrationDeadline)) : '-'}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                    <Trophy size={14} className="text-emerald-400" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white">Event Start</div>
                                                    <div className="text-[10px] text-dark-400">{form.startDate ? (form.startDate instanceof Date ? form.startDate.toLocaleDateString() : String(form.startDate)) : '-'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card p-4 space-y-3">
                                        <button
                                            onClick={handleExport}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-dark-800 hover:bg-dark-700 border border-dark-700 transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-400 group-hover:bg-primary-500 group-hover:text-white transition-all">
                                                <Download size={18} />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-sm font-bold text-white">Export IanSEO</div>
                                                <div className="text-[10px] text-dark-400">Download participant CSV</div>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => setActiveTab('brackets')}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-dark-800 hover:bg-dark-700 border border-dark-700 transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                                                <GitBranch size={18} />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-sm font-bold text-white">Generate Brackets</div>
                                                <div className="text-[10px] text-dark-400">Manage elimination rounds</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            {/* Modular Step Progress */}
                            <div className="flex justify-between items-center mb-8">
                                <div className="grid grid-cols-4 gap-4 w-full max-w-3xl">
                                    {STEPS.map((step, i) => {
                                        const StepIcon = step.icon;
                                        const isActive = currentStep === step.id;
                                        const isComplete = currentStep > step.id;
                                        return (
                                            <div key={step.id} className="relative">
                                                <button
                                                    onClick={() => (isComplete || !isNew) && setCurrentStep(step.id)}
                                                    className={`flex items-center gap-3 w-full p-3 rounded-xl border transition-all ${isActive ? 'bg-primary-500/10 border-primary-500/50 shadow-lg shadow-primary-500/10' :
                                                        isComplete ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-dark-800 border-dark-700 opacity-60'
                                                        }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-primary-500 text-white' :
                                                        isComplete ? 'bg-emerald-500 text-white' : 'bg-dark-700 text-dark-400'
                                                        }`}>
                                                        {isComplete ? <Check size={16} /> : <StepIcon size={16} />}
                                                    </div>
                                                    <div className="text-left">
                                                        <div className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-primary-400' : isComplete ? 'text-emerald-400' : 'text-dark-500'}`}>Step {step.id}</div>
                                                        <div className={`text-xs font-bold ${isActive ? 'text-white' : 'text-dark-300'}`}>{step.title}</div>
                                                    </div>
                                                </button>
                                                {i < STEPS.length - 1 && (
                                                    <div className={`absolute -right-2 top-1/2 -translate-y-1/2 z-10 hidden lg:block ${isComplete ? 'text-emerald-500' : 'text-dark-700'}`}>
                                                        <Link size={12} />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${form.status === 'PUBLISHED' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                                        }`}>
                                        {form.status}
                                    </div>
                                </div>
                            </div>

                            {/* Step Content */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    {currentStep === 1 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <div>
                                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                        <Trophy size={18} className="text-primary-400" />
                                                        General Information
                                                    </h3>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="label">Event Name</label>
                                                            <input
                                                                type="text"
                                                                value={form.name}
                                                                onChange={e => updateForm('name', e.target.value)}
                                                                className="input w-full"
                                                                placeholder="e.g., Regional Championship 2026"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="label">Event Description</label>
                                                            <textarea
                                                                value={form.description}
                                                                onChange={(e) => updateForm('description', e.target.value)}
                                                                placeholder="Describe your event..."
                                                                className="input w-full h-32 resize-none"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="label">Event Level</label>
                                                                <select
                                                                    value={form.level}
                                                                    onChange={e => updateForm('level', e.target.value)}
                                                                    className="input w-full"
                                                                >
                                                                    <option value="CLUB">Club</option>
                                                                    <option value="CITY">City</option>
                                                                    <option value="PROVINCE">Province</option>
                                                                    <option value="NATIONAL">National</option>
                                                                    <option value="INTERNATIONAL">International</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="label">Event Type</label>
                                                                <select
                                                                    value={form.type}
                                                                    onChange={e => updateForm('type', e.target.value)}
                                                                    className="input w-full"
                                                                >
                                                                    <option value="OPEN">Open</option>
                                                                    <option value="INTERNAL">Internal</option>
                                                                    <option value="SELECTION">Selection</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="label">Field Type</label>
                                                            <div className="flex gap-2">
                                                                {['OUTDOOR', 'INDOOR'].map(ft => (
                                                                    <button
                                                                        key={ft}
                                                                        onClick={() => updateForm('fieldType', ft as any)}
                                                                        className={`flex-1 py-2 rounded-lg border font-bold text-xs transition-all ${form.fieldType === ft ? 'bg-primary-500/20 border-primary-500 text-primary-400' : 'bg-dark-800 border-dark-700 text-dark-400 hover:border-dark-600'}`}
                                                                    >
                                                                        {ft}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-dark-700">
                                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                        <CalendarIcon size={18} className="text-primary-400" />
                                                        Schedule
                                                    </h3>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="label text-primary-400">Start Date (YYYY-MM-DD)</label>
                                                            <DatePicker
                                                                selected={form.startDate ? new Date(form.startDate) : null}
                                                                onChange={(date) => updateForm('startDate', date ? date.toISOString().split('T')[0] : '')}
                                                                className="input w-full"
                                                                dateFormat="yyyy-MM-dd"
                                                                placeholderText="Select start date"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="label text-primary-400">End Date (YYYY-MM-DD)</label>
                                                            <DatePicker
                                                                selected={form.endDate ? new Date(form.endDate) : null}
                                                                onChange={(date) => updateForm('endDate', date ? date.toISOString().split('T')[0] : '')}
                                                                className="input w-full"
                                                                dateFormat="yyyy-MM-dd"
                                                                placeholderText="Select end date"
                                                            />
                                                        </div>
                                                        <div className="sm:col-span-2">
                                                            <label className="label text-amber-400">Registration Deadline (YYYY-MM-DD)</label>
                                                            <DatePicker
                                                                selected={form.registrationDeadline ? new Date(form.registrationDeadline) : null}
                                                                onChange={(date) => updateForm('registrationDeadline', date ? date.toISOString().split('T')[0] : '')}
                                                                className="input w-full border-amber-500/30"
                                                                dateFormat="yyyy-MM-dd"
                                                                placeholderText="Select deadline"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div>
                                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                        <MapPin size={18} className="text-primary-400" />
                                                        Location
                                                    </h3>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="label">Venue Name</label>
                                                            <input type="text" className="input w-full" value={form.venue} onChange={e => updateForm('venue', e.target.value)} placeholder="e.g. Stadion Si Jalak Harupat" />
                                                        </div>
                                                        <div>
                                                            <label className="label">Country</label>
                                                            <SearchableSelect
                                                                options={countries.map(c => ({ value: c.name, label: c.name }))}
                                                                value={form.country}
                                                                onChange={(val) => updateForm('country', val)}
                                                                placeholder="Select Country"
                                                                className="w-full"
                                                            />
                                                        </div>
                                                        {form.country === 'Indonesia' && (
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="label">Province</label>
                                                                    <select
                                                                        value={selectedProvince}
                                                                        onChange={e => setSelectedProvince(e.target.value)}
                                                                        className="input w-full"
                                                                        disabled={isLoadingProvinces}
                                                                    >
                                                                        <option value="">Select Province</option>
                                                                        {[...provinces].sort((a, b) => a.name.localeCompare(b.name)).map(p => (
                                                                            <option key={p.id} value={p.id}>{p.name}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="label">City</label>
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
                                                        )}
                                                        <div>
                                                            <label className="label">Full Address</label>
                                                            <textarea
                                                                value={form.address}
                                                                onChange={e => updateForm('address', e.target.value)}
                                                                placeholder="Enter complete address..."
                                                                className="input w-full h-20 resize-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="label mb-2 block">Pin Location on Map</label>
                                                            <LocationPicker
                                                                onLocationSelect={(lat, lng) => {
                                                                    updateForm('latitude', lat);
                                                                    updateForm('longitude', lng);
                                                                }}
                                                                initialLat={form.latitude}
                                                                initialLng={form.longitude}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 2 && (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between gap-4 mb-2">
                                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                    <Users size={18} className="text-primary-400" />
                                                    Competition Categories
                                                </h3>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-2 bg-dark-900/50 px-3 py-1.5 rounded-lg border border-dark-700">
                                                        <Tag size={14} className="text-primary-400" />
                                                        <select
                                                            className="bg-transparent text-[10px] font-bold text-white outline-none cursor-pointer"
                                                            onChange={(e) => {
                                                                const template = CATEGORY_TEMPLATES.find(t => t.label === e.target.value);
                                                                if (template) {
                                                                    setNewCategory({
                                                                        ...newCategory,
                                                                        division: template.division,
                                                                        ageClass: template.ageClass,
                                                                        gender: template.gender || 'MALE',
                                                                        distance: template.distance,
                                                                        qInd: template.qInd,
                                                                        eInd: template.eInd,
                                                                        qTeam: template.qTeam,
                                                                        eTeam: template.eTeam,
                                                                        qMix: template.qMix,
                                                                        eMix: template.eMix
                                                                    });
                                                                    toast.info(`Applied template: ${template.label}`);
                                                                }
                                                                e.target.value = "";
                                                            }}
                                                        >
                                                            <option value="" className="bg-dark-800">Quick Templates...</option>
                                                            {CATEGORY_TEMPLATES.map(t => (
                                                                <option key={t.label} value={t.label} className="bg-dark-800">{t.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <button
                                                        onClick={() => setShowGenerator(true)}
                                                        className="px-3 py-1.5 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/30 text-xs font-bold hover:bg-pink-500/20 transition-colors flex items-center gap-2"
                                                    >
                                                        <Layers size={14} />
                                                        Bulk Generate
                                                    </button>
                                                    <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest bg-dark-900/80 px-3 py-1.5 rounded-lg border border-white/5">
                                                        Double-click row to edit
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-dark-800/50 rounded-xl overflow-hidden border border-dark-700">
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-xs text-left">
                                                        <thead className="text-[10px] text-dark-400 uppercase bg-dark-900 border-b border-dark-700">
                                                            <tr>
                                                                <th rowSpan={2} className="px-3 py-3 border-r border-dark-700 align-middle">Division</th>
                                                                <th rowSpan={2} className="px-3 py-3 border-r border-dark-700 align-middle">Age Class</th>
                                                                <th rowSpan={2} className="px-3 py-3 border-r border-dark-700 align-middle">Gender</th>
                                                                <th rowSpan={2} className="px-3 py-3 border-r border-dark-700 text-center align-middle">Dist</th>
                                                                <th colSpan={2} className="px-1 py-1 text-center border-r border-b border-dark-700">Individu</th>
                                                                <th colSpan={2} className="px-1 py-1 text-center border-r border-b border-dark-700">Team</th>
                                                                <th colSpan={2} className="px-1 py-1 text-center border-r border-b border-dark-700">Mix</th>
                                                                <th rowSpan={2} className="px-1 py-1 text-center border-r border-dark-700 align-middle" title="Special Category">Sp</th>
                                                                <th rowSpan={2} className="px-3 py-3 border-r border-dark-700 align-middle">Description</th>
                                                                <th rowSpan={2} className="px-2 py-3 text-center align-middle w-12">Del</th>
                                                            </tr>
                                                            <tr>
                                                                <th className="px-1 py-1 text-center border-r border-dark-700 w-8">Qua</th>
                                                                <th className="px-1 py-1 text-center border-r border-dark-700 w-8">Elim</th>
                                                                <th className="px-1 py-1 text-center border-r border-dark-700 w-8">Qua</th>
                                                                <th className="px-1 py-1 text-center border-r border-dark-700 w-8">Elim</th>
                                                                <th className="px-1 py-1 text-center border-r border-dark-700 w-8">Qua</th>
                                                                <th className="px-1 py-1 text-center border-white/5 w-8">Elim</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-dark-700">
                                                            {form.competitionCategories.map((cat) => (
                                                                <tr
                                                                    key={cat.id}
                                                                    onDoubleClick={() => !editingCategoryId && editCategory(cat)}
                                                                    className={`hover:bg-dark-800 transition-all duration-300 cursor-pointer group ${editingCategoryId === cat.id ? 'shining-gold bg-emerald-500/10 relative z-10' : ''}`}
                                                                    title={editingCategoryId === cat.id ? "" : "Double click to edit"}
                                                                >
                                                                    {editingCategoryId === cat.id ? (
                                                                        <>
                                                                            <td className="p-1 border-r border-dark-700">
                                                                                <select
                                                                                    className="input !py-1 !px-2 !text-[10px] w-full !h-8"
                                                                                    value={newCategory.division}
                                                                                    onChange={e => setNewCategory({ ...newCategory, division: e.target.value })}
                                                                                >
                                                                                    {['RECURVE', 'COMPOUND', 'BAREBOW', 'STANDARD', 'TRADITIONAL'].map(o => <option key={o} value={o}>{o}</option>)}
                                                                                </select>
                                                                            </td>
                                                                            <td className="p-1 border-r border-dark-700">
                                                                                <select
                                                                                    className="input !py-1 !px-2 !text-[10px] w-full !h-8"
                                                                                    value={newCategory.ageClass}
                                                                                    onChange={e => setNewCategory({ ...newCategory, ageClass: e.target.value })}
                                                                                >
                                                                                    {['U10', 'U12', 'U15', 'U18', 'U21', 'Senior', 'Master'].map(o => <option key={o} value={o}>{o}</option>)}
                                                                                </select>
                                                                            </td>
                                                                            <td className="p-1 border-r border-dark-700">
                                                                                <select
                                                                                    className="input !py-1 !px-2 !text-[10px] w-full !h-8"
                                                                                    value={newCategory.gender}
                                                                                    onChange={e => setNewCategory({ ...newCategory, gender: e.target.value })}
                                                                                >
                                                                                    <option value="MALE">Man</option>
                                                                                    <option value="FEMALE">Woman</option>
                                                                                    <option value="MIXED">Mixed</option>
                                                                                </select>
                                                                            </td>
                                                                            <td className="p-1 border-r border-dark-700">
                                                                                <select
                                                                                    className="input !py-1 !px-2 !text-[10px] w-full !h-8"
                                                                                    value={newCategory.distance}
                                                                                    onChange={e => setNewCategory({ ...newCategory, distance: e.target.value })}
                                                                                >
                                                                                    {['90m', '70m', '60m', '50m', '40m', '30m', '25m', '20m', '18m', '15m', '10m', '5m'].map(o => <option key={o} value={o}>{o}</option>)}
                                                                                </select>
                                                                            </td>
                                                                            <td className="p-0.5 text-center border-r border-dark-700"><input type="checkbox" checked={newCategory.qInd} onChange={e => setNewCategory({ ...newCategory, qInd: e.target.checked })} className="w-4 h-4 accent-primary-500 cursor-pointer" /></td>
                                                                            <td className="p-0.5 text-center border-r border-dark-700"><input type="checkbox" checked={newCategory.eInd} onChange={e => setNewCategory({ ...newCategory, eInd: e.target.checked })} className="w-4 h-4 accent-primary-500 cursor-pointer" /></td>
                                                                            <td className="p-0.5 text-center border-r border-dark-700"><input type="checkbox" checked={newCategory.qTeam} onChange={e => setNewCategory({ ...newCategory, qTeam: e.target.checked })} className="w-4 h-4 accent-primary-500 cursor-pointer" /></td>
                                                                            <td className="p-0.5 text-center border-r border-dark-700"><input type="checkbox" checked={newCategory.eTeam} onChange={e => setNewCategory({ ...newCategory, eTeam: e.target.checked })} className="w-4 h-4 accent-primary-500 cursor-pointer" /></td>
                                                                            <td className="p-0.5 text-center border-r border-dark-700"><input type="checkbox" checked={newCategory.qMix} onChange={e => setNewCategory({ ...newCategory, qMix: e.target.checked })} className="w-4 h-4 accent-primary-500 cursor-pointer" /></td>
                                                                            <td className="p-0.5 text-center border-r border-dark-700"><input type="checkbox" checked={newCategory.eMix} onChange={e => setNewCategory({ ...newCategory, eMix: e.target.checked })} className="w-4 h-4 accent-primary-500 cursor-pointer" /></td>
                                                                            <td className="p-0.5 text-center border-r border-dark-700"><input type="checkbox" checked={newCategory.isSpecial} onChange={e => setNewCategory({ ...newCategory, isSpecial: e.target.checked })} className="w-4 h-4 accent-primary-500 cursor-pointer" /></td>
                                                                            <td className="p-1 border-r border-dark-700">
                                                                                <input
                                                                                    type="text"
                                                                                    className={`input !py-1 !px-2 !text-[10px] w-full !h-8 ${!newCategory.isSpecial ? 'opacity-50 cursor-not-allowed bg-dark-900/50' : ''}`}
                                                                                    placeholder={newCategory.isSpecial ? "Name..." : "-"}
                                                                                    value={newCategory.isSpecial ? newCategory.categoryLabel : ''}
                                                                                    onChange={e => setNewCategory({ ...newCategory, categoryLabel: e.target.value })}
                                                                                    disabled={!newCategory.isSpecial}
                                                                                />
                                                                            </td>
                                                                            <td className="p-1 text-center bg-emerald-500/20">
                                                                                <button
                                                                                    onClick={handleSaveCategory}
                                                                                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-1.5 rounded-lg shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center"
                                                                                    title="Save Changes"
                                                                                >
                                                                                    <Check size={16} />
                                                                                </button>
                                                                            </td>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <td className="px-3 py-3 border-r border-dark-700 font-bold text-white">{cat.division}</td>
                                                                            <td className="px-3 py-3 border-r border-dark-700">{cat.ageClass}</td>
                                                                            <td className="px-3 py-3 border-r border-dark-700">
                                                                                {cat.gender === 'MALE' ? 'Man' : cat.gender === 'FEMALE' ? 'Woman' : 'Mixed'}
                                                                            </td>
                                                                            <td className="px-3 py-3 border-r border-dark-700 text-center">{cat.distance}</td>
                                                                            <td className="px-1 py-3 text-center border-r border-dark-700">{cat.qInd && <Check size={14} className="text-emerald-400 mx-auto" />}</td>
                                                                            <td className="px-1 py-3 text-center border-r border-dark-700">{cat.eInd && <Check size={14} className="text-emerald-400 mx-auto" />}</td>
                                                                            <td className="px-1 py-3 text-center border-r border-dark-700">{cat.qTeam && <Check size={14} className="text-primary-400 mx-auto" />}</td>
                                                                            <td className="px-1 py-3 text-center border-r border-dark-700">{cat.eTeam && <Check size={14} className="text-primary-400 mx-auto" />}</td>
                                                                            <td className="px-1 py-3 text-center border-r border-dark-700">{cat.qMix && <Check size={14} className="text-purple-400 mx-auto" />}</td>
                                                                            <td className="px-1 py-3 text-center border-r border-dark-700">{cat.eMix && <Check size={14} className="text-purple-400 mx-auto" />}</td>
                                                                            <td className="px-1 py-3 text-center border-r border-dark-700">{cat.isSpecial && <Check size={14} className="text-amber-400 mx-auto" />}</td>
                                                                            <td className="px-3 py-3 border-r border-dark-700 max-w-[150px] truncate" title={cat.categoryLabel}>{cat.categoryLabel || '-'}</td>
                                                                            <td className="px-2 py-3 text-center">
                                                                                <div className="flex justify-center">
                                                                                    <button
                                                                                        onClick={() => removeCategory(cat.id)}
                                                                                        disabled={!!editingCategoryId}
                                                                                        className={`p-1.5 rounded transition-all ${editingCategoryId ? 'text-dark-600 cursor-not-allowed' : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'}`}
                                                                                        title="Delete Category"
                                                                                    >
                                                                                        <Trash2 size={14} />
                                                                                    </button>
                                                                                </div>
                                                                            </td>
                                                                        </>
                                                                    )}
                                                                </tr>
                                                            ))}

                                                            {!editingCategoryId && (
                                                                <tr className="transition-all duration-300 bg-dark-900/50">
                                                                    <td className="p-1 border-r border-dark-700">
                                                                        <select
                                                                            className="input !py-1 !px-2 !text-[10px] w-full"
                                                                            value={newCategory.division}
                                                                            onChange={e => setNewCategory({ ...newCategory, division: e.target.value })}
                                                                        >
                                                                            {['RECURVE', 'COMPOUND', 'BAREBOW', 'STANDARD', 'TRADITIONAL'].map(o => <option key={o} value={o}>{o}</option>)}
                                                                        </select>
                                                                    </td>
                                                                    <td className="p-1 border-r border-dark-700">
                                                                        <select
                                                                            className="input !py-1 !px-2 !text-[10px] w-full"
                                                                            value={newCategory.ageClass}
                                                                            onChange={e => setNewCategory({ ...newCategory, ageClass: e.target.value })}
                                                                        >
                                                                            {['U10', 'U12', 'U15', 'U18', 'U21', 'Senior', 'Master'].map(o => <option key={o} value={o}>{o}</option>)}
                                                                        </select>
                                                                    </td>
                                                                    <td className="p-1 border-r border-dark-700">
                                                                        <select
                                                                            className="input !py-1 !px-2 !text-[10px] w-full"
                                                                            value={newCategory.gender}
                                                                            onChange={e => setNewCategory({ ...newCategory, gender: e.target.value })}
                                                                        >
                                                                            <option value="MALE">Man</option>
                                                                            <option value="FEMALE">Woman</option>
                                                                            <option value="MIXED">Mixed</option>
                                                                        </select>
                                                                    </td>
                                                                    <td className="p-1 border-r border-dark-700">
                                                                        <select
                                                                            className="input !py-1 !px-2 !text-[10px] w-full"
                                                                            value={newCategory.distance}
                                                                            onChange={e => setNewCategory({ ...newCategory, distance: e.target.value })}
                                                                        >
                                                                            {['90m', '70m', '60m', '50m', '40m', '30m', '25m', '20m', '18m', '15m', '10m', '5m'].map(o => <option key={o} value={o}>{o}</option>)}
                                                                        </select>
                                                                    </td>
                                                                    <td className="p-0.5 text-center border-r border-dark-700"><input type="checkbox" checked={newCategory.qInd} onChange={e => setNewCategory({ ...newCategory, qInd: e.target.checked })} className="w-5 h-5 accent-primary-500 cursor-pointer" /></td>
                                                                    <td className="p-0.5 text-center border-r border-dark-700"><input type="checkbox" checked={newCategory.eInd} onChange={e => setNewCategory({ ...newCategory, eInd: e.target.checked })} className="w-5 h-5 accent-primary-500 cursor-pointer" /></td>
                                                                    <td className="p-0.5 text-center border-r border-dark-700"><input type="checkbox" checked={newCategory.qTeam} onChange={e => setNewCategory({ ...newCategory, qTeam: e.target.checked })} className="w-5 h-5 accent-primary-500 cursor-pointer" /></td>
                                                                    <td className="p-0.5 text-center border-r border-dark-700"><input type="checkbox" checked={newCategory.eTeam} onChange={e => setNewCategory({ ...newCategory, eTeam: e.target.checked })} className="w-5 h-5 accent-primary-500 cursor-pointer" /></td>
                                                                    <td className="p-0.5 text-center border-r border-dark-700"><input type="checkbox" checked={newCategory.qMix} onChange={e => setNewCategory({ ...newCategory, qMix: e.target.checked })} className="w-5 h-5 accent-primary-500 cursor-pointer" /></td>
                                                                    <td className="p-0.5 text-center border-r border-dark-700"><input type="checkbox" checked={newCategory.eMix} onChange={e => setNewCategory({ ...newCategory, eMix: e.target.checked })} className="w-5 h-5 accent-primary-500 cursor-pointer" /></td>
                                                                    <td className="p-0.5 text-center border-r border-dark-700"><input type="checkbox" checked={newCategory.isSpecial} onChange={e => setNewCategory({ ...newCategory, isSpecial: e.target.checked })} className="w-5 h-5 accent-primary-500 cursor-pointer" /></td>
                                                                    <td className="p-1 border-r border-dark-700">
                                                                        <input
                                                                            type="text"
                                                                            className={`input !py-1 !px-2 !text-[10px] w-full ${!newCategory.isSpecial ? 'opacity-50 cursor-not-allowed bg-dark-900/50' : ''}`}
                                                                            placeholder={newCategory.isSpecial ? "Name..." : "-"}
                                                                            value={newCategory.isSpecial ? newCategory.categoryLabel : ''}
                                                                            onChange={e => setNewCategory({ ...newCategory, categoryLabel: e.target.value })}
                                                                            disabled={!newCategory.isSpecial}
                                                                        />
                                                                    </td>
                                                                    <td className="p-1 text-center">
                                                                        <div className="flex justify-center">
                                                                            <button onClick={handleSaveCategory} className="w-full py-1.5 h-9 rounded bg-primary-500 hover:bg-primary-400 text-white flex items-center justify-center transition-all active:scale-95">
                                                                                <Plus size={16} />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {form.competitionCategories.length === 0 && (
                                                <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                                                    <AlertCircle size={20} />
                                                    <p className="text-sm">You must add at least one competition category to proceed.</p>
                                                </div>
                                            )}

                                            {/* Roles & Regulations */}
                                            <div className="mt-8 pt-6 border-t border-dark-700">
                                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                    <FileText size={18} className="text-primary-400" />
                                                    Roles & Regulations
                                                </h3>
                                                <textarea
                                                    value={form.rules}
                                                    onChange={(e) => updateForm('rules', e.target.value)}
                                                    placeholder="Enter competition rules..."
                                                    className="input w-full h-40 resize-none"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 3 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <div className="space-y-6">
                                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                        <DollarSign size={18} className="text-primary-400" />
                                                        Registration Fees
                                                    </h3>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="label">Currency</label>
                                                            <SearchableSelect
                                                                options={currencies.map(c => ({ value: c.code, label: `${c.code} - ${c.name}` }))}
                                                                value={form.currency}
                                                                onChange={(val) => updateForm('currency', val)}
                                                                placeholder="Select Currency"
                                                                className="w-full"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="label">Individual Fee</label>
                                                            <input type="number" className="input w-full" value={form.feeIndividual} onChange={e => updateForm('feeIndividual', parseInt(e.target.value))} />
                                                        </div>
                                                        <div>
                                                            <label className="label">Team Fee</label>
                                                            <input type="number" className="input w-full" value={form.feeTeam} onChange={e => updateForm('feeTeam', parseInt(e.target.value))} />
                                                        </div>
                                                        <div>
                                                            <label className="label">Mixed Team Fee</label>
                                                            <input type="number" className="input w-full" value={form.feeMixTeam} onChange={e => updateForm('feeMixTeam', parseInt(e.target.value))} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div>
                                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                        <Upload size={18} className="text-primary-400" />
                                                        Assets & Links
                                                    </h3>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="p-6 border border-dashed border-dark-600 rounded-xl hover:bg-dark-800 transition-all text-center group cursor-pointer relative">
                                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => updateForm('eFlyer', e.target.files?.[0])} />
                                                            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-dark-500 group-hover:text-primary-400 transition-colors" />
                                                            <div className="text-xs font-bold text-dark-300">Event Flyer</div>
                                                            {form.eFlyer && <div className="text-[10px] text-emerald-400 mt-1 font-bold">Image Selected</div>}
                                                        </div>
                                                        <div className="p-6 border border-dashed border-dark-600 rounded-xl hover:bg-dark-800 transition-all text-center group cursor-pointer relative">
                                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => updateForm('technicalHandbook', e.target.files?.[0])} />
                                                            <FileText className="w-8 h-8 mx-auto mb-2 text-dark-500 group-hover:text-primary-400 transition-colors" />
                                                            <div className="text-xs font-bold text-dark-300">Handbook</div>
                                                            {form.technicalHandbook && <div className="text-[10px] text-emerald-400 mt-1 font-bold">PDF Selected</div>}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="label">Instagram Link</label>
                                                        <div className="relative">
                                                            <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={16} />
                                                            <input type="text" className="input w-full pl-10" value={form.instagram} onChange={e => updateForm('instagram', e.target.value)} placeholder="@username or link" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="label">Website Link</label>
                                                        <div className="relative">
                                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={16} />
                                                            <input type="text" className="input w-full pl-10" value={form.website} onChange={e => updateForm('website', e.target.value)} placeholder="https://..." />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 4 && (
                                        <div className="space-y-8">
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                                    <LayoutList size={24} className="text-primary-400" />
                                                    Visual Preview Cards
                                                </h2>
                                                <div className="text-xs text-dark-500 bg-dark-800 px-3 py-1 rounded-full border border-white/5 uppercase tracking-widest font-bold">
                                                    Summary
                                                </div>
                                            </div>

                                            {/* Premium Flyer Preview */}
                                            <div className="relative group max-w-[450px] mx-auto overflow-hidden rounded-[2rem] border-4 border-dark-900 shadow-2xl shadow-primary-500/10 transition-all duration-500 hover:shadow-primary-500/20">
                                                {/* Main Flyer Content */}
                                                <div className="aspect-[4/5] bg-dark-950 relative flex flex-col overflow-hidden text-center">
                                                    {/* Background Elements */}
                                                    <div className="absolute inset-0 bg-gradient-to-b from-primary-600/20 via-transparent to-dark-950/90 z-0" />
                                                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none grayscale brightness-50 z-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />

                                                    {/* Content Wrapper */}
                                                    <div className="relative z-10 flex flex-col h-full p-6">
                                                        {/* Header */}
                                                        <div className="mb-4 space-y-1 text-center">
                                                            <div className="inline-block px-3 py-1 rounded-full bg-primary-500 text-[10px] font-black tracking-[0.2em] text-black uppercase mb-1">
                                                                Archery Competition
                                                            </div>
                                                            <h1 className="text-2xl font-display font-black leading-tight text-white uppercase tracking-tight">
                                                                {form.name || "Event Name"}
                                                            </h1>
                                                            <div className="flex items-center justify-center gap-2 text-primary-400 font-bold tracking-widest uppercase text-[10px]">
                                                                <div className="h-px w-4 bg-primary-500/30" />
                                                                <span>{form.level} • {form.fieldType}</span>
                                                                <div className="h-px w-4 bg-primary-500/30" />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                                            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 flex flex-col items-center justify-center">
                                                                <div className="text-primary-400 uppercase text-[9px] font-black tracking-widest mb-0.5 flex items-center gap-1">
                                                                    <CalendarIcon size={10} /> Schedule
                                                                </div>
                                                                <p className="text-[12px] font-black text-white whitespace-nowrap uppercase">
                                                                    {form.startDate ? new Date(form.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '---'} - {form.endDate ? new Date(form.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '---'}
                                                                </p>
                                                            </div>
                                                            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 flex flex-col items-center justify-center text-center">
                                                                <div className="text-primary-400 uppercase text-[9px] font-black tracking-widest mb-0.5 flex items-center gap-1">
                                                                    <MapPin size={10} /> Venue
                                                                </div>
                                                                <p className="text-[11px] font-bold text-white leading-tight line-clamp-1 uppercase">
                                                                    {form.venue || "TBA"}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Fee Section */}
                                                        <div className="bg-dark-900/80 rounded-xl p-4 border border-white/5 mb-3 relative overflow-hidden">
                                                            <div className="flex items-center justify-between mb-3 px-1">
                                                                <div className="text-primary-400 uppercase text-[9px] font-black tracking-widest">Registration Fees</div>
                                                                <div className="text-[9px] text-dark-500 font-bold uppercase tracking-tight">{form.currency} ({currencySymbol})</div>
                                                            </div>
                                                            <div className="grid grid-cols-3 gap-2">
                                                                <div className="text-center">
                                                                    <div className="text-[9px] font-bold text-dark-400 uppercase mb-0.5">Individual</div>
                                                                    <div className="text-[11px] font-black text-white">{currencySymbol} {form.feeIndividual > 0 ? form.feeIndividual.toLocaleString() : '---'}</div>
                                                                </div>
                                                                <div className="text-center border-x border-white/5">
                                                                    <div className="text-[9px] font-bold text-dark-400 uppercase mb-0.5">Team</div>
                                                                    <div className="text-[11px] font-black text-white">{currencySymbol} {form.feeTeam > 0 ? form.feeTeam.toLocaleString() : '---'}</div>
                                                                </div>
                                                                <div className="text-center">
                                                                    <div className="text-[9px] font-bold text-dark-400 uppercase mb-0.5">Mix Team</div>
                                                                    <div className="text-[11px] font-black text-white">{currencySymbol} {form.feeMixTeam > 0 ? form.feeMixTeam.toLocaleString() : '---'}</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Categories Summary - Maximized Space */}
                                                        <div className="flex-1 flex flex-col gap-2 overflow-hidden text-center min-h-0">
                                                            <div className="flex flex-wrap justify-center gap-2 overflow-y-auto max-h-[160px] scrollbar-hide py-1">
                                                                {form.competitionCategories.length > 0 ? (
                                                                    Array.from(new Map(
                                                                        form.competitionCategories.map(cat => [
                                                                            `${cat.division}-${cat.ageClass}-${cat.distance}-${cat.categoryLabel || ''}`,
                                                                            cat
                                                                        ])
                                                                    ).values()).slice(0, 12).map((cat, i) => (
                                                                        <div key={i} className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center min-w-[85px] shadow-lg hover:bg-white/10 transition-colors">
                                                                            <div className="text-[9px] font-black text-white uppercase leading-none mb-1">{cat.division}</div>
                                                                            <div className="text-[7px] font-bold text-primary-400 uppercase tracking-tight">{cat.ageClass} • {cat.distance}</div>
                                                                            {cat.categoryLabel && <div className="text-[6px] text-dark-500 font-bold uppercase mt-0.5 line-clamp-1">{cat.categoryLabel}</div>}
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="text-xs text-dark-500 italic py-2">No Categories Added</div>
                                                                )}
                                                                {(() => {
                                                                    const uniqueCount = new Set(form.competitionCategories.map(cat => `${cat.division}-${cat.ageClass}-${cat.distance}-${cat.categoryLabel || ''}`)).size;
                                                                    return uniqueCount > 12 && (
                                                                        <div className="px-2.5 py-1.5 rounded-xl bg-primary-500/10 border border-primary-400/20 text-[7px] font-black text-primary-400 uppercase flex items-center">
                                                                            +{uniqueCount - 12} More
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </div>
                                                        </div>

                                                        {/* Footer Info */}
                                                        <div className="mt-auto pt-3 border-t border-white/5 space-y-3">
                                                            <div className="flex items-center justify-center gap-4">
                                                                {form.instagram && (
                                                                    <div className="flex items-center gap-1 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
                                                                        <Instagram size={10} className="text-pink-400" />
                                                                        <span className="text-[8px] font-bold text-dark-300">{form.instagram}</span>
                                                                    </div>
                                                                )}
                                                                {form.website && (
                                                                    <div className="flex items-center gap-1 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
                                                                        <Globe size={10} className="text-blue-400" />
                                                                        <span className="text-[8px] font-bold text-dark-300 uppercase">Website</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className={`${deadlineStyles.base} ${deadlineStyles.glow} p-3 rounded-xl flex items-center justify-between ${deadlineStyles.text} relative overflow-hidden group/cta transition-all duration-700`}>
                                                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/cta:translate-x-[100%] transition-transform duration-1000" />
                                                                <div className="text-left relative z-10">
                                                                    <p className="text-[7px] font-black uppercase opacity-60">Deadline</p>
                                                                    <p className="text-[9px] font-black uppercase">{form.registrationDeadline ? new Date(form.registrationDeadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'N/A'}</p>
                                                                </div>

                                                                {/* Middle Countdown */}
                                                                <div className="flex flex-col items-center justify-center px-3 border-x border-black/10 relative z-10 mx-auto">
                                                                    <span className="text-lg font-black leading-none">{daysLeft !== null ? daysLeft : '--'}</span>
                                                                    <span className="text-[5px] font-black uppercase opacity-60">Days Left</span>
                                                                </div>

                                                                <div className="text-right flex-1 relative z-10">
                                                                    <p className="text-[7px] font-black uppercase opacity-60">Secure Slot</p>
                                                                    <p className="text-[9px] font-black uppercase">core-panahan.id</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Glass Overlay Effects */}
                                                <div className="absolute top-0 left-0 w-full h-[25%] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                                                <div className="absolute top-3 right-3 pointer-events-none">
                                                    <div className="w-16 h-16 bg-primary-500/20 blur-2xl rounded-full" />
                                                </div>
                                            </div>

                                            <div className="text-center">
                                                <p className="text-xs text-dark-500 italic max-w-sm mx-auto">
                                                    This is a generated preview based on your current settings.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Navigation Buttons */}
                            <div className="flex justify-between items-center pt-8 border-t border-dark-700">
                                <button
                                    onClick={() => setCurrentStep(prev => prev - 1)}
                                    disabled={currentStep === 1}
                                    className="px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all bg-dark-800 text-dark-300 hover:bg-dark-700 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ArrowLeft size={18} />
                                    Back
                                </button>

                                {currentStep < 4 ? (
                                    <button
                                        onClick={nextStep}
                                        className="btn-primary px-8 py-2.5 flex items-center gap-2 font-bold"
                                    >
                                        Next Component
                                        <Plus size={18} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="btn-primary px-10 py-2.5 flex items-center gap-2 font-bold shadow-xl shadow-primary-500/20"
                                    >
                                        {saving ? <Loader2 className="animate-spin" size={18} /> : isNew ? <Plus size={18} /> : <Save size={18} />}
                                        {isNew ? 'Create Competition' : 'Save Changes'}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'brackets' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <CompetitionBracketView eventId={id!} />
                        </motion.div>
                    )}

                    {
                        activeTab === 'targets' && (
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
                        )
                    }

                    {
                        activeTab === 'budget' && (
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
                        )
                    }

                    {
                        activeTab === 'rundown' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Event Rundown</h3>
                                        <p className="text-sm text-dark-400">Manage the schedule of activities.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 bg-dark-900/50 px-3 py-1.5 rounded-lg border border-dark-700">
                                            <CalendarIcon size={14} className="text-primary-400" />
                                            <select
                                                className="bg-transparent text-[10px] font-bold text-white outline-none cursor-pointer"
                                                onChange={async (e) => {
                                                    const template = SCHEDULE_TEMPLATES.find(t => t.label === e.target.value);
                                                    if (template) {
                                                        try {
                                                            const dayDate = form.startDate instanceof Date
                                                                ? form.startDate.toISOString().split('T')[0]
                                                                : (typeof form.startDate === 'string' ? form.startDate : new Date().toISOString().split('T')[0]);

                                                            await api.post(`/eo/events/${id}/schedule/bulk`, {
                                                                items: template.items,
                                                                dayDate
                                                            });
                                                            toast.success(`Loaded schedule template: ${template.label}`);
                                                            // Refresh schedule
                                                            const res = await api.get(`/eo/events/${id}/schedule`);
                                                            setSchedule(res.data.data);
                                                        } catch (err) {
                                                            toast.error("Failed to load template");
                                                        }
                                                    }
                                                    e.target.value = "";
                                                }}
                                            >
                                                <option value="" className="bg-dark-800">Load Template...</option>
                                                {SCHEDULE_TEMPLATES.map(t => (
                                                    <option key={t.label} value={t.label} className="bg-dark-800">{t.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setScheduleForm(prev => ({
                                                    ...prev,
                                                    dayDate: form.startDate instanceof Date
                                                        ? form.startDate.toISOString().split('T')[0]
                                                        : (typeof form.startDate === 'string' ? form.startDate : new Date().toISOString().split('T')[0])
                                                }));
                                                setShowScheduleModal(true);
                                            }}
                                            className="btn-primary flex items-center gap-2"
                                        >
                                            <Plus size={18} />
                                            Add Item
                                        </button>
                                    </div>
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
                        )
                    }

                    {/* Certificates Tab */}
                    {
                        activeTab === 'certificates' && (
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
                                                                qrCodeData={`https://core-panahan.id/verify/${p.id}`} // Mock verification URL
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
                        )
                    }

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




                    {
                        activeTab === 'timeline' && (
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
                            </div>
                        )}




                    {
                        activeTab === 'registration' && (
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

                                {/* Category Table */}
                                <div className="bg-dark-900 border border-dark-700 rounded-lg overflow-hidden">
                                    <table className="w-full text-left text-sm text-dark-300">
                                        <thead className="bg-dark-800 text-dark-400 font-medium border-b border-dark-700">
                                            <tr>
                                                <th className="px-4 py-3">Division</th>
                                                <th className="px-4 py-3">Class</th>
                                                <th className="px-4 py-3">Gender</th>
                                                <th className="px-4 py-3">Distance</th>
                                                <th className="px-4 py-3 text-center">Quota</th>
                                                <th className="px-4 py-3 text-right">Fee</th>
                                                <th className="px-4 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-dark-700">
                                            {categories.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="px-4 py-8 text-center text-dark-500">
                                                        No categories defined yet. Click "Add Category" to start.
                                                    </td>
                                                </tr>
                                            ) : (
                                                categories.map((cat) => (
                                                    <tr key={cat.id} className="hover:bg-dark-800/50 transition-colors">
                                                        <td className="px-4 py-3 font-medium text-white">{cat.division}</td>
                                                        <td className="px-4 py-3">{cat.ageClass}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] ${cat.gender === 'FEMALE' ? 'bg-pink-500/10 text-pink-400' :
                                                                cat.gender === 'MALE' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                                                                }`}>
                                                                {cat.gender}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-dark-200">{cat.distance}m</td>
                                                        <td className="px-4 py-3 text-center">{cat.quota}</td>
                                                        <td className="px-4 py-3 text-right font-mono text-dark-200">
                                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(cat.fee)}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex justify-end gap-2">
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
                                                                    className="p-1.5 hover:bg-dark-700 rounded text-blue-400 transition-colors"
                                                                >
                                                                    <Settings size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteCategory(cat.id)}
                                                                    className="p-1.5 hover:bg-dark-700 rounded text-red-400 transition-colors"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    }

                    {
                        activeTab === 'participants' && (
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
                        )
                    }

                    {
                        activeTab === 'results' && (
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
                                        The system will automatically match scores to athletes using their CORE ID/Bib.
                                    </p>
                                </div>
                            </div>
                        )
                    }

                    {
                        activeTab === 'certificates' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-white">Certificate Management</h3>
                                </div>

                                <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
                                    <div className="flex flex-col md:flex-row gap-6 items-start">
                                        <div className="flex-1">
                                            <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                                                <Award className="text-amber-400" size={20} />
                                                Bulk Generation
                                            </h4>
                                            <p className="text-sm text-dark-300 mb-4">
                                                Automatically generate verifiable digital certificates for all winners and participants based on the latest results.
                                                Certificates can be downloaded individually by athletes from the Results page.
                                            </p>

                                            <div className="flex items-center gap-3 mb-6">
                                                <input
                                                    type="checkbox"
                                                    id="incPart"
                                                    checked={certIncludeParticipants}
                                                    onChange={e => setCertIncludeParticipants(e.target.checked)}
                                                    className="rounded bg-dark-700 border-dark-600 text-primary-500 focus:ring-primary-500/50"
                                                />
                                                <label htmlFor="incPart" className="text-sm text-white cursor-pointer select-none">
                                                    Include Participation Certificates (Rank {'>'} 3)
                                                </label>
                                            </div>

                                            <button
                                                onClick={handleGenerateCertificates}
                                                disabled={generatingCerts}
                                                className="btn-primary flex items-center gap-2 bg-amber-600 hover:bg-amber-500 border-amber-500"
                                            >
                                                {generatingCerts ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
                                                {generatingCerts ? 'Generating...' : 'Generate All Certificates'}
                                            </button>
                                        </div>

                                        <div className="w-full md:w-80 bg-dark-900/50 rounded-lg p-4 border border-dark-700/50">
                                            <h5 className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-3">Preview Options</h5>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm p-2 bg-dark-800 rounded">
                                                    <span className="text-dark-300">Winners (Gold/Silver/Bronze)</span>
                                                    <span className="text-emerald-400 font-bold">Auto</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm p-2 bg-dark-800 rounded">
                                                    <span className="text-dark-300">QR Validation</span>
                                                    <span className="text-emerald-400 font-bold">Active</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                </AnimatePresence >
            </div>

            <CategoryGeneratorModal
                isOpen={showGenerator}
                onClose={() => setShowGenerator(false)}
                onGenerate={(newCats) => {
                    setForm(prev => ({
                        ...prev,
                        competitionCategories: [...prev.competitionCategories, ...newCats]
                    }));
                    toast.success(`Generated ${newCats.length} categories!`);
                }}
            />
        </div>


    );
}
