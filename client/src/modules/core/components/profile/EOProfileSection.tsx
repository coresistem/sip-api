import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User, Phone, Mail, CreditCard, Building2, MapPin, Globe, Calendar, Users
} from 'lucide-react';

interface EOProfileSectionProps {
    user: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        coreId?: string;
    };
    onUpdate?: (data: Partial<EOData>) => void;
}

interface EOData {
    organizationName: string;
    email: string;
    phone: string;
    address: string;
    provinceId: string;
    cityId: string;
    website: string;
    instagram: string;
    description: string;
    eventsOrganized: number;
    establishedYear: number;
}

export default function EOProfileSection({ user, onUpdate }: EOProfileSectionProps) {
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState<EOData>({
        organizationName: '',
        email: user.email || '',
        phone: user.phone || '',
        address: '',
        provinceId: '',
        cityId: '',
        website: '',
        instagram: '',
        description: '',
        eventsOrganized: 0,
        establishedYear: new Date().getFullYear(),
    });

    const handleChange = (field: keyof EOData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onUpdate?.(formData);
        setIsEditing(false);
    };

    return (
        <div className="space-y-6">
            {/* Organization Information */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-orange-400" />
                        Event Organizer Profile
                    </h2>
                    <button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className={`px-4 py-2 rounded-lg transition-all ${isEditing
                            ? 'bg-primary-500 text-white hover:bg-primary-600'
                            : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                            }`}
                    >
                        {isEditing ? 'Save Changes' : 'Edit'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Person Name */}
                    <div>
                        <label className="label">Contact Person</label>
                        <div className="input flex items-center gap-3 cursor-not-allowed opacity-70">
                            <User className="w-5 h-5 text-dark-400" />
                            <span>{user.name}</span>
                        </div>
                    </div>

                    {/* Core ID */}
                    <div>
                        <label className="label">EO CORE ID</label>
                        <div className="input flex items-center gap-3 bg-dark-800/50 font-mono">
                            <CreditCard className="w-5 h-5 text-orange-400" />
                            <span className="text-orange-400">{user.coreId || 'Not generated'}</span>
                        </div>
                    </div>

                    {/* Organization Name */}
                    <div className="md:col-span-2">
                        <label className="label">Organization / Company Name</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.organizationName}
                                onChange={(e) => handleChange('organizationName', e.target.value)}
                                className="input w-full"
                                placeholder="Enter organization name"
                            />
                        ) : (
                            <div className="input flex items-center gap-3">
                                <Building2 className="w-5 h-5 text-dark-400" />
                                <span>{formData.organizationName || 'Not set'}</span>
                            </div>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="label">Email</label>
                        {isEditing ? (
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className="input w-full"
                            />
                        ) : (
                            <div className="input flex items-center gap-3">
                                <Mail className="w-5 h-5 text-dark-400" />
                                <span>{formData.email || 'Not set'}</span>
                            </div>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="label">Phone / WhatsApp</label>
                        {isEditing ? (
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                className="input w-full"
                            />
                        ) : (
                            <div className="input flex items-center gap-3">
                                <Phone className="w-5 h-5 text-dark-400" />
                                <span>{formData.phone || 'Not set'}</span>
                            </div>
                        )}
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                        <label className="label">Office Address</label>
                        {isEditing ? (
                            <textarea
                                value={formData.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                className="input w-full"
                                rows={2}
                            />
                        ) : (
                            <div className="input flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-dark-400" />
                                <span>{formData.address || 'Not set'}</span>
                            </div>
                        )}
                    </div>

                    {/* Website */}
                    <div>
                        <label className="label">Website</label>
                        {isEditing ? (
                            <input
                                type="url"
                                value={formData.website}
                                onChange={(e) => handleChange('website', e.target.value)}
                                className="input w-full"
                                placeholder="https://..."
                            />
                        ) : (
                            <div className="input flex items-center gap-3">
                                <Globe className="w-5 h-5 text-dark-400" />
                                <span>{formData.website || 'Not set'}</span>
                            </div>
                        )}
                    </div>

                    {/* Instagram */}
                    <div>
                        <label className="label">Instagram</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.instagram}
                                onChange={(e) => handleChange('instagram', e.target.value)}
                                className="input w-full"
                                placeholder="@username"
                            />
                        ) : (
                            <div className="input">
                                <span>{formData.instagram || 'Not set'}</span>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                        <label className="label">About / Description</label>
                        {isEditing ? (
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                className="input w-full"
                                rows={3}
                                placeholder="Describe your organization and services..."
                            />
                        ) : (
                            <div className="input min-h-[80px]">
                                <span>{formData.description || 'Not set'}</span>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Statistics */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card"
            >
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-400" />
                    Event Statistics
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-dark-800/50 text-center">
                        <p className="text-3xl font-bold text-primary-400">{formData.eventsOrganized}</p>
                        <p className="text-sm text-dark-400 mt-1">Total Events</p>
                    </div>
                    <div className="p-4 rounded-lg bg-dark-800/50 text-center">
                        <p className="text-3xl font-bold text-green-400">0</p>
                        <p className="text-sm text-dark-400 mt-1">This Year</p>
                    </div>
                    <div className="p-4 rounded-lg bg-dark-800/50 text-center">
                        <p className="text-3xl font-bold text-amber-400">0</p>
                        <p className="text-sm text-dark-400 mt-1">Upcoming</p>
                    </div>
                    <div className="p-4 rounded-lg bg-dark-800/50 text-center">
                        <p className="text-3xl font-bold text-blue-400">0</p>
                        <p className="text-sm text-dark-400 mt-1">Total Participants</p>
                    </div>
                </div>
            </motion.div>

            {/* Recent Events */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card"
            >
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary-400" />
                    Recent Events
                </h2>

                <div className="text-center py-8 text-dark-400">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No events organized yet</p>
                </div>
            </motion.div>
        </div>
    );
}
