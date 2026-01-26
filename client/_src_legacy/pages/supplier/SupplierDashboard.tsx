import React from 'react';
import { motion } from 'framer-motion';
import {
    ShoppingBag,
    DollarSign,
    Package,
    TrendingUp,
    Clock,
    AlertCircle,
    ChevronRight,
    Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, subtext, icon: Icon, color }: any) => (
    <div className="card hover:border-primary-500/50 transition-colors">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-400`}>
                <Icon size={24} />
            </div>
            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-${color}-500/10 text-${color}-400`}>
                <TrendingUp size={12} />
                +12.5%
            </span>
        </div>
        <div>
            <h3 className="text-dark-400 text-sm font-medium mb-1">{title}</h3>
            <p className="text-2xl font-bold text-white mb-1">{value}</p>
            <p className="text-xs text-dark-500">{subtext}</p>
        </div>
    </div>
);

export default function SupplierDashboard() {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Supplier Dashboard</h1>
                    <p className="text-dark-400">Welcome back, manage your products and orders.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/supplier/myshop')}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Package size={18} />
                        Manage My Shop
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Revenue"
                    value="Rp 45.2M"
                    subtext="vs last month"
                    icon={DollarSign}
                    color="emerald"
                />
                <StatCard
                    title="Active Products"
                    value="24"
                    subtext="3 low stock"
                    icon={ShoppingBag}
                    color="blue"
                />
                <StatCard
                    title="Pending Orders"
                    value="12"
                    subtext="Needs attention"
                    icon={Clock}
                    color="amber"
                />
                <StatCard
                    title="Store Rating"
                    value="4.8"
                    subtext="From 156 reviews"
                    icon={Star}
                    color="purple"
                />
            </div>

            {/* Recent Orders & Low Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="lg:col-span-2 card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white">Recent Orders</h2>
                        <button className="text-primary-400 text-sm hover:underline">View All</button>
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50 border border-dark-700/50 hover:bg-dark-800 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center">
                                        <Package size={20} className="text-dark-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">Order #ORD-2026-00{i}</p>
                                        <p className="text-sm text-dark-400">2 items • Rp 1.500.000</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
                                        Processing
                                    </span>
                                    <ChevronRight size={16} className="text-dark-500" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Alerts */}
                <div className="card h-fit">
                    <h2 className="text-lg font-bold text-white mb-6">Action Required</h2>
                    <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-3">
                            <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-red-400">Low Stock Alert</p>
                                <p className="text-xs text-red-300/70 mt-1">Recurve Bow Pro Series X is running low (2 left).</p>
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex gap-3">
                            <AlertCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-blue-400">New Message</p>
                                <p className="text-xs text-blue-300/70 mt-1">Customer asking about shipping to Jakarta.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
