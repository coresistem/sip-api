import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target,
    User,
    CheckCircle,
    AlertCircle,
    Loader2,
    ArrowLeft,
    Save,
    Sparkles,
    ChevronDown,
    ChevronRight,
    Check
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    CustomModule,
    ModuleField,
    getModule,
    createAssessment,
    generateFeedback
} from '../../../core/lib/api/moduleApi';
import { api } from '../../../core/contexts/AuthContext';

// Types
interface Athlete {
    id: string;
    user: {
        id: string;
        name: string;
        sipId?: string;
        avatarUrl?: string;
    };
}

interface FieldValue {
    [fieldName: string]: boolean | string | number;
}

interface SectionScore {
    [sectionName: string]: number;
}

const AssessmentFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { moduleId } = useParams<{ moduleId: string }>();

    // Module state
    const [module, setModule] = useState<CustomModule | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
    const [athletes, setAthletes] = useState<Athlete[]>([]);
    const [athleteSearch, setAthleteSearch] = useState('');
    const [showAthleteDropdown, setShowAthleteDropdown] = useState(false);
    const [fieldValues, setFieldValues] = useState<FieldValue>({});
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
    const [assessmentId, setAssessmentId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);

    // Load module
    useEffect(() => {
        if (moduleId) {
            loadModule(moduleId);
            loadAthletes();
        }
    }, [moduleId]);

    const loadModule = async (id: string) => {
        setIsLoading(true);
        try {
            const data = await getModule(id);
            setModule(data);

            // Expand all sections by default
            if (data.sections) {
                setExpandedSections(new Set(Object.keys(data.sections)));
            }

            // Initialize field values
            const initialValues: FieldValue = {};
            if (data.sections) {
                Object.values(data.sections).forEach((fields: ModuleField[]) => {
                    fields.forEach((field: ModuleField) => {
                        if (field.fieldType === 'checkbox') {
                            initialValues[field.fieldName] = false;
                        } else if (field.fieldType === 'number') {
                            initialValues[field.fieldName] = 0;
                        } else {
                            initialValues[field.fieldName] = '';
                        }
                    });
                });
            }
            setFieldValues(initialValues);
        } catch (err) {
            console.error('Failed to load module:', err);
            setError('Failed to load assessment module');
        } finally {
            setIsLoading(false);
        }
    };

    const loadAthletes = async () => {
        try {
            const response = await api.get('/athletes');
            setAthletes(response.data.data || []);
        } catch (err) {
            console.error('Failed to load athletes:', err);
        }
    };

    const toggleSection = (sectionName: string) => {
        setExpandedSections(prev => {
            const updated = new Set(prev);
            if (updated.has(sectionName)) {
                updated.delete(sectionName);
            } else {
                updated.add(sectionName);
            }
            return updated;
        });
    };

    const handleFieldChange = (fieldName: string, value: boolean | string | number) => {
        setFieldValues(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const calculateScores = (): { sectionScores: SectionScore; totalScore: number; maxScore: number } => {
        if (!module?.sections) return { sectionScores: {}, totalScore: 0, maxScore: 0 };

        const sectionScores: SectionScore = {};
        let totalScore = 0;
        let maxScore = 0;

        Object.entries(module.sections).forEach(([sectionName, fields]) => {
            let sectionTotal = 0;
            let sectionMax = 0;

            (fields as ModuleField[]).forEach(field => {
                if (field.isScored && field.maxScore) {
                    sectionMax += field.maxScore;
                    maxScore += field.maxScore;

                    const value = fieldValues[field.fieldName];
                    if (field.fieldType === 'checkbox' && value === true) {
                        sectionTotal += field.maxScore;
                        totalScore += field.maxScore;
                    } else if (field.fieldType === 'number' && typeof value === 'number') {
                        const score = Math.min(value, field.maxScore);
                        sectionTotal += score;
                        totalScore += score;
                    }
                }
            });

            sectionScores[sectionName] = sectionMax > 0 ? Math.round((sectionTotal / sectionMax) * 100) : 0;
        });

        return { sectionScores, totalScore, maxScore };
    };

    const handleSubmit = async () => {
        if (!selectedAthlete || !module) {
            setError('Please select an athlete');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const { sectionScores, totalScore, maxScore } = calculateScores();
            const percentScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

            const assessment = await createAssessment({
                moduleId: module.id,
                athleteId: selectedAthlete.id,
                fieldValues,
                sectionScores,
                totalScore: percentScore
            });

            setAssessmentId(assessment.id);
            setShowResult(true);
        } catch (err) {
            console.error('Failed to submit assessment:', err);
            setError('Failed to submit assessment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGenerateFeedback = async () => {
        if (!assessmentId) return;

        setIsGeneratingFeedback(true);
        try {
            const result = await generateFeedback(assessmentId);
            setFeedback(result.feedback);
        } catch (err) {
            console.error('Failed to generate feedback:', err);
            setError('Failed to generate AI feedback');
        } finally {
            setIsGeneratingFeedback(false);
        }
    };

    const filteredAthletes = athletes.filter(a =>
        a.user.name.toLowerCase().includes(athleteSearch.toLowerCase()) ||
        a.user.sipId?.includes(athleteSearch)
    );

    const { sectionScores, totalScore, maxScore } = calculateScores();
    const percentScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        if (score >= 40) return 'text-orange-400';
        return 'text-red-400';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
        );
    }

    if (error && !module) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-400">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 px-4 py-2 bg-slate-700 text-white rounded-lg"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Result Screen
    if (showResult) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 text-center"
                    >
                        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Assessment Complete!</h2>
                        <p className="text-slate-400 mb-6">
                            Assessment for {selectedAthlete?.user.name} has been saved.
                        </p>

                        {/* Score Display */}
                        <div className="bg-slate-900/50 rounded-xl p-6 mb-6">
                            <div className={`text-5xl font-bold mb-2 ${getScoreColor(percentScore)}`}>
                                {percentScore}%
                            </div>
                            <p className="text-slate-400">Total Score</p>

                            {/* Section Scores */}
                            <div className="grid grid-cols-3 gap-4 mt-6">
                                {Object.entries(sectionScores).map(([section, score]) => (
                                    <div key={section} className="text-center">
                                        <div className={`text-xl font-bold ${getScoreColor(score)}`}>
                                            {score}%
                                        </div>
                                        <p className="text-xs text-slate-500">{section}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Feedback */}
                        {feedback ? (
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 text-left">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-5 h-5 text-amber-400" />
                                    <span className="font-medium text-amber-400">AI Feedback</span>
                                </div>
                                <p className="text-slate-300 text-sm">{feedback}</p>
                            </div>
                        ) : (
                            <button
                                onClick={handleGenerateFeedback}
                                disabled={isGeneratingFeedback}
                                className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-xl transition-colors disabled:opacity-50"
                            >
                                {isGeneratingFeedback ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Sparkles className="w-5 h-5" />
                                )}
                                Generate AI Feedback
                            </button>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowResult(false);
                                    setFeedback(null);
                                    setSelectedAthlete(null);
                                    // Reset form
                                    const initialValues: FieldValue = {};
                                    if (module?.sections) {
                                        Object.values(module.sections).forEach((fields: ModuleField[]) => {
                                            fields.forEach((field: ModuleField) => {
                                                if (field.fieldType === 'checkbox') {
                                                    initialValues[field.fieldName] = false;
                                                } else if (field.fieldType === 'number') {
                                                    initialValues[field.fieldName] = 0;
                                                } else {
                                                    initialValues[field.fieldName] = '';
                                                }
                                            });
                                        });
                                    }
                                    setFieldValues(initialValues);
                                }}
                                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
                            >
                                New Assessment
                            </button>
                            <button
                                onClick={() => navigate('/admin/modules')}
                                className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-xl transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <div className="bg-slate-800/50 border-b border-slate-700 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-400" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                <Target className="w-5 h-5 text-amber-400" />
                                {module?.name || 'Assessment'}
                            </h1>
                            <p className="text-sm text-slate-400">{module?.description}</p>
                        </div>
                    </div>

                    {/* Live Score */}
                    <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(percentScore)}`}>
                            {percentScore}%
                        </div>
                        <p className="text-xs text-slate-500">Score</p>
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 mx-4 mt-4 rounded-lg flex items-center gap-2"
                    >
                        <AlertCircle className="w-5 h-5" />
                        {error}
                        <button onClick={() => setError(null)} className="ml-auto hover:text-red-300">×</button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* Athlete Selection */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Select Athlete
                    </h3>

                    <div className="relative">
                        <input
                            type="text"
                            value={selectedAthlete ? selectedAthlete.user.name : athleteSearch}
                            onChange={(e) => {
                                setAthleteSearch(e.target.value);
                                setSelectedAthlete(null);
                                setShowAthleteDropdown(true);
                            }}
                            onFocus={() => setShowAthleteDropdown(true)}
                            placeholder="Search athlete by name or SIP ID..."
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                        />

                        <AnimatePresence>
                            {showAthleteDropdown && filteredAthletes.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute z-20 w-full mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                                >
                                    {filteredAthletes.map(athlete => (
                                        <button
                                            key={athlete.id}
                                            onClick={() => {
                                                setSelectedAthlete(athlete);
                                                setAthleteSearch('');
                                                setShowAthleteDropdown(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors text-left"
                                        >
                                            <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                                                {athlete.user.avatarUrl ? (
                                                    <img src={athlete.user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                                                ) : (
                                                    <User className="w-5 h-5 text-amber-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{athlete.user.name}</p>
                                                <p className="text-xs text-slate-400">{athlete.user.sipId}</p>
                                            </div>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {selectedAthlete && (
                        <div className="mt-3 flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-green-400">
                                {selectedAthlete.user.name} ({selectedAthlete.user.sipId})
                            </span>
                        </div>
                    )}
                </div>

                {/* Assessment Sections */}
                {module?.sections && Object.entries(module.sections).map(([sectionName, fields]) => (
                    <div
                        key={sectionName}
                        className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden"
                    >
                        {/* Section Header */}
                        <button
                            onClick={() => toggleSection(sectionName)}
                            className="w-full flex items-center justify-between px-4 py-4 bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                {expandedSections.has(sectionName) ? (
                                    <ChevronDown className="w-5 h-5 text-slate-400" />
                                ) : (
                                    <ChevronRight className="w-5 h-5 text-slate-400" />
                                )}
                                <span className="text-white font-medium">{sectionName}</span>
                                <span className="text-xs text-slate-500">({(fields as ModuleField[]).length} fields)</span>
                            </div>
                            <div className={`font-bold ${getScoreColor(sectionScores[sectionName] || 0)}`}>
                                {sectionScores[sectionName] || 0}%
                            </div>
                        </button>

                        {/* Section Fields */}
                        <AnimatePresence>
                            {expandedSections.has(sectionName) && (
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: 'auto' }}
                                    exit={{ height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-4 space-y-3">
                                        {(fields as ModuleField[]).map((field) => (
                                            <div
                                                key={field.id}
                                                className={`p-4 rounded-lg border transition-colors ${fieldValues[field.fieldName] === true
                                                    ? 'bg-green-500/10 border-green-500/30'
                                                    : 'bg-slate-900/50 border-slate-700'
                                                    }`}
                                            >
                                                {field.fieldType === 'checkbox' ? (
                                                    <label className="flex items-start gap-4 cursor-pointer">
                                                        <div
                                                            onClick={() => handleFieldChange(field.fieldName, !fieldValues[field.fieldName])}
                                                            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${fieldValues[field.fieldName]
                                                                ? 'bg-green-500 border-green-500'
                                                                : 'border-slate-500 hover:border-slate-400'
                                                                }`}
                                                        >
                                                            {fieldValues[field.fieldName] && (
                                                                <Check className="w-4 h-4 text-white" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-white font-medium">{field.label}</p>
                                                            {field.isScored && field.maxScore && (
                                                                <p className="text-xs text-slate-500 mt-1">
                                                                    {fieldValues[field.fieldName] ? field.maxScore : 0}/{field.maxScore} points
                                                                </p>
                                                            )}
                                                            {fieldValues[field.fieldName] && field.feedbackGood && (
                                                                <p className="text-sm text-green-400 mt-2">✓ {field.feedbackGood}</p>
                                                            )}
                                                        </div>
                                                    </label>
                                                ) : field.fieldType === 'number' ? (
                                                    <div>
                                                        <label className="text-white font-medium">{field.label}</label>
                                                        <input
                                                            type="number"
                                                            value={fieldValues[field.fieldName] as number || 0}
                                                            onChange={(e) => handleFieldChange(field.fieldName, parseInt(e.target.value, 10) || 0)}
                                                            max={field.maxScore}
                                                            min={0}
                                                            className="mt-2 w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <label className="text-white font-medium">{field.label}</label>
                                                        <input
                                                            type="text"
                                                            value={fieldValues[field.fieldName] as string || ''}
                                                            onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
                                                            placeholder={field.placeholder}
                                                            className="mt-2 w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}

                {/* Submit Button */}
                <div className="sticky bottom-4">
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedAthlete || isSubmitting}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-colors shadow-lg"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        Submit Assessment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssessmentFormPage;
