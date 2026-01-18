import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Eye,
    Play,
    Trash2,
    Save,
    X,
    Check,
    Package,
    Maximize2,
    RotateCcw,
    GripVertical,
    Settings,
    Target,
    Calendar,
    ClipboardCheck,
    BarChart3,
    CreditCard,
    UserCog,
    ShoppingBag,
    Activity,
    Trophy
} from 'lucide-react';
import {
    FeatureAssembly,
    FeaturePart,
    ROLE_OPTIONS,
} from '../../../services/factory.service';
import { getPreviewComponent } from './PreviewRegistry';
import PropsPanel from './PropsPanel';

// Helper to get icon based on part code
const getIconForPart = (code: string) => {
    switch (code) {
        case 'scoring': return <Target size={18} />;
        case 'schedule': return <Calendar size={18} />;
        case 'attendance': return <ClipboardCheck size={18} />;
        case 'analytics': return <BarChart3 size={18} />;
        case 'bleeptest': return <Activity size={18} />;
        case 'digital_id_card': return <CreditCard size={18} />;
        case 'archer_config': return <UserCog size={18} />;
        case 'jersey_shop': return <ShoppingBag size={18} />;
        case 'top_performers': return <Trophy size={18} />;
        default: return <Package size={18} />;
    }
};

interface LivePreviewProps {
    parts: FeaturePart[];
    assembly: FeatureAssembly | null;
    onRemovePart: (partId: string) => void;
    onReorderParts: (parts: FeaturePart[]) => void;
    onCreateAssembly: (name: string, targetRole: string) => void;
    onClearPreview: () => void;
    selectedPartId: string | null;
    onSelectPart: (id: string | null) => void;
    onUpdatePartProps: (id: string, props: Record<string, any>) => void;
}

// Component renderer - extracts the system part and renders it
const PartPreviewRenderer: React.FC<{ featurePart: FeaturePart }> = ({ featurePart }) => {
    const part = featurePart.part;
    // Try to get a real preview component from the registry
    const PreviewComponent = getPreviewComponent(part.code);

    // TODO: Parse propsConfig and pass to component
    let props = {};
    try {
        props = featurePart.propsConfig ?
            (typeof featurePart.propsConfig === 'string' ? JSON.parse(featurePart.propsConfig) : featurePart.propsConfig)
            : {};
    } catch (e) { console.error("Props parsing error", e); }

    if (PreviewComponent) {
        return <PreviewComponent {...props} />;
    }

    // Fallback to generic placeholder based on type
    switch (part.type) {
        case 'FULLSTACK':
            return (
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                            <Package size={16} className="text-white" />
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-white">{part.name}</h4>
                            <p className="text-[10px] text-slate-500">FullStack Component</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-3 bg-slate-700 rounded w-3/4" />
                        <div className="h-3 bg-slate-700 rounded w-1/2" />
                        <div className="grid grid-cols-3 gap-2 mt-3">
                            <div className="h-12 bg-slate-700/50 rounded" />
                            <div className="h-12 bg-slate-700/50 rounded" />
                            <div className="h-12 bg-slate-700/50 rounded" />
                        </div>
                    </div>
                </div>
            );
        case 'WIDGET':
            return (
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-3 border border-blue-500/30">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded bg-blue-500/30 flex items-center justify-center">
                            <Package size={12} className="text-blue-400" />
                        </div>
                        <span className="text-xs font-medium text-blue-400">{part.name}</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">--</div>
                    <div className="text-[10px] text-slate-400">Widget preview</div>
                </div>
            );
        case 'FORM_INPUT':
            return (
                <div className="bg-slate-800 rounded-lg p-3 border border-emerald-500/30">
                    <label className="text-xs text-slate-400 mb-1 block">{part.name}</label>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-8 bg-slate-700 rounded border border-slate-600" />
                        <div className="w-8 h-8 bg-emerald-500/20 rounded flex items-center justify-center">
                            <Check size={14} className="text-emerald-400" />
                        </div>
                    </div>
                </div>
            );
        default:
            return (
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 text-center">
                    <Package className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">{part.name}</p>
                </div>
            );
    }
};


