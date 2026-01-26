import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Clock, Package, Truck, CheckCircle, RefreshCw,
    ChevronLeft, ChevronRight, Loader2, AlertCircle,
    Columns as KanbanIcon, BarChart2 as GanttIcon, Calendar // Changed icons for compatibility
} from 'lucide-react';
import { api } from '../../../../../context/AuthContext';

interface OrderItem {
    id: string;
    product?: { name: string };
    quantity: number;
    recipientName: string;
}

interface Order {
    id: string;
    orderNo: string;
    status: 'PENDING' | 'CONFIRMED' | 'PRODUCTION' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    paymentStatus: string;
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
    itemCount?: number;
}

interface ManpowerTask {
    id: string;
    manpower: { name: string; specialization: string };
    order: { orderNo: string };
    stage: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED';
    startedAt?: string;
    completedAt?: string;
    estimatedMinutes: number;
}

const PRODUCTION_STAGES = [
    { id: 'PENDING', label: 'Pending', icon: Clock, color: 'amber' },
    { id: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle, color: 'blue' },
    { id: 'PRODUCTION', label: 'Production', icon: Package, color: 'purple' },
    { id: 'SHIPPED', label: 'Shipped', icon: Truck, color: 'cyan' },
    { id: 'DELIVERED', label: 'Delivered', icon: CheckCircle, color: 'emerald' },
];

const MANPOWER_STAGES = [
    { id: 'GRADING', label: 'Grading', color: 'blue' },
    { id: 'PRINTING', label: 'Printing', color: 'indigo' },
    { id: 'CUTTING', label: 'Cutting', color: 'pink' },
    { id: 'PRESS', label: 'Press', color: 'orange' },
    { id: 'SEWING', label: 'Sewing', color: 'purple' },
    { id: 'QC', label: 'QC', color: 'teal' },
    { id: 'PACKING', label: 'Packing', color: 'green' },
];

const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
        amber: 'bg-amber-500',
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        cyan: 'bg-cyan-500',
        emerald: 'bg-emerald-500',
        red: 'bg-red-500',
        indigo: 'bg-indigo-500',
        pink: 'bg-pink-500',
        orange: 'bg-orange-500',
        teal: 'bg-teal-500',
        green: 'bg-green-500',
    };
    const stageInfo = PRODUCTION_STAGES.find(s => s.id === stage) || MANPOWER_STAGES.find(s => s.id === stage);
    return colors[stageInfo?.color || 'purple'] || colors.purple;
};

