import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Building2, MapPin, Globe, Users, Mail, Phone, Shield, Calendar
} from 'lucide-react';

interface PerpaniProfileSectionProps {
    user: {
        id: string;
        name: string;
        email: string;
        coreId?: string;
    };
    perpani?: PerpaniData;
    onUpdate?: (data: Partial<PerpaniData>) => void;
}

interface PerpaniData {
    coreId: string;
    name: string;
    level: 'NATIONAL' | 'PROVINCIAL' | 'CITY';
    provinceId: string;
    provinceName: string;
    cityId: string;
    cityName: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    chairperson: string;
    secretary: string;
    establishedDate: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export default function PerpaniProfileSection({ user: _user, perpani, onUpdate }: PerpaniProfileSectionProps) {
    const dateInputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState<PerpaniData>({
        coreId: perpani?.coreId || '',
        name: perpani?.name || '',
        level: perpani?.level || 'PROVINCIAL',
        provinceId: perpani?.provinceId || '',
        provinceName: perpani?.provinceName || '',
        cityId: perpani?.cityId || '',
        cityName: perpani?.cityName || '',
        address: perpani?.address || '',
        phone: perpani?.phone || '',
        email: perpani?.email || '',
        website: perpani?.website || '',
        chairperson: perpani?.chairperson || '',
        secretary: perpani?.secretary || '',
        establishedDate: perpani?.establishedDate || '',
        status: perpani?.status || 'ACTIVE',
    });

    const handleChange = (field: keyof PerpaniData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onUpdate?.(formData);
        setIsEditing(false);
    };

    const levelColors = {
        NATIONAL: 'bg-red-500/20 text-red-400',
        PROVINCIAL: 'bg-blue-500/20 text-blue-400',
        CITY: 'bg-green-500/20 text-green-400',
    };

    return (
        <div className="space-y-6">
            {/* Perpani Information Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Shield className="w-5 h-5 text-red-400" />
                        Perpani Organization
                    </h2>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${levelColors[formData.level]}`}>
                            {formData.level === 'NATIONAL' ? 'PB Perpani' :
                                formData.level === 'PROVINCIAL' ? 'Pengprov' : 'Pengkot/Pengkab'}
                        </span>
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Perpani CORE ID */}
                    <div>
                        <label className="label">Perpani CORE ID</label>
                        <div className="input flex items-center gap-3 bg-dark-800/50 font-mono">
                            <Shield className="w-5 h-5 text-red-400" />
                            <span className="text-red-400">{formData.coreId || 'Not generated'}</span>
                        </div>
                    </div>

                    {/* Organization Name */}
                    <div>
                        <label className="label">Organization Name</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="input w-full"
                                placeholder="Pengprov Perpani DKI Jakarta"
                            />
                        ) : (
                            <div className="input flex items-center gap-3">
                                <Building2 className="w-5 h-5 text-dark-400" />
                                <span>{formData.name || 'Not set'}</span>
                            </div>
                        )}
                    </div>

                    {/* Province */}
                    <div>
                        <label className="label">Province</label>
                        {isEditing ? (
                            <select
                                value={formData.provinceId}
                                onChange={(e) => handleChange('provinceId', e.target.value)}
                                className="input w-full"
                            >
                                <option value="">Select Province</option>
                            </select>
                        ) : (
                            <div className="input flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-dark-400" />
                                <span>{formData.provinceName || 'Not set'}</span>
                            </div>
                        )}
                    </div>

                    {/* City (for Pengkot/Pengkab) */}
                    {formData.level === 'CITY' && (
                        <div>
                            <label className="label">City/Regency</label>
                            {isEditing ? (
                                <select
                                    value={formData.cityId}
                                    onChange={(e) => handleChange('cityId', e.target.value)}
                                    className="input w-full"
                                >
                                    <option value="">Select City</option>
                                </select>
                            ) : (
                                <div className="input flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-dark-400" />
                                    <span>{formData.cityName || 'Not set'}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Address */}
                    <div className="md:col-span-2">
                        <label className="label">Address</label>
                        {isEditing ? (
                            <textarea
                                value={formData.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                className="input w-full"
                                rows={2}
                                placeholder="Office address..."
                            />
                        ) : (
                            <div className="input min-h-[60px]">
                                <span>{formData.address || 'Not set'}</span>
                            </div>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="label">Phone</label>
                        {isEditing ? (
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                className="input w-full"
                                placeholder="62812xxxxxx"
                            />
                        ) : (
                            <div className="input flex items-center gap-3">
                                <Phone className="w-5 h-5 text-dark-400" />
                                <span>{formData.phone || 'Not set'}</span>
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
                                placeholder="email@perpani.or.id"
                            />
                        ) : (
                            <div className="input flex items-center gap-3">
                                <Mail className="w-5 h-5 text-dark-400" />
                                <span>{formData.email || 'Not set'}</span>
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

                    {/* Established Date */}
                    <div>
                        <label className="label">Established Date</label>
                        {isEditing ? (
                            <div
                                className="relative group cursor-pointer"
                                onClick={() => {
                                    const input = dateInputRef.current;
                                    if (input) {
                                        const el = input as any;
                                        if (el.showPicker) {
                                            el.showPicker();
                                        } else {
                                            el.focus();
                                            el.click();
                                        }
                                    }
                                }}
                            >
                                <input
                                    ref={dateInputRef}
                                    type="date"
                                    value={formData.establishedDate}
                                    onChange={(e) => handleChange('establishedDate', e.target.value)}
                                    className="input w-full cursor-pointer pr-10"
                                />
                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 pointer-events-none" />
                            </div>
                        ) : (
                            <div className="input flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-dark-400" />
                                <span>{formData.establishedDate || 'Not set'}</span>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Leadership Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card"
            >
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary-400" />
                    Leadership
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label">Chairperson (Ketua Umum)</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.chairperson}
                                onChange={(e) => handleChange('chairperson', e.target.value)}
                                className="input w-full"
                                placeholder="Name"
                            />
                        ) : (
                            <div className="input">
                                <span>{formData.chairperson || 'Not set'}</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="label">Secretary (Sekretaris Umum)</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.secretary}
                                onChange={(e) => handleChange('secretary', e.target.value)}
                                className="input w-full"
                                placeholder="Name"
                            />
                        ) : (
                            <div className="input">
                                <span>{formData.secretary || 'Not set'}</span>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Member Clubs Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card"
            >
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary-400" />
                    Member Clubs
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-dark-800/50 text-center">
                        <p className="text-3xl font-bold text-primary-400">0</p>
                        <p className="text-sm text-dark-400 mt-1">Total Clubs</p>
                    </div>
                    <div className="p-4 rounded-lg bg-dark-800/50 text-center">
                        <p className="text-3xl font-bold text-green-400">0</p>
                        <p className="text-sm text-dark-400 mt-1">Active</p>
                    </div>
                    <div className="p-4 rounded-lg bg-dark-800/50 text-center">
                        <p className="text-3xl font-bold text-blue-400">0</p>
                        <p className="text-sm text-dark-400 mt-1">Athletes</p>
                    </div>
                    <div className="p-4 rounded-lg bg-dark-800/50 text-center">
                        <p className="text-3xl font-bold text-amber-400">0</p>
                        <p className="text-sm text-dark-400 mt-1">Coaches</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
