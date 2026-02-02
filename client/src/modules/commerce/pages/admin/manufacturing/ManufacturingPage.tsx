import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Play, Pause, CheckCircle, Package, Loader2, Timer
} from 'lucide-react';
import { manufacturingApi, Task } from '../../../api/manufacturing.api'; // Fixed relative path

const STAGES = [
    { id: 'GRADING', label: 'Grading', icon: '📐' },
    { id: 'PRINTING', label: 'Printing', icon: '🖨️' },
    { id: 'CUTTING', label: 'Cutting', icon: '✂️' },
    { id: 'PRESS', label: 'Press', icon: '🔥' },
    { id: 'SEWING', label: 'Sewing', icon: '🧵' },
    { id: 'QC', label: 'QC', icon: '✅' },
    { id: 'PACKING', label: 'Packing', icon: '📦' },
];

const STATUS_COLORS = {
    PENDING: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
    IN_PROGRESS: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    COMPLETED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    ON_HOLD: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

export default function ManufacturingPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        fetchTasks();
    }, [filterStatus]);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (activeTask && activeTask.status === 'IN_PROGRESS') {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [activeTask]);

    const fetchTasks = async () => {
        try {
            setIsLoading(true);
            const params: any = {};
            if (filterStatus) params.status = filterStatus;

            const response = await manufacturingApi.listTasks(params);

            // Assume response structured correctly or adapt
            if (response.success) {
                setTasks(response.data || []);
                const inProgress = (response.data || []).find((t: Task) => t.status === 'IN_PROGRESS');
                if (inProgress) {
                    setActiveTask(inProgress);
                    if (inProgress.startedAt) {
                        const elapsed = Math.floor((Date.now() - new Date(inProgress.startedAt).getTime()) / 1000);
                        setTimer(elapsed > 0 ? elapsed : 0);
                    }
                }
            } else if (Array.isArray(response)) {
                setTasks(response);
            }
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const startTask = async (task: Task) => {
        try {
            await manufacturingApi.updateTaskStatus(task.id, 'IN_PROGRESS');
            // Optimistic update or refresh
            setActiveTask({ ...task, status: 'IN_PROGRESS', startedAt: new Date().toISOString() });
            setTimer(0);
            fetchTasks();
        } catch (error) {
            console.error('Failed to start task:', error);
        }
    };

    const completeTask = async (task: Task) => {
        try {
            // const actualMinutes = Math.ceil(timer / 60);
            await manufacturingApi.updateTaskStatus(task.id, 'COMPLETED');
            setActiveTask(null);
            setTimer(0);
            fetchTasks();
        } catch (error) {
            console.error('Failed to complete task:', error);
        }
    };

    const pauseTask = async (task: Task) => {
        try {
            await manufacturingApi.updateTaskStatus(task.id, 'ON_HOLD');
            setActiveTask(null);
            fetchTasks();
        } catch (error) {
            console.error('Failed to pause task:', error);
        }
    };

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getStageInfo = (stageId: string) => {
        return STAGES.find(s => s.id === stageId) || { id: stageId, label: stageId, icon: '📋' };
    };

    const pendingTasks = tasks.filter(t => t.status === 'PENDING');
    const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

    return (
        <div className="max-w-4xl mx-auto p-6 pb-20 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-display font-black text-white">Manpower Station</h1>
                <p className="text-slate-400 text-sm">View and manage your assigned production tasks</p>
            </div>

            {/* Active Task Timer */}
            {activeTask && activeTask.status === 'IN_PROGRESS' && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6 mb-8 backdrop-blur-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">{getStageInfo(activeTask.stage).icon}</span>
                            <div>
                                <h2 className="text-lg font-bold text-white">
                                    {getStageInfo(activeTask.stage).label}
                                </h2>
                                <p className="text-sm text-slate-300">
                                    Order: {activeTask.order?.orderNo} • {activeTask.quantity} items
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-mono font-bold text-blue-400 tracking-wider">
                                {formatTime(timer)}
                            </div>
                            <p className="text-xs text-slate-400">Time elapsed</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => pauseTask(activeTask)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors font-medium"
                        >
                            <Pause size={18} />
                            <span>Pause</span>
                        </button>
                        <button
                            onClick={() => completeTask(activeTask)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors font-medium"
                        >
                            <CheckCircle size={18} />
                            <span>Complete</span>
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-amber-500">{pendingTasks.length}</p>
                    <p className="text-xs text-amber-500/70 font-semibold uppercase tracking-wider">Pending</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-400">{inProgressTasks.length}</p>
                    <p className="text-xs text-blue-400/70 font-semibold uppercase tracking-wider">In Progress</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-400">{completedTasks.length}</p>
                    <p className="text-xs text-emerald-400/70 font-semibold uppercase tracking-wider">Completed</p>
                </div>
            </div>

            {/* Task List */}
            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-amber-500" size={32} />
                </div>
            ) : tasks.length === 0 ? (
                <div className="text-center py-20 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                    <Package className="mx-auto text-slate-600 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-slate-300 mb-2">No tasks assigned</h3>
                    <p className="text-slate-500">Tasks will appear here when assigned by your manager.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">All Tasks</h3>
                    {tasks.map(task => {
                        const stageInfo = getStageInfo(task.stage);
                        const isActive = activeTask?.id === task.id && task.status === 'IN_PROGRESS';

                        return (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`bg-slate-800/50 border rounded-xl p-5 backdrop-blur-sm ${isActive ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 'border-slate-700/50'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl">{stageInfo.icon}</span>
                                        <div>
                                            <h4 className="font-bold text-white">{stageInfo.label}</h4>
                                            <p className="text-sm text-slate-400">
                                                {task.order?.orderNo} • {task.quantity} items
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[task.status] || STATUS_COLORS.PENDING}`}>
                                            {task.status.replace('_', ' ')}
                                        </span>
                                        {task.status === 'PENDING' && !activeTask && (
                                            <button
                                                onClick={() => startTask(task)}
                                                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors font-bold shadow-lg shadow-amber-500/20"
                                            >
                                                <Play size={16} />
                                                <span>Start</span>
                                            </button>
                                        )}
                                        {task.status === 'ON_HOLD' && !activeTask && (
                                            <button
                                                onClick={() => startTask(task)}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-bold shadow-lg shadow-blue-600/20"
                                            >
                                                <Play size={16} />
                                                <span>Resume</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {task.completedAt && (
                                    <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-4 text-sm text-slate-400">
                                        <span className="flex items-center gap-1 font-mono">
                                            <Timer size={14} />
                                            {task.actualMinutes || 0} min
                                        </span>
                                        <span className="text-xs">
                                            Completed: {new Date(task.completedAt).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
