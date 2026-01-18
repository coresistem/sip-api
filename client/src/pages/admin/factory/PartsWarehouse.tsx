import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    Search,
    Filter,
    ChevronDown,
    ChevronRight,
    Plus,
    Target,
    Activity,
    Calendar,
    CheckSquare,
    DollarSign,
    Users,
    BarChart3,
    ShoppingBag,
    Wrench,
    CreditCard,
    FolderOpen,
    Upload,
    Hash,
    TrendingUp,
    Zap,
    QrCode,
    Settings,
    Layers
} from 'lucide-react';
import { SystemPart, PartType, PART_TYPE_LABELS, CATEGORY_LABELS } from '../../../services/factory.service';

interface PartsWarehouseProps {
    parts: SystemPart[];
    selectedPart: SystemPart | null;
    onSelectPart: (part: SystemPart) => void;
    onAddToPreview: (part: SystemPart) => void;
}

// Icon mapping
const ICON_MAP: Record<string, React.ElementType> = {
    Target,
    Activity,
    Calendar,
    CheckSquare,
    DollarSign,
    Users,
    BarChart3,
    ShoppingBag,
    Wrench,
    CreditCard,
    FolderOpen,
    Upload,
    Hash,
    TrendingUp,
    Zap,
    QrCode,
    Settings,
    Package,
    Layers,
};

const TYPE_COLORS: Record<PartType, { bg: string; text: string; border: string }> = {
    FULLSTACK: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
    WIDGET: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    FORM_INPUT: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
};

const PartsWarehouse: React.FC<PartsWarehouseProps> = ({
    parts,
    selectedPart,
    onSelectPart,
    onAddToPreview,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedTypes, setExpandedTypes] = useState<Set<PartType>>(new Set(['FULLSTACK', 'WIDGET', 'FORM_INPUT']));
    const [filterCategory, setFilterCategory] = useState<string>('all');

    // Group parts by type
    const groupedParts = useMemo(() => {
        const filtered = parts.filter(part => {
            const matchesSearch = part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                part.code.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = filterCategory === 'all' || part.category === filterCategory;
            return matchesSearch && matchesCategory;
        });

        return {
            FULLSTACK: filtered.filter(p => p.type === 'FULLSTACK'),
            WIDGET: filtered.filter(p => p.type === 'WIDGET'),
            FORM_INPUT: filtered.filter(p => p.type === 'FORM_INPUT'),
        };
    }, [parts, searchQuery, filterCategory]);

    const toggleType = (type: PartType) => {
        const newExpanded = new Set(expandedTypes);
        if (newExpanded.has(type)) {
            newExpanded.delete(type);
        } else {
            newExpanded.add(type);
        }
        setExpandedTypes(newExpanded);
    };

    const getIcon = (iconName?: string) => {
        if (!iconName) return Package;
        return ICON_MAP[iconName] || Package;
    };

    const categories = useMemo(() => {
        const cats = new Set(parts.map(p => p.category));
        return Array.from(cats);
    }, [parts]);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                    <Package className="w-5 h-5 text-amber-500" />
                    <h2 className="font-semibold text-white">Parts Warehouse</h2>
                    <span className="text-xs text-slate-500 ml-auto">{parts.length} parts</span>
                </div>

                {/* Search */}
                <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search parts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                    />
                </div>

                {/* Category Filter */}
                <div className="flex gap-1 flex-wrap">
                    <button
                        onClick={() => setFilterCategory('all')}
                        className={`px-2 py-1 rounded text-xs transition-colors ${filterCategory === 'all'
                                ? 'bg-slate-700 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-2 py-1 rounded text-xs transition-colors ${filterCategory === cat
                                    ? 'bg-slate-700 text-white'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Parts List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {(['FULLSTACK', 'WIDGET', 'FORM_INPUT'] as PartType[]).map(type => {
                    const typeParts = groupedParts[type];
                    const isExpanded = expandedTypes.has(type);
                    const colors = TYPE_COLORS[type];

                    return (
                        <div key={type} className="rounded-lg border border-slate-700/50">
                            {/* Type Header */}
                            <button
                                onClick={() => toggleType(type)}
                                className={`w-full flex items-center gap-2 p-3 ${colors.bg} rounded-t-lg hover:brightness-110 transition-all`}
                            >
                                {isExpanded ? (
                                    <ChevronDown size={16} className={colors.text} />
                                ) : (
                                    <ChevronRight size={16} className={colors.text} />
                                )}
                                <span className={`text-sm font-medium ${colors.text}`}>
                                    {PART_TYPE_LABELS[type]}
                                </span>
                                <span className="text-xs text-slate-500 ml-auto">
                                    {typeParts.length}
                                </span>
                            </button>

                            {/* Parts List */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-2 space-y-1 bg-slate-900/50">
                                            {typeParts.length === 0 ? (
                                                <p className="text-xs text-slate-500 text-center py-2">
                                                    No parts found
                                                </p>
                                            ) : (
                                                typeParts.map(part => {
                                                    const Icon = getIcon(part.icon);
                                                    const isSelected = selectedPart?.id === part.id;

                                                    return (
                                                        <motion.div
                                                            key={part.id}
                                                            layout
                                                            onClick={() => onSelectPart(part)}
                                                            className={`
                                                                flex items-center gap-2 p-2 rounded-lg cursor-pointer
                                                                transition-all group
                                                                ${isSelected
                                                                    ? `${colors.bg} ${colors.border} border`
                                                                    : 'hover:bg-slate-800'
                                                                }
                                                            `}
                                                        >
                                                            <Icon className={`w-4 h-4 ${colors.text}`} />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm text-white truncate">
                                                                    {part.name}
                                                                </div>
                                                                <div className="text-[10px] text-slate-500 truncate">
                                                                    {part.code}
                                                                </div>
                                                            </div>
                                                            {part.isCore && (
                                                                <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">
                                                                    Core
                                                                </span>
                                                            )}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onAddToPreview(part);
                                                                }}
                                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary-500 rounded transition-all"
                                                                title="Add to Preview"
                                                            >
                                                                <Plus size={14} className="text-white" />
                                                            </button>
                                                        </motion.div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* Selected Part Details */}
            {selectedPart && (
                <div className="p-3 border-t border-slate-700 bg-slate-800/50">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="font-medium text-white text-sm">{selectedPart.name}</h3>
                            <p className="text-[10px] font-mono text-slate-500">{selectedPart.code}</p>
                        </div>
                        <button
                            onClick={() => onAddToPreview(selectedPart)}
                            className="flex items-center gap-1 px-2 py-1 bg-primary-500 hover:bg-primary-600 rounded text-xs text-white transition-colors"
                        >
                            <Plus size={12} />
                            Add
                        </button>
                    </div>
                    {selectedPart.description && (
                        <p className="text-xs text-slate-400 mb-2">{selectedPart.description}</p>
                    )}
                    <div className="flex gap-2 text-[10px]">
                        {selectedPart.dataSource && (
                            <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                                📊 {selectedPart.dataSource}
                            </span>
                        )}
                        {selectedPart.requiredPerms && (
                            <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded">
                                🔒 Permissions
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PartsWarehouse;
