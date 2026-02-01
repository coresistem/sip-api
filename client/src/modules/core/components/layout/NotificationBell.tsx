import { useState, useEffect } from 'react';
import { Bell, Info, AlertTriangle, AlertCircle, Check, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

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

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications?limit=5');
            const data = res.data.data;
            setNotifications(data);
            setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const markAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            api.patch(`/notifications/${notification.id}/read`).catch(console.error);
        }
        setIsOpen(false);
        if (notification.link) {
            navigate(notification.link);
        } else {
            navigate('/notifications');
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'WARNING': return <AlertTriangle className="w-4 h-4 text-orange-400" />;
            case 'ALERT': return <AlertCircle className="w-4 h-4 text-red-400" />;
            case 'SUCCESS': return <Check className="w-4 h-4 text-green-400" />;
            case 'PAYMENT': return <FileText className="w-4 h-4 text-blue-400" />;
            default: return <Info className="w-4 h-4 text-blue-400" />;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-dark-800 transition-colors text-dark-400 hover:text-white"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-dark-900">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-80 bg-dark-900 border border-dark-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                        >
                            <div className="p-4 border-b border-dark-700 flex justify-between items-center bg-dark-800/50">
                                <h3 className="font-bold text-sm">Notifications</h3>
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        navigate('/notifications');
                                    }}
                                    className="text-xs text-primary-400 hover:text-primary-300 font-medium"
                                >
                                    View All
                                </button>
                            </div>

                            <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-dark-500">
                                        <Bell size={32} className="mx-auto mb-2 opacity-20" />
                                        <p className="text-xs">No recent notifications</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-dark-800">
                                        {notifications.map(notification => (
                                            <div
                                                key={notification.id}
                                                onClick={() => handleNotificationClick(notification)}
                                                className={`p-4 hover:bg-dark-800 cursor-pointer transition-colors ${!notification.isRead ? 'bg-primary-500/5' : ''}`}
                                            >
                                                <div className="flex gap-3">
                                                    <div className="mt-1 shrink-0">
                                                        {getIcon(notification.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start">
                                                            <p className={`text-xs font-bold truncate ${!notification.isRead ? 'text-white' : 'text-dark-300'}`}>
                                                                {notification.title}
                                                            </p>
                                                            {!notification.isRead && (
                                                                <button
                                                                    onClick={(e) => markAsRead(notification.id, e)}
                                                                    className="shrink-0 ml-2"
                                                                >
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-dark-400 line-clamp-2 mt-0.5">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-[9px] text-dark-500 mt-1">
                                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate('/notifications');
                                }}
                                className="w-full p-3 text-center text-xs text-dark-400 hover:text-white hover:bg-dark-800 transition-colors border-t border-dark-700"
                            >
                                See all notifications
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
