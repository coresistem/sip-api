import { useState, useEffect } from 'react';
import { Bell, Search, Check, X, Info, AlertTriangle, AlertCircle, FileText } from 'lucide-react';
import { api } from '../../core/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS' | 'PAYMENT';
    isRead: boolean;
    createdAt: string;
    link?: string;
    actionPayload?: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'INFO' | 'WARNING' | 'ALERT'>('ALL');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications?limit=50');
            setNotifications(res.data.data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.post('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleDecision = async (requestId: string, decision: 'APPROVED' | 'REJECTED') => {
        try {
            await api.post('/integration/decision', {
                requestId,
                decision,
                feedback: decision === 'REJECTED' ? 'Rejected via notification' : 'Approved via notification'
            });
            // Refresh notifications
            fetchNotifications();
        } catch (error) {
            console.error('Failed to process integration decision:', error);
            alert('Failed to process action. Request may have already been handled.');
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'WARNING': return <AlertTriangle className="w-5 h-5 text-orange-400" />;
            case 'ALERT': return <AlertCircle className="w-5 h-5 text-red-400" />;
            case 'SUCCESS': return <Check className="w-5 h-5 text-green-400" />;
            case 'PAYMENT': return <FileText className="w-5 h-5 text-blue-400" />;
            default: return <Info className="w-5 h-5 text-blue-400" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'WARNING': return 'bg-orange-500/10 border-orange-500/20';
            case 'ALERT': return 'bg-red-500/10 border-red-500/20';
            case 'SUCCESS': return 'bg-green-500/10 border-green-500/20';
            case 'PAYMENT': return 'bg-blue-500/10 border-blue-500/20';
            default: return 'bg-dark-800 border-dark-700'; // Default/Info
        }
    };

    const filteredNotifications = notifications.filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.message.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'ALL' ||
            (filter === 'UNREAD' && !n.isRead) ||
            (filter === 'INFO' && n.type === 'INFO') ||
            (filter === 'WARNING' && n.type === 'WARNING') ||
            (filter === 'ALERT' && n.type === 'ALERT');
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Bell className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Notifications</h1>
                        <p className="text-sm text-dark-400">Manage system notifications and alerts</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={markAllAsRead}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <Check size={18} />
                        Mark All Read
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="card">
                <div className="flex gap-2 border-b border-dark-700 pb-0 overflow-x-auto">
                    {['ALL', 'UNREAD', 'INFO', 'WARNING', 'ALERT'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilter(t as any)}
                            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${filter === t
                                ? 'text-primary-400 border-primary-400'
                                : 'text-dark-400 border-transparent hover:text-white'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Bar */}
            <div className="card p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                        type="text"
                        placeholder="Search notifications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:border-primary-500 focus:outline-none text-white placeholder-dark-400"
                    />
                </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-2">
                {loading ? (
                    <div className="text-center py-12 text-dark-400">Loading...</div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="card">
                        <div className="text-center py-12 text-dark-400">
                            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No notifications found</p>
                        </div>
                    </div>
                ) : (
                    <AnimatePresence>
                        {filteredNotifications.map(notification => (
                            <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`card p-4 border flex gap-4 ${getBgColor(notification.type)} ${!notification.isRead ? 'border-primary-500/50' : ''}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-dark-900/50`}>
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className={`font-semibold ${!notification.isRead ? 'text-white' : 'text-dark-300'}`}>
                                            {notification.title}
                                            {!notification.isRead && (
                                                <span className="ml-2 w-2 h-2 rounded-full bg-primary-500 inline-block align-middle" />
                                            )}
                                        </h4>
                                        <span className="text-xs text-dark-500 whitespace-nowrap ml-2">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-dark-400 text-sm mt-1">{notification.message}</p>
                                    {notification.link && (
                                        <a href={notification.link} className="inline-block mt-2 text-xs text-primary-400 hover:text-primary-300 underline">
                                            View Details
                                        </a>
                                    )}

                                    {notification.actionPayload && (() => {
                                        try {
                                            const payload = JSON.parse(notification.actionPayload);
                                            if (payload.type === 'INTEGRATION_REQUEST') {
                                                return (
                                                    <div className="mt-4 flex gap-2">
                                                        <button
                                                            onClick={() => handleDecision(payload.id, 'APPROVED')}
                                                            className="px-4 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-xs font-semibold transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleDecision(payload.id, 'REJECTED')}
                                                            className="px-4 py-1.5 bg-dark-700 hover:bg-dark-600 text-dark-200 rounded-lg text-xs font-semibold transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                );
                                            }
                                        } catch (e) {
                                            return null;
                                        }
                                        return null;
                                    })()}
                                </div>
                                {!notification.isRead && (
                                    <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="text-dark-400 hover:text-primary-400 self-center"
                                        title="Mark as read"
                                    >
                                        <Check size={18} />
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
