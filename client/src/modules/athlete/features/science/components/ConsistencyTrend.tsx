import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface ConsistencyTrendProps {
    data: {
        date: string;
        xCount: number;
    }[];
}

export default function ConsistencyTrend({ data }: ConsistencyTrendProps) {
    return (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">Precision Trend</h3>
            <p className="text-sm text-dark-400 mb-6">Tracking 10s and Xs over last 5 sessions</p>

            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorX" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#666"
                            tick={{ fill: '#666', fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#666"
                            tick={{ fill: '#666', fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                            itemStyle={{ color: '#fbbf24' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="xCount"
                            name="10s + Xs"
                            stroke="#fbbf24"
                            fillOpacity={1}
                            fill="url(#colorX)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
