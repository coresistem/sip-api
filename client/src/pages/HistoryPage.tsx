import { History, Search } from 'lucide-react';

export default function HistoryPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                        <History className="w-6 h-6 text-teal-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">History</h1>
                        <p className="text-sm text-dark-400">User history logs (transfers, achievements)</p>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="card">
                <div className="flex gap-2 border-b border-dark-700 pb-0">
                    <button className="px-4 py-2 text-sm font-medium text-primary-400 border-b-2 border-primary-400">All</button>
                    <button className="px-4 py-2 text-sm font-medium text-dark-400 hover:text-white">School Transfers</button>
                    <button className="px-4 py-2 text-sm font-medium text-dark-400 hover:text-white">Club Transfers</button>
                    <button className="px-4 py-2 text-sm font-medium text-dark-400 hover:text-white">Achievements</button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="card">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                        type="text"
                        placeholder="Search history logs..."
                        className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-dark-700">
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Date</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">User</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Log Type</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">From</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">To</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Details</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={7} className="text-center py-12 text-dark-400">
                                    <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No history logs found</p>
                                    <p className="text-sm mt-1">Database table: <code className="text-primary-400">history_logs</code></p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
