import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function FinancePage() {
    const { user } = useAuth();

    if (user?.role === 'PARENT' || user?.role === 'ATHLETE') {
        return <Navigate to="/payments" replace />;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-display font-bold">Financial Dashboard</h1>
                <p className="text-dark-400">Manage payments and billing</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Revenue', value: 'Rp 45.2M', icon: TrendingUp, color: 'from-emerald-500 to-teal-400' },
                    { label: 'Pending', value: 'Rp 8.5M', icon: Clock, color: 'from-amber-500 to-orange-400' },
                    { label: 'Verified', value: 'Rp 36.7M', icon: CheckCircle2, color: 'from-blue-500 to-cyan-400' },
                    { label: 'This Month', value: 'Rp 12.3M', icon: Wallet, color: 'from-purple-500 to-pink-400' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="card"
                    >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                            <stat.icon className="text-white" size={20} />
                        </div>
                        <p className="text-dark-400 text-sm">{stat.label}</p>
                        <p className="text-xl font-display font-bold mt-1">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card"
            >
                <h3 className="text-lg font-semibold mb-4">Recent Payments</h3>
                <div className="text-center py-12">
                    <Wallet className="w-16 h-16 mx-auto mb-4 text-dark-500" />
                    <p className="text-dark-400">No payment records to display</p>
                </div>
            </motion.div>
        </div>
    );
}