export default function ProductionTimeline() {
    const [viewMode, setViewMode] = useState<'pipeline' | 'timeline'>('timeline');
    const [orders, setOrders] = useState<Order[]>([]);
    const [tasks, setTasks] = useState<ManpowerTask[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>(''); // Kept for future use or pipeline filter
    const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        loadData();
    }, [filterStatus, viewMode]);

    const loadData = async () => {
        try {
            setIsLoading(true);

            // Always fetch orders for stats
            const params = new URLSearchParams();
            if (filterStatus) params.append('status', filterStatus);
            params.append('limit', '50');
            const ordersRes = await api.get(`/jersey/orders?${params.toString()}`);
            setOrders(ordersRes.data.data || []);

            // Fetch tasks only if in timeline view
            if (viewMode === 'timeline') {
                const tasksRes = await api.get('/manpower/tasks');
                setTasks(tasksRes.data.data || []);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate current week dates
    const weekDates = useMemo(() => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1 + (currentWeekOffset * 7));

        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            dates.push(date);
        }
        return dates;
    }, [currentWeekOffset]);

    // Filter tasks for selected date
    const dayTasks = useMemo(() => {
        return tasks.filter(t => {
            if (!t.startedAt) return false;
            const tDate = new Date(t.startedAt);
            return tDate.toDateString() === selectedDate.toDateString();
        });
    }, [tasks, selectedDate]);

    // Format date
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
    };

    // Stats
    const stats = useMemo(() => {
        const activeOrders = orders.filter(o => !['CANCELLED', 'DELIVERED'].includes(o.status));
        return {
            total: orders.length,
            pending: orders.filter(o => o.status === 'PENDING').length,
            production: orders.filter(o => o.status === 'PRODUCTION').length,
            shipped: orders.filter(o => o.status === 'SHIPPED').length,
            completed: orders.filter(o => o.status === 'DELIVERED').length,
            active: activeOrders.length,
        };
    }, [orders]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
    };

    // Gantt Chart Logic
    const hours = Array.from({ length: 24 }, (_, i) => i); // 00:00 to 23:00 - Full Day for Overtime
    const pixelPerMinute = 2;

    // Generate color from string (Order ID/No)
    const getOrderColor = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colors = [
            'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500',
            'bg-cyan-500', 'bg-teal-500', 'bg-emerald-500', 'bg-amber-500',
            'bg-orange-500', 'bg-rose-500', 'bg-fuchsia-500'
        ];
        return colors[Math.abs(hash) % colors.length];
    };

    const getTaskPosition = (task: ManpowerTask) => {
        if (!task.startedAt) return null;
        const start = new Date(task.startedAt);
        const startHour = start.getHours();
        const startMinute = start.getMinutes();

        // Full day view (0-23)
        const minutesFrom0 = (startHour * 60) + startMinute;
        const left = minutesFrom0 * pixelPerMinute;

        // Calculate duration
        let duration = task.estimatedMinutes;
        if (task.completedAt) {
            const end = new Date(task.completedAt);
            duration = (end.getTime() - start.getTime()) / 60000;
        }

        const width = duration * pixelPerMinute;

        return { left, width };
    };

    return (
        <div className="max-w-screen-2xl mx-auto p-6 pb-20 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold font-display gradient-text">Production Timeline</h1>
                    <p className="text-dark-400 text-sm">Track orders through the production pipeline</p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-dark-800 p-1 rounded-lg border border-dark-700 flex">
                        <button
                            onClick={() => setViewMode('pipeline')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${viewMode === 'pipeline' ? 'bg-primary-600 text-white' : 'text-dark-400 hover:text-white'
                                }`}
                        >
                            <KanbanIcon size={16} />
                            Pipeline
                        </button>
                        <button
                            onClick={() => setViewMode('timeline')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${viewMode === 'timeline' ? 'bg-primary-600 text-white' : 'text-dark-400 hover:text-white'
                                }`}
                        >
                            <GanttIcon size={16} />
                            Timeline
                        </button>
                    </div>
                    <button
                        onClick={loadData}
                        className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors"
                    >
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Stats Cards - Only visible in Pipeline View */}
            {viewMode === 'pipeline' && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
                        <p className="text-dark-400 text-sm">Total Orders</p>
                        <p className="text-2xl font-bold text-white">{stats.total}</p>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                        <p className="text-amber-400 text-sm">Pending</p>
                        <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Production</p>
                        <p className="text-2xl font-bold text-purple-400">{stats.production}</p>
                    </div>
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                        <p className="text-cyan-400 text-sm">Shipped</p>
                        <p className="text-2xl font-bold text-cyan-400">{stats.shipped}</p>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                        <p className="text-emerald-400 text-sm">Completed</p>
                        <p className="text-2xl font-bold text-emerald-400">{stats.completed}</p>
                    </div>
                </div>
            )}

            {/* Filters (Only for Pipeline) */}
            {viewMode === 'pipeline' && (
                <div className="flex flex-wrap gap-2 mb-6">
                    <button
                        onClick={() => setFilterStatus('')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === '' ? 'bg-primary-600 text-white' : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                            }`}
                    >
                        All
                    </button>
                    {PRODUCTION_STAGES.map(stage => (
                        <button
                            key={stage.id}
                            onClick={() => setFilterStatus(stage.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === stage.id ? 'bg-primary-600 text-white' : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                                }`}
                        >
                            {stage.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-6 bg-dark-800 rounded-xl p-4 border border-dark-700">
                <button
                    onClick={() => setCurrentWeekOffset(prev => prev - 1)}
                    className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                >
                    <ChevronLeft size={20} className="text-dark-400" />
                </button>
                <div className="flex gap-2 overflow-x-auto">
                    {weekDates.map((date, idx) => {
                        const isSelected = date.toDateString() === selectedDate.toDateString();
                        return (
                            <button
                                key={idx}
                                onClick={() => setSelectedDate(date)}
                                className={`flex-1 min-w-[80px] text-center py-2 px-3 rounded-lg transition-all ${isSelected
                                    ? 'bg-primary-600 text-white border border-primary-500 shadow-lg shadow-primary-500/20'
                                    : 'bg-dark-700/50 text-dark-400 hover:bg-dark-700'
                                    }`}
                            >
                                <p className="text-xs font-semibold">
                                    {formatDate(date)}
                                </p>
                            </button>
                        );
                    })}
                </div>
                <button
                    onClick={() => setCurrentWeekOffset(prev => prev + 1)}
                    className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                >
                    <ChevronRight size={20} className="text-dark-400" />
                </button>
            </div>

            {viewMode === 'pipeline' ? (
                /* PIPELINE VIEW (Kanban) */
                <div className="bg-dark-800/50 rounded-xl border border-dark-700 overflow-hidden">
                    <div className="grid grid-cols-5 bg-dark-800 border-b border-dark-700">
                        {PRODUCTION_STAGES.map(stage => (
                            <div key={stage.id} className="p-4 text-center border-r border-dark-700 last:border-r-0">
                                <div className="flex items-center justify-center gap-2">
                                    <stage.icon size={16} className={`text-${stage.color}-400`} />
                                    <span className="font-medium text-dark-200">{stage.label}</span>
                                </div>
                                <p className="text-xs text-dark-500 mt-1">
                                    {orders.filter(o => o.status === stage.id).length} orders
                                </p>
                            </div>
                        ))}
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="animate-spin text-primary-500" size={32} />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-20">
                            <AlertCircle className="mx-auto text-dark-600 mb-4" size={48} />
                            <h3 className="text-lg font-medium text-dark-300 mb-2">No orders found</h3>
                            <p className="text-dark-500 text-sm">Orders will appear here when customers place them.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-5 min-h-[400px]">
                            {PRODUCTION_STAGES.map(stage => {
                                const stageOrders = orders.filter(o => o.status === stage.id);
                                return (
                                    <div key={stage.id} className="border-r border-dark-700 last:border-r-0 p-3 space-y-3">
                                        {stageOrders.map(order => (
                                            <motion.div
                                                key={order.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`p-3 rounded-lg border ${getStageColor(stage.id)}/10 border-${stage.color}-500/30 hover:border-${stage.color}-500/50 transition-all cursor-pointer group`}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <span className="font-mono text-xs text-dark-400">{order.orderNo}</span>
                                                    <span className={`text-xs px-1.5 py-0.5 rounded ${getStageColor(stage.id)}/20 text-${stage.color}-400`}>
                                                        {order.items?.length || order.itemCount || 0} items
                                                    </span>
                                                </div>
                                                <p className="text-sm font-medium text-white line-clamp-1 group-hover:text-primary-400 transition-colors">
                                                    {order.items?.[0]?.product?.name || 'Jersey Order'}
                                                </p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-dark-500">
                                                        {new Date(order.createdAt).toLocaleDateString('id-ID')}
                                                    </span>
                                                    <span className="text-xs font-medium text-primary-400">
                                                        {formatCurrency(order.totalAmount)}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                /* TIMELINE VIEW (Gantt) */
                <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
                    <div className="p-4 border-b border-dark-700 flex justify-between items-center bg-dark-900/50">
                        <div className="flex items-center gap-2 text-dark-300">
                            <Calendar size={18} />
                            <span className="font-medium">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded bg-blue-500"></span> Active
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded bg-green-500"></span> Completed
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <div className="min-w-[1000px]">
                            {/* Header (Hours) */}
                            {/* Header (Date & Hours) */}
                            <div className="flex flex-col border-b border-dark-700 bg-dark-900/30 sticky top-0 z-20">
                                {/* Date Row - Above Hour */}
                                <div className="flex border-b border-dark-700/50">
                                    <div className="w-40 p-2 border-r border-dark-700 shrink-0 bg-dark-800/80">
                                        {/* Corner */}
                                    </div>
                                    <div className="flex-1 py-1 px-4 text-xs font-semibold text-primary-400 bg-primary-500/10">
                                        {selectedDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                </div>

                                {/* Hours Row */}
                                <div className="flex items-center">
                                    <div className="w-40 p-3 text-sm font-medium text-dark-400 border-r border-dark-700 shrink-0 bg-dark-800/80">
                                        Department
                                    </div>
                                    <div className="flex-1 flex relative h-10">
                                        {hours.map(hour => (
                                            <div key={hour} className="absolute text-xs text-dark-500 border-l border-dark-700/50 pl-1 h-full" style={{ left: `${hour * 60 * pixelPerMinute}px` }}>
                                                {String(hour).padStart(2, '0')}:00
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Gantt Body */}
                            {isLoading ? (
                                <div className="flex justify-center items-center py-20">
                                    <Loader2 className="animate-spin text-primary-500" size={32} />
                                </div>
                            ) : (
                                <div className="divide-y divide-dark-700">
                                    {MANPOWER_STAGES.map(stage => (
                                        <div key={stage.id} className="flex h-20 group hover:bg-dark-700/20 transition-colors">
                                            {/* Y-Axis Label */}
                                            <div className="w-40 p-3 border-r border-dark-700 shrink-0 flex items-center justify-between bg-dark-800/20">
                                                <span className="font-medium text-dark-200">{stage.label}</span>
                                                <span className={`text-xs px-1.5 py-0.5 rounded bg-${stage.color}-500/20 text-${stage.color}-400`}>
                                                    {dayTasks.filter(t => t.stage === stage.id).length}
                                                </span>
                                            </div>

                                            {/* Timeline Lane */}
                                            <div className="flex-1 relative bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGxpbmUgeDEvIjAiIHkyPSIxMDAlIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')]">
                                                {dayTasks.filter(t => t.stage === stage.id).map(task => {
                                                    const pos = getTaskPosition(task);
                                                    if (!pos) return null;

                                                    const barColor = getOrderColor(task.order.orderNo);

                                                    return (
                                                        <motion.div
                                                            key={task.id}
                                                            initial={{ opacity: 0, scaleX: 0 }}
                                                            animate={{ opacity: 1, scaleX: 1 }}
                                                            className={`absolute top-4 h-12 rounded-lg ${barColor} shadow-lg shadow-black/20 border border-white/10 px-2 py-1 flex flex-col justify-center cursor-pointer hover:brightness-110 z-10 overflow-hidden text-white`}
                                                            style={{
                                                                left: `${pos.left}px`,
                                                                width: `${Math.max(pos.width, 60)}px` // Min width for visibility
                                                            }}
                                                            title={`${task.order.orderNo} - ${task.manpower.name} (${task.status})`}
                                                        >
                                                            <div className="text-xs font-bold truncate">{task.order.orderNo}</div>
                                                            <div className="text-[10px] opacity-80 truncate">{task.manpower.name}</div>
                                                        </motion.div>
                                                    );
                                                })}

                                                {/* Current Time Indicator - Only on Today */}
                                                {(new Date().toDateString() === selectedDate.toDateString()) && (
                                                    <div
                                                        className="absolute top-0 bottom-0 w-px bg-red-500/50 z-20 pointer-events-none"
                                                        style={{
                                                            left: `${((new Date().getHours()) * 60 + new Date().getMinutes()) * pixelPerMinute}px`,
                                                            display: 'block'
                                                        }}
                                                    >
                                                        <div className="w-2 h-2 rounded-full bg-red-500 -ml-[3px] -mt-1"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
