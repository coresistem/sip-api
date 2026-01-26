import { FileSearch, Search, Download } from 'lucide-react';

export default function AuditLogsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                        <FileSearch className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Audit Logs</h1>
                        <p className="text-sm text-dark-400">System activity and audit trail</p>
                    </div>
                </div>
                <button className="btn-secondary flex items-center gap-2">
                    <Download size={18} />
                    Export Logs
                </button>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="text-sm text-dark-400 mb-2 block">Date From</label>
                        <input type="date" className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:border-primary-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="text-sm text-dark-400 mb-2 block">Date To</label>
                        <input type="date" className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:border-primary-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="text-sm text-dark-400 mb-2 block">Entity Type</label>
                        <select className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:border-primary-500 focus:outline-none">
                            <option value="">All</option>
                            <option value="user">User</option>
                            <option value="order">Order</option>
                            <option value="product">Product</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-dark-400 mb-2 block">Action</label>
                        <select className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:border-primary-500 focus:outline-none">
                            <option value="">All</option>
                            <option value="create">Create</option>
                            <option value="update">Update</option>
                            <option value="delete">Delete</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="card">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                        type="text"
                        placeholder="Search logs by user, entity, or IP address..."
                        className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-dark-700">
                                <th className="text-left py-3 px-4 text-xs font-medium text-dark-400">Timestamp</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-dark-400">User</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-dark-400">Action</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-dark-400">Entity</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-dark-400">Entity ID</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-dark-400">IP Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-dark-400">
                                    <FileSearch className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No audit logs found</p>
                                    <p className="text-sm mt-1">Database table: <code className="text-primary-400">audit_logs</code></p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
