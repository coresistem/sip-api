import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, LayoutGrid, Table, Image, FileText, Map, BarChart3, LayoutDashboard, FileEdit, Rocket, CreditCard } from 'lucide-react';
import { CustomModule, ModuleLayoutType, generateModuleId } from '../../types/uiBuilder';

interface CustomModuleModalProps {
    onClose: () => void;
    onAdd: (module: CustomModule) => void;
    existingModulesCount: number;
}

const MODULE_TYPES: { type: ModuleLayoutType; label: string; icon: React.ElementType; description: string }[] = [
    { type: 'calendar', label: 'Calendar', icon: Calendar, description: 'Event calendar view' },
    { type: 'deck', label: 'Deck', icon: LayoutGrid, description: 'Card deck layout' },
    { type: 'table', label: 'Table', icon: Table, description: 'Data table view' },
    { type: 'gallery', label: 'Gallery', icon: Image, description: 'Image gallery' },
    { type: 'detail', label: 'Detail', icon: FileText, description: 'Detail view page' },
    { type: 'map', label: 'Map', icon: Map, description: 'Location map' },
    { type: 'chart', label: 'Chart', icon: BarChart3, description: 'Data visualization' },
    { type: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Dashboard layout' },
    { type: 'form', label: 'Form', icon: FileEdit, description: 'Input form' },
    { type: 'onboarding', label: 'Onboarding', icon: Rocket, description: 'Onboarding wizard' },
    { type: 'card', label: 'Card', icon: CreditCard, description: 'Single card view' },
];

const DATA_SOURCES = [
    { value: 'athletes', label: 'Athletes' },
    { value: 'scores', label: 'Scores' },
    { value: 'schedules', label: 'Schedules' },
    { value: 'attendance', label: 'Attendance' },
    { value: 'finance', label: 'Finance' },
    { value: 'inventory', label: 'Inventory' },
    { value: 'custom', label: 'Custom API' },
];

const LUCIDE_ICONS = [
    'Home', 'Settings', 'User', 'Users', 'Target', 'Calendar', 'Clock', 'Bell',
    'Mail', 'MessageSquare', 'Heart', 'Star', 'Award', 'Trophy', 'Flag',
    'MapPin', 'Navigation', 'Search', 'Filter', 'Download', 'Upload', 'Share',
    'Plus', 'Minus', 'Check', 'X', 'AlertCircle', 'Info', 'HelpCircle',
    'Activity', 'Briefcase', 'Camera', 'Clipboard', 'Code', 'Compass', 'Database'
];

export default function CustomModuleModal({ onClose, onAdd, existingModulesCount }: CustomModuleModalProps) {
    const [step, setStep] = useState<'type' | 'config'>('type');
    const [selectedType, setSelectedType] = useState<ModuleLayoutType | null>(null);
    const [moduleName, setModuleName] = useState('');
    const [moduleLabel, setModuleLabel] = useState('');
    const [moduleIcon, setModuleIcon] = useState('Star');
    const [dataSource, setDataSource] = useState('athletes');

    const handleTypeSelect = (type: ModuleLayoutType) => {
        setSelectedType(type);
        setStep('config');
    };

    const handleCreate = () => {
        if (!selectedType || !moduleName.trim() || !moduleLabel.trim()) return;

        const module: CustomModule = {
            id: generateModuleId(),
            name: moduleName.toLowerCase().replace(/\s+/g, '_'),
            label: moduleLabel,
            icon: moduleIcon,
            type: selectedType,
            dataSource,
            visible: true,
            order: existingModulesCount + 1,
        };

        onAdd(module);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-dark-800 rounded-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">
                        {step === 'type' ? 'Select Module Type' : 'Configure Module'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-dark-700 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                {step === 'type' ? (
                    <div className="grid grid-cols-3 gap-3">
                        {MODULE_TYPES.map(({ type, label, icon: Icon, description }) => (
                            <button
                                key={type}
                                onClick={() => handleTypeSelect(type)}
                                className="p-3 rounded-lg border border-dark-700 hover:border-primary-500/50 transition-colors text-center"
                            >
                                <Icon size={24} className="text-primary-400 mx-auto mb-2" />
                                <h4 className="font-medium text-sm">{label}</h4>
                                <p className="text-xs text-dark-400 mt-1">{description}</p>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <button
                            onClick={() => setStep('type')}
                            className="text-sm text-primary-400 hover:underline"
                        >
                            ← Back to types
                        </button>

                        <div className="p-3 bg-dark-700/50 rounded-lg flex items-center gap-3">
                            {MODULE_TYPES.find(t => t.type === selectedType)?.icon && (
                                (() => {
                                    const Icon = MODULE_TYPES.find(t => t.type === selectedType)!.icon;
                                    return <Icon size={24} className="text-primary-400" />;
                                })()
                            )}
                            <div>
                                <p className="font-medium">{MODULE_TYPES.find(t => t.type === selectedType)?.label}</p>
                                <p className="text-xs text-dark-400">{MODULE_TYPES.find(t => t.type === selectedType)?.description}</p>
                            </div>
                        </div>

                        <div>
                            <label className="label">Module Name (internal)</label>
                            <input
                                type="text"
                                value={moduleName}
                                onChange={(e) => setModuleName(e.target.value)}
                                placeholder="my_custom_module"
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="label">Display Label</label>
                            <input
                                type="text"
                                value={moduleLabel}
                                onChange={(e) => setModuleLabel(e.target.value)}
                                placeholder="My Custom Module"
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="label">Icon</label>
                            <select
                                value={moduleIcon}
                                onChange={(e) => setModuleIcon(e.target.value)}
                                className="input"
                            >
                                {LUCIDE_ICONS.map(icon => (
                                    <option key={icon} value={icon}>{icon}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="label">Data Source</label>
                            <select
                                value={dataSource}
                                onChange={(e) => setDataSource(e.target.value)}
                                className="input"
                            >
                                {DATA_SOURCES.map(({ value, label }) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleCreate}
                            disabled={!moduleName.trim() || !moduleLabel.trim()}
                            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Create Module
                        </button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
