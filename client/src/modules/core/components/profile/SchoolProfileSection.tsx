import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    GraduationCap, MapPin, Globe, Users, Building2,
    ExternalLink, AlertCircle
} from 'lucide-react';

interface SchoolProfileSectionProps {
    user: {
        id: string;
        name: string;
        email: string;
        sipId?: string;
    };
    school?: SchoolData;
    onUpdate?: (data: Partial<SchoolData>) => void;
}

interface SchoolData {
    sipId: string;
    npsn: string;
    name: string;
    provinceId: string;
    provinceName: string;
    cityId: string;
    cityName: string;
    address: string;
    website: string;
    sourceUrl: string;
    status: 'NO_OPERATOR' | 'ACTIVE';
}

export default function SchoolProfileSection({ user: _user, school, onUpdate }: SchoolProfileSectionProps) {
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState<SchoolData>({
        sipId: school?.sipId || '',
        npsn: school?.npsn || '',
        name: school?.name || '',
        provinceId: school?.provinceId || '',
        provinceName: school?.provinceName || '',
        cityId: school?.cityId || '',
        cityName: school?.cityName || '',
        address: school?.address || '',
        website: school?.website || '',
        sourceUrl: school?.sourceUrl || '',
        status: school?.status || 'NO_OPERATOR',
    });

    const handleChange = (field: keyof SchoolData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onUpdate?.(formData);
        setIsEditing(false);
    };

    return (
        <div className="space-y-6">
            {/* Status Banner */}
            {formData.status === 'NO_OPERATOR' && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30"
                >
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-amber-400">No Operator Assigned</h4>
                            <p className="text-sm text-dark-400 mt-1">
                                This school account does not have an active operator.
                                Contact administrator to become the school operator.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* School Information Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-primary-400" />
                        School Information
                    </h2>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${formData.status === 'ACTIVE'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-amber-500/20 text-amber-400'
                            }`}>
                            {formData.status === 'ACTIVE' ? 'Active' : 'No Operator'}
                        </span>
                        {formData.status === 'ACTIVE' && (
                            <button
                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                className={`px-4 py-2 rounded-lg transition-all ${isEditing
                                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                                    : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                                    }`}
                            >
                                {isEditing ? 'Save Changes' : 'Edit'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* School SIP ID */}
                    <div>
                        <label className="label">School SIP ID</label>
                        <div className="input flex items-center gap-3 bg-dark-800/50 font-mono">
                            <Building2 className="w-5 h-5 text-dark-400" />
                            <span className="text-primary-400">{formData.sipId || 'Not generated'}</span>
                        </div>
                    </div>

                    {/* NPSN */}
                    <div>
                        <label className="label">NPSN (National School ID)</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.npsn}
                                onChange={(e) => handleChange('npsn', e.target.value)}
                                className="input w-full font-mono"
                                placeholder="8 digit NPSN"
                                maxLength={8}
                            />
                        ) : (
                            <div className="input flex items-center gap-3">
                                <span className="font-mono">{formData.npsn || 'Not set'}</span>
                                {formData.npsn && (
                                    <a
                                        href={`https://sekolah.data.kemendikdasmen.go.id/sekolah?npsn=${formData.npsn}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-auto text-primary-400 hover:text-primary-300"
                                    >
                                        <ExternalLink size={16} />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* School Name */}
                    <div className="md:col-span-2">
                        <label className="label">School Name</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="input w-full"
                                placeholder="Enter school name"
                            />
                        ) : (
                            <div className="input">
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
                                {/* Province options would be populated from API */}
                            </select>
                        ) : (
                            <div className="input flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-dark-400" />
                                <span>{formData.provinceName || 'Not set'}</span>
                            </div>
                        )}
                    </div>

                    {/* City */}
                    <div>
                        <label className="label">City</label>
                        {isEditing ? (
                            <select
                                value={formData.cityId}
                                onChange={(e) => handleChange('cityId', e.target.value)}
                                className="input w-full"
                            >
                                <option value="">Select City</option>
                                {/* City options would be populated from API */}
                            </select>
                        ) : (
                            <div className="input flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-dark-400" />
                                <span>{formData.cityName || 'Not set'}</span>
                            </div>
                        )}
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                        <label className="label">Address</label>
                        {isEditing ? (
                            <textarea
                                value={formData.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                className="input w-full"
                                rows={3}
                                placeholder="School address..."
                            />
                        ) : (
                            <div className="input min-h-[80px]">
                                <span>{formData.address || 'Not set'}</span>
                            </div>
                        )}
                    </div>

                    {/* Website */}
                    <div className="md:col-span-2">
                        <label className="label">Website</label>
                        {isEditing ? (
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <input
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => handleChange('website', e.target.value)}
                                    className="input pl-11 w-full"
                                    placeholder="https://..."
                                />
                            </div>
                        ) : (
                            <div className="input flex items-center gap-3">
                                <Globe className="w-5 h-5 text-dark-400" />
                                {formData.website ? (
                                    <a
                                        href={formData.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary-400 hover:text-primary-300 flex items-center gap-1"
                                    >
                                        {formData.website}
                                        <ExternalLink size={14} />
                                    </a>
                                ) : (
                                    <span className="text-dark-400">Not set</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Kemendikdasmen Source Link */}
                <div className="mt-6 pt-6 border-t border-dark-700">
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-emerald-400">Official Data Source</p>
                                <p className="text-xs text-dark-400 mt-1">
                                    School data verified from Kemendikdasmen national database
                                </p>
                            </div>
                            <a
                                href="https://sekolah.data.kemendikdasmen.go.id/sekolah"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors flex items-center gap-2 whitespace-nowrap"
                            >
                                <ExternalLink size={16} />
                                Kemendikdasmen Database
                            </a>
                        </div>
                    </div>

                    {/* Source URL display */}
                    {formData.sourceUrl && (
                        <div className="mt-4">
                            <label className="label">School Page URL (Kemendikdasmen)</label>
                            <div className="input flex items-center gap-3">
                                <Globe className="w-5 h-5 text-dark-400" />
                                <a
                                    href={formData.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-400 hover:text-primary-300 flex items-center gap-1 truncate"
                                >
                                    {formData.sourceUrl}
                                    <ExternalLink size={14} className="flex-shrink-0" />
                                </a>
                            </div>
                            <p className="text-xs text-dark-500 mt-1">
                                This URL can be used by SuperAdmin to verify school data
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Students Summary Card (for active operators) */}
            {formData.status === 'ACTIVE' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card"
                >
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary-400" />
                        Student Athletes
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg bg-dark-800/50 text-center">
                            <p className="text-3xl font-bold text-primary-400">0</p>
                            <p className="text-sm text-dark-400 mt-1">Total Students</p>
                        </div>
                        <div className="p-4 rounded-lg bg-dark-800/50 text-center">
                            <p className="text-3xl font-bold text-blue-400">0</p>
                            <p className="text-sm text-dark-400 mt-1">Active</p>
                        </div>
                        <div className="p-4 rounded-lg bg-dark-800/50 text-center">
                            <p className="text-3xl font-bold text-green-400">0</p>
                            <p className="text-sm text-dark-400 mt-1">Graduated</p>
                        </div>
                        <div className="p-4 rounded-lg bg-dark-800/50 text-center">
                            <p className="text-3xl font-bold text-amber-400">0</p>
                            <p className="text-sm text-dark-400 mt-1">Transferred</p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h4 className="text-sm font-medium text-dark-400 mb-3">Recent Student Athletes</h4>
                        <div className="text-center py-8 text-dark-500">
                            No student athletes enrolled yet
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
