import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Save,
    Trash2,
    GripVertical,
    ChevronDown,
    ChevronRight,
    Settings,
    Eye,
    CheckSquare,
    Type,
    Hash,
    Calendar,
    List,
    FileText,
    PenTool,
    Target,
    ClipboardList,
    ArrowLeft,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    CreateFieldData,
    getModule,
    createModule,
    updateModule,
    addField,
    updateField,
    deleteField
} from '../services/moduleApi';

// Field type categories with all options
interface FieldTypeOption {
    value: string;
    label: string;
    commonTerm: string;
    function: string;
    sampleData: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface FieldCategory {
    id: number;
    name: string;
    color: string;
    types: FieldTypeOption[];
}

const FIELD_CATEGORIES: FieldCategory[] = [
    {
        id: 1,
        name: 'Text-based Input',
        color: 'blue',
        types: [
            { value: 'text', label: 'Text', commonTerm: 'Single-line Text', function: 'Short text', sampleData: 'Name', icon: Type },
            { value: 'textarea', label: 'Text Area', commonTerm: 'Multi-line Text', function: 'Long text', sampleData: 'Address', icon: FileText },
            { value: 'password', label: 'Password', commonTerm: 'Password Field', function: 'Confidential data', sampleData: '********', icon: Type },
            { value: 'email', label: 'Email', commonTerm: 'Email Field', function: 'Email validation', sampleData: 'a@b.com', icon: Type },
            { value: 'search', label: 'Search', commonTerm: 'Search Field', function: 'Searching', sampleData: 'keyword', icon: Type },
            { value: 'url', label: 'URL', commonTerm: 'URL Field', function: 'Web address', sampleData: 'https://', icon: Type },
            { value: 'username', label: 'Username', commonTerm: 'Username Field', function: 'User ID', sampleData: 'user01', icon: Type },
        ]
    },
    {
        id: 2,
        name: 'Numeric Input',
        color: 'green',
        types: [
            { value: 'number', label: 'Number', commonTerm: 'Number Field', function: 'General number', sampleData: '10', icon: Hash },
            { value: 'integer', label: 'Integer', commonTerm: 'Integer Field', function: 'Whole number', sampleData: '5', icon: Hash },
            { value: 'decimal', label: 'Decimal', commonTerm: 'Decimal Field', function: 'Fractional number', sampleData: '3.14', icon: Hash },
            { value: 'currency', label: 'Currency', commonTerm: 'Currency Field', function: 'Monetary value', sampleData: '100000', icon: Hash },
            { value: 'percentage', label: 'Percentage', commonTerm: 'Percent Field', function: 'Percentage value', sampleData: '75%', icon: Hash },
            { value: 'range', label: 'Range', commonTerm: 'Slider', function: 'Value range', sampleData: '1–10', icon: Hash },
        ]
    },
    {
        id: 3,
        name: 'Selection Input',
        color: 'purple',
        types: [
            { value: 'select', label: 'Select', commonTerm: 'Dropdown', function: 'Select one', sampleData: 'City', icon: List },
            { value: 'multiselect', label: 'Multi-Select', commonTerm: 'Multi Dropdown', function: 'Select multiple', sampleData: 'Hobbies', icon: List },
            { value: 'radio', label: 'Radio', commonTerm: 'Radio Button', function: 'Select one', sampleData: 'Gender', icon: List },
            { value: 'checkbox', label: 'Checkbox', commonTerm: 'Checkbox', function: 'Select multiple', sampleData: 'Facilities', icon: CheckSquare },
            { value: 'autocomplete', label: 'Autocomplete', commonTerm: 'Search Select', function: 'Search and select', sampleData: 'Product', icon: List },
        ]
    },
    {
        id: 4,
        name: 'Boolean Input',
        color: 'yellow',
        types: [
            { value: 'boolean', label: 'Boolean', commonTerm: 'Boolean Field', function: 'Yes / No', sampleData: 'TRUE', icon: CheckSquare },
            { value: 'toggle', label: 'Toggle', commonTerm: 'Switch', function: 'On / Off', sampleData: 'Active', icon: CheckSquare },
            { value: 'agreement', label: 'Agreement', commonTerm: 'Agreement Checkbox', function: 'Agree / Consent', sampleData: '✔', icon: CheckSquare },
        ]
    },
    {
        id: 5,
        name: 'Date & Time Input',
        color: 'orange',
        types: [
            { value: 'date', label: 'Date', commonTerm: 'Date Picker', function: 'Date', sampleData: '1/7/2026', icon: Calendar },
            { value: 'time', label: 'Time', commonTerm: 'Time Picker', function: 'Time', sampleData: '10:30', icon: Calendar },
            { value: 'datetime', label: 'DateTime', commonTerm: 'DateTime Picker', function: 'Date & time', sampleData: '1/7/2026 10:30', icon: Calendar },
            { value: 'month', label: 'Month', commonTerm: 'Month Picker', function: 'Month', sampleData: 'January', icon: Calendar },
            { value: 'year', label: 'Year', commonTerm: 'Year Picker', function: 'Year', sampleData: '2026', icon: Calendar },
            { value: 'duration', label: 'Duration', commonTerm: 'Duration Input', function: 'Time duration', sampleData: '2 hours', icon: Calendar },
        ]
    },
    {
        id: 6,
        name: 'File & Media Input',
        color: 'pink',
        types: [
            { value: 'file', label: 'File', commonTerm: 'File Upload', function: 'Upload document', sampleData: 'PDF', icon: FileText },
            { value: 'image', label: 'Image', commonTerm: 'Image Upload', function: 'Upload image', sampleData: 'JPG', icon: FileText },
            { value: 'video', label: 'Video', commonTerm: 'Video Upload', function: 'Upload video', sampleData: 'MP4', icon: FileText },
            { value: 'audio', label: 'Audio', commonTerm: 'Audio Upload', function: 'Upload audio', sampleData: 'MP3', icon: FileText },
            { value: 'multifile', label: 'Multiple File', commonTerm: 'Multi Upload', function: 'Upload multiple', sampleData: 'ZIP', icon: FileText },
        ]
    },
    {
        id: 7,
        name: 'Special / Advanced Input',
        color: 'red',
        types: [
            { value: 'hidden', label: 'Hidden', commonTerm: 'Hidden Field', function: 'Hidden data', sampleData: 'ID', icon: Settings },
            { value: 'readonly', label: 'Readonly', commonTerm: 'Read-only Field', function: 'Not editable', sampleData: 'NIK', icon: Settings },
            { value: 'richtext', label: 'Rich Text', commonTerm: 'WYSIWYG Editor', function: 'Formatted text', sampleData: 'Article', icon: FileText },
            { value: 'json', label: 'JSON', commonTerm: 'JSON Input', function: 'Structured data', sampleData: '{}', icon: Settings },
            { value: 'code', label: 'Code', commonTerm: 'Code Editor', function: 'Source code', sampleData: 'JS', icon: Settings },
            { value: 'color', label: 'Color', commonTerm: 'Color Picker', function: 'Select color', sampleData: '#FF0000', icon: Settings },
            { value: 'rating', label: 'Rating', commonTerm: 'Rating Input', function: 'Rating / Evaluation', sampleData: '⭐⭐⭐⭐', icon: Settings },
            { value: 'signature', label: 'Signature', commonTerm: 'Signature Pad', function: 'Digital signature', sampleData: '✍️', icon: PenTool },
        ]
    },
];

// Flatten all types for quick lookup
const ALL_FIELD_TYPES = FIELD_CATEGORIES.flatMap(cat => cat.types);

// Legacy compatible FIELD_TYPES for existing code
const FIELD_TYPES = ALL_FIELD_TYPES.map(t => ({
    value: t.value,
    label: t.label,
    icon: t.icon
}));

// Role options
const ROLE_OPTIONS = [
    { value: 'COACH', label: 'Coach' },
    { value: 'CLUB', label: 'Club' },
    { value: 'CLUB_OWNER', label: 'Club Owner' },
    { value: 'SCHOOL', label: 'School' },
    { value: 'ATHLETE', label: 'Athlete (View Only)' },
    { value: 'PARENT', label: 'Parent (View Only)' },
];

// Icon options
const ICON_OPTIONS = [
    { value: 'target', label: 'Target', icon: Target },
    { value: 'clipboard', label: 'Clipboard', icon: ClipboardList },
];

interface FieldFormData extends CreateFieldData {
    id?: string;
    isNew?: boolean;
}

const ModuleBuilderPage: React.FC = () => {
    const navigate = useNavigate();
    const { moduleId } = useParams<{ moduleId?: string }>();
    const isEditing = !!moduleId;

    // Module state
    const [moduleName, setModuleName] = useState('');
    const [moduleDescription, setModuleDescription] = useState('');
    const [moduleIcon, setModuleIcon] = useState('target');
    const [moduleStatus, setModuleStatus] = useState<'DRAFT' | 'ACTIVE' | 'ARCHIVED'>('DRAFT');
    const [allowedRoles, setAllowedRoles] = useState<string[]>(['COACH', 'CLUB']);
    const [menuCategory, setMenuCategory] = useState('Assessment');

    // Fields state
    const [sections, setSections] = useState<Record<string, FieldFormData[]>>({});
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [selectedField, setSelectedField] = useState<FieldFormData | null>(null);
    const [newSectionName, setNewSectionName] = useState('');
    const [showAddSection, setShowAddSection] = useState(false);

    // Options Modal state (for select, multi-select, radio, checkbox, autocomplete)
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [editingOptions, setEditingOptions] = useState<{ label: string; value: string }[]>([]);
    const [newOptionLabel, setNewOptionLabel] = useState('');
    const [newOptionValue, setNewOptionValue] = useState('');

    // Field types that require options configuration
    const FIELDS_REQUIRING_OPTIONS = ['select', 'multiselect', 'radio', 'checkbox', 'autocomplete'];

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [currentModuleId, setCurrentModuleId] = useState<string | null>(moduleId || null);

    // Load existing module
    useEffect(() => {
        if (moduleId) {
            loadModule(moduleId);
        }
    }, [moduleId]);

    const loadModule = async (id: string) => {
        setIsLoading(true);
        try {
            const module = await getModule(id);
            setModuleName(module.name);
            setModuleDescription(module.description || '');
            setModuleIcon(module.icon || 'target');
            setModuleStatus(module.status);
            setAllowedRoles(module.allowedRoles || []);
            setMenuCategory(module.menuCategory || 'Assessment');
            setCurrentModuleId(module.id);

            // Group fields by section
            if (module.sections) {
                const sectionsData: Record<string, FieldFormData[]> = {};
                Object.entries(module.sections).forEach(([sectionName, fields]) => {
                    sectionsData[sectionName] = fields.map(f => ({
                        ...f,
                        options: f.options ? (typeof f.options === 'string' ? JSON.parse(f.options) : f.options) : undefined
                    }));
                });
                setSections(sectionsData);
                setExpandedSections(new Set(Object.keys(sectionsData)));
            }
        } catch (err) {
            console.error('Failed to load module:', err);
            setError('Failed to load module');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveModule = async () => {
        if (!moduleName.trim()) {
            setError('Module name is required');
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            let savedModuleId = currentModuleId;

            // Create or update module
            if (!savedModuleId) {
                const newModule = await createModule({
                    name: moduleName,
                    description: moduleDescription,
                    icon: moduleIcon,
                    allowedRoles,
                    menuCategory
                });
                savedModuleId = newModule.id;
                setCurrentModuleId(savedModuleId);
            } else {
                await updateModule(savedModuleId, {
                    name: moduleName,
                    description: moduleDescription,
                    icon: moduleIcon,
                    status: moduleStatus,
                    allowedRoles,
                    menuCategory
                });
            }

            // Save fields
            for (const [sectionName, fields] of Object.entries(sections)) {
                for (const field of fields) {
                    if (field.isNew && !field.id?.startsWith('new_')) {
                        // Already saved
                        continue;
                    }

                    if (field.isNew || field.id?.startsWith('new_')) {
                        // Create new field
                        const newField = await addField(savedModuleId, {
                            sectionName,
                            fieldName: field.fieldName,
                            fieldType: field.fieldType,
                            label: field.label,
                            placeholder: field.placeholder,
                            isRequired: field.isRequired,
                            isScored: field.isScored,
                            maxScore: field.maxScore,
                            feedbackGood: field.feedbackGood,
                            feedbackBad: field.feedbackBad,
                            helpText: field.helpText
                        });

                        // Update local state with real ID
                        setSections(prev => ({
                            ...prev,
                            [sectionName]: prev[sectionName].map(f =>
                                f.id === field.id ? { ...f, id: newField.id, isNew: false } : f
                            )
                        }));
                    } else if (field.id) {
                        // Update existing field
                        await updateField(savedModuleId, field.id, {
                            sectionName,
                            fieldName: field.fieldName,
                            fieldType: field.fieldType,
                            label: field.label,
                            placeholder: field.placeholder,
                            isRequired: field.isRequired,
                            isScored: field.isScored,
                            maxScore: field.maxScore,
                            feedbackGood: field.feedbackGood,
                            feedbackBad: field.feedbackBad,
                            helpText: field.helpText
                        });
                    }
                }
            }

            setSuccessMessage('Module saved successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Failed to save module:', err);
            setError('Failed to save module');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddSection = () => {
        if (!newSectionName.trim()) return;

        setSections(prev => ({
            ...prev,
            [newSectionName]: []
        }));
        setExpandedSections(prev => new Set([...prev, newSectionName]));
        setNewSectionName('');
        setShowAddSection(false);
    };

    const handleAddField = (sectionName: string) => {
        const newField: FieldFormData = {
            id: `new_${Date.now()}`,
            sectionName,
            fieldName: '',
            fieldType: 'checkbox',
            label: '',
            isRequired: false,
            isScored: true,
            maxScore: 25,
            isNew: true
        };

        setSections(prev => ({
            ...prev,
            [sectionName]: [...(prev[sectionName] || []), newField]
        }));
        setSelectedField(newField);
    };

    const handleUpdateField = (field: FieldFormData) => {
        setSections(prev => ({
            ...prev,
            [field.sectionName]: prev[field.sectionName].map(f =>
                f.id === field.id ? field : f
            )
        }));
        setSelectedField(field);
    };

    const handleDeleteField = async (sectionName: string, fieldId: string) => {
        // If field was saved to server, delete from server too
        if (currentModuleId && !fieldId.startsWith('new_')) {
            try {
                await deleteField(currentModuleId, fieldId);
            } catch (err) {
                console.error('Failed to delete field:', err);
            }
        }

        setSections(prev => ({
            ...prev,
            [sectionName]: prev[sectionName].filter(f => f.id !== fieldId)
        }));

        if (selectedField?.id === fieldId) {
            setSelectedField(null);
        }
    };

    const handleDeleteSection = (sectionName: string) => {
        const { [sectionName]: _, ...rest } = sections;
        setSections(rest);
        setExpandedSections(prev => {
            const updated = new Set(prev);
            updated.delete(sectionName);
            return updated;
        });
    };

    const toggleSection = (sectionName: string) => {
        setExpandedSections(prev => {
            const updated = new Set(prev);
            if (updated.has(sectionName)) {
                updated.delete(sectionName);
            } else {
                updated.add(sectionName);
            }
            return updated;
        });
    };

    const toggleRole = (role: string) => {
        setAllowedRoles(prev =>
            prev.includes(role)
                ? prev.filter(r => r !== role)
                : [...prev, role]
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <div className="bg-slate-800/50 border-b border-slate-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-400" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-white">
                                {isEditing ? 'Edit Module' : 'Create Module'}
                            </h1>
                            <p className="text-sm text-slate-400">
                                Build custom assessment forms
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {successMessage && (
                            <span className="text-green-400 text-sm">{successMessage}</span>
                        )}
                        <button
                            onClick={handleSaveModule}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Save Module
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 mx-4 mt-4 rounded-lg flex items-center gap-2"
                    >
                        <AlertCircle className="w-5 h-5" />
                        {error}
                        <button onClick={() => setError(null)} className="ml-auto hover:text-red-300">×</button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-3 gap-6">
                {/* Left Panel - Module Settings */}
                <div className="col-span-1 space-y-4">
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Module Settings
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Module Name *</label>
                                <input
                                    type="text"
                                    value={moduleName}
                                    onChange={(e) => setModuleName(e.target.value)}
                                    placeholder="e.g., Basic Archery Assessment"
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Description</label>
                                <textarea
                                    value={moduleDescription}
                                    onChange={(e) => setModuleDescription(e.target.value)}
                                    placeholder="Describe what this module assesses..."
                                    rows={3}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Icon</label>
                                <div className="flex gap-2">
                                    {ICON_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setModuleIcon(opt.value)}
                                            className={`p-3 rounded-lg border transition-colors ${moduleIcon === opt.value
                                                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                                                : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500'
                                                }`}
                                        >
                                            <opt.icon className="w-5 h-5" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Category</label>
                                <input
                                    type="text"
                                    value={menuCategory}
                                    onChange={(e) => setMenuCategory(e.target.value)}
                                    placeholder="e.g., Assessment, Training"
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                                />
                            </div>

                            {isEditing && (
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Status</label>
                                    <select
                                        value={moduleStatus}
                                        onChange={(e) => setModuleStatus(e.target.value as 'DRAFT' | 'ACTIVE' | 'ARCHIVED')}
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                                    >
                                        <option value="DRAFT">Draft</option>
                                        <option value="ACTIVE">Active</option>
                                        <option value="ARCHIVED">Archived</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Permissions */}
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                        <h3 className="text-white font-medium mb-4">Who can use this module?</h3>
                        <div className="space-y-2">
                            {ROLE_OPTIONS.map(role => (
                                <label
                                    key={role.value}
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={allowedRoles.includes(role.value)}
                                        onChange={() => toggleRole(role.value)}
                                        className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-500"
                                    />
                                    <span className="text-slate-300 text-sm">{role.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Middle Panel - Sections & Fields */}
                <div className="col-span-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-white font-medium">Form Sections</h3>
                        <button
                            onClick={() => setShowAddSection(true)}
                            className="flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300"
                        >
                            <Plus className="w-4 h-4" />
                            Add Section
                        </button>
                    </div>

                    {/* Add Section Input */}
                    <AnimatePresence>
                        {showAddSection && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-slate-800/50 rounded-lg p-3 border border-slate-700"
                            >
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newSectionName}
                                        onChange={(e) => setNewSectionName(e.target.value)}
                                        placeholder="Section name (e.g., Posture)"
                                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none text-sm"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
                                    />
                                    <button
                                        onClick={handleAddSection}
                                        className="px-3 py-2 bg-amber-500 text-black rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
                                    >
                                        Add
                                    </button>
                                    <button
                                        onClick={() => setShowAddSection(false)}
                                        className="px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Sections List */}
                    {Object.keys(sections).length === 0 ? (
                        <div className="bg-slate-800/30 rounded-xl p-8 border border-dashed border-slate-600 text-center">
                            <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm">No sections yet</p>
                            <p className="text-slate-500 text-xs mt-1">Click "Add Section" to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {Object.entries(sections).map(([sectionName, fields]) => (
                                <div
                                    key={sectionName}
                                    className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden"
                                >
                                    {/* Section Header */}
                                    <div
                                        className="flex items-center justify-between px-4 py-3 bg-slate-700/30 cursor-pointer"
                                        onClick={() => toggleSection(sectionName)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <GripVertical className="w-4 h-4 text-slate-500" />
                                            {expandedSections.has(sectionName) ? (
                                                <ChevronDown className="w-4 h-4 text-slate-400" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4 text-slate-400" />
                                            )}
                                            <span className="text-white font-medium">{sectionName}</span>
                                            <span className="text-xs text-slate-500">({fields.length} fields)</span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteSection(sectionName);
                                            }}
                                            className="p-1 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Section Fields */}
                                    <AnimatePresence>
                                        {expandedSections.has(sectionName) && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: 'auto' }}
                                                exit={{ height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-4 py-2 space-y-2">
                                                    {fields.map((field) => (
                                                        <div
                                                            key={field.id}
                                                            onClick={() => setSelectedField(field)}
                                                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${selectedField?.id === field.id
                                                                ? 'bg-amber-500/20 border border-amber-500/50'
                                                                : 'bg-slate-900/50 hover:bg-slate-700/50 border border-transparent'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <GripVertical className="w-3 h-3 text-slate-600" />
                                                                {(() => {
                                                                    const IconComponent = FIELD_TYPES.find(t => t.value === field.fieldType)?.icon || CheckSquare;
                                                                    return <IconComponent className="w-4 h-4 text-slate-400" />;
                                                                })()}
                                                                <span className="text-sm text-slate-300">
                                                                    {field.label || '(Untitled)'}
                                                                </span>
                                                            </div>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteField(sectionName, field.id!);
                                                                }}
                                                                className="p-1 hover:bg-red-500/20 rounded text-slate-500 hover:text-red-400 transition-colors"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}

                                                    <button
                                                        onClick={() => handleAddField(sectionName)}
                                                        className="w-full flex items-center justify-center gap-1 py-2 text-sm text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        Add Field
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Panel - Field Properties */}
                <div className="col-span-1">
                    {selectedField ? (
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 sticky top-24">
                            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                Field Properties
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Label *</label>
                                    <input
                                        type="text"
                                        value={selectedField.label}
                                        onChange={(e) => handleUpdateField({ ...selectedField, label: e.target.value })}
                                        placeholder="e.g., Stance"
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Field Name (ID)</label>
                                    <input
                                        type="text"
                                        value={selectedField.fieldName}
                                        onChange={(e) => handleUpdateField({
                                            ...selectedField,
                                            fieldName: e.target.value.toLowerCase().replace(/\s+/g, '_')
                                        })}
                                        placeholder="e.g., stance"
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none font-mono text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Field Type</label>

                                    {/* Context-aware field type display */}
                                    {selectedField.isScored ? (
                                        /* When scoring is enabled - show Checklist Item indicator */
                                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CheckSquare className="w-4 h-4 text-emerald-400" />
                                                <span className="text-emerald-400 font-medium text-sm">Checklist Item</span>
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                Y/N scoring item • Checked = Points • Unchecked = 0
                                            </p>
                                        </div>
                                    ) : (
                                        /* When scoring is disabled - show full dropdown for data collection */
                                        <>
                                            <select
                                                value={selectedField.fieldType}
                                                onChange={(e) => handleUpdateField({ ...selectedField, fieldType: e.target.value })}
                                                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-amber-500 focus:outline-none appearance-none cursor-pointer"
                                                style={{
                                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23f59e0b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'right 0.75rem center',
                                                    backgroundSize: '1.25rem'
                                                }}
                                            >
                                                {FIELD_CATEGORIES.map(category => (
                                                    <optgroup key={category.id} label={`${category.id}. ${category.name}`}>
                                                        {category.types.map(type => (
                                                            <option key={type.value} value={type.value}>
                                                                {type.label} ({type.commonTerm})
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                ))}
                                            </select>

                                            {/* Field Type Description */}
                                            {(() => {
                                                const selectedType = ALL_FIELD_TYPES.find(t => t.value === selectedField.fieldType);
                                                if (selectedType) {
                                                    return (
                                                        <div className="mt-2 text-xs text-slate-500">
                                                            <span className="text-slate-400">{selectedType.function}</span>
                                                            <span className="mx-1">•</span>
                                                            <span>e.g., {selectedType.sampleData}</span>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </>
                                    )}
                                </div>

                                {/* Configure Options Button - for selection-type fields */}
                                {FIELDS_REQUIRING_OPTIONS.includes(selectedField.fieldType) && (
                                    <div className="border-t border-slate-700 pt-4">
                                        <h4 className="text-sm text-slate-300 mb-3">Field Options</h4>
                                        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-slate-400">
                                                    {Array.isArray(selectedField.options) ? selectedField.options.length : 0} options configured
                                                </span>
                                            </div>
                                            {/* Show current options preview */}
                                            {Array.isArray(selectedField.options) && selectedField.options.length > 0 && (
                                                <div className="mb-3 space-y-1">
                                                    {(selectedField.options as { label: string; value: string }[]).slice(0, 3).map((opt, i) => (
                                                        <div key={i} className="text-xs text-slate-500 flex gap-2">
                                                            <span className="text-slate-600">{i + 1}.</span>
                                                            <span>{typeof opt === 'string' ? opt : opt.label}</span>
                                                        </div>
                                                    ))}
                                                    {(selectedField.options as { label: string; value: string }[]).length > 3 && (
                                                        <div className="text-xs text-slate-600">
                                                            +{(selectedField.options as { label: string; value: string }[]).length - 3} more...
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <button
                                                onClick={() => {
                                                    // Initialize editing options from current field options
                                                    const opts = selectedField.options || [];
                                                    const normalizedOpts = opts.map((o: string | { label: string; value: string }) =>
                                                        typeof o === 'string' ? { label: o, value: o.toLowerCase().replace(/\s+/g, '_') } : o
                                                    );
                                                    setEditingOptions(normalizedOpts);
                                                    setShowOptionsModal(true);
                                                }}
                                                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg transition-colors text-sm"
                                            >
                                                <Settings className="w-4 h-4" />
                                                Configure Options
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="border-t border-slate-700 pt-4">
                                    <h4 className="text-sm text-slate-300 mb-3">Scoring</h4>

                                    <label className="flex items-center gap-2 cursor-pointer mb-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedField.isScored}
                                            onChange={(e) => handleUpdateField({ ...selectedField, isScored: e.target.checked })}
                                            className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-500"
                                        />
                                        <span className="text-slate-400 text-sm">Include in score calculation</span>
                                    </label>

                                    {selectedField.isScored && (
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">Max Score</label>
                                            <input
                                                type="number"
                                                value={selectedField.maxScore || 25}
                                                onChange={(e) => handleUpdateField({ ...selectedField, maxScore: parseInt(e.target.value, 10) })}
                                                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-slate-700 pt-4">
                                    <h4 className="text-sm text-slate-300 mb-3">Feedback Templates</h4>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm text-green-400 mb-1">✓ When Checked / Good</label>
                                            <textarea
                                                value={selectedField.feedbackGood || ''}
                                                onChange={(e) => handleUpdateField({ ...selectedField, feedbackGood: e.target.value })}
                                                placeholder="Great Job!! Description of correct technique..."
                                                rows={2}
                                                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none resize-none text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm text-red-400 mb-1">✗ When Unchecked / Needs Improvement</label>
                                            <textarea
                                                value={selectedField.feedbackBad || ''}
                                                onChange={(e) => handleUpdateField({ ...selectedField, feedbackBad: e.target.value })}
                                                placeholder="Needs improvement, let's practice..."
                                                rows={2}
                                                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none resize-none text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-800/30 rounded-xl p-8 border border-dashed border-slate-600 text-center sticky top-24">
                            <Eye className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm">Select a field to edit</p>
                            <p className="text-slate-500 text-xs mt-1">Click on any field in the sections panel</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Options Configuration Modal */}
            <AnimatePresence>
                {showOptionsModal && selectedField && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowOptionsModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg max-h-[80vh] overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="bg-slate-700/50 px-6 py-4 border-b border-slate-700">
                                <h3 className="text-lg font-semibold text-white">
                                    Configure Options for "{selectedField.label || 'Field'}"
                                </h3>
                                <p className="text-sm text-slate-400 mt-1">
                                    Add the options that will appear in this {selectedField.fieldType} field
                                </p>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
                                {/* Add New Option */}
                                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                                    <h4 className="text-sm font-medium text-white mb-3">Add Option</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Label (displayed)</label>
                                            <input
                                                type="text"
                                                value={newOptionLabel}
                                                onChange={(e) => setNewOptionLabel(e.target.value)}
                                                placeholder="e.g., Male"
                                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Value (stored)</label>
                                            <input
                                                type="text"
                                                value={newOptionValue}
                                                onChange={(e) => setNewOptionValue(e.target.value)}
                                                placeholder="e.g., male"
                                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none text-sm font-mono"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (newOptionLabel.trim()) {
                                                const value = newOptionValue.trim() || newOptionLabel.toLowerCase().replace(/\s+/g, '_');
                                                setEditingOptions([...editingOptions, { label: newOptionLabel, value }]);
                                                setNewOptionLabel('');
                                                setNewOptionValue('');
                                            }
                                        }}
                                        className="mt-3 flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors text-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Option
                                    </button>
                                </div>

                                {/* Options List */}
                                <div>
                                    <h4 className="text-sm font-medium text-white mb-2">Current Options ({editingOptions.length})</h4>
                                    {editingOptions.length === 0 ? (
                                        <div className="text-center py-6 text-slate-500 text-sm">
                                            No options added yet
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {editingOptions.map((opt, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-700"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-slate-500 text-xs w-6">{index + 1}.</span>
                                                        <span className="text-white">{opt.label}</span>
                                                        <span className="text-slate-500 text-xs font-mono">({opt.value})</span>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setEditingOptions(editingOptions.filter((_, i) => i !== index));
                                                        }}
                                                        className="p-1 hover:bg-red-500/20 rounded text-slate-500 hover:text-red-400 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-slate-700/30 px-6 py-4 border-t border-slate-700 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowOptionsModal(false)}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        // Save options to the selected field
                                        handleUpdateField({
                                            ...selectedField,
                                            options: editingOptions
                                        });
                                        setShowOptionsModal(false);
                                    }}
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
                                >
                                    Save Options
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ModuleBuilderPage;
