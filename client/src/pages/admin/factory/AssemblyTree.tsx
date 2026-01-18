import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GitBranch,
    ChevronDown,
    ChevronRight,
    Check,
    Rocket,
    Clock,
    Users,
    FileText,
    Package,
    Undo2,
    RotateCcw,
    Trash2,
    Folder
} from 'lucide-react';
import {
    FeatureAssembly,
    AssemblyStatus,
    STATUS_LABELS,
    ROLE_OPTIONS,
} from '../../../services/factory.service';

interface AssemblyTreeProps {
    assemblies: FeatureAssembly[];
    selectedAssembly: FeatureAssembly | null;
    onSelectAssembly: (assembly: FeatureAssembly) => void;
    onApprove: (assemblyId: string) => void;
    onDeploy: (assemblyId: string) => void;
    onRollback: (assemblyId: string) => void;
    onRevert: (assemblyId: string) => void;
    onDelete: (assemblyId: string) => void;
    pendingDeleteId?: string | null;
}

const STATUS_COLORS: Record<AssemblyStatus, { bg: string; text: string; icon: React.ElementType }> = {
    DRAFT: { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: FileText },
    TESTING: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: Clock },
    APPROVED: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: Check },
    DEPLOYED: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Rocket },
};

// ==================== HELPER COMPONENTS ====================

