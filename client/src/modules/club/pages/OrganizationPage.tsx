import { motion } from 'framer-motion';
import { Building2, Edit3, Save, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { useState } from 'react';

export default function OrganizationPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [orgData, setOrgData] = useState({
        name: 'Jakarta Archery Club',
        description: 'Premier archery training center in Jakarta since 2010',
        address: 'Jl. Sudirman No. 123, Jakarta Selatan',
        phone: '+62 21 1234567',
        email: 'info@jakartaarchery.id',
        website: 'www.jakartaarchery.id',
    });

    const handleSave = () => {
        setIsEditing(false);
        // TODO: Save to backend
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Organization Settings</h1>
                        <p className="text-dark-400">Manage your club's information</p>
                    </div>
                </div>
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    {isEditing ? <Save size={18} /> : <Edit3 size={18} />}
                    {isEditing ? 'Save Changes' : 'Edit'}
                </button>
            </motion.div>

            {/* Organization Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card"
            >
                <h2 className="text-lg font-semibold mb-6">Club Information</h2>

                <div className="space-y-4">
                    <div>
                        <label className="label">Club Name</label>
                        <input
                            type="text"
                            value={orgData.name}
                            onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                            disabled={!isEditing}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="label">Description</label>
                        <textarea
                            value={orgData.description}
                            onChange={(e) => setOrgData({ ...orgData, description: e.target.value })}
                            disabled={!isEditing}
                            rows={3}
                            className="input resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label flex items-center gap-2">
                                <MapPin size={14} /> Address
                            </label>
                            <input
                                type="text"
                                value={orgData.address}
                                onChange={(e) => setOrgData({ ...orgData, address: e.target.value })}
                                disabled={!isEditing}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="label flex items-center gap-2">
                                <Phone size={14} /> Phone
                            </label>
                            <input
                                type="text"
                                value={orgData.phone}
                                onChange={(e) => setOrgData({ ...orgData, phone: e.target.value })}
                                disabled={!isEditing}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="label flex items-center gap-2">
                                <Mail size={14} /> Email
                            </label>
                            <input
                                type="email"
                                value={orgData.email}
                                onChange={(e) => setOrgData({ ...orgData, email: e.target.value })}
                                disabled={!isEditing}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="label flex items-center gap-2">
                                <Globe size={14} /> Website
                            </label>
                            <input
                                type="text"
                                value={orgData.website}
                                onChange={(e) => setOrgData({ ...orgData, website: e.target.value })}
                                disabled={!isEditing}
                                className="input"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Club Logo */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card"
            >
                <h2 className="text-lg font-semibold mb-6">Club Logo</h2>
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                        <Building2 className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <p className="text-dark-400 text-sm mb-2">Upload your club logo (PNG, JPG, max 2MB)</p>
                        <button className="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-all text-sm">
                            Upload Logo
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
