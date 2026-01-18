import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X } from 'lucide-react';
import IndexArrowTimelineWidget from './IndexArrowTimelineWidget';

// Logic lifted from original Dashboard.tsx to make this widget self-contained for Factory Demo

interface ConfigLog {
    id: string;
    date: string;
    arrowsPerEnd: number;
    indexArrowScore: number;
    hasConfigChange: boolean;
    config?: {
        drawLength: number;
        drawWeight: number;
        bowHeight: string;
        braceHeight: number;
        aTiller: number;
        bTiller: number;
        nockingPoint: number;
        arrowPoint: number;
        arrowLength: number;
    };
}

// Sample data helpers
const sampleTodayData = [
    { end: 1, indexScore: 9.17, hasConfigChange: false },
    { end: 2, indexScore: 9.00, hasConfigChange: false },
    { end: 3, indexScore: 9.17, hasConfigChange: true, config: { drawLength: 28, drawWeight: 32, bowHeight: '68"', braceHeight: 8.5, aTiller: 3, bTiller: 0, nockingPoint: 3, arrowPoint: 100, arrowLength: 29 } },
    { end: 4, indexScore: 9.17, hasConfigChange: false },
    { end: 5, indexScore: 9.50, hasConfigChange: false },
    { end: 6, indexScore: 9.17, hasConfigChange: false },
];

const sampleWeekData: ConfigLog[] = [
    { id: '1', date: '2025-12-30', arrowsPerEnd: 6, indexArrowScore: 8.5, hasConfigChange: false },
    { id: '2', date: '2025-12-31', arrowsPerEnd: 6, indexArrowScore: 8.7, hasConfigChange: false },
    { id: '3', date: '2026-01-01', arrowsPerEnd: 6, indexArrowScore: 8.3, hasConfigChange: true, config: { drawLength: 28, drawWeight: 32, bowHeight: '68"', braceHeight: 8.5, aTiller: 3, bTiller: 0, nockingPoint: 3, arrowPoint: 100, arrowLength: 29 } },
    { id: '4', date: '2026-01-02', arrowsPerEnd: 6, indexArrowScore: 9.0, hasConfigChange: false },
    { id: '5', date: '2026-01-03', arrowsPerEnd: 6, indexArrowScore: 8.8, hasConfigChange: true, config: { drawLength: 29, drawWeight: 34, bowHeight: '68"', braceHeight: 8.5, aTiller: 2, bTiller: 0, nockingPoint: 2, arrowPoint: 100, arrowLength: 29 } },
    { id: '6', date: '2026-01-04', arrowsPerEnd: 6, indexArrowScore: 9.2, hasConfigChange: false },
    { id: '7', date: '2026-01-05', arrowsPerEnd: 6, indexArrowScore: 9.3, hasConfigChange: false },
];

const generateMonthData = (): ConfigLog[] => {
    const data: ConfigLog[] = [];
    const baseDate = new Date('2026-01-05');
    for (let i = 29; i >= 0; i--) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() - i);
        const hasChange = i === 25 || i === 15 || i === 5;
        data.push({
            id: String(30 - i),
            date: date.toISOString().split('T')[0],
            arrowsPerEnd: 6,
            indexArrowScore: 8.0 + Math.random() * 1.5,
            hasConfigChange: hasChange,
            config: hasChange ? { drawLength: 28 + Math.floor(Math.random() * 2), drawWeight: 32 + Math.floor(Math.random() * 4), bowHeight: '68"', braceHeight: 8.5, aTiller: 3, bTiller: 0, nockingPoint: Math.floor(Math.random() * 5), arrowPoint: 100, arrowLength: 29 } : undefined,
        });
    }
    return data;
};
const sampleMonthData = generateMonthData();

