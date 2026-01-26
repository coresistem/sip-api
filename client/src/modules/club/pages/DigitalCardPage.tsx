
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, BadgeCheck, Shield } from 'lucide-react';
import { useAuth } from '../../core/contexts/AuthContext';
import DigitalIDCard, { IDCardData } from '../components/DigitalIDCard';

export default function DigitalCardPage() {
    const { user } = useAuth();
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [availableRoles, setAvailableRoles] = useState<string[]>([]);
    const [roleData, setRoleData] = useState<Record<string, { sipId: string; status: string }>>({});

    // Parse user roles data on mount or user change
    useEffect(() => {
        if (user) {
            try {
                // Parse roles
                let roles: string[] = [];
                if (user.roles) {
                    roles = JSON.parse(user.roles);
                } else if (user.role) {
                    roles = [user.role];
                }

                // Parse SIP IDs and Statuses
                const sipIds = user.sipIds ? JSON.parse(user.sipIds) : { [user.role]: user.sipId };
                const statuses = user.roleStatuses ? JSON.parse(user.roleStatuses) : { [user.role]: user.isActive ? 'Active' : 'Inactive' };

                // Build combined data map
                const combinedData: Record<string, { sipId: string; status: string }> = {};
                roles.forEach(role => {
                    combinedData[role] = {
                        sipId: sipIds[role] || user.sipId || 'PENDING',
                        status: statuses[role] || (user.isActive ? 'Active' : 'Inactive')
                    };
                });

                setAvailableRoles(roles);
                setRoleData(combinedData);

                // Default to active role or first available
                if (roles.includes(user.role)) {
                    setSelectedRole(user.role);
                } else if (roles.length > 0) {
                    setSelectedRole(roles[0]);
                }
            } catch (error) {
                console.error('Error parsing user role data:', error);
                // Fallback
                setAvailableRoles([user.role]);
                setSelectedRole(user.role);
                setRoleData({
                    [user.role]: {
                        sipId: user.sipId || 'PENDING',
                        status: user.isActive ? 'ACTIVE' : 'INACTIVE'
                    }
                });
            }
        }
    }, [user]);

    // Current card data
    const currentData = roleData[selectedRole];

    // Map backend status to IDCardStatus
    const mapStatus = (status: string): any => {
        const s = status.toUpperCase();
        if (['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PROPOSED'].includes(s)) return s;
        return 'INACTIVE';
    };

    const idCardData: IDCardData = {
        sipId: currentData?.sipId || 'PENDING',
        name: user?.name || 'Unknown',
        photo: user?.avatarUrl,
        role: selectedRole,
        status: currentData ? mapStatus(currentData.status) : 'INACTIVE',
        verifiedBy: 'Jakarta Archery Club', // TODO: Fetch verification details
        verifiedAt: new Date(), // TODO: Fetch verification date
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4"
            >
                <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Digital ID Card</h1>
                    <p className="text-dark-400">Your official SIP identification card</p>
                </div>
            </motion.div>

            {/* Role Selector (if multiple roles) */}
            {availableRoles.length > 1 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
                >
                    {availableRoles.map(role => (
                        <button
                            key={role}
                            onClick={() => setSelectedRole(role)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${selectedRole === role
                                ? 'bg-primary-500 text-white'
                                : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
                                }`}
                        >
                            {role === user?.activeRole && <BadgeCheck size={14} />}
                            {role}
                        </button>
                    ))}
                </motion.div>
            )}

            {/* ID Card Display */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedRole}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="card relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <Shield size={120} />
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-lg font-semibold mb-1">
                            {selectedRole} ID Card
                        </h2>
                        <p className="text-sm text-dark-400 mb-6">
                            Official identification for {user?.name} as {selectedRole}.
                        </p>

                        <div className="flex justify-center py-4">
                            <DigitalIDCard data={idCardData} className="max-w-sm w-full" showExport={true} />
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Card Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card"
            >
                <h2 className="text-lg font-semibold mb-4">Card Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-dark-800/50 rounded-lg p-4">
                        <p className="text-xs text-dark-400 mb-1">SIP ID Format</p>
                        <p className="font-mono text-lg">XX.XXXX.XXXX</p>
                        <p className="text-xs text-dark-500 mt-2">Role Code . Province+City . Serial</p>
                    </div>
                    <div className="bg-dark-800/50 rounded-lg p-4">
                        <p className="text-xs text-dark-400 mb-1">Print Specifications</p>
                        <p className="text-sm">8.56 × 5.40 cm (CR80)</p>
                        <p className="text-xs text-dark-500 mt-2">300 DPI • 1011 × 638 px</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
