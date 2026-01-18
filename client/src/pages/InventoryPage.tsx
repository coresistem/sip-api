import { motion } from 'framer-motion';
import { Package, Plus, Wrench, AlertTriangle } from 'lucide-react';

export default function InventoryPage() {
    const assets = [
        { id: 1, name: 'Recurve Bow - Hoyt Formula', category: 'Bow', status: 'Available', condition: 'Excellent' },
        { id: 2, name: 'Carbon Arrows (12 pcs)', category: 'Arrow', status: 'In Use', condition: 'Good' },
        { id: 3, name: 'Target Face 80cm', category: 'Target', status: 'Maintenance', condition: 'Fair' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold">Inventory</h1>
                    <p className="text-dark-400">Track club equipment and assets</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={18} />
                    Add Asset
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Total Assets', value: 156, color: 'text-primary-400' },
                    { label: 'Needs Maintenance', value: 8, color: 'text-amber-400' },
                    { label: 'In Use', value: 42, color: 'text-emerald-400' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="card text-center"
                    >
                        <p className={`text-3xl font-display font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-dark-400 mt-1">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card"
            >
                <h3 className="text-lg font-semibold mb-4">Equipment List</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-dark-400 text-sm border-b border-dark-700">
                                <th className="pb-3">Item</th>
                                <th className="pb-3">Category</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3">Condition</th>
                                <th className="pb-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {assets.map((asset) => (
                                <tr key={asset.id} className="border-b border-dark-800 hover:bg-dark-800/50">
                                    <td className="py-3 font-medium">{asset.name}</td>
                                    <td className="py-3 text-dark-400">{asset.category}</td>
                                    <td className="py-3">
                                        <span className={`badge ${asset.status === 'Available' ? 'badge-success' :
                                                asset.status === 'In Use' ? 'badge-primary' : 'badge-warning'
                                            }`}>
                                            {asset.status}
                                        </span>
                                    </td>
                                    <td className="py-3 text-dark-400">{asset.condition}</td>
                                    <td className="py-3">
                                        <button className="btn btn-ghost text-sm py-1">
                                            <Wrench size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
