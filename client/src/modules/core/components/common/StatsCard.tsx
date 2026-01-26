
import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color?: 'blue' | 'purple' | 'orange' | 'emerald' | 'primary' | 'red';
    trend?: {
        value: number;
        label?: string;
        isPositive?: boolean;
    };
    actionLabel?: string;
    onAction?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    icon: Icon,
    color = 'primary',
    trend,
    actionLabel,
    onAction
}) => {
    const colorStyles = {
        primary: 'text-primary-500 bg-primary-500/10',
        blue: 'text-blue-500 bg-blue-500/10',
        purple: 'text-purple-500 bg-purple-500/10',
        orange: 'text-orange-500 bg-orange-500/10',
        emerald: 'text-emerald-500 bg-emerald-500/10',
        red: 'text-red-500 bg-red-500/10',
    };

    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="bg-dark-900/50 border border-dark-800 rounded-xl p-6"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${colorStyles[color]}`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={`flex items-center text-xs font-medium ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
                        } bg-dark-800 px-2 py-1 rounded-full`}>
                        {trend.isPositive ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                        <span>{Math.abs(trend.value)}% {trend.label}</span>
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
                <p className="text-sm text-dark-400 font-medium">{title}</p>
            </div>

            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="mt-4 text-xs font-bold text-dark-300 hover:text-white uppercase tracking-wider transition-colors flex items-center gap-1 group"
                >
                    {actionLabel}
                    <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
            )}
        </motion.div>
    );
};

export default StatsCard;