const AssemblyItem: React.FC<{
    assembly: FeatureAssembly;
    isSelected: boolean;
    onSelect: () => void;
}> = ({ assembly, isSelected, onSelect }) => {
    const statusConfig = STATUS_COLORS[assembly.status];
    const StatusIcon = statusConfig.icon;
    // Strip folder name from display name if present
    const displayName = assembly.name.includes('/') ? assembly.name.split('/').pop() : assembly.name;

    return (
        <motion.div
            layout
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className={`
                flex items-center gap-2 p-2 rounded-lg cursor-pointer
                transition-all mb-1 group
                ${isSelected
                    ? 'bg-primary-500/20 border border-primary-500/30'
                    : 'hover:bg-slate-800'
                }
            `}
        >
            <Package size={14} className="text-slate-400" />
            <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">
                    {displayName}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                    {assembly.parts?.length || 0} parts • v{assembly.version}
                </div>
            </div>
            <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded ${statusConfig.bg} ${statusConfig.text}`}>
                <StatusIcon size={10} />
                {STATUS_LABELS[assembly.status]}
            </span>
        </motion.div>
    );
};

const FolderItem: React.FC<{
    name: string;
    items: FeatureAssembly[];
    selectedId?: string;
    onSelect: (assembly: FeatureAssembly) => void;
}> = ({ name, items, selectedId, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    // Auto-open if a child is selected
    React.useEffect(() => {
        if (items.some(i => i.id === selectedId)) setIsOpen(true);
    }, [selectedId, items]);

    return (
        <div className="mb-1">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
            >
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <Folder size={14} className="text-amber-500/70" />
                <span className="text-xs font-medium uppercase tracking-wider">{name}</span>
                <span className="text-[10px] bg-slate-800 px-1.5 rounded ml-auto">{items.length}</span>
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden ml-4 pl-2 border-l border-slate-700/30"
                    >
                        {items.map(assembly => (
                            <AssemblyItem
                                key={assembly.id}
                                assembly={assembly}
                                isSelected={selectedId === assembly.id}
                                onSelect={() => onSelect(assembly)}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const AssemblyTree: React.FC<AssemblyTreeProps> = ({
    assemblies,
    selectedAssembly,
    onSelectAssembly,
    onApprove,
    onDeploy,
    onRollback,
    onRevert,
    onDelete,
    pendingDeleteId,
}) => {
    // Default collapsed (empty set)
    const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());

    // Group assemblies by role
    const assemblyByRole = ROLE_OPTIONS.reduce((acc, role) => {
        acc[role.value] = assemblies.filter(a => a.targetRole === role.value);
        return acc;
    }, {} as Record<string, FeatureAssembly[]>);

    const toggleRole = (role: string) => {
        const newExpanded = new Set(expandedRoles);
        if (newExpanded.has(role)) {
            newExpanded.delete(role);
        } else {
            newExpanded.add(role);
        }
        setExpandedRoles(newExpanded);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-700">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <GitBranch className="w-5 h-5 text-emerald-500" />
                        <h2 className="font-semibold text-white">Assembly Tree</h2>
                    </div>
                    <span className="text-xs text-slate-500">{assemblies.length} features</span>
                </div>
                <p className="text-xs text-slate-400">
                    Expand a role to see its configured assembly hierarchy.
                </p>
            </div>

            {/* Tree View */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {ROLE_OPTIONS.map(role => {
                    const roleAssemblies = assemblyByRole[role.value] || [];
                    const isExpanded = expandedRoles.has(role.value);
                    const hasAssemblies = roleAssemblies.length > 0;

                    // Group by Logic (Folders)
                    const rootAssemblies: FeatureAssembly[] = [];
                    const folders: Record<string, FeatureAssembly[]> = {};

                    roleAssemblies.forEach(a => {
                        if (a.name.includes('/')) {
                            const [folderName, ...rest] = a.name.split('/');
                            if (!folders[folderName]) folders[folderName] = [];
                            folders[folderName].push(a);
                        } else {
                            rootAssemblies.push(a);
                        }
                    });

                    return (
                        <div key={role.value} className="rounded-lg">
                            {/* Role Header */}
                            <button
                                onClick={() => toggleRole(role.value)}
                                className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${hasAssemblies
                                    ? 'hover:bg-slate-800 text-white'
                                    : 'text-slate-500 cursor-default'
                                    }`}
                            >
                                {hasAssemblies ? (
                                    isExpanded ? (
                                        <ChevronDown size={16} className="text-slate-400" />
                                    ) : (
                                        <ChevronRight size={16} className="text-slate-400" />
                                    )
                                ) : (
                                    <div className="w-4" />
                                )}
                                <Users size={14} className="text-slate-400" />
                                <span className="text-sm">{role.label}</span>
                                {hasAssemblies && (
                                    <span className="text-xs text-slate-500 ml-auto">
                                        {roleAssemblies.length}
                                    </span>
                                )}
                            </button>

                            {/* Assemblies */}
                            <AnimatePresence>
                                {isExpanded && hasAssemblies && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="ml-6 border-l border-slate-700/50 pl-2 space-y-1"
                                    >
                                        {/* Root Items */}
                                        {rootAssemblies.map(assembly => (
                                            <AssemblyItem
                                                key={assembly.id}
                                                assembly={assembly}
                                                isSelected={selectedAssembly?.id === assembly.id}
                                                onSelect={() => onSelectAssembly(assembly)}
                                            />
                                        ))}

                                        {/* Folders */}
                                        {Object.entries(folders).map(([folderName, items]) => (
                                            <FolderItem
                                                key={folderName}
                                                name={folderName}
                                                items={items}
                                                selectedId={selectedAssembly?.id}
                                                onSelect={onSelectAssembly}
                                            />
                                        ))}

                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}

                {assemblies.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                        <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No assemblies yet</p>
                        <p className="text-xs mt-1">Add parts to Preview and create a feature</p>
                    </div>
                )}
            </div>

            {/* Selected Assembly Actions */}
            {selectedAssembly && (
                <div className="p-3 border-t border-slate-700 bg-slate-800/50">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <h3 className="font-medium text-white text-sm">{selectedAssembly.name}</h3>
                            <p className="text-[10px] font-mono text-slate-500">{selectedAssembly.code}</p>
                        </div>
                        <span className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded ${STATUS_COLORS[selectedAssembly.status].bg} ${STATUS_COLORS[selectedAssembly.status].text}`}>
                            {STATUS_LABELS[selectedAssembly.status]}
                        </span>
                    </div>

                    {selectedAssembly.description && (
                        <p className="text-xs text-slate-400 mb-3">{selectedAssembly.description}</p>
                    )}

                    {/* Parts in assembly */}
                    <div className="mb-3">
                        <p className="text-[10px] text-slate-500 uppercase mb-1">Parts</p>
                        <div className="flex flex-wrap gap-1">
                            {selectedAssembly.parts?.map(fp => (
                                <span key={fp.id} className="text-[10px] px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded">
                                    {fp.part.name}
                                </span>
                            )) || <span className="text-[10px] text-slate-500">No parts</span>}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            {selectedAssembly.status === 'DRAFT' && (
                                <>
                                    <button
                                        onClick={() => onApprove(selectedAssembly.id)}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded text-xs transition-colors"
                                    >
                                        <Clock size={12} />
                                        Start Testing
                                    </button>
                                    <button
                                        onClick={() => {
                                            console.log('[DEBUG] Delete button clicked, assemblyId:', selectedAssembly.id);
                                            onDelete(selectedAssembly.id);
                                        }}
                                        className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded text-xs transition-colors ${pendingDeleteId === selectedAssembly.id
                                                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                                                : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                                            }`}
                                        title={pendingDeleteId === selectedAssembly.id ? 'Click again to confirm delete' : 'Delete Assembly'}
                                    >
                                        <Trash2 size={12} />
                                        {pendingDeleteId === selectedAssembly.id && <span>Confirm?</span>}
                                    </button>
                                </>
                            )}
                            {selectedAssembly.status === 'TESTING' && (
                                <>
                                    <button
                                        onClick={() => onRevert(selectedAssembly.id)}
                                        className="flex items-center justify-center gap-1 px-3 py-1.5 bg-slate-500/20 hover:bg-slate-500/30 text-slate-400 rounded text-xs transition-colors"
                                        title="Back to Draft"
                                    >
                                        <RotateCcw size={12} />
                                    </button>
                                    <button
                                        onClick={() => onApprove(selectedAssembly.id)}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded text-xs transition-colors"
                                    >
                                        <Check size={12} />
                                        Approve
                                    </button>
                                </>
                            )}
                            {selectedAssembly.status === 'APPROVED' && (
                                <>
                                    <button
                                        onClick={() => onRevert(selectedAssembly.id)}
                                        className="flex items-center justify-center gap-1 px-3 py-1.5 bg-slate-500/20 hover:bg-slate-500/30 text-slate-400 rounded text-xs transition-colors"
                                        title="Back to Draft"
                                    >
                                        <RotateCcw size={12} />
                                    </button>
                                    <button
                                        onClick={() => onDeploy(selectedAssembly.id)}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-xs transition-colors"
                                    >
                                        <Rocket size={12} />
                                        Deploy to Role
                                    </button>
                                </>
                            )}
                            {selectedAssembly.status === 'DEPLOYED' && (
                                <>
                                    <button
                                        onClick={() => onRollback(selectedAssembly.id)}
                                        className="flex items-center justify-center gap-1 px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded text-xs transition-colors"
                                        title="Rollback to Approved"
                                    >
                                        <Undo2 size={12} />
                                        Rollback
                                    </button>
                                    <div className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-500/10 text-blue-400/70 rounded text-xs">
                                        <Rocket size={12} />
                                        Live
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssemblyTree;
