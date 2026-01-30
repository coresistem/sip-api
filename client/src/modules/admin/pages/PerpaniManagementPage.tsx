import { Building2, Plus, Search } from 'lucide-react';

export default function PerpaniManagementPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Perpani Management</h1>
                        <p className="text-sm text-dark-400">Manage Perpani organizations and records</p>
                    </div>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    Add Perpani
                </button>
            </div>

            {/* Search Bar */}
            <div className="card">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                        type="text"
                        placeholder="Search Perpani organizations..."
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
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">CORE ID</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Name</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Province</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">City</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Status</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-dark-400">
                                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No Perpani records found</p>
                                    <p className="text-sm mt-1">Database table: <code className="text-primary-400">perpani</code></p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
