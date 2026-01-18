import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, api } from '../context/AuthContext';
import { Target, Settings, X, Plus, Trash2, RotateCcw, ChevronDown, Save, RefreshCw, ChevronRight } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface ArcherConfig {
    drawLength: number; // inch
    drawWeight: number; // lbs
    bowHeight: string; // 64"/66"/68"/70"/72"
    braceHeight: number; // inch
    aTiller: number; // mm
    bTiller: number; // mm
    nockingPoint: number; // mm (+/-)
    arrowPoint: number; // grain
    arrowLength: number; // inch
}

interface ScoringSettings {
    division: string;
    targetFace: string;
    distance: number | '';
    arrowsPerEnd: number;
    archerConfig: ArcherConfig;
}

type ScoreValue = number | 'X' | 'M' | null;

interface EndData {
    scores: ScoreValue[];
    subtotal: number;
}

interface RoundData {
    id: number;
    ends: EndData[];
    totalScore: number;
    totalArrows: number;
    average: string;
    xPlusTen: number;
    xCount: number;
    timestamp: string;
}

// Target face configurations
const targetFaces = ['122R10', '80R10', '80R6', '80R5', '40R10', '40R5', '60R10'];
const targetFaceMinScores: Record<string, number> = {
    '122R10': 1, '80R10': 1, '80R6': 5, '80R5': 6, '40R10': 1, '40R5': 6, '60R10': 1,
};

// Score button colors
const scoreColors: Record<string, { bg: string; text: string; border?: string }> = {
    'X': { bg: '#FFD700', text: '#000000' },
    '10': { bg: '#FFD700', text: '#000000' },
    '9': { bg: '#FFD700', text: '#000000' },
    '8': { bg: '#FF0000', text: '#FFFFFF' },
    '7': { bg: '#FF0000', text: '#FFFFFF' },
    '6': { bg: '#2563EB', text: '#FFFFFF' },
    '5': { bg: '#2563EB', text: '#FFFFFF' },
    '4': { bg: '#1a1a1a', text: '#FFFFFF' },
    '3': { bg: '#1a1a1a', text: '#FFFFFF' },
    '2': { bg: '#FFFFFF', text: '#000000', border: '#ccc' },
    '1': { bg: '#FFFFFF', text: '#000000', border: '#ccc' },
    'M': { bg: '#9CA3AF', text: '#FFFFFF' },
};

const defaultArcherConfig: ArcherConfig = {
    drawLength: 28,
    drawWeight: 32,
    bowHeight: '68"',
    braceHeight: 8.5,
    aTiller: 3,
    bTiller: 0,
    nockingPoint: 3,
    arrowPoint: 100,
    arrowLength: 29,
};

