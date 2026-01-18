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
import { getSalesAnalytics, SalesAnalyticsData } from '../../../../services/jerseyApi';
import { formatCurrency } from '../../../../services/jerseyApi';

const SalesTrendChart = () => {
    const [data, setData] = useState<SalesAnalyticsData[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState(30);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const analytics = await getSalesAnalytics(period);
                setData(analytics);
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
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white">Sales Trend</h3>
                    <p className="text-sm text-slate-400">Revenue over time</p>
                </div>
                <select
                    value={period}
                    onChange={(e) => setPeriod(Number(e.target.value))}
                    className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg p-2 focus:ring-cyan-500 focus:border-cyan-500"
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
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
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
                            itemStyle={{ color: '#06b6d4' }}
                            formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']}
                            labelFormatter={(label) => new Date(label).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        />
                        <Area
                            type="monotone"
                            dataKey="total"
                            stroke="#06b6d4"
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
