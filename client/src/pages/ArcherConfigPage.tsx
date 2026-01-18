import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Save, Check, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ArcherConfig {
    drawLength: number;
    drawWeight: number;
    bowHeight: string;
    braceHeight: number;
    aTiller: number;
    bTiller: number;
    nockingPoint: number;
    arrowPoint: number;
    arrowLength: number;
}

const defaultConfig: ArcherConfig = {
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

export default function ArcherConfigPage() {
    const { user } = useAuth();
    const [config, setConfig] = useState<ArcherConfig>(defaultConfig);
    const [configSaved, setConfigSaved] = useState(false);
    const [showBowSection, setShowBowSection] = useState(true);
    const [showArrowSection, setShowArrowSection] = useState(true);

    const bowHeights = ['64"', '66"', '68"', '70"', '72"'];

    const diffTiller = config.aTiller - config.bTiller;
    const tillerStatus = diffTiller > 0 ? 'Positive' : diffTiller < 0 ? 'Negative' : 'Neutral';

    const updateConfig = (key: keyof ArcherConfig, value: number | string) => {
        setConfig(prev => ({ ...prev, [key]: value }));
        setConfigSaved(false);
    };

    const saveConfig = () => {
        // Would save to backend in production
        setConfigSaved(true);
        setTimeout(() => setConfigSaved(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                        <Target className="w-6 h-6 text-primary-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Archer & Equipment Config</h1>
                        <p className="text-dark-400">Configure your bow and arrow settings</p>
                    </div>
                </div>
                <button
                    onClick={saveConfig}
                    className="btn-primary flex items-center gap-2"
                >
                    {configSaved ? <Check size={18} /> : <Save size={18} />}
                    {configSaved ? 'Saved!' : 'Save Config'}
                </button>
            </motion.div>

            {/* Bow Configuration */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card"
            >
                <button
                    onClick={() => setShowBowSection(!showBowSection)}
                    className="w-full flex items-center justify-between mb-4"
                >
                    <h2 className="text-lg font-semibold">Bow Configuration</h2>
                    <ChevronDown className={`w-5 h-5 text-dark-400 transition-transform ${showBowSection ? 'rotate-180' : ''}`} />
                </button>

                {showBowSection && (
                    <div className="space-y-6">
                        {/* Draw Length & Weight */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm text-dark-400 mb-2">Draw Length (inches)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="24"
                                        max="32"
                                        step="0.5"
                                        value={config.drawLength}
                                        onChange={(e) => updateConfig('drawLength', parseFloat(e.target.value))}
                                        className="flex-1 accent-primary-500"
                                    />
                                    <span className="w-16 text-center font-mono text-lg">{config.drawLength}"</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-dark-400 mb-2">Draw Weight (lbs)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="18"
                                        max="50"
                                        step="1"
                                        value={config.drawWeight}
                                        onChange={(e) => updateConfig('drawWeight', parseFloat(e.target.value))}
                                        className="flex-1 accent-primary-500"
                                    />
                                    <span className="w-16 text-center font-mono text-lg">{config.drawWeight}#</span>
                                </div>
                            </div>
                        </div>

                        {/* Bow Height & Brace Height */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm text-dark-400 mb-2">Bow Height</label>
                                <div className="flex gap-2">
                                    {bowHeights.map(h => (
                                        <button
                                            key={h}
                                            onClick={() => updateConfig('bowHeight', h)}
                                            className={`px-4 py-2 rounded-lg transition-all ${config.bowHeight === h
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-dark-700 hover:bg-dark-600'
                                                }`}
                                        >
                                            {h}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-dark-400 mb-2">Brace Height (inches)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="7"
                                        max="10"
                                        step="0.25"
                                        value={config.braceHeight}
                                        onChange={(e) => updateConfig('braceHeight', parseFloat(e.target.value))}
                                        className="flex-1 accent-primary-500"
                                    />
                                    <span className="w-16 text-center font-mono text-lg">{config.braceHeight}"</span>
                                </div>
                            </div>
                        </div>

                        {/* Tiller Settings */}
                        <div>
                            <label className="block text-sm text-dark-400 mb-3">Tiller Settings</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-dark-800/50 rounded-lg p-4">
                                    <p className="text-xs text-dark-400 mb-1">A-Tiller (Top)</p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={config.aTiller}
                                            onChange={(e) => updateConfig('aTiller', parseFloat(e.target.value))}
                                            className="w-20 bg-dark-700 rounded px-3 py-1 text-center"
                                            step="0.5"
                                        />
                                        <span className="text-dark-400">mm</span>
                                    </div>
                                </div>
                                <div className="bg-dark-800/50 rounded-lg p-4">
                                    <p className="text-xs text-dark-400 mb-1">B-Tiller (Bottom)</p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={config.bTiller}
                                            onChange={(e) => updateConfig('bTiller', parseFloat(e.target.value))}
                                            className="w-20 bg-dark-700 rounded px-3 py-1 text-center"
                                            step="0.5"
                                        />
                                        <span className="text-dark-400">mm</span>
                                    </div>
                                </div>
                                <div className="bg-dark-800/50 rounded-lg p-4">
                                    <p className="text-xs text-dark-400 mb-1">Diff Tiller</p>
                                    <p className={`text-lg font-bold ${tillerStatus === 'Positive' ? 'text-emerald-400' :
                                            tillerStatus === 'Negative' ? 'text-red-400' : 'text-amber-400'
                                        }`}>
                                        {diffTiller > 0 ? '+' : ''}{diffTiller} mm ({tillerStatus})
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Nocking Point */}
                        <div>
                            <label className="block text-sm text-dark-400 mb-2">Nocking Point (mm above square)</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="0.5"
                                    value={config.nockingPoint}
                                    onChange={(e) => updateConfig('nockingPoint', parseFloat(e.target.value))}
                                    className="flex-1 accent-primary-500"
                                />
                                <span className="w-16 text-center font-mono text-lg">{config.nockingPoint} mm</span>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Arrow Configuration */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card"
            >
                <button
                    onClick={() => setShowArrowSection(!showArrowSection)}
                    className="w-full flex items-center justify-between mb-4"
                >
                    <h2 className="text-lg font-semibold">Arrow Configuration</h2>
                    <ChevronDown className={`w-5 h-5 text-dark-400 transition-transform ${showArrowSection ? 'rotate-180' : ''}`} />
                </button>

                {showArrowSection && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm text-dark-400 mb-2">Arrow Spine</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="300"
                                        max="1200"
                                        step="50"
                                        value={config.arrowPoint}
                                        onChange={(e) => updateConfig('arrowPoint', parseInt(e.target.value))}
                                        className="flex-1 accent-primary-500"
                                    />
                                    <span className="w-16 text-center font-mono text-lg">{config.arrowPoint}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-dark-400 mb-2">Arrow Length (inches)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="26"
                                        max="32"
                                        step="0.5"
                                        value={config.arrowLength}
                                        onChange={(e) => updateConfig('arrowLength', parseFloat(e.target.value))}
                                        className="flex-1 accent-primary-500"
                                    />
                                    <span className="w-16 text-center font-mono text-lg">{config.arrowLength}"</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
