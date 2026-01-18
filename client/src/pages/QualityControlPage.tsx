import { CheckCircle, Search } from 'lucide-react';

export default function QualityControlPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Quality Control</h1>
                        <p className="text-sm text-dark-400">Manage QC inspections, rejections, and repair requests</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card">
                    <p className="text-sm text-dark-400">Pending Inspections</p>
                    <p className="text-2xl font-bold text-white mt-1">0</p>
                </div>
                <div className="card">
                    <p className="text-sm text-dark-400">Approved</p>
                    <p className="text-2xl font-bold text-emerald-400 mt-1">0</p>
                </div>
                <div className="card">
                    <p className="text-sm text-dark-400">Rejected</p>
                    <p className="text-2xl font-bold text-red-400 mt-1">0</p>
                </div>
                <div className="card">
                    <p className="text-sm text-dark-400">Repair Requests</p>
                    <p className="text-2xl font-bold text-amber-400 mt-1">0</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="card">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                        type="text"
                        placeholder="Search inspections..."
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
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Order ID</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Inspector</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Total Qty</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Passed</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Rejected</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Result</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={7} className="text-center py-12 text-dark-400">
                                    <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No QC inspections found</p>
                                    <p className="text-sm mt-1">Database tables: <code className="text-primary-400">qc_inspections</code>, <code className="text-primary-400">qc_rejections</code>, <code className="text-primary-400">repair_requests</code></p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
