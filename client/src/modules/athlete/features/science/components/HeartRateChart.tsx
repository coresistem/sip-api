import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface HeartRateChartProps {
    data: {
        date: string;
        restingHR: number | null;
        hrv: number | null;
        vo2Max: number | null;
        load: number;
    }[];
}

export default function HeartRateChart({ data }: HeartRateChartProps) {
    return (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">Physiological Recovery</h3>
            <p className="text-sm text-dark-400 mb-6">Resting Heart Rate vs Training Load</p>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#666"
                            tick={{ fill: '#666', fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            yAxisId="left"
                            stroke="#ef4444"
                            tick={{ fill: '#ef4444', fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            domain={[40, 100]}
                            label={{ value: 'RHR (bpm)', angle: -90, position: 'insideLeft', fill: '#ef4444' }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#3b82f6"
                            tick={{ fill: '#3b82f6', fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            label={{ value: 'Load (AU)', angle: 90, position: 'insideRight', fill: '#3b82f6' }}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />

                        <Bar yAxisId="right" dataKey="load" name="Training Load" fill="#3b82f6" opacity={0.3} barSize={20} radius={[4, 4, 0, 0]} />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="restingHR"
                            name="Resting HR"
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={{ fill: '#ef4444', r: 4 }}
                        />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="hrv"
                            name="HRV (ms)"
                            stroke="#10b981"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                        />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="vo2Max"
                            name="VO2 Max"
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            dot={{ fill: '#8b5cf6', r: 6, strokeWidth: 2, stroke: '#fff' }}
                            connectNulls={false}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-dark-700/30 rounded-lg border border-dark-700">
                <h4 className="text-sm font-semibold text-white mb-2">Insight</h4>
                <p className="text-xs text-dark-400">
                    A trend of rising Resting HR coupled with falling HRV often indicates accumulated fatigue or overtraining.
                    Ensure recovery days (Load = 0) to allow your body to adapt.
                </p>
            </div>
        </div>
    );
}
