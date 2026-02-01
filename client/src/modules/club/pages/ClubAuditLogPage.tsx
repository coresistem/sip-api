import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, User, Activity, AlertTriangle, RefreshCw } from 'lucide-react';
import { api } from '../../core/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface AuditLogEntry {
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    metadata: Record<string, unknown> | null;
    ipAddress: string | null;
    createdAt: string;
}

// Action type to color/icon mapping
const ACTION_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
    'MEMBER_UNLINKED': { color: 'text-red-400', bgColor: 'bg-red-500/10', label: 'Member Removed' },
    'ROLE_JOIN_APPROVED': { color: 'text-green-400', bgColor: 'bg-green-500/10', label: 'Join Approved' },
    'ROLE_JOIN_REJECTED': { color: 'text-red-400', bgColor: 'bg-red-500/10', label: 'Join Rejected' },
    'ROLE_JOIN_REQUEST': { color: 'text-amber-400', bgColor: 'bg-amber-500/10', label: 'Join Request' },
    'DATA_ACCESS_GRANTED': { color: 'text-blue-400', bgColor: 'bg-blue-500/10', label: 'Access Granted' },
    'LOGIN': { color: 'text-green-400', bgColor: 'bg-green-500/10', label: 'Login' },
    'LOGOUT': { color: 'text-gray-400', bgColor: 'bg-gray-500/10', label: 'Logout' },
    'UPDATE': { color: 'text-blue-400', bgColor: 'bg-blue-500/10', label: 'Updated' },
    'CREATE': { color: 'text-green-400', bgColor: 'bg-green-500/10', label: 'Created' },
    'DELETE': { color: 'text-red-400', bgColor: 'bg-red-500/10', label: 'Deleted' },
};

export default function ClubAuditLogPage() {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAuditLogs = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.get('/clubs/audit-log');
            setLogs(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
            setError('Failed to load audit logs. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    const getActionConfig = (action: string) => {
        return ACTION_CONFIG[action] || { color: 'text-dark-400', bgColor: 'bg-dark-700', label: action };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <Shield className="w-7 h-7 text-primary-400" />
                        Security & Audit Log
                    </h1>
                    <p className="text-dark-400 mt-1">
                        Activity log for the last 30 days
                    </p>
                </div>
                <button
                    onClick={fetchAuditLogs}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4">
                    <div className="text-2xl font-bold text-white">{logs.length}</div>
                    <div className="text-sm text-dark-400">Total Events</div>
                </div>
                <div className="card p-4">
                    <div className="text-2xl font-bold text-green-400">
                        {logs.filter(l => l.action.includes('APPROVED') || l.action === 'CREATE').length}
                    </div>
                    <div className="text-sm text-dark-400">Approvals</div>
                </div>
                <div className="card p-4">
                    <div className="text-2xl font-bold text-red-400">
                        {logs.filter(l => l.action.includes('REJECTED') || l.action.includes('UNLINKED') || l.action === 'DELETE').length}
                    </div>
                    <div className="text-sm text-dark-400">Removals</div>
                </div>
                <div className="card p-4">
                    <div className="text-2xl font-bold text-amber-400">
                        {logs.filter(l => l.action.includes('REQUEST')).length}
                    </div>
                    <div className="text-sm text-dark-400">Requests</div>
                </div>
            </div>

            {/* Logs List */}
            <div className="card">
                <div className="p-4 border-b border-dark-700">
                    <h2 className="font-semibold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary-400" />
                        Activity Timeline
                    </h2>
                </div>

                {isLoading ? (
                    <div className="p-8 text-center text-dark-400">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                        Loading audit logs...
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-red-400">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                        {error}
                    </div>
                ) : logs.length === 0 ? (
                    <div className="p-8 text-center text-dark-400">
                        <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        No audit logs found for the last 30 days
                    </div>
                ) : (
                    <div className="divide-y divide-dark-700">
                        {logs.map((log, index) => {
                            const config = getActionConfig(log.action);
                            return (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.02 }}
                                    className="p-4 hover:bg-dark-800/50 transition-colors"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Action Badge */}
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${config.bgColor} ${config.color}`}>
                                            {config.label}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 text-sm">
                                                <User className="w-4 h-4 text-dark-400" />
                                                <span className="font-medium text-white">{log.user.name}</span>
                                                <span className="text-dark-500">({log.user.email})</span>
                                            </div>

                                            <div className="text-sm text-dark-400 mt-1">
                                                {log.entity && <span className="text-dark-300">{log.entity}</span>}
                                                {log.entityId && <span className="text-dark-500 ml-1">#{log.entityId.slice(0, 8)}</span>}
                                            </div>

                                            {/* Metadata */}
                                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                                                <div className="mt-2 p-2 rounded bg-dark-900/50 text-xs">
                                                    {Object.entries(log.metadata).map(([key, value]) => (
                                                        <div key={key} className="flex gap-2">
                                                            <span className="text-dark-500">{key}:</span>
                                                            <span className="text-dark-300">{String(value)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Timestamp */}
                                        <div className="text-right text-xs text-dark-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
