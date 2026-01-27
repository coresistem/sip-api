import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Trophy,
    Calendar,
    MapPin,
    Users,
    Settings,
    ChevronRight,
    ChevronLeft,
    Check,
    Loader2,
    Plus,
    Tag,
    Info,
    AlertCircle,
    Trash2,
    Edit,
    Image,
    FileText
} from 'lucide-react';
import { api } from '@/modules/core/contexts/AuthContext';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import LocationPicker from '@/modules/core/components/LocationPicker';
import { useLocations } from '@/modules/core/hooks/useLocations';
import SearchableSelect from '@/modules/core/components/ui/SearchableSelect';
import { countries } from '@/modules/core/data/countries';
import { currencies } from '@/modules/core/data/currencies';

interface CompetitionCategoryItem {
    id: string;
    division: string;
    ageClass: string;
    gender: string;
    distance: string;
    quota: number;
    fee: number;
    qInd: boolean;
    eInd: boolean;
    qTeam: boolean;
    eTeam: boolean;
    qMix: boolean;
    eMix: boolean;
    isSpecial: boolean;
    categoryLabel: string;
}

interface EventForm {
    name: string;
    level: 'CITY' | 'PROVINCIAL' | 'NATIONAL' | 'INTERNATIONAL';
    type: 'INTERNAL' | 'SELECTION' | 'OPEN';
    fieldType: 'OUTDOOR' | 'INDOOR';
    startDate: Date | null;
    endDate: Date | null;
    registrationDeadline: Date | null;
    venue: string;
    address: string;
    city: string;
    province: string;
    country: string;
    latitude?: number;
    longitude?: number;
    competitionCategories: CompetitionCategoryItem[];
    description: string;
    rules: string;
    // Registration Details
    currency: string;
    feeIndividual: number;
    feeTeam: number;
    feeMixTeam: number;
    feeOfficial: number;
    instagram: string;
    website: string;
    technicalHandbook?: string; // URL or file path
    eFlyer?: string; // URL or file path
}

const INITIAL_FORM: EventForm = {
    name: '',
    level: 'CITY',
    type: 'OPEN',
    fieldType: 'OUTDOOR',
    startDate: null,
    endDate: null,
    registrationDeadline: null,
    venue: '',
    address: '',
    city: '',
    province: '',
    country: 'Indonesia',
    competitionCategories: [],
    description: '',
    rules: '',
    currency: 'IDR',
    feeIndividual: 0,
    feeTeam: 0,
    feeMixTeam: 0,
    feeOfficial: 0,
    instagram: '',
    website: '',
};

const CATEGORIES = ['RECURVE', 'COMPOUND', 'BAREBOW', 'TRADITIONAL'];
const STEPS = [
    { id: 1, title: 'General Info', icon: Trophy, description: 'Basic details & schedule' },
    { id: 2, title: 'Categories', icon: Users, description: 'Divisions & classes' },
    { id: 3, title: 'Details', icon: Settings, description: 'Rules & fees' }
];

