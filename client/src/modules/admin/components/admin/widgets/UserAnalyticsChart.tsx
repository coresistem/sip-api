import { useState, useEffect } from 'react';
import { api } from '@/modules/core/contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, Users, LogIn, UserPlus } from 'lucide-react';

type DateRange = 'daily' | 'weekly' | 'monthly' | 'custom';

interface DataPoint {
    date: string;
    count: number;
}

interface ChartData {
    date: string;
    newUsers: number;
    logins: number;
    onboardVisits: number;
}

interface UserStatsResponse {
    newUsers: DataPoint[];
    logins: DataPoint[];
    onboardVisits: DataPoint[];
    range: string;
    startDate: string;
    endDate: string;
}

export default function UserAnalyticsChart() {
    const [range, setRange] = useState<DateRange>('daily');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState(true);
    const [totals, setTotals] = useState({ newUsers: 0, logins: 0, onboardVisits: 0 });

    useEffect(() => {
        fetchData();
    }, [range, customFrom, customTo]);

    const fetchData = async () => {
        try {
            setLoading(true);
            let url = `/analytics/user-stats?range=${range}`;
            if (range === 'custom' && customFrom && customTo) {
                url = `/analytics/user-stats?from=${customFrom}&to=${customTo}`;
            }

            const response = await api.get<{ success: boolean; data: UserStatsResponse }>(url);
            if (response.data.success) {
                const { newUsers, logins, onboardVisits } = response.data.data;

                // Merge data into a single timeline
                const dateMap = new Map<string, ChartData>();

                // Initialize with all dates from any dataset
                [...newUsers, ...logins, ...onboardVisits].forEach(item => {
                    const dateKey = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    if (!dateMap.has(dateKey)) {
                        dateMap.set(dateKey, { date: dateKey, newUsers: 0, logins: 0, onboardVisits: 0 });
                    }
                });

                // Fill in values
                newUsers.forEach(item => {
                    const dateKey = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const existing = dateMap.get(dateKey);
                    if (existing) existing.newUsers = item.count;
                });

                logins.forEach(item => {
                    const dateKey = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const existing = dateMap.get(dateKey);
                    if (existing) existing.logins = item.count;
                });

                onboardVisits.forEach(item => {
                    const dateKey = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const existing = dateMap.get(dateKey);
                    if (existing) existing.onboardVisits = item.count;
                });

                // Sort by date and convert to array
                const sortedData = Array.from(dateMap.values());

                setChartData(sortedData);
                setTotals({
                    newUsers: newUsers.reduce((acc, curr) => acc + curr.count, 0),
                    logins: logins.reduce((acc, curr) => acc + curr.count, 0),
                    onboardVisits: onboardVisits.reduce((acc, curr) => acc + curr.count, 0),
                });
            }
        } catch (error) {
            console.error('Failed to fetch user stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card p-4">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary-400" />
                    User Analytics
                </h3>

                {/* Range Selector */}
                <div className="flex items-center gap-2 flex-wrap">
                    {(['daily', 'weekly', 'monthly'] as DateRange[]).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${range === r
                                ? 'bg-primary-500 text-white'
                                : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                                }`}
                        >
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                    ))}
                    <button
                        onClick={() => setRange('custom')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${range === 'custom'
                            ? 'bg-primary-500 text-white'
                            : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                            }`}
                    >
                        <Calendar size={14} />
                        Custom
                    </button>
                </div>
            </div>

            {/* Custom Date Inputs */}
            {range === 'custom' && (
                <div className="flex items-center gap-2 mb-4">
                    <input
                        type="date"
                        value={customFrom}
                        onChange={(e) => setCustomFrom(e.target.value)}
                        className="px-3 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-sm focus:border-primary-500 focus:outline-none"
                    />
                    <span className="text-dark-400">to</span>
                    <input
                        type="date"
                        value={customTo}
                        onChange={(e) => setCustomTo(e.target.value)}
                        className="px-3 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-sm focus:border-primary-500 focus:outline-none"
                    />
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-dark-700/50 rounded-lg p-3 text-center">
                    <UserPlus className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                    <p className="text-xs text-dark-400">New Users</p>
                    <p className="text-xl font-bold text-emerald-400">{totals.newUsers}</p>
                </div>
                <div className="bg-dark-700/50 rounded-lg p-3 text-center">
                    <LogIn className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                    <p className="text-xs text-dark-400">Logins</p>
                    <p className="text-xl font-bold text-blue-400">{totals.logins}</p>
                </div>
                <div className="bg-dark-700/50 rounded-lg p-3 text-center">
                    <Users className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                    <p className="text-xs text-dark-400">Onboard Visits</p>
                    <p className="text-xl font-bold text-purple-400">{totals.onboardVisits}</p>
                </div>
            </div>

            {/* Chart */}
            <div className="h-64">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-dark-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-dark-400">
                        No data available for this period
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="date"
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                axisLine={{ stroke: '#374151' }}
                            />
                            <YAxis
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                axisLine={{ stroke: '#374151' }}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                }}
                                labelStyle={{ color: '#F3F4F6' }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="newUsers"
                                name="New Users"
                                stroke="#10B981"
                                strokeWidth={2}
                                dot={{ fill: '#10B981', strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="logins"
                                name="Logins"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="onboardVisits"
                                name="Onboard Visits"
                                stroke="#A855F7"
                                strokeWidth={2}
                                dot={{ fill: '#A855F7', strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