export default function ScoringPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [sessionStarted, setSessionStarted] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showScorePopup, setShowScorePopup] = useState(false);
    const [showConfigNotes, setShowConfigNotes] = useState(false);
    const [settings, setSettings] = useState<ScoringSettings>({
        division: '',
        targetFace: '',
        distance: '',
        arrowsPerEnd: 6,
        archerConfig: { ...defaultArcherConfig },
    });
    const [ends, setEnds] = useState<EndData[]>([]);
    const [editingEnd, setEditingEnd] = useState<number | null>(null);
    const [editingArrow, setEditingArrow] = useState<number | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [configLogs, setConfigLogs] = useState<Array<{
        timestamp: string;
        config: ArcherConfig;
        arrowsPerEnd: number;
        avgScore: number;
    }>>([]);
    const [configSaved, setConfigSaved] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [showNextRoundConfirm, setShowNextRoundConfirm] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [rounds, setRounds] = useState<RoundData[]>([]);
    const [expandedRoundId, setExpandedRoundId] = useState<number | null>(null);

    const divisions = ['Barebow', 'Nasional', 'Recurve', 'Compound', 'Traditional'];
    const distances = [70, 60, 50, 40, 30, 25, 20, 18, 15, 10, 5];
    const bowHeights = ['64"', '66"', '68"', '70"', '72"'];

    // Socket connection
    useEffect(() => {
        const socketUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
        const newSocket = io(socketUrl, { transports: ['websocket', 'polling'] });
        newSocket.on('connect', () => setIsConnected(true));
        newSocket.on('disconnect', () => setIsConnected(false));
        setSocket(newSocket);
        return () => { newSocket.disconnect(); };
    }, []);

    const arrowsPerEnd = settings.arrowsPerEnd;
    const getMinScore = () => targetFaceMinScores[settings.targetFace] || 1;

    const getScoreValue = (score: ScoreValue): number => {
        if (score === 'X') return 10;
        if (score === 'M' || score === null) return 0;
        return score;
    };

    const getAvailableScores = (): (number | 'X' | 'M')[] => {
        const minScore = getMinScore();
        const scores: (number | 'X' | 'M')[] = ['X'];
        for (let i = 10; i >= minScore; i--) scores.push(i);
        scores.push('M');
        return scores;
    };

    // Calculate totals
    const totalScore = ends.reduce((sum, end) => sum + end.subtotal, 0);
    const totalArrows = ends.reduce((sum, end) => sum + end.scores.filter(s => s !== null).length, 0);
    const average = totalArrows > 0 ? (totalScore / totalArrows).toFixed(2) : '0.00';
    const allScores = ends.flatMap(e => e.scores).filter(s => s !== null);
    const xPlusTen = allScores.filter(s => s === 10 || s === 'X').length;
    const xCount = allScores.filter(s => s === 'X').length;

    // Tiller calculations
    const diffTiller = settings.archerConfig.aTiller - settings.archerConfig.bTiller;
    const tillerStatus = diffTiller > 0 ? 'Positive' : diffTiller < 0 ? 'Negative' : 'Neutral';

    // Nocking Point status
    const nockingPointStatus = settings.archerConfig.nockingPoint > 0 ? 'Positive' :
        settings.archerConfig.nockingPoint < 0 ? 'Negative' : 'Neutral';

    // Index Arrow Score = Total Score / Arrows per End setting
    const indexArrowScore = arrowsPerEnd > 0 ? (totalScore / arrowsPerEnd).toFixed(2) : '0.00';

    const handleStartSession = () => {
        setShowSettings(false);
        setSessionStarted(true);
    };

    const updateConfig = (key: keyof ArcherConfig, value: number | string) => {
        setSettings({
            ...settings,
            archerConfig: { ...settings.archerConfig, [key]: value }
        });
        setConfigSaved(false);
    };

    const handleSaveConfig = async () => {
        const newLog = {
            timestamp: new Date().toISOString(),
            config: { ...settings.archerConfig },
            arrowsPerEnd: settings.arrowsPerEnd,
            avgScore: parseFloat(average),
        };
        setConfigLogs([...configLogs, newLog]);
        setConfigSaved(true);

        // Save to backend API
        try {
            const token = localStorage.getItem('accessToken');
            await fetch('/api/v1/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    arrowsPerEnd: settings.arrowsPerEnd,
                    division: settings.division,
                    targetFace: settings.targetFace,
                    distance: settings.distance,
                    drawLength: settings.archerConfig.drawLength,
                    drawWeight: settings.archerConfig.drawWeight,
                    bowHeight: settings.archerConfig.bowHeight,
                    braceHeight: settings.archerConfig.braceHeight,
                    aTiller: settings.archerConfig.aTiller,
                    bTiller: settings.archerConfig.bTiller,
                    nockingPoint: settings.archerConfig.nockingPoint,
                    arrowPoint: settings.archerConfig.arrowPoint,
                    arrowLength: settings.archerConfig.arrowLength,
                    avgScoreArrow: parseFloat(average),
                    totalScore: totalScore,
                    totalArrows: totalArrows,
                    indexArrowScore: parseFloat(indexArrowScore),
                }),
            });
        } catch (error) {
            console.error('Failed to save config to backend:', error);
        }

        setTimeout(() => setConfigSaved(false), 3000);
    };

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

    const handleCellClick = (endIndex: number, arrowIndex: number) => {
        setEditingEnd(endIndex);
        setEditingArrow(arrowIndex);
        setShowScorePopup(true);
    };

    const handleScoreSelect = (value: number | 'X' | 'M') => {
        if (editingEnd === null || editingArrow === null) return;

        const newEnds = [...ends];
        newEnds[editingEnd].scores[editingArrow] = value;

        // Sort scores in descending order (X, 10, 9, ... M)
        // Get filled scores and null scores separately
        const filledScores = newEnds[editingEnd].scores.filter(s => s !== null);
        const nullCount = newEnds[editingEnd].scores.filter(s => s === null).length;

        // Sort filled scores: X > 10 > 9 > ... > 1 > M
        filledScores.sort((a, b) => {
            const getOrder = (s: ScoreValue): number => {
                if (s === 'X') return 11;
                if (s === 'M') return -1;
                return s as number;
            };
            return getOrder(b) - getOrder(a);
        });

        // Combine sorted scores with nulls at the end
        newEnds[editingEnd].scores = [...filledScores, ...Array(nullCount).fill(null)];
        newEnds[editingEnd].subtotal = newEnds[editingEnd].scores.reduce((sum, s) => sum + getScoreValue(s), 0);
        setEnds(newEnds);

        // Move to next empty arrow in current end
        const nextEmpty = newEnds[editingEnd].scores.findIndex(s => s === null);
        if (nextEmpty !== -1) {
            setEditingArrow(nextEmpty);
        } else {
            // All filled, close popup
            setShowScorePopup(false);
            setEditingEnd(null);
            setEditingArrow(null);
        }
    };

    const handleDeleteArrow = () => {
        if (editingEnd === null || editingArrow === null) return;

        const newEnds = [...ends];
        newEnds[editingEnd].scores[editingArrow] = null;
        newEnds[editingEnd].subtotal = newEnds[editingEnd].scores.reduce((sum, s) => sum + getScoreValue(s), 0);
        setEnds(newEnds);
    };

    const handleDeleteEnd = () => {
        if (editingEnd === null) return;

        const newEnds = ends.filter((_, i) => i !== editingEnd);
        setEnds(newEnds);
        setShowScorePopup(false);
        setEditingEnd(null);
        setEditingArrow(null);
    };

    const getRunningTotal = (endIndex: number): number => {
        return ends.slice(0, endIndex + 1).reduce((sum, end) => sum + end.subtotal, 0);
    };

    const getScoreDisplay = (score: ScoreValue): string => {
        if (score === null) return '';
        if (score === 'X') return 'X';
        if (score === 'M') return 'M';
        return score.toString();
    };

    const handleNextRound = () => {
        if (ends.length > 0) {
            const totalScore = ends.reduce((sum, end) => sum + end.subtotal, 0);
            const totalArrows = ends.reduce((sum, end) => sum + end.scores.filter(s => s !== null).length, 0);
            const average = totalArrows > 0 ? (totalScore / totalArrows).toFixed(2) : '0.00';
            const allScores = ends.flatMap(e => e.scores).filter(s => s !== null);
            const xPlusTen = allScores.filter(s => s === 10 || s === 'X').length;
            const xCount = allScores.filter(s => s === 'X').length;

            const newRound: RoundData = {
                id: rounds.length + 1,
                ends: [...ends],
                totalScore,
                totalArrows,
                average,
                xPlusTen,
                xCount,
                timestamp: new Date().toISOString(),
            };
            setRounds([...rounds, newRound]);
        }

        setEnds([]);
        setEditingEnd(null);
        setEditingArrow(null);
        setShowNextRoundConfirm(false);
    };

    const handleSaveSession = async () => {
        try {
            // Collect all sequences to save: historical rounds + current active ends (if any)
            const sequencesToSave = [...rounds];
            if (ends.length > 0) {
                // If there are active ends, structure them like a round
                /* 
                   Note: The backend treats a submission as a "session record". 
                   We can either save each "round" as a separate record, or 
                   combine them. For now, let's allow saving the active ends 
                   as a new accumulated record or just save each round individually.
                   
                   Decision: Save each Round as a separate DB entry for granular history.
                */
                sequencesToSave.push({
                    id: -1, // temporary ID
                    ends: ends,
                    totalScore: ends.reduce((sum, end) => sum + end.subtotal, 0),
                    totalArrows: 0, // Not needed for payload construction
                    average: '0',
                    xPlusTen: 0,
                    xCount: 0,
                    timestamp: new Date().toISOString()
                });
            }

            if (sequencesToSave.length === 0) {
                alert("No scores to save!");
                setShowSaveConfirm(false);
                return;
            }

            // Save each sequence
            for (const round of sequencesToSave) {
                const arrowScores = round.ends.map(e => e.scores.map(s => s === null ? 'M' : s)); // Convert null to 'M'

                await api.post('/scores/submit', {
                    sessionDate: round.timestamp || new Date().toISOString(),
                    sessionType: 'TRAINING', // Could add configuration for this
                    distance: Number(settings.distance) || 70, // Fallback default
                    targetFace: settings.targetFace || '122R10',
                    arrowScores: arrowScores,
                    notes: `Round Saved from SIP Web`,
                    weatherCondition: 'Sunny' // Placeholder, could be added to UI
                });
            }

            // Success feedback
            alert(`Successfully saved ${sequencesToSave.length} record(s) to database!`);
            setShowSaveConfirm(false);

        } catch (error) {
            console.error("Failed to save session:", error);
            alert("Failed to save session. Please try again.");
        }
    };

    const toggleRoundExpansion = (roundId: number) => {
        setExpandedRoundId(expandedRoundId === roundId ? null : roundId);
    };

    return (
        <div className="space-y-4 max-w-4xl mx-auto">
            {/* Landing View - Before Session Starts */}
            {!sessionStarted && !showSettings && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center min-h-[60vh] space-y-8"
                >
                    {/* Header with Live Status */}
                    <div className="flex items-center justify-between w-full px-4">
                        <div />
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                            {isConnected ? 'Live' : 'Offline'}
                        </div>
                    </div>

                    {/* User Name and Avatar */}
                    <div className="text-center space-y-4">
                        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary-500/25">
                            {user?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div>
                            <h1 className="text-2xl font-display font-bold">
                                {user?.name || 'Athlete'}
                            </h1>
                            <p className="text-dark-400 text-sm mt-1">Ready to start scoring</p>
                        </div>
                    </div>

                    {/* Scoring Session Button */}
                    <button
                        onClick={() => setShowSettings(true)}
                        className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-lg font-bold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-105 transition-all flex items-center gap-3"
                    >
                        <Target className="w-6 h-6" />
                        Scoring Session
                    </button>

                    {/* Quick Stats Preview */}
                    <div className="text-center text-dark-400 text-sm">
                        <p>Configure your session settings and start recording scores</p>
                    </div>
                </motion.div>
            )}

            {/* Cancel Confirmation Modal */}
            <AnimatePresence>
                {showCancelConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                        onClick={() => setShowCancelConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-dark-900 rounded-2xl p-6 w-full max-w-sm border border-dark-700 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                                    <X className="w-8 h-8 text-red-400" />
                                </div>
                                <h3 className="text-lg font-display font-bold mb-2">Cancel Session?</h3>
                                <p className="text-dark-400 text-sm">
                                    Are you sure you want to cancel? All settings will be lost.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCancelConfirm(false)}
                                    className="flex-1 py-3 rounded-xl bg-dark-700 text-dark-300 font-medium hover:bg-dark-600 transition-all"
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCancelConfirm(false);
                                        setShowSettings(false);
                                        setSessionStarted(false);
                                    }}
                                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all"
                                >
                                    Yes, Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Save Session Confirmation Modal */}
            <AnimatePresence>
                {showSaveConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                        onClick={() => setShowSaveConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-dark-900 rounded-2xl p-6 w-full max-w-sm border border-dark-700 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <Save className="w-8 h-8 text-emerald-400" />
                                </div>
                                <h3 className="text-lg font-display font-bold mb-2">Save Session?</h3>
                                <p className="text-dark-400 text-sm">
                                    This will save all rounds and complete the session.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowSaveConfirm(false)}
                                    className="flex-1 py-3 rounded-xl bg-dark-700 text-dark-300 font-medium hover:bg-dark-600 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveSession}
                                    className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all"
                                >
                                    Save
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Next Round Confirmation Modal */}
            <AnimatePresence>
                {showNextRoundConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                        onClick={() => setShowNextRoundConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-dark-900 rounded-2xl p-6 w-full max-w-sm border border-dark-700 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-500/20 flex items-center justify-center">
                                    <RefreshCw className="w-8 h-8 text-primary-400" />
                                </div>
                                <h3 className="text-lg font-display font-bold mb-2">Start Next Round?</h3>
                                <p className="text-dark-400 text-sm">
                                    This will save the current round to history and start a fresh scoresheet.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowNextRoundConfirm(false)}
                                    className="flex-1 py-3 rounded-xl bg-dark-700 text-dark-300 font-medium hover:bg-dark-600 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleNextRound}
                                    className="flex-1 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-all"
                                >
                                    Next Round
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Settings Modal */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-dark-900 rounded-2xl p-5 w-full max-w-lg border border-dark-700 shadow-2xl my-4 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-display font-bold flex items-center gap-2">
                                    <Target className="w-5 h-5 text-primary-400" />
                                    Scoring Session
                                </h2>
                                {ends.length > 0 && (
                                    <button onClick={() => setShowSettings(false)} className="p-2 rounded-lg hover:bg-dark-800">
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            {/* Dropdowns Row */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {/* Division */}
                                <div>
                                    <label className="block text-xs text-dark-400 mb-1">Division</label>
                                    <div className="relative">
                                        <select
                                            value={settings.division}
                                            onChange={(e) => setSettings({ ...settings, division: e.target.value })}
                                            className={`w-full px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-sm appearance-none cursor-pointer ${!settings.division ? 'text-dark-400' : 'text-white'}`}
                                        >
                                            <option value="" disabled>Select...</option>
                                            {divisions.map(d => <option key={d} value={d.toUpperCase()}>{d}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Target Face */}
                                <div>
                                    <label className="block text-xs text-dark-400 mb-1">Target Face</label>
                                    <div className="relative">
                                        <select
                                            value={settings.targetFace}
                                            onChange={(e) => setSettings({ ...settings, targetFace: e.target.value })}
                                            className={`w-full px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-sm appearance-none cursor-pointer ${!settings.targetFace ? 'text-dark-400' : 'text-white'}`}
                                        >
                                            <option value="" disabled>Select...</option>
                                            {targetFaces.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Distance */}
                                <div>
                                    <label className="block text-xs text-dark-400 mb-1">Distance</label>
                                    <div className="relative">
                                        <select
                                            value={settings.distance}
                                            onChange={(e) => setSettings({ ...settings, distance: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                            className={`w-full px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-sm appearance-none cursor-pointer ${!settings.distance ? 'text-dark-400' : 'text-white'}`}
                                        >
                                            <option value="" disabled>Select...</option>
                                            {distances.map(d => <option key={d} value={d}>{d}m</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Arrows per End */}
                                <div>
                                    <label className="block text-xs text-dark-400 mb-1">Arrows/End</label>
                                    <div className="px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600">
                                        <div className="text-center text-lg font-bold text-primary-400 mb-2">
                                            {settings.arrowsPerEnd}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Arrows per End Slider */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between text-xs text-dark-400 mb-2">
                                    <span>1</span>
                                    <span className="text-primary-400 font-medium">{settings.arrowsPerEnd} arrows per end</span>
                                    <span>24</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="24"
                                    value={settings.arrowsPerEnd}
                                    onChange={(e) => setSettings({ ...settings, arrowsPerEnd: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                                    style={{
                                        background: `linear-gradient(to right, #0ea5e9 0%, #0ea5e9 ${((settings.arrowsPerEnd - 1) / 23) * 100}%, #374151 ${((settings.arrowsPerEnd - 1) / 23) * 100}%, #374151 100%)`
                                    }}
                                />
                            </div>

                            {/* Notes / Archer Config Toggle */}
                            <button
                                onClick={() => setShowConfigNotes(!showConfigNotes)}
                                className="w-full mb-3 py-2 px-3 rounded-lg bg-dark-800 text-dark-300 text-sm flex items-center justify-between hover:bg-dark-700"
                            >
                                <span>📝 Notes: Archer & Equipment Config</span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${showConfigNotes ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Archer Config Section */}
                            <AnimatePresence>
                                {showConfigNotes && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700 mb-4 space-y-4">
                                            {/* Archer Config */}
                                            <div>
                                                <h4 className="text-xs font-medium text-primary-400 mb-2">Archer Config</h4>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[10px] text-dark-400">DL (Draw Length)</label>
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                type="number"
                                                                value={settings.archerConfig.drawLength}
                                                                onChange={(e) => updateConfig('drawLength', parseFloat(e.target.value))}
                                                                className="w-full px-2 py-1.5 rounded bg-dark-700 border border-dark-600 text-sm"
                                                            />
                                                            <span className="text-xs text-dark-400">inch</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-dark-400">DW (Draw Weight)</label>
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                type="number"
                                                                value={settings.archerConfig.drawWeight}
                                                                onChange={(e) => updateConfig('drawWeight', parseFloat(e.target.value))}
                                                                className="w-full px-2 py-1.5 rounded bg-dark-700 border border-dark-600 text-sm"
                                                            />
                                                            <span className="text-xs text-dark-400">lbs</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bow Setting */}
                                            <div>
                                                <h4 className="text-xs font-medium text-primary-400 mb-2">Bow Setting</h4>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[10px] text-dark-400">Bow Height</label>
                                                        <select
                                                            value={settings.archerConfig.bowHeight}
                                                            onChange={(e) => updateConfig('bowHeight', e.target.value)}
                                                            className="w-full px-2 py-1.5 rounded bg-dark-700 border border-dark-600 text-sm"
                                                        >
                                                            {bowHeights.map(h => <option key={h} value={h}>{h}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-dark-400">Brace Height</label>
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                value={settings.archerConfig.braceHeight}
                                                                onChange={(e) => updateConfig('braceHeight', parseFloat(e.target.value))}
                                                                className="w-full px-2 py-1.5 rounded bg-dark-700 border border-dark-600 text-sm"
                                                            />
                                                            <span className="text-xs text-dark-400">inch</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-dark-400">A Tiller</label>
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                type="number"
                                                                value={settings.archerConfig.aTiller}
                                                                onChange={(e) => updateConfig('aTiller', parseFloat(e.target.value))}
                                                                className="w-full px-2 py-1.5 rounded bg-dark-700 border border-dark-600 text-sm"
                                                            />
                                                            <span className="text-xs text-dark-400">mm</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-dark-400">B Tiller</label>
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                type="number"
                                                                value={settings.archerConfig.bTiller}
                                                                onChange={(e) => updateConfig('bTiller', parseFloat(e.target.value))}
                                                                className="w-full px-2 py-1.5 rounded bg-dark-700 border border-dark-600 text-sm"
                                                            />
                                                            <span className="text-xs text-dark-400">mm</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                    <div className="p-2 rounded bg-dark-700/50 text-center">
                                                        <span className="text-[10px] text-dark-400">Diff Tiller</span>
                                                        <p className="text-sm font-medium">{diffTiller} mm</p>
                                                    </div>
                                                    <div className="p-2 rounded bg-dark-700/50 text-center">
                                                        <span className="text-[10px] text-dark-400">Status Tiller</span>
                                                        <p className={`text-sm font-medium ${tillerStatus === 'Positive' ? 'text-emerald-400' :
                                                            tillerStatus === 'Negative' ? 'text-red-400' : 'text-amber-400'
                                                            }`}>{tillerStatus}</p>
                                                    </div>
                                                </div>

                                                {/* Nocking Point - Same style as Tiller */}
                                                <div className="grid grid-cols-2 gap-2 mt-3">
                                                    <div>
                                                        <label className="text-[10px] text-dark-400">Nocking Point</label>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <input
                                                                type="number"
                                                                value={settings.archerConfig.nockingPoint}
                                                                onChange={(e) => updateConfig('nockingPoint', parseFloat(e.target.value))}
                                                                className="w-full px-2 py-1.5 rounded bg-dark-700 border border-dark-600 text-sm"
                                                            />
                                                            <span className="text-xs text-dark-400">mm</span>
                                                        </div>
                                                    </div>
                                                    <div className="p-2 rounded bg-dark-700/50 text-center flex flex-col justify-center">
                                                        <span className="text-[10px] text-dark-400">Status NP</span>
                                                        <p className={`text-sm font-medium ${nockingPointStatus === 'Positive' ? 'text-emerald-400' :
                                                            nockingPointStatus === 'Negative' ? 'text-red-400' : 'text-amber-400'
                                                            }`}>{nockingPointStatus}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Arrow Setting */}
                                            <div>
                                                <h4 className="text-xs font-medium text-primary-400 mb-2">Arrow Setting</h4>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[10px] text-dark-400">Point Weight</label>
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                type="number"
                                                                value={settings.archerConfig.arrowPoint}
                                                                onChange={(e) => updateConfig('arrowPoint', parseFloat(e.target.value))}
                                                                className="w-full px-2 py-1.5 rounded bg-dark-700 border border-dark-600 text-sm"
                                                            />
                                                            <span className="text-xs text-dark-400">grain</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-dark-400">Arrow Length</label>
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                type="number"
                                                                step="0.5"
                                                                value={settings.archerConfig.arrowLength}
                                                                onChange={(e) => updateConfig('arrowLength', parseFloat(e.target.value))}
                                                                className="w-full px-2 py-1.5 rounded bg-dark-700 border border-dark-600 text-sm"
                                                            />
                                                            <span className="text-xs text-dark-400">inch</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleSaveConfig}
                                                className="w-full py-2 rounded-lg bg-dark-700 text-dark-300 text-xs flex items-center justify-center gap-1 hover:bg-dark-600"
                                            >
                                                <Save className="w-3 h-3" />
                                                {configSaved ? '✓ Saved!' : 'Save to Profile'}
                                            </button>

                                            {configLogs.length > 0 && (
                                                <div className="mt-3 p-2 rounded bg-dark-700/30 text-xs text-dark-400">
                                                    <span className="text-primary-400">📋 {configLogs.length} config(s) logged</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (ends.length > 0) {
                                            setShowSettings(false);
                                        } else {
                                            // Check if settings changed
                                            const initialSettings = {
                                                division: '',
                                                targetFace: '',
                                                distance: '',
                                                arrowsPerEnd: 6,
                                                archerConfig: defaultArcherConfig,
                                            };

                                            // If settings haven't changed, close immediately without confirmation
                                            if (JSON.stringify(settings) === JSON.stringify(initialSettings)) {
                                                setShowSettings(false);
                                                setSessionStarted(false);
                                            } else {
                                                setShowCancelConfirm(true);
                                            }
                                        }
                                    }}
                                    className="flex-1 py-3 rounded-xl bg-dark-700 text-dark-300 font-medium hover:bg-dark-600 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleStartSession}
                                    disabled={!settings.division || !settings.targetFace || !settings.distance}
                                    className={`flex-[2] py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold transition-all ${!settings.division || !settings.targetFace || !settings.distance
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:shadow-lg hover:shadow-primary-500/25'
                                        }`}
                                >
                                    Start Session
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Score Popup */}
            <AnimatePresence>
                {showScorePopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
                        onClick={() => { setShowScorePopup(false); setEditingEnd(null); setEditingArrow(null); }}
                    >
                        <motion.div
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
                            exit={{ y: 100 }}
                            className="w-full max-w-md bg-dark-900 rounded-t-2xl p-4 border-t border-dark-700"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {getAvailableScores().map((value) => {
                                    const color = scoreColors[String(value)];
                                    return (
                                        <button
                                            key={String(value)}
                                            onClick={() => handleScoreSelect(value)}
                                            style={{ backgroundColor: color.bg, color: color.text, borderColor: color.border || 'transparent' }}
                                            className={`py-4 rounded-xl text-2xl font-bold transition-all hover:scale-105 active:scale-95 ${color.border ? 'border-2' : ''}`}
                                        >
                                            {value}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex gap-2">
                                <button onClick={handleDeleteArrow} className="flex-1 py-3 rounded-xl bg-dark-800 text-dark-300 font-medium flex items-center justify-center gap-2">
                                    <RotateCcw className="w-5 h-5" /> Delete Arrow
                                </button>
                                <button onClick={handleDeleteEnd} className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-400 font-medium flex items-center justify-center gap-2">
                                    <Trash2 className="w-5 h-5" /> Delete End
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Session Content - Only shown after session starts */}
            {sessionStarted && (
                <>
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-display font-bold flex items-center gap-2">
                                <Target className="w-5 h-5 text-primary-500" />
                                {settings.distance}m-{ends.length || 1}
                            </h1>
                            <p className="text-dark-400 text-xs">{settings.division} • {settings.targetFace}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowSaveConfirm(true)}
                                className="px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors flex items-center gap-2"
                                title="Save Session"
                            >
                                <Save className="w-4 h-4" />
                                Save
                            </button>
                            <button onClick={() => setShowSettings(true)} className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700">
                                <Settings className="w-4 h-4 text-dark-400" />
                            </button>
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                {isConnected ? 'Live' : 'Off'}
                            </div>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-5 gap-2">
                        {[
                            { label: 'Score', value: totalScore },
                            { label: 'Arrows', value: totalArrows },
                            { label: 'Avg', value: average },
                            { label: 'X+10', value: xPlusTen },
                            { label: 'X', value: xCount },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center py-2 rounded-lg bg-dark-800">
                                <p className="text-lg font-bold text-primary-400">{stat.value}</p>
                                <p className="text-[10px] text-dark-400">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Scoresheet Grid */}
                    <div className="card overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-dark-600">
                                    <th className="py-2 px-2 text-left text-dark-400 font-medium w-8"></th>
                                    {Array.from({ length: arrowsPerEnd }).map((_, i) => (
                                        <th key={i} className="py-2 px-1 text-center text-dark-400 font-medium w-12">{i + 1}</th>
                                    ))}
                                    <th className="py-2 px-2 text-center text-dark-400 font-medium w-14">End</th>
                                    <th className="py-2 px-2 text-center text-dark-400 font-medium w-14">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ends.map((end, endIndex) => (
                                    <tr
                                        key={endIndex}
                                        className={`border-b border-dark-700 ${editingEnd === endIndex ? 'bg-amber-500/10' : ''}`}
                                    >
                                        <td className="py-2 px-2 text-dark-400 font-medium">{endIndex + 1}</td>
                                        {Array.from({ length: arrowsPerEnd }).map((_, arrowIndex) => {
                                            const score = end.scores[arrowIndex];
                                            const isEditing = editingEnd === endIndex && editingArrow === arrowIndex;
                                            const color = score !== null ? scoreColors[String(score)] : null;

                                            return (
                                                <td key={arrowIndex} className="py-1.5 px-1">
                                                    <button
                                                        onClick={() => handleCellClick(endIndex, arrowIndex)}
                                                        className={`w-full h-10 rounded-lg font-bold text-base transition-all ${isEditing
                                                            ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-dark-900 bg-amber-400 text-black'
                                                            : score !== null
                                                                ? ''
                                                                : 'bg-dark-800 text-dark-600 hover:bg-dark-700 border border-dark-600 border-dashed'
                                                            }`}
                                                        style={!isEditing && color ? {
                                                            backgroundColor: color.bg,
                                                            color: color.text,
                                                            border: color.border ? `1px solid ${color.border}` : 'none'
                                                        } : undefined}
                                                    >
                                                        {getScoreDisplay(score)}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                        <td className="py-2 px-2 text-center font-bold text-primary-400">{end.subtotal}</td>
                                        <td className="py-2 px-2 text-center font-bold">{getRunningTotal(endIndex)}</td>
                                    </tr>
                                ))}

                                {/* Add End Row */}
                                <tr>
                                    <td colSpan={arrowsPerEnd + 3} className="py-3">
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setShowNextRoundConfirm(true)}
                                                className="flex-1 py-3 rounded-xl bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-primary-400 transition-all flex items-center justify-center gap-2 font-medium"
                                            >
                                                <RefreshCw className="w-5 h-5" />
                                                New Round
                                            </button>
                                            <button
                                                onClick={addNewEnd}
                                                className="flex-1 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-all flex items-center justify-center gap-2"
                                            >
                                                Next
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Empty State */}
                    {ends.length === 0 && (
                        <div className="text-center py-8 text-dark-400">
                            <Target className="w-12 h-12 mx-auto mb-3 opacity-40" />
                            <p className="text-sm">Click "Add End" to start scoring</p>
                        </div>
                    )}

                    {/* Round History */}
                    {rounds.length > 0 && (
                        <div className="space-y-3 mt-6">
                            <h3 className="text-lg font-display font-bold text-dark-300">Round History</h3>
                            {rounds.map((round) => (
                                <div key={round.id} className="bg-dark-800 rounded-xl overflow-hidden border border-dark-700">
                                    <button
                                        onClick={() => toggleRoundExpansion(round.id)}
                                        className="w-full p-4 bg-dark-800 hover:bg-dark-750 transition-colors block"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center font-bold text-dark-300 border border-dark-600">
                                                    {round.id}
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-sm font-bold text-white">Round {round.id}</div>
                                                    <div className="text-xs text-dark-500">
                                                        {new Date(round.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {round.ends.length} ends
                                                    </div>
                                                </div>
                                            </div>
                                            <ChevronDown className={`w-5 h-5 text-dark-500 transition-transform ${expandedRoundId === round.id ? 'rotate-180' : ''}`} />
                                        </div>

                                        <div className="grid grid-cols-5 gap-2">
                                            <div className="bg-dark-900/50 rounded-lg py-2 px-1 text-center border border-dark-700/50">
                                                <div className="text-primary-400 font-bold text-lg leading-tight">{round.totalScore}</div>
                                                <div className="text-[10px] uppercase tracking-wider text-dark-500 font-medium">Score</div>
                                            </div>
                                            <div className="bg-dark-900/50 rounded-lg py-2 px-1 text-center border border-dark-700/50">
                                                <div className="text-white font-bold text-lg leading-tight">{round.totalArrows}</div>
                                                <div className="text-[10px] uppercase tracking-wider text-dark-500 font-medium">Arrows</div>
                                            </div>
                                            <div className="bg-dark-900/50 rounded-lg py-2 px-1 text-center border border-dark-700/50">
                                                <div className="text-white font-bold text-lg leading-tight">{round.average}</div>
                                                <div className="text-[10px] uppercase tracking-wider text-dark-500 font-medium">Avg</div>
                                            </div>
                                            <div className="bg-dark-900/50 rounded-lg py-2 px-1 text-center border border-dark-700/50">
                                                <div className="text-white font-bold text-lg leading-tight">{round.xPlusTen}</div>
                                                <div className="text-[10px] uppercase tracking-wider text-dark-500 font-medium">X+10</div>
                                            </div>
                                            <div className="bg-dark-900/50 rounded-lg py-2 px-1 text-center border border-dark-700/50">
                                                <div className="text-white font-bold text-lg leading-tight">{round.xCount}</div>
                                                <div className="text-[10px] uppercase tracking-wider text-dark-500 font-medium">X</div>
                                            </div>
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {expandedRoundId === round.id && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: 'auto' }}
                                                exit={{ height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-4 pt-0 border-t border-dark-700">
                                                    <table className="w-full text-sm mt-2">
                                                        <tbody>
                                                            {round.ends.map((end, idx) => {
                                                                // Calculate running total for history
                                                                const runningTotal = round.ends.slice(0, idx + 1).reduce((sum, e) => sum + e.subtotal, 0);

                                                                return (
                                                                    <tr key={idx} className="border-b border-dark-700 last:border-0 hover:bg-dark-700/50">
                                                                        <td className="py-2 px-2 text-dark-400 w-8">{idx + 1}</td>
                                                                        <td className="py-2">
                                                                            <div className="flex gap-1 justify-center">
                                                                                {end.scores.map((score, sIdx) => {
                                                                                    const color = score !== null ? scoreColors[String(score)] : null;
                                                                                    return (
                                                                                        <span key={sIdx} className={`inline-flex items-center justify-center w-8 h-8 rounded font-bold text-sm ${color?.border ? 'bg-white text-black border border-gray-300' : ''
                                                                                            }`}
                                                                                            style={!color?.border && color ? {
                                                                                                backgroundColor: color.bg,
                                                                                                color: color.text
                                                                                            } : { backgroundColor: '#374151', color: '#9CA3AF' }}
                                                                                        >
                                                                                            {getScoreDisplay(score)}
                                                                                        </span>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </td>
                                                                        <td className="py-2 px-3 text-right font-bold text-primary-400 w-16">{end.subtotal}</td>
                                                                        <td className="py-2 px-3 text-right font-bold w-16">{runningTotal}</td>
                                                                    </tr>
                                                                )
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
