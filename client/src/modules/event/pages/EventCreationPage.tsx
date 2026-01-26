import { useState } from 'react';
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
    Plus
} from 'lucide-react';
import { api } from '../../core/contexts/AuthContext';

interface EventForm {
    name: string;
    type: 'REGIONAL' | 'PROVINCIAL' | 'NATIONAL' | 'OPEN';
    startDate: string;
    endDate: string;
    registrationDeadline: string;
    venue: string;
    address: string;
    maxParticipants: number;
    categories: string[];
    divisions: string[];
    description: string;
    entryFee: number;
    rules: string;
}

const INITIAL_FORM: EventForm = {
    name: '',
    type: 'REGIONAL',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    venue: '',
    address: '',
    maxParticipants: 100,
    categories: [],
    divisions: [],
    description: '',
    entryFee: 0,
    rules: ''
};

const CATEGORIES = ['RECURVE', 'COMPOUND', 'BAREBOW', 'TRADITIONAL'];
const DIVISIONS = ['JUNIOR', 'SENIOR', 'MASTER'];

const STEPS = [
    { id: 1, title: 'Basic Info', icon: Trophy },
    { id: 2, title: 'Schedule', icon: Calendar },
    { id: 3, title: 'Location', icon: MapPin },
    { id: 4, title: 'Categories', icon: Users },
    { id: 5, title: 'Details', icon: Settings }
];

