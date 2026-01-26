import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceArea, Legend } from 'recharts';
import { Info } from 'lucide-react';

interface ACWRChartProps {
    data: {
        date: string;
        acuteLoad: number;
        chronicLoad: number;
        acwr: number;
    }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-dark-800 border border-dark-700 p-3 rounded-lg shadow-xl">
                <p className="text-white font-medium mb-2">{label}</p>
                <div className="space-y-1 text-sm">
                    <p className="text-blue-400">Acute Load: {payload[0].value}</p>
                    <p className="text-purple-400">Chronic Load: {payload[1].value}</p>
                    <p className="text-green-400 font-bold">ACWR: {payload[2].value}</p>
                </div>
            </div>
        );
    }
    return null;
};

export default function ACWRChart({ data }: ACWRChartProps) {
    return (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        Load Monitoring (ACWR)
                        <div className="group relative">
                            <Info className="w-4 h-4 text-dark-400 cursor-help" />
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-black/90 text-xs text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                Acute:Chronic Workload Ratio helps prevent injury. Keep your ratio between 0.8 and 1.3 (Green Zone) for optimal performance.
                            </div>
                        </div>
                    </h3>
                    <p className="text-sm text-dark-400">7-day vs 28-day workload analysis</p>
                </div>

                <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500/20 border border-green-500/50 rounded" />
                        <span className="text-dark-300">Safe Zone (0.8-1.3)</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500/20 border border-red-500/50 rounded" />
                        <span className="text-dark-300">Danger Zone (&gt;1.5)</span>
                    </div>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#666"
                            tick={{ fill: '#666', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            yAxisId="left"
                            stroke="#666"
                            tick={{ fill: '#666', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            label={{ value: 'Load (AU)', angle: -90, position: 'insideLeft', fill: '#444' }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            domain={[0, 2.5]}
                            stroke="#666"
                            tick={{ fill: '#666', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            label={{ value: 'Ratio', angle: 90, position: 'insideRight', fill: '#444' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />

                        {/* Safe Zone Background */}
                        <ReferenceArea yAxisId="right" y1={0.8} y2={1.3} fill="#22c55e" fillOpacity={0.05} />
                        <ReferenceArea yAxisId="right" y1={1.5} y2={2.5} fill="#ef4444" fillOpacity={0.05} />

                        <Bar yAxisId="left" dataKey="acuteLoad" name="Acute Load (7d)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} fillOpacity={0.3} />
                        <Line yAxisId="left" type="monotone" dataKey="chronicLoad" name="Chronic Load (28d)" stroke="#a855f7" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                        <Line yAxisId="right" type="monotone" dataKey="acwr" name="AC Ratio" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
