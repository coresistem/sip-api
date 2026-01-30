import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, Phone, Globe, Instagram, Camera, Search, Plus,
    Users, FileText, Shield, Trash2, Check, X, CreditCard
} from 'lucide-react';

interface ClubProfileSectionProps {
    user: {
        id: string;
        name: string;
        email: string;
        coreId?: string;
        clubId?: string;
    };
    club?: ClubData;
    onUpdate?: (data: Partial<ClubData>) => void;
}

interface ClubData {
    name: string;
    description: string;
    address: string;
    whatsappHotline: string;
    instagram: string;
    website: string;
    logoUrl: string;
    isPerpaniMember: boolean;
    skPerpaniNo: string;
    perpaniId: string;
}

interface OrganizationMember {
    id: string;
    position: string;
    customTitle?: string;
    name: string;
    whatsapp: string;
    email: string;
}

const POSITIONS = [
    { value: 'CHAIRPERSON', label: 'Chairperson' },
    { value: 'SECRETARY', label: 'Secretary' },
    { value: 'TREASURER', label: 'Treasurer' },
    { value: 'HEAD_COACH', label: 'Head Coach' },
    { value: 'CUSTOM', label: 'Custom Position' },
];

export default function ClubProfileSection({ user: _user, club, onUpdate }: ClubProfileSectionProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'perpani' | 'organization'>('info');
    const [isEditing, setIsEditing] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);
    const [showPerpaniSearch, setShowPerpaniSearch] = useState(false);
    const [showAddPerpani, setShowAddPerpani] = useState(false);

    const [formData, setFormData] = useState<ClubData>({
        name: club?.name || '',
        description: club?.description || '',
        address: club?.address || '',
        whatsappHotline: club?.whatsappHotline || '',
        instagram: club?.instagram || '',
        website: club?.website || '',
        logoUrl: club?.logoUrl || '',
        isPerpaniMember: club?.isPerpaniMember || false,
        skPerpaniNo: club?.skPerpaniNo || '',
        perpaniId: club?.perpaniId || '',
    });

    const [organization, setOrganization] = useState<OrganizationMember[]>([
        { id: '1', position: 'CHAIRPERSON', name: '', whatsapp: '', email: '' },
        { id: '2', position: 'SECRETARY', name: '', whatsapp: '', email: '' },
        { id: '3', position: 'TREASURER', name: '', whatsapp: '', email: '' },
        { id: '4', position: 'HEAD_COACH', name: '', whatsapp: '', email: '' },
    ]);

    const [perpaniSearch, setPerpaniSearch] = useState('');
    const [newMember, setNewMember] = useState<OrganizationMember>({
        id: '',
        position: 'CUSTOM',
        customTitle: '',
        name: '',
        whatsapp: '',
        email: '',
    });

    const handleChange = (field: keyof ClubData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onUpdate?.(formData);
        setIsEditing(false);
    };

    const handleOrgChange = (id: string, field: keyof OrganizationMember, value: string) => {
        setOrganization(prev =>
            prev.map(m => (m.id === id ? { ...m, [field]: value } : m))
        );
    };

    const handleAddMember = () => {
        const member: OrganizationMember = {
            ...newMember,
            id: Date.now().toString(),
        };
        setOrganization(prev => [...prev, member]);
        setNewMember({
            id: '',
            position: 'CUSTOM',
            customTitle: '',
            name: '',
            whatsapp: '',
            email: '',
        });
        setShowAddMember(false);
    };

    const handleRemoveMember = (id: string) => {
        setOrganization(prev => prev.filter(m => m.id !== id));
    };

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-dark-700 pb-2">
                <button
                    onClick={() => setActiveTab('info')}
                    className={`px-4 py-2 rounded-t-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'info'
                        ? 'bg-dark-700 text-white'
                        : 'text-dark-400 hover:text-white'
                        }`}
                >
                    <Building2 size={18} />
                    Club Information
                </button>
                <button
                    onClick={() => setActiveTab('perpani')}
                    className={`px-4 py-2 rounded-t-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'perpani'
                        ? 'bg-dark-700 text-white'
                        : 'text-dark-400 hover:text-white'
                        }`}
                >
                    <Shield size={18} />
                    Perpani
                </button>
                <button
                    onClick={() => setActiveTab('organization')}
                    className={`px-4 py-2 rounded-t-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'organization'
                        ? 'bg-dark-700 text-white'
                        : 'text-dark-400 hover:text-white'
                        }`}
                >
                    <Users size={18} />
                    Organization
                </button>
            </div>

            <AnimatePresence mode="wait">
                {/* Club Information Tab */}
                {activeTab === 'info' && (
                    <motion.div
                        key="info"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="card"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-primary-400" />
                                Club Information
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

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Club Logo */}
                            <div className="lg:row-span-3">
                                <label className="label">Club Logo</label>
                                <div className="relative group aspect-square rounded-xl bg-dark-800 border-2 border-dashed border-dark-600 flex items-center justify-center overflow-hidden">
                                    {formData.logoUrl ? (
                                        <img
                                            src={formData.logoUrl}
                                            alt="Club Logo"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center p-4">
                                            <Camera className="w-12 h-12 mx-auto text-dark-500 mb-2" />
                                            <p className="text-sm text-dark-400">Upload Logo</p>
                                        </div>
                                    )}
                                    {isEditing && (
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button className="px-4 py-2 rounded-lg bg-primary-500 text-white">
                                                Change Logo
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Club Name */}
                            <div className="lg:col-span-2">
                                <label className="label">Club Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        className="input w-full"
                                        placeholder="Enter club name"
                                    />
                                ) : (
                                    <div className="input">{formData.name || 'Not set'}</div>
                                )}
                            </div>

                            {/* Description */}
                            <div className="lg:col-span-2">
                                <label className="label">Description</label>
                                {isEditing ? (
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        className="input w-full"
                                        rows={3}
                                        placeholder="Club description..."
                                    />
                                ) : (
                                    <div className="input min-h-[80px]">{formData.description || 'Not set'}</div>
                                )}
                            </div>

                            {/* Address */}
                            <div className="lg:col-span-2">
                                <label className="label">Address</label>
                                {isEditing ? (
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => handleChange('address', e.target.value)}
                                        className="input w-full"
                                        rows={2}
                                        placeholder="Club address..."
                                    />
                                ) : (
                                    <div className="input min-h-[60px]">{formData.address || 'Not set'}</div>
                                )}
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            <div>
                                <label className="label">WhatsApp Hotline</label>
                                {isEditing ? (
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                        <input
                                            type="tel"
                                            value={formData.whatsappHotline}
                                            onChange={(e) => handleChange('whatsappHotline', e.target.value)}
                                            className="input pl-11 w-full"
                                            placeholder="+62..."
                                        />
                                    </div>
                                ) : (
                                    <div className="input flex items-center gap-3">
                                        <Phone className="w-5 h-5 text-dark-400" />
                                        <span>{formData.whatsappHotline || 'Not set'}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="label">Instagram</label>
                                {isEditing ? (
                                    <div className="relative">
                                        <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                        <input
                                            type="text"
                                            value={formData.instagram}
                                            onChange={(e) => handleChange('instagram', e.target.value)}
                                            className="input pl-11 w-full"
                                            placeholder="@clubname"
                                        />
                                    </div>
                                ) : (
                                    <div className="input flex items-center gap-3">
                                        <Instagram className="w-5 h-5 text-dark-400" />
                                        <span>{formData.instagram || 'Not set'}</span>
                                    </div>
                                )}
                            </div>

                            <div>
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
                                        <span>{formData.website || 'Not set'}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Perpani Tab */}
                {activeTab === 'perpani' && (
                    <motion.div
                        key="perpani"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="card"
                    >
                        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary-400" />
                            Perpani Membership
                        </h2>

                        {/* Perpani Member Toggle */}
                        <div className="mb-6">
                            <label className="label">Club Perpani Member?</label>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => handleChange('isPerpaniMember', true)}
                                    className={`flex-1 p-4 rounded-lg border transition-all ${formData.isPerpaniMember
                                        ? 'bg-green-500/20 border-green-500 text-green-400'
                                        : 'bg-dark-800 border-dark-700 text-dark-400 hover:border-green-500/50'
                                        }`}
                                >
                                    <Check className="w-6 h-6 mx-auto mb-1" />
                                    <span>Yes</span>
                                </button>
                                <button
                                    onClick={() => handleChange('isPerpaniMember', false)}
                                    className={`flex-1 p-4 rounded-lg border transition-all ${!formData.isPerpaniMember
                                        ? 'bg-red-500/20 border-red-500 text-red-400'
                                        : 'bg-dark-800 border-dark-700 text-dark-400 hover:border-red-500/50'
                                        }`}
                                >
                                    <X className="w-6 h-6 mx-auto mb-1" />
                                    <span>No</span>
                                </button>
                            </div>
                        </div>

                        {formData.isPerpaniMember && (
                            <div className="space-y-4">
                                {/* SK Perpani No */}
                                <div>
                                    <label className="label">SK Perpani No</label>
                                    <input
                                        type="text"
                                        value={formData.skPerpaniNo}
                                        onChange={(e) => handleChange('skPerpaniNo', e.target.value)}
                                        className="input w-full"
                                        placeholder="Enter SK Perpani number"
                                    />
                                </div>

                                {/* SK Perpani Document */}
                                <div>
                                    <label className="label">SK Perpani Document</label>
                                    <button className="w-full p-4 rounded-lg border-2 border-dashed border-dark-600 hover:border-primary-500/50 transition-colors flex items-center justify-center gap-2 text-dark-400">
                                        <FileText className="w-5 h-5" />
                                        Select from File Manager
                                    </button>
                                </div>

                                {/* Perpani Link */}
                                <div>
                                    <label className="label">Perpani (Search Core)</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                        <input
                                            type="text"
                                            value={perpaniSearch}
                                            onChange={(e) => setPerpaniSearch(e.target.value)}
                                            onFocus={() => setShowPerpaniSearch(true)}
                                            className="input pl-11 w-full"
                                            placeholder="Search Perpani by Core ID..."
                                        />
                                    </div>

                                    {showPerpaniSearch && perpaniSearch && (
                                        <div className="mt-2 p-4 rounded-lg bg-dark-800 border border-dark-700">
                                            <div className="flex items-center justify-between text-dark-400 mb-3">
                                                <span className="text-sm">No Perpani found</span>
                                                <button
                                                    onClick={() => setShowAddPerpani(true)}
                                                    className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
                                                >
                                                    <Plus size={14} />
                                                    Add New Perpani
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Add Perpani Modal */}
                        <AnimatePresence>
                            {showAddPerpani && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                                    onClick={() => setShowAddPerpani(false)}
                                >
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.9, opacity: 0 }}
                                        className="card max-w-lg w-full"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-primary-400" />
                                            Add New Perpani
                                        </h3>

                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="label">Province</label>
                                                    <select className="input w-full">
                                                        <option value="">Select Province</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="label">City</label>
                                                    <select className="input w-full">
                                                        <option value="">Select City</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="label">Address</label>
                                                <textarea className="input w-full" rows={2} placeholder="Perpani address"></textarea>
                                            </div>
                                        </div>

                                        <p className="mt-4 text-sm text-dark-400">
                                            Perpani Core ID will be auto-generated. Status: <span className="text-amber-400">No Operator</span>
                                        </p>

                                        <div className="flex gap-3 mt-6">
                                            <button
                                                onClick={() => setShowAddPerpani(false)}
                                                className="flex-1 btn-secondary"
                                            >
                                                Cancel
                                            </button>
                                            <button className="flex-1 btn-primary">
                                                Create Perpani
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Organization Tab */}
                {activeTab === 'organization' && (
                    <motion.div
                        key="organization"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="card"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary-400" />
                                Organization Structure
                            </h2>
                            <button
                                onClick={() => setShowAddMember(true)}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Add Position
                            </button>
                        </div>

                        {/* Organization Members */}
                        <div className="space-y-4">
                            {organization.map((member) => (
                                <div
                                    key={member.id}
                                    className="p-4 rounded-lg bg-dark-800/50 border border-dark-700"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium text-primary-400">
                                            {member.position === 'CUSTOM'
                                                ? member.customTitle
                                                : POSITIONS.find(p => p.value === member.position)?.label}
                                        </h4>
                                        {member.position === 'CUSTOM' && (
                                            <button
                                                onClick={() => handleRemoveMember(member.id)}
                                                className="p-1.5 rounded hover:bg-red-500/20 text-dark-400 hover:text-red-400"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-xs text-dark-400">Name</label>
                                            <input
                                                type="text"
                                                value={member.name}
                                                onChange={(e) => handleOrgChange(member.id, 'name', e.target.value)}
                                                className="input w-full mt-1"
                                                placeholder="Enter name"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-dark-400">WhatsApp</label>
                                            <input
                                                type="tel"
                                                value={member.whatsapp}
                                                onChange={(e) => handleOrgChange(member.id, 'whatsapp', e.target.value)}
                                                className="input w-full mt-1"
                                                placeholder="+62..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-dark-400">Email</label>
                                            <input
                                                type="email"
                                                value={member.email}
                                                onChange={(e) => handleOrgChange(member.id, 'email', e.target.value)}
                                                className="input w-full mt-1"
                                                placeholder="email@..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add Member Modal */}
                        <AnimatePresence>
                            {showAddMember && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                                    onClick={() => setShowAddMember(false)}
                                >
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.9, opacity: 0 }}
                                        className="card max-w-md w-full"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <Plus className="w-5 h-5 text-primary-400" />
                                            Add Position
                                        </h3>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="label">Position Title</label>
                                                <input
                                                    type="text"
                                                    value={newMember.customTitle}
                                                    onChange={(e) => setNewMember(prev => ({ ...prev, customTitle: e.target.value }))}
                                                    className="input w-full"
                                                    placeholder="e.g., Vice Chairperson, Coach Assistant"
                                                />
                                            </div>
                                            <div>
                                                <label className="label">Name</label>
                                                <input
                                                    type="text"
                                                    value={newMember.name}
                                                    onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                                                    className="input w-full"
                                                    placeholder="Enter name"
                                                />
                                            </div>
                                            <div>
                                                <label className="label">WhatsApp</label>
                                                <input
                                                    type="tel"
                                                    value={newMember.whatsapp}
                                                    onChange={(e) => setNewMember(prev => ({ ...prev, whatsapp: e.target.value }))}
                                                    className="input w-full"
                                                    placeholder="+62..."
                                                />
                                            </div>
                                            <div>
                                                <label className="label">Email</label>
                                                <input
                                                    type="email"
                                                    value={newMember.email}
                                                    onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                                                    className="input w-full"
                                                    placeholder="email@..."
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-3 mt-6">
                                            <button
                                                onClick={() => setShowAddMember(false)}
                                                className="flex-1 btn-secondary"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleAddMember}
                                                className="flex-1 btn-primary"
                                            >
                                                Add Position
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