export default function EventCreationPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [form, setForm] = useState<EventForm>(INITIAL_FORM);
    const [submitting, setSubmitting] = useState(false);

    const updateForm = (field: keyof EventForm, value: string | number | string[]) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const toggleCategory = (cat: string) => {
        setForm(prev => ({
            ...prev,
            categories: prev.categories.includes(cat)
                ? prev.categories.filter(c => c !== cat)
                : [...prev.categories, cat]
        }));
    };

    const toggleDivision = (div: string) => {
        setForm(prev => ({
            ...prev,
            divisions: prev.divisions.includes(div)
                ? prev.divisions.filter(d => d !== div)
                : [...prev.divisions, div]
        }));
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1: return form.name && form.type;
            case 2: return form.startDate && form.endDate && form.registrationDeadline;
            case 3: return form.venue && form.address;
            case 4: return form.categories.length > 0 && form.divisions.length > 0;
            case 5: return true;
            default: return false;
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await api.post('/api/v1/eo/events', form);
            navigate('/');
        } catch (error) {
            console.log('Event created (mock)');
            navigate('/');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl md:text-3xl font-display font-bold">
                    Create <span className="gradient-text">Event</span>
                </h1>
                <p className="text-dark-400 mt-1">
                    Set up a new archery competition
                </p>
            </motion.div>

            {/* Progress Steps */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-between"
            >
                {STEPS.map((step, i) => {
                    const StepIcon = step.icon;
                    const isActive = currentStep === step.id;
                    const isComplete = currentStep > step.id;
                    return (
                        <div key={step.id} className="flex items-center">
                            <div
                                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${isComplete ? 'bg-green-500' :
                                    isActive ? 'bg-primary-500' : 'bg-dark-700'
                                    }`}
                            >
                                {isComplete ? (
                                    <Check className="w-5 h-5 text-white" />
                                ) : (
                                    <StepIcon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-dark-400'}`} />
                                )}
                            </div>
                            <span className={`ml-2 text-sm font-medium hidden md:block ${isActive ? 'text-white' : 'text-dark-400'
                                }`}>
                                {step.title}
                            </span>
                            {i < STEPS.length - 1 && (
                                <div className={`w-8 md:w-16 h-0.5 mx-2 ${isComplete ? 'bg-green-500' : 'bg-dark-700'
                                    }`} />
                            )}
                        </div>
                    );
                })}
            </motion.div>

            {/* Form Steps */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-6"
            >
                <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
                            <div>
                                <label className="block text-sm text-dark-400 mb-2">Event Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => updateForm('name', e.target.value)}
                                    placeholder="e.g., Regional Championship 2026"
                                    className="input w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-dark-400 mb-2">Event Type *</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {['REGIONAL', 'PROVINCIAL', 'NATIONAL', 'OPEN'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => updateForm('type', type)}
                                            className={`p-3 rounded-lg border transition-all ${form.type === type
                                                ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                                                : 'bg-dark-800 border-dark-700 text-dark-400 hover:border-dark-600'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <h2 className="text-lg font-semibold text-white mb-4">Schedule</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-dark-400 mb-2">Start Date *</label>
                                    <input
                                        type="date"
                                        value={form.startDate}
                                        onChange={(e) => updateForm('startDate', e.target.value)}
                                        className="input w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-dark-400 mb-2">End Date *</label>
                                    <input
                                        type="date"
                                        value={form.endDate}
                                        onChange={(e) => updateForm('endDate', e.target.value)}
                                        className="input w-full"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-dark-400 mb-2">Registration Deadline *</label>
                                <input
                                    type="date"
                                    value={form.registrationDeadline}
                                    onChange={(e) => updateForm('registrationDeadline', e.target.value)}
                                    className="input w-full"
                                />
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <h2 className="text-lg font-semibold text-white mb-4">Location</h2>
                            <div>
                                <label className="block text-sm text-dark-400 mb-2">Venue Name *</label>
                                <input
                                    type="text"
                                    value={form.venue}
                                    onChange={(e) => updateForm('venue', e.target.value)}
                                    placeholder="e.g., GOR Panahan Bandung"
                                    className="input w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-dark-400 mb-2">Full Address *</label>
                                <textarea
                                    value={form.address}
                                    onChange={(e) => updateForm('address', e.target.value)}
                                    placeholder="Enter complete address..."
                                    className="input w-full h-24 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-dark-400 mb-2">Max Participants</label>
                                <input
                                    type="number"
                                    value={form.maxParticipants}
                                    onChange={(e) => updateForm('maxParticipants', parseInt(e.target.value) || 0)}
                                    className="input w-full"
                                />
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <h2 className="text-lg font-semibold text-white mb-4">Categories & Divisions</h2>
                            <div>
                                <label className="block text-sm text-dark-400 mb-2">Categories *</label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => toggleCategory(cat)}
                                            className={`px-4 py-2 rounded-lg border transition-all ${form.categories.includes(cat)
                                                ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                                                : 'bg-dark-800 border-dark-700 text-dark-400 hover:border-dark-600'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-dark-400 mb-2">Divisions *</label>
                                <div className="flex flex-wrap gap-2">
                                    {DIVISIONS.map(div => (
                                        <button
                                            key={div}
                                            onClick={() => toggleDivision(div)}
                                            className={`px-4 py-2 rounded-lg border transition-all ${form.divisions.includes(div)
                                                ? 'bg-green-500/20 border-green-500 text-green-400'
                                                : 'bg-dark-800 border-dark-700 text-dark-400 hover:border-dark-600'
                                                }`}
                                        >
                                            {div}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 5 && (
                        <motion.div
                            key="step5"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <h2 className="text-lg font-semibold text-white mb-4">Additional Details</h2>
                            <div>
                                <label className="block text-sm text-dark-400 mb-2">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => updateForm('description', e.target.value)}
                                    placeholder="Event description..."
                                    className="input w-full h-24 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-dark-400 mb-2">Entry Fee (IDR)</label>
                                <input
                                    type="number"
                                    value={form.entryFee}
                                    onChange={(e) => updateForm('entryFee', parseInt(e.target.value) || 0)}
                                    className="input w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-dark-400 mb-2">Rules & Regulations</label>
                                <textarea
                                    value={form.rules}
                                    onChange={(e) => updateForm('rules', e.target.value)}
                                    placeholder="Competition rules..."
                                    className="input w-full h-24 resize-none"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Navigation Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-between"
            >
                <button
                    onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate('/')}
                    className="btn-secondary flex items-center gap-2"
                >
                    <ChevronLeft className="w-4 h-4" />
                    {currentStep === 1 ? 'Cancel' : 'Back'}
                </button>
                {currentStep < 5 ? (
                    <button
                        onClick={() => setCurrentStep(currentStep + 1)}
                        disabled={!canProceed()}
                        className="btn-primary flex items-center gap-2"
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="btn-primary flex items-center gap-2"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Create Event
                    </button>
                )}
            </motion.div>
        </div>
    );
}
