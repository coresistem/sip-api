import { GraduationCap, Plus, Search } from 'lucide-react';

export default function SchoolsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Schools</h1>
                        <p className="text-sm text-dark-400">Manage school database and student enrollments</p>
                    </div>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    Add School
                </button>
            </div>

            {/* Search Bar */}
            <div className="card">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                        type="text"
                        placeholder="Search schools by name or NPSN..."
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
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">SIP ID</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">NPSN</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">School Name</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Province</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">City</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Status</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Students</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={7} className="text-center py-12 text-dark-400">
                                    <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No schools found</p>
                                    <p className="text-sm mt-1">Database tables: <code className="text-primary-400">schools</code>, <code className="text-primary-400">student_enrollments</code></p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
