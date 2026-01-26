import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth, api } from '../context/AuthContext';
import { BarChart3, TrendingUp, Target, Calendar, Award } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Chart.js default options
ChartJS.defaults.color = '#94a3b8';
ChartJS.defaults.borderColor = 'rgba(148, 163, 184, 0.1)';

interface PerformanceData {
    labels: string[];
    scores: number[];
    averages: number[];
}

export default function AnalyticsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

    // Sample data - in production, fetch from API
    const [performanceData] = useState<PerformanceData>({
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        scores: [285, 312, 298, 325],
        averages: [8.2, 8.5, 8.3, 8.7],
    });

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    // Score Progression Line Chart
    const scoreProgressionData = {
        labels: performanceData.labels,
        datasets: [
            {
                label: 'Total Score',
                data: performanceData.scores,
                borderColor: 'rgb(14, 165, 233)',
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgb(14, 165, 233)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
            },
        ],
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                titleColor: '#f8fafc',
                bodyColor: '#94a3b8',
                borderColor: 'rgba(148, 163, 184, 0.2)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
            },
        },
        scales: {
            y: {
                beginAtZero: false,
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)',
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    };

    // Distance Performance Bar Chart
    const distanceData = {
        labels: ['18m', '30m', '50m', '70m'],
        datasets: [
            {
                label: 'Average Score',
                data: [9.2, 8.8, 8.1, 7.5],
                backgroundColor: [
                    'rgba(14, 165, 233, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                ],
                borderRadius: 8,
            },
        ],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 10,
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)',
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    };

    // Score Distribution Doughnut Chart
    const distributionData = {
        labels: ['10s (X)', '9s', '8s', '7 & below'],
        datasets: [
            {
                data: [35, 28, 22, 15],
                backgroundColor: [
                    'rgba(250, 204, 21, 0.8)',
                    'rgba(14, 165, 233, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(100, 116, 139, 0.8)',
                ],
                borderWidth: 0,
                hoverOffset: 4,
            },
        ],
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle',
                },
            },
        },
    };

    // Skill Radar Chart
    const skillData = {
        labels: ['Accuracy', 'Consistency', 'Grouping', 'Endurance', 'Focus', 'Technique'],
        datasets: [
            {
                label: 'Current',
                data: [85, 78, 82, 70, 88, 75],
                backgroundColor: 'rgba(14, 165, 233, 0.2)',
                borderColor: 'rgb(14, 165, 233)',
                borderWidth: 2,
                pointBackgroundColor: 'rgb(14, 165, 233)',
            },
            {
                label: 'Previous Month',
                data: [80, 72, 78, 68, 82, 70],
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                borderColor: 'rgb(139, 92, 246)',
                borderWidth: 2,
                pointBackgroundColor: 'rgb(139, 92, 246)',
            },
        ],
    };

    const radarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    stepSize: 20,
                    display: false,
                },
                grid: {
                    color: 'rgba(148, 163, 184, 0.2)',
                },
                angleLines: {
                    color: 'rgba(148, 163, 184, 0.2)',
                },
                pointLabels: {
                    color: '#94a3b8',
                    font: {
                        size: 12,
                    },
                },
            },
        },
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
        },
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold">Performance Analytics</h1>
                    <p className="text-dark-400">Track your progress and improve your game</p>
                </div>
                <div className="flex gap-2">
                    {(['week', 'month', 'year'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${timeRange === range
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-dark-800 text-dark-400 hover:text-white'
                                }`}
                        >
                            {range.charAt(0).toUpperCase() + range.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Sessions', value: '24', change: '+5', icon: Calendar, color: 'text-primary-400' },
                    { label: 'Arrows Shot', value: '1,440', change: '+180', icon: Target, color: 'text-emerald-400' },
                    { label: 'Average Score', value: '8.7', change: '+0.3', icon: TrendingUp, color: 'text-amber-400' },
                    { label: 'Best Session', value: '325', change: 'PB!', icon: Award, color: 'text-purple-400' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="card"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            <span className="text-dark-400 text-sm">{stat.label}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-display font-bold">{stat.value}</span>
                            <span className="text-emerald-400 text-sm font-medium">{stat.change}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Score Progression */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card"
                >
                    <h3 className="text-lg font-semibold mb-4">Score Progression</h3>
                    <div className="h-64">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <Line data={scoreProgressionData} options={lineOptions} />
                        )}
                    </div>
                </motion.div>

                {/* Performance by Distance */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card"
                >
                    <h3 className="text-lg font-semibold mb-4">Performance by Distance</h3>
                    <div className="h-64">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <Bar data={distanceData} options={barOptions} />
                        )}
                    </div>
                </motion.div>

                {/* Score Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="card"
                >
                    <h3 className="text-lg font-semibold mb-4">Score Distribution</h3>
                    <div className="h-64">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <Doughnut data={distributionData} options={doughnutOptions} />
                        )}
                    </div>
                </motion.div>

                {/* Skill Analysis */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="card"
                >
                    <h3 className="text-lg font-semibold mb-4">Skill Analysis</h3>
                    <div className="h-64">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <Radar data={skillData} options={radarOptions} />
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Monthly Comparison */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="card"
            >
                <h3 className="text-lg font-semibold mb-4">Monthly Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Sessions', current: 24, previous: 19, unit: '' },
                        { label: 'Arrows Shot', current: 1440, previous: 1260, unit: '' },
                        { label: 'Average Score', current: 8.7, previous: 8.4, unit: '/10' },
                        { label: 'Consistency', current: 82, previous: 77, unit: '%' },
                    ].map((item) => {
                        const change = ((item.current - item.previous) / item.previous * 100).toFixed(1);
                        const isPositive = item.current > item.previous;

                        return (
                            <div key={item.label} className="p-4 rounded-xl bg-dark-800/50 text-center">
                                <p className="text-dark-400 text-sm mb-1">{item.label}</p>
                                <p className="text-2xl font-display font-bold">
                                    {item.current.toLocaleString()}{item.unit}
                                </p>
                                <p className={`text-sm mt-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {isPositive ? '+' : ''}{change}% vs last month
                                </p>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}
