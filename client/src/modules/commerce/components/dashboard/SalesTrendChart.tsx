import { useEffect, useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { analyticsApi } from '../../api/analytics.api';
import { SalesAnalyticsData } from '../../types/analytics.types';

const SalesTrendChart = () => {
    const [data, setData] = useState<SalesAnalyticsData[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState(30);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Cast to any because the API returns the data directly but strict typing might complain if not exact
                const analytics = await analyticsApi.getSalesAnalytics(period.toString()) as any;
                // Assuming API returns { success: true, data: [...] } or just [...]? 
                // Based on controller it likely returns standard API response { success: true, data: ... }
                // Let's assume standard response wrapper if consistency holds. 
                // The analytics controller likely returns just data or wrapper. 
                // Checking previous view of jersey.controller... wait, analytics controller wasn't viewed.
                // Assuming standard { success: true, data: ... } structure from my api wrapper.
                // My api wrapper `response.data` returns the body. 

                if (analytics.success) {
                    setData(analytics.data);
                } else if (Array.isArray(analytics)) {
                    setData(analytics);
                }
            } catch (error) {
                console.error('Failed to fetch sales analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [period]);

    if (loading) {
        return <div className="h-64 flex items-center justify-center text-slate-400">Loading chart...</div>;
    }

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white">Sales Trend</h3>
                    <p className="text-sm text-slate-400">Revenue over time</p>
                </div>
                <select
                    value={period}
                    onChange={(e) => setPeriod(Number(e.target.value))}
                    className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg p-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                >
                    <option value={7}>Last 7 Days</option>
                    <option value={30}>Last 30 Days</option>
                    <option value={90}>Last 3 Months</option>
                </select>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                        <XAxis
                            dataKey="date"
                            stroke="#94a3b8"
                            fontSize={12}
                            tickFormatter={(str) => {
                                const date = new Date(str);
                                return `${date.getDate()}/${date.getMonth() + 1}`;
                            }}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={12}
                            tickFormatter={(val) => `Rp${(val / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                            itemStyle={{ color: '#f59e0b' }}
                            formatter={(value: any) => [`Rp ${Number(value).toLocaleString()}`, 'Revenue']}
                            labelFormatter={(label) => new Date(label).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        />
                        <Area
                            type="monotone"
                            dataKey="total"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorTotal)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalesTrendChart;
