import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ArrowUpRight } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface IndexArrowTimelineWidgetProps {
    data: any; // Using any for now to match Dashboard.tsx structure, can refine later
    period: 'today' | 'week' | 'month';
    onPeriodChange: (period: 'today' | 'week' | 'month') => void;
    onConfigClick: (config: any) => void;
}

const IndexArrowTimelineWidget: React.FC<IndexArrowTimelineWidgetProps> = ({
    data,
    period,
    onPeriodChange,
    onConfigClick
}) => {

    // Config for Chart options
    const chartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (_event: any, elements: any[]) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                // logic for "Today" view markers
                if (data.configMarkers && data.configMarkers.length > 0) {
                    const marker = data.configMarkers.find((m: any) => m.index === index);
                    if (marker) onConfigClick(marker.config);
                } else if (data.configData) {
                    // logic for Week/Month
                    const item = data.configData[index];
                    if (item?.hasConfigChange) onConfigClick(item.config);
                }
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    afterLabel: (context: any) => {
                        const index = context.dataIndex;
                        let hasChange = false;
                        if (data.configMarkers) {
                            hasChange = data.configMarkers.some((m: any) => m.index === index);
                        } else if (data.configData) {
                            hasChange = data.configData[index]?.hasConfigChange;
                        }

                        if (hasChange) return '⚙️ Config changed - Click to view';
                        return '';
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                min: 7,
                max: 10,
                grid: { color: 'rgba(255,255,255,0.1)' },
                ticks: { color: '#9ca3af', font: { size: 10 } },
            },
            x: {
                grid: { display: false },
                ticks: { color: '#9ca3af', font: { size: 10 } },
            },
        },
    };

    return (
        <div className="card h-[400px] flex flex-col p-4 bg-dark-800 border-dark-700">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <ArrowUpRight className="w-5 h-5 text-primary-400" />
                        Index Arrow Timeline
                    </h3>
                    <p className="text-sm text-dark-400">Average score consistency</p>
                </div>

                {/* Period Selector */}
                <div className="flex bg-dark-900 rounded-lg p-1 border border-dark-700">
                    {(['today', 'week', 'month'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => onPeriodChange(p)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${period === p
                                    ? 'bg-primary-500 text-white shadow-lg'
                                    : 'text-dark-400 hover:text-white hover:bg-dark-800'
                                }`}
                        >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 min-h-0 relative">
                <Line data={data} options={chartOptions} />
            </div>

            <div className="mt-4 flex items-center gap-4 text-xs text-dark-400 justify-center">
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                    <span>Score Trend</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Config Change</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 border-t border-dashed border-white/50"></span>
                    <span>Benchmark</span>
                </div>
            </div>
        </div>
    );
};

export default IndexArrowTimelineWidget;
