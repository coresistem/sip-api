import { Bell, Search, Check, X } from 'lucide-react';

export default function NotificationsPage() {
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
                    <button className="btn-secondary flex items-center gap-2">
                        <Check size={18} />
                        Mark All Read
                    </button>
                    <button className="btn-secondary flex items-center gap-2">
                        <X size={18} />
                        Clear All
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="card">
                <div className="flex gap-2 border-b border-dark-700 pb-0">
                    <button className="px-4 py-2 text-sm font-medium text-primary-400 border-b-2 border-primary-400">All</button>
                    <button className="px-4 py-2 text-sm font-medium text-dark-400 hover:text-white">Unread</button>
                    <button className="px-4 py-2 text-sm font-medium text-dark-400 hover:text-white">Info</button>
                    <button className="px-4 py-2 text-sm font-medium text-dark-400 hover:text-white">Warning</button>
                    <button className="px-4 py-2 text-sm font-medium text-dark-400 hover:text-white">Alert</button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="card">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                        type="text"
                        placeholder="Search notifications..."
                        className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                </div>
            </div>

            {/* Notifications List */}
            <div className="card">
                <div className="text-center py-12 text-dark-400">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No notifications found</p>
                    <p className="text-sm mt-1">Database table: <code className="text-primary-400">notifications</code></p>
                </div>
            </div>
        </div>
    );
}
