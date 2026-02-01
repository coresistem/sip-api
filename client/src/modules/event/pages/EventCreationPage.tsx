import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Trophy,
    Users,
    Settings,
    ChevronRight,
    ChevronLeft,
    Check,
    Loader2,
    Plus,
    Image
} from 'lucide-react';
import { api } from '@/modules/core/contexts/AuthContext';
import { toast } from 'react-toastify';
import { useLocations } from '@/modules/core/hooks/useLocations';
import { currencies } from '@/modules/core/data/currencies';

// Subcomponents
import Step1GeneralInfo from '../components/creation/Step1GeneralInfo';
import Step2Categories from '../components/creation/Step2Categories';
import Step3Details from '../components/creation/Step3Details';
import Step4Preview from '../components/creation/Step4Preview';

// Types & Constants
import { EventForm, CompetitionCategoryItem } from '../types';
import { INITIAL_FORM } from '../constants';

const STEPS = [
    { id: 1, title: 'General Info', icon: Trophy, description: 'Basic details & schedule' },
    { id: 2, title: 'Categories', icon: Users, description: 'Divisions & classes' },
    { id: 3, title: 'Details', icon: Settings, description: 'Rules & fees' },
    { id: 4, title: 'Preview', icon: Image, description: 'E-Flyer Preview' }
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

    // --- LOGIC HELPERS ---
    const updateForm = (field: keyof EventForm, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provinceId = e.target.value;
        updateForm('province', provinceId);
        updateForm('city', ''); // Reset city
        setSelectedProvince(provinceId);
    };

    useEffect(() => {
        if (form.country) {
            const currency = currencies.find(c => c.country === form.country) || currencies.find(c => c.code === 'USD');
            if (currency) {
                updateForm('currency', currency.code);
            }
        }
    }, [form.country]);

    // --- CATEGORY EDITING STATE ---
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
            setForm(prev => ({
                ...prev,
                competitionCategories: prev.competitionCategories.map(cat =>
                    cat.id === editingId ? { ...newCategory, id: editingId } : cat
                )
            }));
            setEditingId(null);
        } else {
            setForm(prev => ({
                ...prev,
                competitionCategories: [
                    ...prev.competitionCategories,
                    { ...newCategory, id: Math.random().toString(36).substr(2, 9) }
                ]
            }));
        }
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
        if (editingId === id) setEditingId(null);
    };

    const editCategory = (cat: CompetitionCategoryItem) => {
        setNewCategory(cat);
        setEditingId(cat.id);
    };

    // --- PREVIEW UTILS ---
    const getDaysRemaining = (date: Date | null | string) => {
        if (!date) return null;
        const today = new Date();
        const deadline = new Date(date);
        today.setHours(0, 0, 0, 0);
        deadline.setHours(0, 0, 0, 0);
        const diffTime = deadline.getTime() - today.getTime();
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

    // --- NAVIGATION ---
    const validateStep = (step: number) => {
        switch (step) {
            case 1: return true; // Minimal check
            case 2: return form.competitionCategories.length > 0;
            case 3: return true;
            case 4: return true;
            default: return false;
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const finalForm = { ...form };

            // Handle file uploads
            if (form.technicalHandbook instanceof File) {
                const fd = new FormData();
                fd.append('file', form.technicalHandbook);
                const res = await api.post('/uploads/document', fd);
                if (res.data.success) finalForm.technicalHandbook = res.data.data.url;
            }

            if (form.eFlyer instanceof File) {
                const fd = new FormData();
                fd.append('image', form.eFlyer);
                const res = await api.post('/uploads/image', fd);
                if (res.data.success) finalForm.eFlyer = res.data.data.url;
            }

            const response = await api.post('/events', finalForm);
            if (response.data.success) {
                toast.success('Event created successfully!');
                navigate('/events');
            }
        } catch (error: any) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.message || 'Failed to create event.');
        } finally {
            setSubmitting(false);
        }
    };

    const nextStep = () => {
        if (validateStep(currentStep)) setCurrentStep(prev => prev + 1);
        else toast.warning('Please complete required fields.');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-6 px-4">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-500/20 flex items-center justify-center text-primary-400 border border-primary-500/30">
                    <Trophy size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-display font-bold">Create <span className="gradient-text">Event</span></h1>
                    <p className="text-dark-400">Set up a new archery competition</p>
                </div>
            </motion.div>

            {/* Progress Steps */}
            <div className="grid grid-cols-4 gap-2 relative">
                {STEPS.map((step, i) => {
                    const StepIcon = step.icon;
                    const isActive = currentStep === step.id;
                    const isComplete = currentStep > step.id;
                    return (
                        <div key={step.id} className="relative z-10">
                            <div className="flex flex-col items-center">
                                <button
                                    onClick={() => isComplete && setCurrentStep(step.id)}
                                    disabled={!isComplete}
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${isComplete ? 'bg-green-500 border-green-500' : isActive ? 'bg-primary-500 border-primary-500 shadow-lg shadow-primary-500/20 scale-110' : 'bg-dark-800 border-dark-700'}`}
                                >
                                    {isComplete ? <Check className="w-6 h-6 text-white" /> : <StepIcon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-dark-500'}`} />}
                                </button>
                                <div className="mt-3 text-center sm:block hidden">
                                    <p className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-primary-400' : 'text-dark-500'}`}>Step {step.id}</p>
                                    <p className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-dark-400'}`}>{step.title}</p>
                                </div>
                            </div>
                            {i < STEPS.length - 1 && <div className={`absolute top-6 left-1/2 w-full h-0.5 -z-10 ${isComplete ? 'bg-green-500' : 'bg-dark-700'}`} />}
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
                        className="card p-4 sm:p-8 border border-white/5 backdrop-blur-xl"
                    >
                        {currentStep === 1 && <Step1GeneralInfo form={form} updateForm={updateForm} provinces={provinces} cities={cities} isLoadingProvinces={isLoadingProvinces} isLoadingCities={isLoadingCities} handleProvinceChange={handleProvinceChange} />}
                        {currentStep === 2 && <Step2Categories form={form} updateForm={updateForm} editingId={editingId} newCategory={newCategory} setNewCategory={setNewCategory} handleSaveCategory={handleSaveCategory} removeCategory={removeCategory} editCategory={editCategory} />}
                        {currentStep === 3 && <Step3Details form={form} updateForm={updateForm} />}
                        {currentStep === 4 && <Step4Preview form={form} currencySymbol={currencySymbol} daysLeft={daysLeft} deadlineStyles={deadlineStyles} />}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4">
                <button
                    onClick={() => currentStep > 1 ? setCurrentStep(prev => prev - 1) : navigate('/events')}
                    className="btn btn-secondary flex items-center gap-2 px-8 py-3"
                >
                    <ChevronLeft className="w-4 h-4" />
                    {currentStep === 1 ? 'Cancel' : 'Back'}
                </button>
                {currentStep < 4 ? (
                    <button onClick={nextStep} className="btn btn-primary flex items-center gap-2 px-8 py-3 group">
                        <span>Continue</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                ) : (
                    <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary flex items-center gap-3 px-8 py-3 shadow-lg shadow-primary-500/20">
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        <span className="font-bold">Publish Event</span>
                    </button>
                )}
            </div>
        </div>
    );
}
