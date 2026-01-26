import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Clock, Target, Moon, Thermometer, Battery, Brain } from 'lucide-react';
import { api } from '../../../../core/contexts/AuthContext';

interface DailyWellnessModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

export default function DailyWellnessModal({ isOpen, onClose, onSave }: DailyWellnessModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [rpe, setRpe] = useState(5);
    const [duration, setDuration] = useState(120);
    const [arrowCount, setArrowCount] = useState(0);
    const [sleepQuality, setSleepQuality] = useState(3);
    const [fatigueLevel, setFatigueLevel] = useState(3);
    const [stressLevel, setStressLevel] = useState(3);
    const [sorenessLevel, setSorenessLevel] = useState(3);
    // Physiology
    const [restingHR, setRestingHR] = useState<number | ''>('');
    const [hrv, setHrv] = useState<number | ''>('');

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await api.post('/analytics/daily-log', {
                date: new Date().toISOString(),
                rpe,
                durationMinutes: duration,
                arrowCount,
                sleepQuality,
                fatigueLevel,
                stressLevel,
                sorenessLevel,
                restingHR: restingHR || undefined,
                hrv: hrv || undefined
            });
            onSave();
            onClose();
        } catch (error) {
            console.error('Failed to save daily log', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const renderScale = (value: number, setValue: (val: number) => void, label: string, icon: any, color: string) => (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-white">
                    {icon}
                    <span className="font-medium">{label}</span>
                </div>
                <span className={`text-xl font-bold ${color}`}>{value}/5</span>
            </div>
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                    <button
                        key={num}
                        onClick={() => setValue(num)}
                        className={`flex-1 h-10 rounded-lg transition-all ${value === num
                            ? 'bg-primary-600 text-white ring-2 ring-primary-400'
                            : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                            }`}
                    >
                        {num}
                    </button>
                ))}
            </div>
            <div className="flex justify-between mt-1 text-xs text-dark-400 px-1">
                <span>Low/Bad</span>
                <span>High/Good</span>
            </div>
        </div>
    );

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-dark-800 rounded-2xl w-full max-w-lg overflow-hidden border border-dark-700 shadow-2xl"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-dark-700 flex items-center justify-between bg-dark-800/50">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Activity className="text-primary-500" />
                                Wellness Check-in
                            </h2>
                            <p className="text-sm text-dark-400">Track your daily load and recovery</p>
                        </div>
                        <button onClick={onClose} className="text-dark-400 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        {step === 1 ? (
                            <div className="space-y-6">
                                {/* RPE Slider */}
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <label className="text-white font-medium flex items-center gap-2">
                                            <Brain className="w-4 h-4 text-purple-400" />
                                            Intensity (RPE)
                                        </label>
                                        <span className="text-2xl font-bold text-purple-400">{rpe}/10</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={rpe}
                                        onChange={(e) => setRpe(parseInt(e.target.value))}
                                        className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                    />
                                    <p className="text-xs text-dark-400 mt-2">
                                        1 = Rest, 10 = Max Effort
                                    </p>
                                </div>

                                {/* Duration */}
                                <div>
                                    <label className="text-white font-medium flex items-center gap-2 mb-2">
                                        <Clock className="w-4 h-4 text-blue-400" />
                                        Duration (Minutes)
                                    </label>
                                    <input
                                        type="number"
                                        value={duration}
                                        onChange={(e) => setDuration(parseInt(e.target.value))}
                                        className="input w-full"
                                    />
                                </div>

                                {/* Arrow Count */}
                                <div>
                                    <label className="text-white font-medium flex items-center gap-2 mb-2">
                                        <Target className="w-4 h-4 text-red-400" />
                                        Total Arrows Shot
                                    </label>
                                    <input
                                        type="number"
                                        value={arrowCount}
                                        onChange={(e) => setArrowCount(parseInt(e.target.value))}
                                        className="input w-full"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div>
                                {renderScale(sleepQuality, setSleepQuality, 'Sleep Quality', <Moon className="w-4 h-4 text-indigo-400" />, 'text-indigo-400')}
                                {renderScale(fatigueLevel, setFatigueLevel, 'Fatigue Level', <Battery className="w-4 h-4 text-yellow-400" />, 'text-yellow-400')}
                                {renderScale(stressLevel, setStressLevel, 'Stress Level', <Brain className="w-4 h-4 text-red-400" />, 'text-red-400')}
                                {renderScale(sorenessLevel, setSorenessLevel, 'Muscle Soreness', <Thermometer className="w-4 h-4 text-orange-400" />, 'text-orange-400')}

                                <div className="border-t border-white/10 pt-4 mt-2">
                                    <h4 className="text-sm font-medium text-gray-400 mb-3">Physiology (Optional)</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-dark-700/50 p-3 rounded-lg">
                                            <label className="text-xs text-gray-400 block mb-1">Resting HR (bpm)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-transparent text-white font-bold outline-none"
                                                placeholder="e.g. 60"
                                                value={restingHR}
                                                onChange={(e) => setRestingHR(Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="bg-dark-700/50 p-3 rounded-lg">
                                            <label className="text-xs text-gray-400 block mb-1">HRV (ms)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-transparent text-white font-bold outline-none"
                                                placeholder="e.g. 50"
                                                value={hrv}
                                                onChange={(e) => setHrv(Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-dark-700 flex justify-between bg-dark-800/50">
                        {step === 2 ? (
                            <button
                                onClick={() => setStep(1)}
                                className="px-4 py-2 text-dark-400 hover:text-white transition-colors"
                            >
                                Back
                            </button>
                        ) : (
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-dark-400 hover:text-white transition-colors"
                            >
                                Skip
                            </button>
                        )}

                        {step === 1 ? (
                            <button
                                onClick={() => setStep(2)}
                                className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Complete Check-in'}
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
