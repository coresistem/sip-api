import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ChevronLeft, ChevronRight, Save, Users, Trophy, Settings, Search, CheckCircle2 } from 'lucide-react';
import { useAuth, api } from '../../core/contexts/AuthContext';
import { toast } from 'react-toastify';
import { scoreColors, getScoreValue, sortScores, EndData } from '../../core/hooks/useScoringEngine';

interface Competition {
    id: string;
    name: string;
    status: string;
    startDate: string;
    location: string;
    categories: Category[];
}

interface Category {
    id: string;
    division: string;
    ageClass: string;
    gender: string;
    distance: number;
    categoryLabel: string;
}

interface Participant {
    id: string;
    athleteId: string;
    qualificationScore: number;
    rank: number | null;
    athlete: {
        user: {
            name: string;
            avatarUrl: string | null;
        };
        club: {
            name: string;
        } | null;
    };
}

type Step = 'SELECT_EVENT' | 'SELECT_CATEGORY' | 'SELECT_ATHLETE' | 'SCORING';

export default function EventScoringPage() {
    const { user } = useAuth();
    const [step, setStep] = useState<Step>('SELECT_EVENT');
    const [loading, setLoading] = useState(true);

    // Selection State
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Competition | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Scoring State
    const [ends, setEnds] = useState<EndData[]>([]);
    const [editingEnd, setEditingEnd] = useState<number | null>(null);
    const [editingArrow, setEditingArrow] = useState<number | null>(null);
    const [showScorePopup, setShowScorePopup] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const arrowsPerEnd = 6; // Competition standard usually 6 or 3. Default to 6.

    useEffect(() => {
        fetchCompetitions();
    }, []);

    const fetchCompetitions = async () => {
        try {
            const res = await api.get('/scores/competitions');
            if (res.data.success) {
                setCompetitions(res.data.data);
            }
        } catch (error) {
            toast.error('Failed to load competitions');
        } finally {
            setLoading(false);
        }
    };

    const fetchParticipants = async (eventId: string, categoryId: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/scores/competition/${eventId}/category/${categoryId}/participants`);
            if (res.data.success) {
                setParticipants(res.data.data);
            }
        } catch (error) {
            toast.error('Failed to load participants');
        } finally {
            setLoading(false);
        }
    };

    const handleEventSelect = (event: Competition) => {
        setSelectedEvent(event);
        setStep('SELECT_CATEGORY');
    };

    const handleCategorySelect = (category: Category) => {
        setSelectedCategory(category);
        if (selectedEvent) {
            fetchParticipants(selectedEvent.id, category.id);
        }
        setStep('SELECT_ATHLETE');
    };

    const handleParticipantSelect = (participant: Participant) => {
        setSelectedParticipant(participant);
        setStep('SCORING');
        setEnds([]); // Start fresh or fetch existing if needed
    };

    const goBack = () => {
        if (step === 'SELECT_CATEGORY') {
            setStep('SELECT_EVENT');
            setSelectedEvent(null);
        } else if (step === 'SELECT_ATHLETE') {
            setStep('SELECT_CATEGORY');
            setSelectedCategory(null);
        } else if (step === 'SCORING') {
            if (ends.length > 0 && !confirm('Are you sure you want to leave? Unsaved scores will be lost.')) return;
            setStep('SELECT_ATHLETE');
            setSelectedParticipant(null);
        }
    };

    // --- Scoring Logic ---
    const totalScore = ends.reduce((sum, end) => sum + end.subtotal, 0);
    const totalArrows = ends.reduce((sum, end) => sum + end.scores.filter(s => s !== null).length, 0);
    const tensCount = ends.flatMap(e => e.scores).filter(s => s === 10 || s === 'X').length;
    const xCount = ends.flatMap(e => e.scores).filter(s => s === 'X').length;

    const addNewEnd = () => {
        const newEnd: EndData = {
            scores: Array(arrowsPerEnd).fill(null),
            subtotal: 0,
        };
        setEnds([...ends, newEnd]);
        setEditingEnd(ends.length);
        setEditingArrow(0);
        setShowScorePopup(true);
    };

    const handleCellClick = (endIdx: number, arrowIdx: number) => {
        setEditingEnd(endIdx);
        setEditingArrow(arrowIdx);
        setShowScorePopup(true);
    };

    const handleScoreSelect = (value: number | 'X' | 'M') => {
        if (editingEnd === null || editingArrow === null) return;

        const newEnds = [...ends];
        newEnds[editingEnd].scores[editingArrow] = value;

        const filledScores = newEnds[editingEnd].scores.filter(s => s !== null);
        const nullCount = newEnds[editingEnd].scores.filter(s => s === null).length;
        const sortedFilledScores = sortScores(filledScores);

        newEnds[editingEnd].scores = [...sortedFilledScores, ...Array(nullCount).fill(null)];
        newEnds[editingEnd].subtotal = newEnds[editingEnd].scores.reduce<number>((sum, s) => sum + getScoreValue(s), 0);
        setEnds(newEnds);

        const nextEmpty = newEnds[editingEnd].scores.findIndex(s => s === null);
        if (nextEmpty !== -1) {
            setEditingArrow(nextEmpty);
        } else {
            setShowScorePopup(false);
            setEditingEnd(null);
            setEditingArrow(null);
        }
    };

    const handleSaveScores = async () => {
        if (!selectedEvent || !selectedCategory || !selectedParticipant || ends.length === 0) return;

        setIsSubmitting(true);
        try {
            const arrowScores = ends.map(e => e.scores.map(s => s === null ? 'M' : s));

            const res = await api.post('/scores/submit', {
                athleteId: selectedParticipant.athleteId,
                competitionId: selectedEvent.id,
                categoryId: selectedCategory.id,
                sessionDate: new Date().toISOString(),
                sessionType: 'COMPETITION',
                distance: selectedCategory.distance,
                targetFace: '122R10', // Default or from category
                arrowScores,
                notes: 'Competition Scoring'
            });

            if (res.data.success) {
                toast.success('Scores submitted successfully!');
                setEnds([]);
                setStep('SELECT_ATHLETE');
                setSelectedParticipant(null);
                // Refresh participants to see updated scores/rank
                fetchParticipants(selectedEvent.id, selectedCategory.id);
            }
        } catch (error) {
            toast.error('Failed to submit scores');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredParticipants = participants.filter(p =>
        p.athlete.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.athlete.club?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && step === 'SELECT_EVENT') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-[85vh] max-w-5xl mx-auto px-4 py-6">
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    {step !== 'SELECT_EVENT' && (
                        <button onClick={goBack} className="p-2 rounded-full bg-dark-800 hover:bg-dark-700 transition-colors">
                            <ChevronLeft className="w-5 h-5 text-dark-300" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl font-display font-bold text-white">
                            {step === 'SELECT_EVENT' && 'Select Event'}
                            {step === 'SELECT_CATEGORY' && (selectedEvent?.name || 'Select Category')}
                            {step === 'SELECT_ATHLETE' && (selectedCategory?.categoryLabel || 'Select Athlete')}
                            {step === 'SCORING' && 'Recording Scores'}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary-500"></div>
                            <span className="text-xs text-dark-400 font-medium uppercase tracking-wider">
                                {step.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-dark-800 rounded-xl border border-dark-700">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-emerald-400">Live Scoring System</span>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {/* Step 1: Select Event */}
                {step === 'SELECT_EVENT' && (
                    <motion.div
                        key="events"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        {competitions.map(comp => (
                            <button
                                key={comp.id}
                                onClick={() => handleEventSelect(comp)}
                                className="group relative overflow-hidden text-left p-6 rounded-2xl bg-dark-800 border border-dark-700 hover:border-primary-500/50 hover:bg-dark-750 transition-all"
                            >
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 rounded-xl bg-primary-500/10 text-primary-400 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                                            <Trophy className="w-6 h-6" />
                                        </div>
                                        <div className="text-xs font-bold px-3 py-1 rounded-full bg-dark-900 text-dark-400">
                                            {comp.status}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-1">{comp.name}</h3>
                                    <p className="text-sm text-dark-400 flex items-center gap-1.5">
                                        <Target className="w-4 h-4" />
                                        {comp.location} • {new Date(comp.startDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Trophy className="w-24 h-24" />
                                </div>
                                <div className="absolute bottom-0 right-0 p-4 transform translate-x-1 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all">
                                    <div className="p-2 rounded-full bg-primary-500 text-white">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </motion.div>
                )}

                {/* Step 2: Select Category */}
                {step === 'SELECT_CATEGORY' && (
                    <motion.div
                        key="categories"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                    >
                        {selectedEvent?.categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategorySelect(cat)}
                                className="p-6 rounded-2xl bg-dark-800 border border-dark-700 hover:border-primary-500 text-center group transition-all"
                            >
                                <div className="text-xl font-bold text-white mb-2">{cat.distance}m</div>
                                <div className="text-xs font-bold text-primary-400 uppercase tracking-tighter mb-4">{cat.division}</div>
                                <div className="text-[10px] text-dark-400 font-medium">
                                    {cat.gender} • {cat.ageClass}
                                </div>
                            </button>
                        ))}
                    </motion.div>
                )}

                {/* Step 3: Select Athlete */}
                {step === 'SELECT_ATHLETE' && (
                    <motion.div
                        key="athletes"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                            <input
                                type="text"
                                placeholder="Search by name or club..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-dark-800 border border-dark-700 focus:border-primary-500 outline-none transition-all text-white"
                            />
                        </div>

                        {loading ? (
                            <div className="text-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {filteredParticipants.map(participant => (
                                    <button
                                        key={participant.id}
                                        onClick={() => handleParticipantSelect(participant)}
                                        className="flex items-center justify-between p-4 rounded-2xl bg-dark-800 border border-dark-700 hover:bg-dark-750 hover:border-primary-500/30 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center border-2 border-dark-600 group-hover:border-primary-500/50 transition-colors overflow-hidden">
                                                {participant.athlete.user.avatarUrl ? (
                                                    <img src={participant.athlete.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Users className="w-5 h-5 text-dark-400" />
                                                )}
                                            </div>
                                            <div className="text-left">
                                                <div className="text-sm font-bold text-white mb-0.5">{participant.athlete.user.name}</div>
                                                <div className="text-xs text-dark-400">{participant.athlete.club?.name || 'Individual'}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-display font-bold text-primary-400">
                                                {participant.qualificationScore || 0}
                                            </div>
                                            <div className="text-[10px] text-dark-500 font-bold uppercase">
                                                RANK {participant.rank || '-'}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                                {filteredParticipants.length === 0 && (
                                    <div className="col-span-full text-center py-10 text-dark-400">
                                        No participants found matching your search.
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Step 4: Scoring */}
                {step === 'SCORING' && (
                    <motion.div
                        key="scoring"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                    >
                        {/* Athlete Mini Profile */}
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-dark-800 border border-dark-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
                                    {selectedParticipant?.athlete.user.name.charAt(0)}
                                </div>
                                <div className="text-left">
                                    <h2 className="text-sm font-bold text-white">{selectedParticipant?.athlete.user.name}</h2>
                                    <p className="text-[10px] text-dark-400 uppercase tracking-wider">
                                        {selectedCategory?.categoryLabel}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleSaveScores}
                                disabled={ends.length === 0 || isSubmitting}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-all shadow-lg shadow-emerald-500/20"
                            >
                                {isSubmitting ? (
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <CheckCircle2 className="w-4 h-4" />
                                )}
                                SUBMIT ALL
                            </button>
                        </div>

                        {/* Stats Summary */}
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { label: 'TOTAL', value: totalScore, color: 'text-primary-400' },
                                { label: 'ARROWS', value: totalArrows, color: 'text-white' },
                                { label: 'TENs', value: tensCount, color: 'text-yellow-400' },
                                { label: 'Xs', value: xCount, color: 'text-emerald-400' },
                            ].map(s => (
                                <div key={s.label} className="bg-dark-800 p-3 rounded-xl border border-dark-700 text-center">
                                    <div className={`text-xl font-display font-bold ${s.color}`}>{s.value}</div>
                                    <div className="text-[10px] text-dark-500 font-bold tracking-wider">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* End Grid */}
                        <div className="space-y-3">
                            {ends.map((end, eIdx) => (
                                <div key={eIdx} className={`p-4 rounded-2xl bg-dark-800 border-2 transition-all ${editingEnd === eIdx ? 'border-primary-500 bg-dark-750' : 'border-dark-700'}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-dark-400 uppercase">End {eIdx + 1}</span>
                                        <span className="text-sm font-display font-bold text-primary-400">{end.subtotal} PTS</span>
                                    </div>
                                    <div className="flex gap-2 justify-between">
                                        {end.scores.map((score, aIdx) => {
                                            const color = score !== null ? scoreColors[String(score)] : null;
                                            const isEditing = editingEnd === eIdx && editingArrow === aIdx;
                                            return (
                                                <button
                                                    key={aIdx}
                                                    onClick={() => handleCellClick(eIdx, aIdx)}
                                                    className={`flex-1 aspect-square rounded-xl text-lg font-bold flex items-center justify-center transition-all ${isEditing ? 'ring-2 ring-white scale-110 shadow-lg' : ''
                                                        } ${!score ? 'bg-dark-900 border border-dark-700 text-dark-600' : ''}`}
                                                    style={color ? { backgroundColor: color.bg, color: color.text, border: `1px solid ${color.border || 'transparent'}` } : {}}
                                                >
                                                    {score === 'M' ? 'M' : score === 'X' ? 'X' : score || ''}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={addNewEnd}
                                className="w-full py-4 rounded-2xl border-2 border-dashed border-dark-700 text-dark-400 font-bold text-sm hover:border-primary-500/50 hover:text-primary-400 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                ADD NEW END
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Global Score Selector Modal */}
            <AnimatePresence>
                {showScorePopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
                        onClick={() => { setShowScorePopup(false); setEditingEnd(null); setEditingArrow(null); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-sm"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="grid grid-cols-3 gap-3">
                                {['X', 10, 9, 8, 7, 6, 5, 'M'].map(val => {
                                    const color = scoreColors[String(val)];
                                    return (
                                        <button
                                            key={val}
                                            onClick={() => handleScoreSelect(val as any)}
                                            style={{ backgroundColor: color.bg, color: color.text, borderColor: color.border }}
                                            className={`h-20 rounded-2xl text-2xl font-bold transition-all hover:scale-105 active:scale-95 border-2 ${color.border ? '' : 'border-transparent'}`}
                                        >
                                            {val}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => {
                                        if (editingEnd !== null && editingArrow !== null) {
                                            const newEnds = [...ends];
                                            newEnds[editingEnd].scores[editingArrow] = null;
                                            newEnds[editingEnd].subtotal = newEnds[editingEnd].scores.reduce<number>((sum, s) => sum + getScoreValue(s), 0);
                                            setEnds(newEnds);
                                        }
                                    }}
                                    className="h-20 rounded-2xl bg-dark-700 text-dark-300 font-bold flex items-center justify-center col-span-1"
                                >
                                    CLR
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Plus(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    );
}
