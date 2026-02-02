import { useState, useEffect } from 'react';
import { api } from '../../../core/contexts/AuthContext';
import { FileSearch, User, Clock, Filter, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuditLogEntry {
    id: string;
    userId: string;
    action: string;
    entity: string;
    entityId: string | null;
    oldValues: string | null;
    newValues: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
    user?: { name: string; email: string };
}

interface AuditLogsResponse {
    success: boolean;
    data: AuditLogEntry[];
    pagination?: { total: number; page: number; pageSize: number };
}

export default function AuditLogsTab() {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionFilter, setActionFilter] = useState<string>('');
    const [entityFilter, setEntityFilter] = useState<string>('');
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 25;

    useEffect(() => {
        fetchLogs();
    }, [page, actionFilter, entityFilter]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: String(page),
                pageSize: String(pageSize),
            });
            if (actionFilter) params.append('action', actionFilter);
            if (entityFilter) params.append('entity', entityFilter);

            const response = await api.get<AuditLogsResponse>(`/analytics/admin/audit-logs?${params}`);
            if (response.data.success) {
                setLogs(response.data.data);
                setTotal(response.data.pagination?.total || 0);
            }
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'LOGIN': return 'bg-blue-500/20 text-blue-400';
            case 'PAGE_VIEW': return 'bg-green-500/20 text-green-400';
            case 'CREATE': return 'bg-emerald-500/20 text-emerald-400';
            case 'UPDATE': return 'bg-amber-500/20 text-amber-400';
            case 'DELETE': return 'bg-red-500/20 text-red-400';
            default: return 'bg-dark-600 text-dark-300';
        }
    };

    const uniqueActions = [...new Set(logs.map(l => l.action))];
    const uniqueEntities = [...new Set(logs.map(l => l.entity))];

    const totalPages = Math.ceil(total / pageSize);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-6"
        >
            <div className="card">
                {/* Header with description */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <FileSearch className="w-5 h-5 text-rose-400" />
                                Audit Logs
                                <span className="text-sm font-normal text-dark-400">({total} records)</span>
                            </h2>
                            <p className="text-sm text-dark-400 mt-1 max-w-2xl">
                                Track all system activity including user logins, page visits, data changes, and administrative actions.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            {/* Action Filter */}
                            <div className="relative flex-1 sm:flex-initial min-w-[140px]">
                                <select
                                    value={actionFilter}
                                    onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm focus:border-primary-500 focus:outline-none appearance-none pr-8"
                                >
                                    <option value="">All Actions</option>
                                    {uniqueActions.map(action => (
                                        <option key={action} value={action}>{action}</option>
                                    ))}
                                </select>
                                <Filter size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
                            </div>

                            {/* Entity Filter */}
                            <div className="relative flex-1 sm:flex-initial min-w-[140px]">
                                <select
                                    value={entityFilter}
                                    onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
                                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm focus:border-primary-500 focus:outline-none appearance-none pr-8"
                                >
                                    <option value="">All Entities</option>
                                    {uniqueEntities.map(entity => (
                                        <option key={entity} value={entity}>{entity}</option>
                                    ))}
                                </select>
                                <Filter size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
                            </div>

                            {/* Refresh */}
                            <button
                                onClick={fetchLogs}
                                className="p-2 sm:p-2.5 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors border border-dark-600"
                                title="Refresh"
                            >
                                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                            </button>
                        </div>
                    </div>
                </div>
                {/* Logs Table */}
                {loading ? (
                    <div className="flex items-center justify-center h-48 text-dark-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-12 text-dark-400">
                        <FileSearch size={48} className="mx-auto mb-3 opacity-50" />
                        <p>No audit logs found</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-dark-700">
                                    <tr>
                                        <th className="text-left py-3 px-2 text-dark-400 font-medium">Time</th>
                                        <th className="text-left py-3 px-2 text-dark-400 font-medium">User</th>
                                        <th className="text-left py-3 px-2 text-dark-400 font-medium">Action</th>
                                        <th className="text-left py-3 px-2 text-dark-400 font-medium">Entity</th>
                                        <th className="text-left py-3 px-2 text-dark-400 font-medium">Details</th>
                                        <th className="text-left py-3 px-2 text-dark-400 font-medium">IP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log.id} className="border-b border-dark-700/50 hover:bg-dark-700/30">
                                            <td className="py-3 px-2 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 text-dark-300">
                                                    <Clock size={12} />
                                                    {formatDate(log.createdAt)}
                                                </div>
                                            </td>
                                            <td className="py-3 px-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 rounded-full bg-dark-600">
                                                        <User size={12} />
                                                    </div>
                                                    <span className="text-white">{log.user?.name || log.userId.slice(0, 8)}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 text-dark-300">{log.entity}</td>
                                            <td className="py-3 px-2">
                                                {log.entityId && (
                                                    <>
                                                        <button
                                                            onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                                                            className="text-primary-400 hover:text-primary-300 flex items-center gap-1"
                                                        >
                                                            {log.entityId.length > 20 ? log.entityId.slice(0, 20) + '...' : log.entityId}
                                                            {expandedLogId === log.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                                        </button>
                                                        {expandedLogId === log.id && (log.oldValues || log.newValues) && (
                                                            <div className="mt-2 p-2 bg-dark-800 rounded text-xs font-mono overflow-x-auto">
                                                                {log.oldValues && <div className="text-red-400">- {log.oldValues}</div>}
                                                                {log.newValues && <div className="text-green-400">+ {log.newValues}</div>}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </td>
                                            <td className="py-3 px-2 text-dark-500 text-xs font-mono">
                                                {log.ipAddress || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden space-y-4">
                            {logs.map((log) => (
                                <div key={log.id} className="p-4 rounded-xl bg-dark-800/50 border border-dark-700 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-full bg-dark-700 text-dark-400">
                                                <User size={14} />
                                            </div>
                                            <span className="text-sm font-semibold text-white">{log.user?.name || log.userId.slice(0, 8)}</span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${getActionColor(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-dark-400">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={12} />
                                            {formatDate(log.createdAt)}
                                        </div>
                                        <div className="font-mono">{log.ipAddress || '-'}</div>
                                    </div>

                                    <div className="text-sm flex gap-2">
                                        <span className="text-dark-400">Entity:</span>
                                        <span className="text-dark-200 font-medium">{log.entity}</span>
                                    </div>

                                    {log.entityId && (
                                        <div className="pt-2 border-t border-dark-700/50">
                                            <button
                                                onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                                                className="w-full flex items-center justify-between text-xs text-primary-400 font-medium hover:text-primary-300"
                                            >
                                                ID: {log.entityId.length > 25 ? log.entityId.slice(0, 25) + '...' : log.entityId}
                                                {expandedLogId === log.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                            </button>
                                            {expandedLogId === log.id && (log.oldValues || log.newValues) && (
                                                <div className="mt-3 p-3 bg-dark-900 rounded-lg text-[10px] font-mono overflow-x-auto border border-dark-700 shadow-inner">
                                                    {log.oldValues && <div className="text-red-500 mb-1">- {log.oldValues}</div>}
                                                    {log.newValues && <div className="text-emerald-500">+ {log.newValues}</div>}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-700">
                        <span className="text-sm text-dark-400">
                            Page {page} of {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