const IndexArrowTimelineSmart: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
    const [selectedConfig, setSelectedConfig] = useState<ConfigLog['config'] | null>(null);
    const [showConfigPopup, setShowConfigPopup] = useState(false);

    // Helpers
    const nockingPointStatus = (val: number) => val > 0 ? 'Positive' : val < 0 ? 'Negative' : 'Neutral';
    const diffTiller = (a: number, b: number) => a - b;

    const getChartData = () => {
        if (selectedPeriod === 'today') {
            return {
                labels: sampleTodayData.map(d => `E${d.end}`),
                datasets: [{
                    label: 'Index Arrow Score',
                    data: sampleTodayData.map(d => d.indexScore),
                    borderColor: '#0ea5e9',
                    backgroundColor: 'rgba(14, 165, 233, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: sampleTodayData.map(d => d.hasConfigChange ? 8 : 4),
                    pointBackgroundColor: sampleTodayData.map(d => d.hasConfigChange ? '#f59e0b' : '#0ea5e9'),
                    pointBorderColor: sampleTodayData.map(d => d.hasConfigChange ? '#f59e0b' : '#0ea5e9'),
                    pointBorderWidth: sampleTodayData.map(d => d.hasConfigChange ? 3 : 1),
                }],
                configMarkers: sampleTodayData.filter(d => d.hasConfigChange).map(d => ({ index: d.end - 1, config: d.config })),
            };
        } else if (selectedPeriod === 'week') {
            return {
                labels: sampleWeekData.map(d => new Date(d.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' })),
                datasets: [{
                    label: 'Index Arrow Score',
                    data: sampleWeekData.map(d => d.indexArrowScore),
                    borderColor: '#0ea5e9',
                    backgroundColor: 'rgba(14, 165, 233, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: sampleWeekData.map(d => d.hasConfigChange ? 8 : 4),
                    pointBackgroundColor: sampleWeekData.map(d => d.hasConfigChange ? '#f59e0b' : '#0ea5e9'),
                    pointBorderColor: sampleWeekData.map(d => d.hasConfigChange ? '#f59e0b' : '#0ea5e9'),
                    pointBorderWidth: sampleWeekData.map(d => d.hasConfigChange ? 3 : 1),
                }],
                configData: sampleWeekData,
            };
        } else {
            return {
                labels: sampleMonthData.map(d => new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric' })),
                datasets: [{
                    label: 'Index Arrow Score',
                    data: sampleMonthData.map(d => d.indexArrowScore),
                    borderColor: '#0ea5e9',
                    backgroundColor: 'rgba(14, 165, 233, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: sampleMonthData.map(d => d.hasConfigChange ? 8 : 3),
                    pointBackgroundColor: sampleMonthData.map(d => d.hasConfigChange ? '#f59e0b' : '#0ea5e9'),
                    pointBorderColor: sampleMonthData.map(d => d.hasConfigChange ? '#f59e0b' : '#0ea5e9'),
                    pointBorderWidth: sampleMonthData.map(d => d.hasConfigChange ? 3 : 1),
                }],
                configData: sampleMonthData,
            };
        }
    };

    return (
        <>
            <AnimatePresence>
                {showConfigPopup && selectedConfig && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setShowConfigPopup(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-dark-900 rounded-2xl p-5 w-full max-w-md border border-dark-700 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-amber-400" />
                                    Equipment Config
                                </h3>
                                <button onClick={() => setShowConfigPopup(false)} className="p-2 rounded-lg hover:bg-dark-800">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="p-3 rounded-lg bg-dark-800 grid grid-cols-2 gap-4">
                                    <div><span className="text-xs text-dark-400">Draw Weight</span><p className="font-bold">{selectedConfig.drawWeight} lbs</p></div>
                                    <div><span className="text-xs text-dark-400">Bow Height</span><p className="font-bold">{selectedConfig.bowHeight}</p></div>
                                    <div><span className="text-xs text-dark-400">Nocking Point</span>
                                        <p className="font-bold text-amber-400">{selectedConfig.nockingPoint} mm ({nockingPointStatus(selectedConfig.nockingPoint)})</p>
                                    </div>
                                    <div><span className="text-xs text-dark-400">Tiller Diff</span>
                                        <p className="font-bold text-amber-400">{diffTiller(selectedConfig.aTiller, selectedConfig.bTiller)} mm</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <IndexArrowTimelineWidget
                data={getChartData()}
                period={selectedPeriod}
                onPeriodChange={setSelectedPeriod}
                onConfigClick={(config) => {
                    setSelectedConfig(config);
                    setShowConfigPopup(true);
                }}
            />
        </>
    );
};

export default IndexArrowTimelineSmart;