export default function EventCreationPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [form, setForm] = useState<EventForm>(INITIAL_FORM);
    const [submitting, setSubmitting] = useState(false);

    const {
        provinces,
        cities,
        isLoadingProvinces,
        isLoadingCities,
        setSelectedProvince
    } = useLocations();

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provinceId = e.target.value;
        updateForm('province', provinceId);
        updateForm('city', ''); // Reset city
        setSelectedProvince(provinceId);
    };

    // Auto-select currency based on country
    useEffect(() => {
        if (form.country) {
            const currency = currencies.find(c => c.country === form.country) || currencies.find(c => c.code === 'USD');
            if (currency) {
                updateForm('currency', currency.code);
            }
        }
    }, [form.country]);

    const updateForm = (field: keyof EventForm, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    // Helper to add new category
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newCategory, setNewCategory] = useState<CompetitionCategoryItem>({
        id: '',
        division: 'Recurve',
        ageClass: 'Senior',
        gender: 'Man',
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

    const handleSaveCategory = () => {
        if (editingId) {
            // Update existing
            setForm(prev => ({
                ...prev,
                competitionCategories: prev.competitionCategories.map(cat =>
                    cat.id === editingId ? { ...newCategory, id: editingId } : cat
                )
            }));
            setEditingId(null);
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

        // Reset form (keep some defaults if needed, or reset to initial)
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
        if (editingId === id) {
            setEditingId(null);
            setNewCategory({
                id: '',
                division: 'Recurve',
                ageClass: 'Senior',
                gender: 'Man',
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
        setEditingId(cat.id);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setNewCategory({
            id: '',
            division: 'Recurve',
            ageClass: 'Senior',
            gender: 'Man',
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
                return true;
            // Complex validation disabled for dev speed, enable for prod:
            /*
            if (!form.name || !form.startDate || !form.endDate || !form.registrationDeadline || !form.venue) return false;
            const start = new Date(form.startDate);
            const end = new Date(form.endDate);
            const deadline = new Date(form.registrationDeadline);
            return start <= end && deadline <= start && form.venue.length >= 3;
            */
            case 2:
                return form.competitionCategories.length > 0;
            case 3:
                return true;
            default:
                return false;
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
            toast.error('Please complete all required fields correctly.');
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.post('/events', form);
            if (response.data.success) {
                toast.success('Event created successfully!');
                navigate('/events');
            }
        } catch (error: any) {
            console.error('Failed to create event:', error);
            const errorMessage = error.response?.data?.message || 'Failed to create event. Please try again.';
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
        } else {
            toast.warning('Please fill in all required fields correctly before proceeding.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4"
            >
                <div className="w-12 h-12 rounded-2xl bg-primary-500/20 flex items-center justify-center text-primary-400 border border-primary-500/30">
                    <Trophy size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-display font-bold">
                        Create <span className="gradient-text">Event</span>
                    </h1>
                    <p className="text-dark-400">Set up a new archery competition</p>
                </div>
            </motion.div>

            {/* Progress Steps */}
            <div className="grid grid-cols-5 gap-2 relative">
                {STEPS.map((step, i) => {
                    const StepIcon = step.icon;
                    const isActive = currentStep === step.id;
                    const isComplete = currentStep > step.id;
                    return (
                        <div key={step.id} className="relative z-10">
                            <button
                                onClick={() => isComplete && setCurrentStep(step.id)}
                                disabled={!isComplete}
                                className={`w-full group focus:outline-none ${!isComplete ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${isComplete ? 'bg-green-500 border-green-500 scale-110' :
                                            isActive ? 'bg-primary-500 border-primary-500 shadow-lg shadow-primary-500/20 scale-110' :
                                                'bg-dark-800 border-dark-700'
                                            }`}
                                    >
                                        {isComplete ? (
                                            <Check className="w-6 h-6 text-white" />
                                        ) : (
                                            <StepIcon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-dark-500'}`} />
                                        )}
                                    </div>
                                    <div className="mt-3 text-center">
                                        <p className={`text-xs font-bold uppercase tracking-widest ${isActive ? 'text-primary-400' : 'text-dark-500'}`}>
                                            Step {step.id}
                                        </p>
                                        <p className={`text-sm font-semibold hidden md:block whitespace-nowrap ${isActive ? 'text-white' : 'text-dark-400'}`}>
                                            {step.title}
                                        </p>
                                    </div>
                                </div>
                            </button>
                            {i < STEPS.length - 1 && (
                                <div className={`absolute top-6 left-1/2 w-full h-0.5 -z-10 ${isComplete ? 'bg-green-500' : 'bg-dark-700'}`} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Form Steps */}
            <div className="relative min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="card p-8 border border-white/5 backdrop-blur-xl"
                    >
                        {currentStep === 1 && (
                            <div className="space-y-8">
                                {/* Section 1: Basic Info */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                        <Info className="w-5 h-5 text-primary-400" />
                                        <h2 className="text-lg font-bold text-white">General Information</h2>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="label">Event Name</label>
                                            <input
                                                type="text"
                                                value={form.name}
                                                onChange={(e) => updateForm('name', e.target.value)}
                                                placeholder="e.g., Regional Championship 2026"
                                                className="input w-full"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="label">Event Level</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {['CITY', 'PROVINCIAL', 'NATIONAL', 'INTERNATIONAL'].map(lvl => (
                                                        <button
                                                            key={lvl}
                                                            onClick={() => updateForm('level', lvl as any)}
                                                            className={`p-2 rounded-lg border transition-all text-xs font-bold ${form.level === lvl
                                                                ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                                                                : 'bg-dark-800/50 border-white/5 text-dark-400 hover:border-white/10'
                                                                }`}
                                                        >
                                                            {lvl}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="label">Event Type & Field</label>
                                                <div className="space-y-3">
                                                    {/* Type */}
                                                    <div className="flex gap-2">
                                                        {['INTERNAL', 'SELECTION', 'OPEN'].map(type => (
                                                            <button
                                                                key={type}
                                                                onClick={() => updateForm('type', type as any)}
                                                                className={`flex-1 p-2 rounded-lg border transition-all text-xs font-bold ${form.type === type
                                                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                                                    : 'bg-dark-800/50 border-white/5 text-dark-400 hover:border-white/10'
                                                                    }`}
                                                            >
                                                                {type}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    {/* Field Type */}
                                                    <div className="flex gap-2">
                                                        {['OUTDOOR', 'INDOOR'].map(ft => (
                                                            <button
                                                                key={ft}
                                                                onClick={() => updateForm('fieldType', ft as any)}
                                                                className={`flex-1 p-2 rounded-lg border transition-all text-xs font-bold ${form.fieldType === ft
                                                                    ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                                                                    : 'bg-dark-800/50 border-white/5 text-dark-400 hover:border-white/10'
                                                                    }`}
                                                            >
                                                                {ft}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Schedule */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                        <Calendar className="w-5 h-5 text-primary-400" />
                                        <h2 className="text-lg font-bold text-white">Schedule</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="flex flex-col">
                                            <label className="label">Start Date</label>
                                            <DatePicker
                                                selected={form.startDate}
                                                onChange={(date) => updateForm('startDate', date)}
                                                className="input w-full"
                                                dateFormat="dd MMM yyyy"
                                                placeholderText="Select start date"
                                                showMonthDropdown
                                                showYearDropdown
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <label className="label">End Date</label>
                                            <DatePicker
                                                selected={form.endDate}
                                                onChange={(date) => updateForm('endDate', date)}
                                                className="input w-full"
                                                dateFormat="dd MMM yyyy"
                                                placeholderText="Select end date"
                                                showMonthDropdown
                                                showYearDropdown
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <label className="label text-amber-400">Registration Deadline</label>
                                            <DatePicker
                                                selected={form.registrationDeadline}
                                                onChange={(date) => updateForm('registrationDeadline', date)}
                                                className="input w-full border-amber-500/30 focus:border-amber-500"
                                                dateFormat="dd MMM yyyy"
                                                placeholderText="Select deadline"
                                                showMonthDropdown
                                                showYearDropdown
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Location */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                        <MapPin className="w-5 h-5 text-primary-400" />
                                        <h2 className="text-lg font-bold text-white">Location</h2>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="label">Venue Name</label>
                                            <input
                                                type="text"
                                                value={form.venue}
                                                onChange={(e) => updateForm('venue', e.target.value)}
                                                placeholder="e.g., GOR Panahan Bandung"
                                                className="input w-full"
                                            />
                                        </div>

                                        <div>
                                            <label className="label mb-1 block">Country</label>
                                            <SearchableSelect
                                                options={countries.map(c => ({ value: c.name, label: c.name }))}
                                                value={form.country}
                                                onChange={(val) => updateForm('country', val)}
                                                placeholder="Select Country"
                                                className="w-full"
                                            />
                                        </div>

                                        {form.country === 'Indonesia' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="label">Province</label>
                                                    <select
                                                        value={form.province}
                                                        onChange={handleProvinceChange}
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
                                                        value={form.city}
                                                        onChange={(e) => updateForm('city', e.target.value)}
                                                        className="input w-full"
                                                        disabled={!form.province || isLoadingCities}
                                                    >
                                                        <option value="">Select City</option>
                                                        {cities.map(c => (
                                                            <option key={c.id} value={c.id}>{c.type} {c.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="label">Full Address</label>
                                            <textarea
                                                value={form.address}
                                                onChange={(e) => updateForm('address', e.target.value)}
                                                placeholder="Enter complete address..."
                                                className="input w-full h-20 resize-none mb-4"
                                            />
                                        </div>
                                        <div>
                                            <label className="label mb-2">Pin Location on Map</label>
                                            <LocationPicker
                                                onLocationSelect={(lat, lng) => {
                                                    updateForm('latitude', lat);
                                                    updateForm('longitude', lng);
                                                }}
                                                initialLat={form.latitude}
                                                initialLng={form.longitude}
                                            />
                                            {form.latitude && (
                                                <p className="text-xs text-dark-400 mt-2">
                                                    Selected Coordinates: {form.latitude.toFixed(6)}, {form.longitude?.toFixed(6)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <Users className="w-5 h-5 text-primary-400" />
                                    <h2 className="text-xl font-bold text-white">Competition Categories</h2>
                                </div>

                                {/* CRUD Table */}
                                <div className="bg-dark-800/50 rounded-xl overflow-hidden border border-white/5">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead className="text-xs text-dark-400 uppercase bg-primary-500/10 border-b border-primary-500/20">
                                            <tr>
                                                <th rowSpan={2} className="px-3 py-2 border-r border-white/5 align-middle">Division</th>
                                                <th rowSpan={2} className="px-3 py-2 border-r border-white/5 align-middle">Age Class</th>
                                                <th rowSpan={2} className="px-3 py-2 border-r border-white/5 align-middle">Gender</th>
                                                <th rowSpan={2} className="px-3 py-2 border-r border-white/5 align-middle">Distance</th>
                                                <th colSpan={2} className="px-1 py-1 text-center border-r border-b border-white/5">Individu</th>
                                                <th colSpan={2} className="px-1 py-1 text-center border-r border-b border-white/5">Team</th>
                                                <th colSpan={2} className="px-1 py-1 text-center border-r border-b border-white/5">MixTeam</th>
                                                <th rowSpan={2} className="px-1 py-1 w-10 text-center border-r border-white/5 align-middle" title="Special Category">Sp</th>
                                                <th rowSpan={2} className="px-3 py-2 border-r border-white/5 align-middle min-w-[120px]">Special Category</th>
                                                <th rowSpan={2} className="px-3 py-2 text-right align-middle">Action</th>
                                            </tr>
                                            <tr>
                                                <th className="px-1 py-1 text-center border-r border-white/5 w-8 cursor-help" title="Qualification Round (Individu)">Q</th>
                                                <th className="px-1 py-1 text-center border-r border-white/5 w-8 cursor-help" title="Elimination Round (Individu)">E</th>
                                                <th className="px-1 py-1 text-center border-r border-white/5 w-8 cursor-help" title="Qualification Round (Team)">Q</th>
                                                <th className="px-1 py-1 text-center border-r border-white/5 w-8 cursor-help" title="Elimination Round (Team)">E</th>
                                                <th className="px-1 py-1 text-center border-r border-white/5 w-8 cursor-help" title="Qualification Round (Mixed Team)">Q</th>
                                                <th className="px-1 py-1 text-center border-white/5 w-8 cursor-help" title="Elimination Round (Mixed Team)">E</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {/* Existing Rows */}
                                            {form.competitionCategories.map((cat) => (
                                                <tr key={cat.id} className={`hover:bg-white/5 transition-all duration-300 ${editingId === cat.id ? 'bg-amber-500/10 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] relative z-10' : ''}`}>
                                                    <td className="px-2 py-2 border-r border-white/5 font-medium">{cat.division}</td>
                                                    <td className="px-2 py-2 border-r border-white/5">{cat.ageClass}</td>
                                                    <td className="px-2 py-2 border-r border-white/5">{cat.gender}</td>
                                                    <td className="px-2 py-2 border-r border-white/5">{cat.distance}</td>
                                                    <td className="px-1 py-2 text-center border-r border-white/5"><div className="flex justify-center">{cat.qInd && <Check size={14} className="text-emerald-400" />}</div></td>
                                                    <td className="px-1 py-2 text-center border-r border-white/5"><div className="flex justify-center">{cat.eInd && <Check size={14} className="text-emerald-400" />}</div></td>
                                                    <td className="px-1 py-2 text-center border-r border-white/5"><div className="flex justify-center">{cat.qTeam && <Check size={14} className="text-blue-400" />}</div></td>
                                                    <td className="px-1 py-2 text-center border-r border-white/5"><div className="flex justify-center">{cat.eTeam && <Check size={14} className="text-blue-400" />}</div></td>
                                                    <td className="px-1 py-2 text-center border-r border-white/5"><div className="flex justify-center">{cat.qMix && <Check size={14} className="text-purple-400" />}</div></td>
                                                    <td className="px-1 py-2 text-center border-r border-white/5"><div className="flex justify-center">{cat.eMix && <Check size={14} className="text-purple-400" />}</div></td>
                                                    <td className="px-1 py-2 text-center border-r border-white/5"><div className="flex justify-center">{cat.isSpecial && <Check size={14} className="text-amber-400" />}</div></td>
                                                    <td className="px-3 py-2 border-r border-white/5">{cat.categoryLabel}</td>
                                                    <td className="px-3 py-2 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                onClick={() => editCategory(cat)}
                                                                disabled={!!editingId}
                                                                className={`p-1 rounded transition-colors ${editingId ? 'text-dark-600 cursor-not-allowed' : 'text-primary-400 hover:text-primary-300 hover:bg-primary-500/10'}`}
                                                            >
                                                                <Edit size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => removeCategory(cat.id)}
                                                                disabled={!!editingId}
                                                                className={`p-1 rounded transition-colors ${editingId ? 'text-dark-600 cursor-not-allowed' : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'}`}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}

                                            {/* Input Row */}
                                            <tr className={`transition-all duration-300 ${editingId ? 'bg-amber-500/10 ring-2 ring-inset ring-amber-400 shadow-[inset_0_0_20px_rgba(245,158,11,0.1)]' : 'bg-primary-500/5'}`}>
                                                <td className="p-1 border-r border-white/5">
                                                    <select
                                                        className="input !text-xs w-full !py-1 !px-2 !h-9 !min-w-[100px]"
                                                        value={newCategory.division}
                                                        onChange={e => setNewCategory({ ...newCategory, division: e.target.value })}
                                                    >
                                                        {['Recurve', 'Compound', 'Barebow', 'Nasional', 'Traditional'].map(o => <option key={o} value={o}>{o}</option>)}
                                                    </select>
                                                </td>
                                                <td className="p-1 border-r border-white/5">
                                                    <select
                                                        className="input !text-xs w-full !py-1 !px-2 !h-9 !min-w-[90px]"
                                                        value={newCategory.ageClass}
                                                        onChange={e => setNewCategory({ ...newCategory, ageClass: e.target.value })}
                                                    >
                                                        {['U10', 'U13', 'U15', 'U18', 'U21', 'Senior', 'Master (50+)'].map(o => <option key={o} value={o}>{o}</option>)}
                                                    </select>
                                                </td>
                                                <td className="p-1 border-r border-white/5">
                                                    <select
                                                        className="input !text-xs w-full !py-1 !px-2 !h-9 !min-w-[80px]"
                                                        value={newCategory.gender}
                                                        onChange={e => setNewCategory({ ...newCategory, gender: e.target.value })}
                                                    >
                                                        {['Man', 'Woman'].map(o => <option key={o} value={o}>{o}</option>)}
                                                    </select>
                                                </td>
                                                <td className="p-1 border-r border-white/5">
                                                    <select
                                                        className="input !text-xs w-full !py-1 !px-2 !h-9 !min-w-[70px]"
                                                        value={newCategory.distance}
                                                        onChange={e => setNewCategory({ ...newCategory, distance: e.target.value })}
                                                    >
                                                        {['90m', '70m', '60m', '50m', '40m', '30m', '25m', '20m', '18m', '15m', '10m', '5m'].map(o => <option key={o} value={o}>{o}</option>)}
                                                    </select>
                                                </td>
                                                <td className="p-1 text-center border-r border-white/5"><input type="checkbox" checked={newCategory.qInd} onChange={e => setNewCategory({ ...newCategory, qInd: e.target.checked })} className="w-5 h-5 rounded border-white/10 bg-dark-900 cursor-pointer accent-primary-500" /></td>
                                                <td className="p-1 text-center border-r border-white/5"><input type="checkbox" checked={newCategory.eInd} onChange={e => setNewCategory({ ...newCategory, eInd: e.target.checked })} className="w-5 h-5 rounded border-white/10 bg-dark-900 cursor-pointer accent-primary-500" /></td>
                                                <td className="p-1 text-center border-r border-white/5"><input type="checkbox" checked={newCategory.qTeam} onChange={e => setNewCategory({ ...newCategory, qTeam: e.target.checked })} className="w-5 h-5 rounded border-white/10 bg-dark-900 cursor-pointer accent-primary-500" /></td>
                                                <td className="p-1 text-center border-r border-white/5"><input type="checkbox" checked={newCategory.eTeam} onChange={e => setNewCategory({ ...newCategory, eTeam: e.target.checked })} className="w-5 h-5 rounded border-white/10 bg-dark-900 cursor-pointer accent-primary-500" /></td>
                                                <td className="p-1 text-center border-r border-white/5"><input type="checkbox" checked={newCategory.qMix} onChange={e => setNewCategory({ ...newCategory, qMix: e.target.checked })} className="w-5 h-5 rounded border-white/10 bg-dark-900 cursor-pointer accent-primary-500" /></td>
                                                <td className="p-1 text-center border-r border-white/5"><input type="checkbox" checked={newCategory.eMix} onChange={e => setNewCategory({ ...newCategory, eMix: e.target.checked })} className="w-5 h-5 rounded border-white/10 bg-dark-900 cursor-pointer accent-primary-500" /></td>
                                                <td className="p-1 text-center border-r border-white/5"><input type="checkbox" checked={newCategory.isSpecial} onChange={e => setNewCategory({ ...newCategory, isSpecial: e.target.checked })} className="w-5 h-5 rounded border-white/10 bg-dark-900 cursor-pointer accent-primary-500" /></td>
                                                <td className="p-1 border-r border-white/5">
                                                    <input
                                                        type="text"
                                                        className={`input !text-xs w-full !py-1 !px-2 !h-9 min-w-[100px] ${!newCategory.isSpecial ? 'opacity-50 cursor-not-allowed bg-dark-900/50' : ''}`}
                                                        placeholder={newCategory.isSpecial ? "Name..." : "-"}
                                                        value={newCategory.isSpecial ? newCategory.categoryLabel : ''}
                                                        onChange={e => setNewCategory({ ...newCategory, categoryLabel: e.target.value })}
                                                        disabled={!newCategory.isSpecial}
                                                    />
                                                </td>
                                                <td className="p-1 text-right">
                                                    <div className="flex gap-1">
                                                        {editingId && (
                                                            <button
                                                                onClick={cancelEdit}
                                                                className="btn bg-dark-700 hover:bg-dark-600 py-1 px-2 text-xs h-8 flex-1 flex items-center justify-center text-red-400"
                                                                title="Cancel Edit"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={handleSaveCategory}
                                                            className={`btn ${editingId ? 'btn-success bg-emerald-500 hover:bg-emerald-600' : 'btn-primary'} py-1 px-2 text-xs h-8 flex-1 flex items-center justify-center`}
                                                        >
                                                            {editingId ? <Check size={14} /> : <Plus size={14} />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {form.competitionCategories.length === 0 && (
                                    <div className="text-center text-dark-500 text-sm py-4 italic">
                                        No categories added yet. Add at least one category to proceed.
                                    </div>
                                )}
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <Settings className="w-5 h-5 text-primary-400" />
                                    <h2 className="text-xl font-bold text-white">Registration & Details</h2>
                                </div>

                                {/* Registration Fees, Social, Files */}
                                <div className="space-y-6">
                                    {/* Registration Fees */}
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-4">
                                        <h3 className="text-sm font-bold text-primary-400 uppercase tracking-wider flex items-center gap-2">
                                            <Tag className="w-4 h-4" /> Registration Fees
                                        </h3>

                                        <div>
                                            <label className="label mb-1 block">Currency</label>
                                            <SearchableSelect
                                                options={currencies.map(c => ({ value: c.code, label: `${c.code} - ${c.name} (${c.symbol})` }))}
                                                value={form.currency}
                                                onChange={(val) => updateForm('currency', val)}
                                                placeholder="Select Currency"
                                                className="w-full"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="label">Individual Fee</label>
                                                <input
                                                    type="number"
                                                    value={form.feeIndividual}
                                                    onChange={(e) => updateForm('feeIndividual', parseInt(e.target.value) || 0)}
                                                    className="input w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="label">Team Fee</label>
                                                <input
                                                    type="number"
                                                    value={form.feeTeam}
                                                    onChange={(e) => updateForm('feeTeam', parseInt(e.target.value) || 0)}
                                                    className="input w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="label">Mixed Team Fee</label>
                                                <input
                                                    type="number"
                                                    value={form.feeMixTeam}
                                                    onChange={(e) => updateForm('feeMixTeam', parseInt(e.target.value) || 0)}
                                                    className="input w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="label">Official Fee</label>
                                                <input
                                                    type="number"
                                                    value={form.feeOfficial}
                                                    onChange={(e) => updateForm('feeOfficial', parseInt(e.target.value) || 0)}
                                                    className="input w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Social Media & Contact */}
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-4">
                                        <h3 className="text-sm font-bold text-primary-400 uppercase tracking-wider flex items-center gap-2">
                                            <Users className="w-4 h-4" /> Social & Contact
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="label">Instagram</label>
                                                <input
                                                    type="text"
                                                    value={form.instagram}
                                                    onChange={(e) => updateForm('instagram', e.target.value)}
                                                    placeholder="@username"
                                                    className="input w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="label">Website</label>
                                                <input
                                                    type="text"
                                                    value={form.website}
                                                    onChange={(e) => updateForm('website', e.target.value)}
                                                    placeholder="https://..."
                                                    className="input w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Files */}
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-4">
                                        <h3 className="text-sm font-bold text-primary-400 uppercase tracking-wider flex items-center gap-2">
                                            <Tag className="w-4 h-4" /> Documents
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="label">e-Flyer</label>
                                                <div className="relative border border-dashed border-white/20 rounded-lg p-4 text-center hover:bg-white/5 transition-colors cursor-pointer group">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                // In a real app, you'd upload this or store in state
                                                                // For now, we update the name in the form to show it's selected
                                                                updateForm('eFlyer', file.name);
                                                            }
                                                        }}
                                                    />
                                                    <div className="w-8 h-8 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary-500/20 group-hover:text-primary-400 transition-colors">
                                                        <Image className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-xs text-dark-400 group-hover:text-white truncate block px-2">
                                                        {form.eFlyer || "Upload Image"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="label">Technical Handbook (THB)</label>
                                                <div className="relative border border-dashed border-white/20 rounded-lg p-4 text-center hover:bg-white/5 transition-colors cursor-pointer group">
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.doc,.docx"
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                updateForm('technicalHandbook', file.name);
                                                            }
                                                        }}
                                                    />
                                                    <div className="w-8 h-8 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary-500/20 group-hover:text-primary-400 transition-colors">
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-xs text-dark-400 group-hover:text-white truncate block px-2">
                                                        {form.technicalHandbook || "Upload Document"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4">
                <button
                    onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate('/events')}
                    className="btn btn-secondary flex items-center gap-2 px-8 py-3"
                >
                    <ChevronLeft className="w-4 h-4" />
                    {currentStep === 1 ? 'Cancel' : 'Back'}
                </button>
                {currentStep < 3 ? (
                    <button
                        onClick={nextStep}
                        className="btn btn-primary flex items-center gap-2 px-8 py-3 group"
                    >
                        <span>Continue</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="btn btn-primary flex items-center gap-3 px-8 py-3 shadow-lg shadow-primary-500/20"
                    >
                        {submitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Plus className="w-5 h-5" />
                        )}
                        <span className="font-bold">Publish Event</span>
                    </button>
                )}
            </div>
        </div >
    );
}