// Sortable wrapper for each part
const SortablePartItem: React.FC<{
    featurePart: FeaturePart;
    onRemove: (id: string) => void;
    isDraggable: boolean;
    isSelected: boolean;
    onSelect: () => void;
}> = ({ featurePart, onRemove, isDraggable, isSelected, onSelect }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: featurePart.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={(e) => {
                // Prevent selection if clicking remove or drag handle
                if ((e.target as HTMLElement).closest('button')) return;
                onSelect();
            }}
            className={`
                relative group transition-all duration-200
                ${isDragging ? 'shadow-lg shadow-primary-500/20 z-50' : ''}
                ${isSelected
                    ? 'ring-2 ring-primary-500 bg-slate-800/80 rounded-lg'
                    : 'hover:bg-slate-800/50 rounded-lg'}
            `}
        >
            {isDraggable && (
                <div className="absolute -left-2 top-0 bottom-0 flex items-center z-10">
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Drag Handle */}
                        <button
                            {...attributes}
                            {...listeners}
                            className="p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-400 hover:text-white cursor-grab active:cursor-grabbing"
                            title="Drag to reorder"
                        >
                            <GripVertical size={12} />
                        </button>
                        {/* Remove Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onRemove(featurePart.id); }}
                            className="p-1 bg-red-500/80 hover:bg-red-500 rounded text-white"
                            title="Remove"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                </div>
            )}

            {/* Selection Indicator & Settings visual hint */}
            {isSelected && (
                <div className="absolute top-2 right-2 text-primary-500 animate-in fade-in zoom-in duration-200">
                    <Settings size={14} />
                </div>
            )}

            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-1"
            >
                <PartPreviewRenderer featurePart={featurePart} />
            </motion.div>
        </div>
    );
};

