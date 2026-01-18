import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Shot {
    x: number;
    y: number;
    value: number;
}

interface ShotDistributionChartProps {
    data: {
        '10+X': number;
        '9': number;
        '8': number;
        '7 & below': number;
    }[];
}

// Since we don't have X/Y coordinates yet, we'll visualize the score distribution as a "Heatmap" proxy using a Scatter chart
// mapped to concentric rings.
// 10 = Center (0,0), 9 = Ring 1, etc.

const generateHeatmapData = (distribution: any[]) => {
    // This is a visualization hack to show distribution on a target face
    // In a real app with X/Y data, we'd plot actual points. 
    // Here we generate random points within the ring for each score count to simulate the density.

    const points: Shot[] = [];
    const dist = distribution[0] || {};

    const addPoints = (count: number, minR: number, maxR: number, val: number) => {
        for (let i = 0; i < Math.min(count, 50); i++) { // Limit points for performance
            const angle = Math.random() * 2 * Math.PI;
            const r = Math.sqrt(Math.random() * (maxR * maxR - minR * minR) + minR * minR);
            points.push({
                x: r * Math.cos(angle),
                y: r * Math.sin(angle),
                value: val
            });
        }
    };

    addPoints(dist['10+X'], 0, 10, 10);
    addPoints(dist['9'], 10, 20, 9);
    addPoints(dist['8'], 20, 30, 8);
    // ... extend if needed

    return points;
};

export default function ShotDistributionChart({ data }: ShotDistributionChartProps) {
    const points = generateHeatmapData(data);

    return (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                {/* Target Face Background */}
                <div className="w-[300px] h-[300px] rounded-full border-[20px] border-white flex items-center justify-center">
                    <div className="w-[260px] h-[260px] rounded-full border-[20px] border-black flex items-center justify-center">
                        <div className="w-[220px] h-[220px] rounded-full border-[20px] border-blue-500 flex items-center justify-center">
                            <div className="w-[180px] h-[180px] rounded-full border-[20px] border-red-500 flex items-center justify-center">
                                <div className="w-[140px] h-[140px] rounded-full border-[40px] border-yellow-400 bg-yellow-400"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-4 z-10 relative">Shot Density</h3>
            <div className="h-[300px] w-full z-10 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <XAxis type="number" dataKey="x" name="x" hide domain={[-50, 50]} />
                        <YAxis type="number" dataKey="y" name="y" hide domain={[-50, 50]} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter name="Arrows" data={points} fill="#8884d8">
                            {points.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.value === 10 ? '#FFD700' : entry.value === 9 ? '#C0C0C0' : '#CD7F32'} />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
            <p className="text-center text-xs text-dark-400 mt-2">Simulated distribution based on score counts</p>
        </div>
    );
}
