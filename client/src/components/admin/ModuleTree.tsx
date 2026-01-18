import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown, ChevronRight, Eye, EyeOff, GripVertical, Plus, Trash2,
    LayoutDashboard, Users, Crosshair, Calendar, ScanLine, Wallet, Package,
    BarChart3, FileBarChart, User, CreditCard, Target, Building2, FolderOpen, Settings
} from 'lucide-react';
import { MODULE_LIST } from '../../types/permissions';
import { UIModuleConfig, UIElement, CustomModule } from '../../types/uiBuilder';
import ElementPicker from './ElementPicker';

// Icon mapping
const ICON_MAP: Record<string, React.ElementType> = {
    LayoutDashboard, Users, Crosshair, Calendar, ScanLine, Wallet, Package,
    BarChart3, FileBarChart, User, CreditCard, Target, Building2, FolderOpen, Settings
};

interface ModuleTreeProps {
    modules: UIModuleConfig[];
    customModules: CustomModule[];
    onModulesChange: (modules: UIModuleConfig[]) => void;
    onCustomModulesChange: (modules: CustomModule[]) => void;
    onAddCustomModule: () => void;
}

export default function ModuleTree({
    modules,
    customModules,
    onModulesChange,
    onCustomModulesChange,
    onAddCustomModule
}: ModuleTreeProps) {
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
    const [showElementPicker, setShowElementPicker] = useState<{
        moduleId: string;
        section: 'leftTitle' | 'middleTitle' | 'rightTitle';
    } | null>(null);

    const toggleExpand = (moduleId: string) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(moduleId)) {
            newExpanded.delete(moduleId);
        } else {
            newExpanded.add(moduleId);
        }
        setExpandedModules(newExpanded);
    };

    const toggleModuleVisibility = (moduleId: string) => {
        const newModules = modules.map(m =>
            m.moduleId === moduleId ? { ...m, visible: !m.visible } : m
        );
        onModulesChange(newModules);
    };

    const toggleCustomModuleVisibility = (moduleId: string) => {
        const newModules = customModules.map(m =>
            m.id === moduleId ? { ...m, visible: !m.visible } : m
        );
        onCustomModulesChange(newModules);
    };

    const addElementToModule = (
        moduleId: string,
        section: 'leftTitle' | 'middleTitle' | 'rightTitle',
        element: UIElement
    ) => {
        const newModules = modules.map(m => {
            if (m.moduleId === moduleId) {
                const layout = m.layout || {};
                const sectionElements = layout[section] || [];
                return {
                    ...m,
                    layout: {
                        ...layout,
                        [section]: [...sectionElements, element]
                    }
                };
            }
            return m;
        });
        onModulesChange(newModules);
        setShowElementPicker(null);
    };

    const removeElementFromModule = (
        moduleId: string,
        section: 'leftTitle' | 'middleTitle' | 'rightTitle',
        elementId: string
    ) => {
        const newModules = modules.map(m => {
            if (m.moduleId === moduleId && m.layout) {
                const sectionElements = m.layout[section] || [];
                return {
                    ...m,
                    layout: {
                        ...m.layout,
                        [section]: sectionElements.filter(e => e.id !== elementId)
                    }
                };
            }
            return m;
        });
        onModulesChange(newModules);
    };

    const deleteCustomModule = (moduleId: string) => {
        onCustomModulesChange(customModules.filter(m => m.id !== moduleId));
    };

    const getModuleInfo = (moduleId: string) => {
        return MODULE_LIST.find(m => m.name === moduleId);
    };

    const getIcon = (iconName: string) => {
        return ICON_MAP[iconName] || Settings;
    };

    const renderLayoutSection = (
        moduleId: string,
        section: 'leftTitle' | 'middleTitle' | 'rightTitle',
        elements: UIElement[] = [],
        sectionLabel: string
    ) => (
        <div className="pl-8 py-2 border-l border-dark-700 ml-4">
            <div className="flex items-center justify-between">
                <span className="text-sm text-dark-400">{sectionLabel}</span>
                <button
                    onClick={() => setShowElementPicker({ moduleId, section })}
                    className="p-1 rounded hover:bg-dark-700 transition-colors"
                >
                    <Plus size={14} className="text-primary-400" />
                </button>
            </div>
            {elements.length > 0 && (
                <div className="mt-2 space-y-1">
                    {elements.map(elem => (
                        <div
                            key={elem.id}
                            className="flex items-center justify-between py-1 px-2 bg-dark-800/50 rounded text-xs"
                        >
                            <span className="text-dark-300">
                                {elem.type}: {elem.type === 'text' ? (elem.config as any).content?.substring(0, 20) + '...' : elem.type}
                            </span>
                            <button
                                onClick={() => removeElementFromModule(moduleId, section, elem.id)}
                                className="p-1 hover:bg-red-500/20 rounded"
                            >
                                <Trash2 size={12} className="text-red-400" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Visible Sidebar Modules</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setExpandedModules(new Set(modules.map(m => m.moduleId)))}
                        className="text-xs text-primary-400 hover:text-primary-300"
                    >
                        Expand All
                    </button>
                    <button
                        onClick={() => setExpandedModules(new Set())}
                        className="text-xs text-dark-400 hover:text-dark-300"
                    >
                        Collapse All
                    </button>
                </div>
            </div>

            {/* Module List */}
            <div className="space-y-1">
                {modules.map(module => {
                    const info = getModuleInfo(module.moduleId);
                    const Icon = info ? getIcon(info.icon) : Settings;
                    const isExpanded = expandedModules.has(module.moduleId);
                    const hasLayout = module.layout && (
                        module.layout.leftTitle?.length ||
                        module.layout.middleTitle?.length ||
                        module.layout.rightTitle?.length
                    );

                    return (
                        <div key={module.moduleId} className="rounded-lg border border-dark-700 overflow-hidden">
                            {/* Module Row */}
                            <div className="flex items-center gap-2 p-3 bg-dark-800/30">
                                <GripVertical size={16} className="text-dark-500 cursor-grab" />

                                <button
                                    onClick={() => toggleExpand(module.moduleId)}
                                    className="p-1 hover:bg-dark-700 rounded"
                                >
                                    {isExpanded ? (
                                        <ChevronDown size={16} className="text-dark-400" />
                                    ) : (
                                        <ChevronRight size={16} className="text-dark-400" />
                                    )}
                                </button>

                                <Icon size={18} className="text-primary-400" />
                                <span className="flex-1 font-medium">{info?.label || module.moduleId}</span>

                                {hasLayout && (
                                    <span className="px-2 py-0.5 bg-primary-500/20 text-primary-400 text-xs rounded">
                                        Customized
                                    </span>
                                )}

                                <button
                                    onClick={() => toggleModuleVisibility(module.moduleId)}
                                    className={`p-2 rounded-lg transition-colors ${module.visible
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'bg-dark-700 text-dark-400'
                                        }`}
                                >
                                    {module.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                            </div>

                            {/* Expanded Content */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-dark-700 bg-dark-900/50 p-3"
                                    >
                                        {renderLayoutSection(
                                            module.moduleId,
                                            'leftTitle',
                                            module.layout?.leftTitle,
                                            'Left Title'
                                        )}
                                        {renderLayoutSection(
                                            module.moduleId,
                                            'middleTitle',
                                            module.layout?.middleTitle,
                                            'Middle Title'
                                        )}
                                        {renderLayoutSection(
                                            module.moduleId,
                                            'rightTitle',
                                            module.layout?.rightTitle,
                                            'Right Title'
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* Custom Modules Section */}
            {customModules.length > 0 && (
                <div className="mt-6">
                    <h4 className="font-medium text-dark-300 mb-2">Custom Modules</h4>
                    <div className="space-y-1">
                        {customModules.map(module => (
                            <div
                                key={module.id}
                                className="flex items-center gap-2 p-3 rounded-lg border border-dark-700 bg-dark-800/30"
                            >
                                <GripVertical size={16} className="text-dark-500 cursor-grab" />
                                <Settings size={18} className="text-amber-400" />
                                <span className="flex-1 font-medium">{module.label}</span>
                                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded">
                                    {module.type}
                                </span>
                                <button
                                    onClick={() => toggleCustomModuleVisibility(module.id)}
                                    className={`p-2 rounded-lg transition-colors ${module.visible
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'bg-dark-700 text-dark-400'
                                        }`}
                                >
                                    {module.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                                <button
                                    onClick={() => deleteCustomModule(module.id)}
                                    className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                                >
                                    <Trash2 size={16} className="text-red-400" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Custom Module Button */}
            <button
                onClick={onAddCustomModule}
                className="w-full mt-4 p-3 border border-dashed border-dark-600 rounded-lg text-dark-400 hover:text-primary-400 hover:border-primary-500/50 transition-colors flex items-center justify-center gap-2"
            >
                <Plus size={18} />
                Add Custom Module
            </button>

            {/* Element Picker Modal */}
            <AnimatePresence>
                {showElementPicker && (
                    <ElementPicker
                        onClose={() => setShowElementPicker(null)}
                        onAdd={(element) => addElementToModule(
                            showElementPicker.moduleId,
                            showElementPicker.section,
                            element
                        )}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
