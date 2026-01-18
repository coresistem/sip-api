import React, { useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { TrendingUp } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const TrainingPerformanceWidget: React.FC = () => {
    const [period, setPeriod] = useState<'week' | 'month'>('week');

    // Mock Data
    const mockData = {
        week: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Arrows Shot',
                    data: [120, 144, 100, 0, 150, 200, 96],
                    backgroundColor: 'rgba(56, 189, 248, 0.5)', // Sky 400
                    borderColor: '#38bdf8',
                    borderWidth: 1,
                },
                {
                    label: 'Avg Score',
                    data: [8.5, 8.7, 8.4, 0, 8.9, 9.1, 8.6],
                    type: 'line' as const,
                    borderColor: '#f59e0b', // Amber
                    borderWidth: 2,
                    yAxisID: 'y1',
                    order: 0
                }
            ]
        },
        month: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [
                {
                    label: 'Arrows Shot',
                    data: [850, 920, 780, 890],
                    backgroundColor: 'rgba(56, 189, 248, 0.5)',
                    borderColor: '#38bdf8',
                    borderWidth: 1,
                },
                {
                    label: 'Avg Score',
                    data: [8.7, 8.8, 8.6, 8.9],
                    type: 'line' as const,
                    borderColor: '#f59e0b',
                    borderWidth: 2,
                    yAxisID: 'y1',
                    order: 0
                }
            ]
        }
    };

    const currentData = period === 'week' ? mockData.week : mockData.month;

    const data: any = {
        labels: currentData.labels,
        datasets: currentData.datasets
    };

    const options: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' as const, labels: { color: '#9ca3af' } },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(255,255,255,0.1)' },
                ticks: { color: '#9ca3af' },
                title: { display: true, text: 'Arrows Volume', color: '#9ca3af' }
            },
            y1: {
                type: 'linear' as const,
                display: true,
                position: 'right' as const,
                grid: { drawOnChartArea: false },
                ticks: { color: '#f59e0b' },
                min: 6,
                max: 10,
                title: { display: true, text: 'Avg Score', color: '#f59e0b' }
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
                        <TrendingUp className="w-5 h-5 text-sky-400" />
                        Training Performance
                    </h3>
                    <p className="text-sm text-dark-400">Volume vs Score Correlation</p>
                </div>

                <div className="flex bg-dark-900 rounded-lg p-1 border border-dark-700">
                    {(['week', 'month'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${period === p
                                ? 'bg-sky-500 text-white shadow-lg'
                                : 'text-dark-400 hover:text-white hover:bg-dark-800'
                                }`}
                        >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 min-h-0 relative">
                <Bar data={data} options={options} />
            </div>
        </div>
    );
};

export default TrainingPerformanceWidget;
