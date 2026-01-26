import React, { useState } from 'react';
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
import { Activity, Info } from 'lucide-react';

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

const BMITimelineWidget: React.FC = () => {
    const [period, setPeriod] = useState<'month' | 'year'>('month');

    // Mock Data for BMI
    const mockData = {
        month: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            data: [22.4, 22.3, 22.1, 22.0]
        },
        year: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            data: [23.5, 23.2, 22.8, 22.5, 22.4, 22.0]
        }
    };

    const currentData = period === 'month' ? mockData.month : mockData.year;

    const data = {
        labels: currentData.labels,
        datasets: [
            {
                label: 'BMI',
                data: currentData.data,
                borderColor: '#10b981', // Emerald
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#10b981',
            },
            {
                label: 'Healthy Range (Max)',
                data: currentData.labels.map(() => 24.9),
                borderColor: 'rgba(255, 255, 255, 0.3)',
                borderWidth: 1,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
            },
            {
                label: 'Healthy Range (Min)',
                data: currentData.labels.map(() => 18.5),
                borderColor: 'rgba(255, 255, 255, 0.3)',
                borderWidth: 1,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context: any) => `BMI: ${context.raw}`
                }
            }
        },
        scales: {
            y: {
                min: 15,
                max: 30,
                grid: { color: 'rgba(255,255,255,0.1)' },
                ticks: { color: '#9ca3af' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#9ca3af' }
            }
        }
    };

    return (
        <div className="card h-[400px] flex flex-col p-4 bg-dark-800 border-dark-700">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-400" />
                        BMI Timeline
                    </h3>
                    <p className="text-sm text-dark-400">Body Mass Index Tracking</p>
                </div>

                <div className="flex bg-dark-900 rounded-lg p-1 border border-dark-700">
                    {(['month', 'year'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${period === p
                                    ? 'bg-emerald-500 text-white shadow-lg'
                                    : 'text-dark-400 hover:text-white hover:bg-dark-800'
                                }`}
                        >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 min-h-0 relative">
                <Line data={data} options={options} />
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-dark-400">
                <Info size={14} />
                <span>Normal BMI Range: 18.5 - 24.9</span>
            </div>
        </div>
    );
};

export default BMITimelineWidget;
