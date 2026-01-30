import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User, Mail, Shield, Settings, Users, Database, Activity, Server
} from 'lucide-react';

interface SuperAdminProfileSectionProps {
    user: {
        id: string;
        name: string;
        email: string;
        coreId?: string;
    };
}

export default function SuperAdminProfileSection({ user }: SuperAdminProfileSectionProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [email, setEmail] = useState(user.email || '');

    return (
        <div className="space-y-6">
            {/* Admin Information */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Shield className="w-5 h-5 text-red-400" />
                        Super Admin Profile
                    </h2>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`px-4 py-2 rounded-lg transition-all ${isEditing
                            ? 'bg-primary-500 text-white hover:bg-primary-600'
                            : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                            }`}
                    >
                        {isEditing ? 'Save Changes' : 'Edit'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                        <label className="label">Full Name</label>
                        <div className="input flex items-center gap-3 cursor-not-allowed opacity-70">
                            <User className="w-5 h-5 text-dark-400" />
                            <span>{user.name}</span>
                        </div>
                    </div>

                    {/* Core ID */}
                    <div>
                        <label className="label">Admin CORE ID</label>
                        <div className="input flex items-center gap-3 bg-dark-800/50 font-mono">
                            <Shield className="w-5 h-5 text-red-400" />
                            <span className="text-red-400">{user.coreId || 'Not generated'}</span>
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="label">Email</label>
                        {isEditing ? (
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input w-full"
                            />
                        ) : (
                            <div className="input flex items-center gap-3">
                                <Mail className="w-5 h-5 text-dark-400" />
                                <span>{email}</span>
                            </div>
                        )}
                    </div>

                    {/* Role */}
                    <div>
                        <label className="label">Role</label>
                        <div className="input flex items-center gap-3 bg-red-500/10 border-red-500/30">
                            <Shield className="w-5 h-5 text-red-400" />
                            <span className="text-red-400 font-semibold">Super Administrator</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* System Overview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card"
            >
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary-400" />
                    System Overview
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-dark-800/50 text-center">
                        <Users className="w-8 h-8 mx-auto text-primary-400 mb-2" />
                        <p className="text-2xl font-bold text-primary-400">0</p>
                        <p className="text-sm text-dark-400 mt-1">Total Users</p>
                    </div>
                    <div className="p-4 rounded-lg bg-dark-800/50 text-center">
                        <Activity className="w-8 h-8 mx-auto text-green-400 mb-2" />
                        <p className="text-2xl font-bold text-green-400">0</p>
                        <p className="text-sm text-dark-400 mt-1">Active Today</p>
                    </div>
                    <div className="p-4 rounded-lg bg-dark-800/50 text-center">
                        <Database className="w-8 h-8 mx-auto text-blue-400 mb-2" />
                        <p className="text-2xl font-bold text-blue-400">0</p>
                        <p className="text-sm text-dark-400 mt-1">Total Events</p>
                    </div>
                    <div className="p-4 rounded-lg bg-dark-800/50 text-center">
                        <Server className="w-8 h-8 mx-auto text-amber-400 mb-2" />
                        <p className="text-2xl font-bold text-amber-400">OK</p>
                        <p className="text-sm text-dark-400 mt-1">System Status</p>
                    </div>
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card"
            >
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary-400" />
                    Quick Actions
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button className="p-4 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors text-left">
                        <Users className="w-6 h-6 text-primary-400 mb-2" />
                        <p className="font-medium">Manage Users</p>
                        <p className="text-xs text-dark-400">View all users</p>
                    </button>
                    <button className="p-4 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors text-left">
                        <Shield className="w-6 h-6 text-red-400 mb-2" />
                        <p className="font-medium">Permissions</p>
                        <p className="text-xs text-dark-400">Edit roles</p>
                    </button>
                    <button className="p-4 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors text-left">
                        <Database className="w-6 h-6 text-blue-400 mb-2" />
                        <p className="font-medium">Database</p>
                        <p className="text-xs text-dark-400">View logs</p>
                    </button>
                    <button className="p-4 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors text-left">
                        <Settings className="w-6 h-6 text-amber-400 mb-2" />
                        <p className="font-medium">Settings</p>
                        <p className="text-xs text-dark-400">System config</p>
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