const LivePreview: React.FC<LivePreviewProps> = ({
    parts,
    assembly,
    onRemovePart,
    onReorderParts,
    onCreateAssembly,
    onClearPreview,
    selectedPartId,
    onSelectPart,
    onUpdatePartProps
}) => {
    const [isCreating, setIsCreating] = useState(false);
    const [featureName, setFeatureName] = useState('');
    const [targetRole, setTargetRole] = useState('ATHLETE');
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Setup sensors for drag detection
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Start drag after 8px movement
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = parts.findIndex((p) => p.id === active.id);
            const newIndex = parts.findIndex((p) => p.id === over.id);
            const reorderedParts = arrayMove(parts, oldIndex, newIndex);
            onReorderParts(reorderedParts);
        }
    };

    const handleCreate = () => {
        if (featureName.trim() && parts.length > 0) {
            onCreateAssembly(featureName.trim(), targetRole);
            setFeatureName('');
            setIsCreating(false);
        }
    };

    // Determine what to preview: staged parts or selected assembly
    // If assembly is selected, use its parts (FeatureParts). 
    // If composing, use 'parts' (FeatureParts).
    // The props interface now guarantees FeaturePart[] for both inputs if we map correctly upstream.
    // In SystemModulesFactoryPage:
    // - previewParts is FeaturePart[]
    // - assembly is FeatureAssembly, which has parts: FeaturePart[]
    const previewingParts = assembly ? assembly.parts : parts;
    const hasContent = previewingParts && previewingParts.length > 0;
    const canDrag = !assembly && hasContent;

    // Find the Selected Feature Part Object
    const selectedPart = selectedPartId ? previewingParts.find(p => p.id === selectedPartId) || null : null;

    return (
        <div className={`relative flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900' : ''}`}>
            {/* Header */}
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-cyan-500" />
                    <h2 className="font-semibold text-white">Live Preview</h2>
                    {assembly && (
                        <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                            {assembly.name}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {hasContent && !assembly && (
                        <button
                            onClick={onClearPreview}
                            className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                            title="Clear Preview"
                        >
                            <RotateCcw size={14} />
                        </button>
                    )}
                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                        title="Toggle Fullscreen"
                    >
                        <Maximize2 size={14} />
                    </button>
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 overflow-y-auto p-4 relative">
                {!hasContent ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                            <Eye className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                            <h3 className="text-sm font-medium text-slate-400 mb-1">No Preview</h3>
                            <p className="text-xs text-slate-500 max-w-[200px] mx-auto">
                                Add parts from the Warehouse or select an Assembly to preview
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3 pb-20">
                        {/* Preview Header */}
                        <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-2">
                            <div className="flex items-center gap-2">
                                <Play size={14} className="text-emerald-400" />
                                <span className="text-xs text-slate-300">
                                    {assembly ? 'Assembly Preview' : 'Staged Parts'}
                                </span>
                                {canDrag && (
                                    <span className="text-[10px] text-slate-500 ml-2">
                                        (drag to reorder, click to configure)
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-slate-500">
                                {previewingParts.length} components
                            </span>
                        </div>

                        {/* Navigation Preview (Mobile/Sidebar) */}
                        {assembly && previewingParts.length > 0 && (
                            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3">
                                <h3 className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-1">
                                    <Settings size={10} /> UI Navigation Preview
                                </h3>
                                <div className="flex gap-4 items-center overflow-x-auto pb-1">
                                    {/* Sidebar Style */}
                                    <div>
                                        <p className="text-[9px] text-slate-600 mb-1">Sidebar Item</p>
                                        <div className="flex items-center gap-3 px-3 py-2 bg-slate-800 rounded-md border border-slate-700 text-white w-40 opacity-90 hover:opacity-100 cursor-pointer">
                                            {getIconForPart(previewingParts[0].part.code)}
                                            <span className="text-sm font-medium">{assembly.name.split('/').pop()}</span>
                                        </div>
                                    </div>
                                    {/* Mobile Tab Style */}
                                    <div>
                                        <p className="text-[9px] text-slate-600 mb-1">Mobile Tab</p>
                                        <div className="flex flex-col items-center justify-center w-16 h-14 bg-slate-800 rounded-md border border-slate-700 text-slate-400 hover:text-white cursor-pointer">
                                            {getIconForPart(previewingParts[0].part.code)}
                                            <span className="text-[9px] mt-1 truncate w-14 text-center">{assembly.name.split('/').pop()?.slice(0, 8)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Sortable Parts List */}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={previewingParts.map(p => p.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-3">
                                    <AnimatePresence>
                                        {previewingParts.map((part) => (
                                            <SortablePartItem
                                                key={part.id}
                                                featurePart={part}
                                                onRemove={onRemovePart}
                                                isDraggable={canDrag}
                                                isSelected={selectedPartId === part.id}
                                                onSelect={() => !assembly && onSelectPart(part.id)}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>
                )}

                {/* Props Panel Overlay */}
                <AnimatePresence>
                    {selectedPart && !assembly && (
                        <PropsPanel
                            selectedPart={selectedPart}
                            onUpdate={onUpdatePartProps}
                            onClose={() => onSelectPart(null)}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Create Assembly Form */}
            {!assembly && hasContent && (
                <div className="p-3 border-t border-slate-700 bg-slate-800/50 absolute bottom-0 left-0 right-0 glass-blur z-10">
                    {!isCreating ? (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="w-full flex items-center justify-center gap-2 py-2 bg-primary-500 hover:bg-primary-600 rounded text-white text-sm transition-colors"
                        >
                            <Save size={16} />
                            Create Feature Assembly
                        </button>
                    ) : (
                        <div className="space-y-3 animate-in slide-in-from-bottom duration-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-white">Create Feature</span>
                                <button
                                    onClick={() => setIsCreating(false)}
                                    className="p-1 hover:bg-slate-700 rounded text-slate-400"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Feature Name</label>
                                <input
                                    type="text"
                                    value={featureName}
                                    onChange={(e) => setFeatureName(e.target.value)}
                                    placeholder="e.g. Athlete Dashboard"
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Target Role</label>
                                <select
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-primary-500"
                                >
                                    {ROLE_OPTIONS.map(role => (
                                        <option key={role.value} value={role.value}>
                                            {role.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsCreating(false)}
                                    className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={!featureName.trim()}
                                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 rounded text-white text-sm transition-colors"
                                >
                                    <Check size={14} />
                                    Create
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Assembly Status */}
            {assembly && (
                <div className="p-3 border-t border-slate-700 bg-slate-800/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${assembly.status === 'DEPLOYED' ? 'bg-blue-400' :
                                assembly.status === 'APPROVED' ? 'bg-emerald-400' :
                                    assembly.status === 'TESTING' ? 'bg-amber-400 animate-pulse' :
                                        'bg-slate-400'
                                }`} />
                            <span className="text-xs text-slate-400">
                                Status: <span className="text-white">{assembly.status}</span>
                            </span>
                        </div>
                        <span className="text-xs text-slate-500">
                            v{assembly.version}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LivePreview;
