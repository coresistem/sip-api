import React, { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Check,
    GripVertical,
    Plus,
    RotateCcw,
    Save,
    Trash2,
    X,
    LayoutDashboard,
    AlertCircle,
    User,
    CreditCard,
    Bell,
    Target,
    Trophy,
    TrendingUp,
    Calendar,
    Shield,
    Timer,
    CheckSquare,
    DollarSign,
    Package,
    Building2,
    UserCheck,
    Receipt,
    GraduationCap,
    Heart,
    Scale,
    Shirt,
    Truck,
    CheckCircle,
    FileText,
    FileBarChart,
    FolderOpen,
    History,
    Settings,
    FileSearch,
    ShoppingBag,
    ClipboardList,
    Wrench,
    Award,
    Folder
} from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionsContext';
import {
    ModuleName,
    MODULE_LIST,
    SidebarGroupConfig,
    ROLE_LIST,
    SidebarRoleGroup
} from '../../types/permissions';
import { SIDEBAR_ROLE_GROUPS } from '../../types/permissions'; // fallback defaults

// --- Icon Mapper ---
const IconMapper = ({ icon, size = 16, className = "" }: { icon: string; size?: number; className?: string }) => {
    const icons: Record<string, any> = {
        LayoutDashboard, User, CreditCard, Bell, Target, Trophy, TrendingUp,
        Calendar, Shield, Timer, CheckSquare, DollarSign, Package, Building2,
        UserCheck, Receipt, GraduationCap, Heart, Scale, Shirt, Truck,
        CheckCircle, FileText, FileBarChart, FolderOpen, History, Settings,
        FileSearch, ShoppingBag, ClipboardList, Wrench, Award, Folder
    };

    const IconComponent = icons[icon] || LayoutDashboard;
    return <IconComponent size={size} className={className} />;
};

// --- Sortable Item Component ---
function SortableItem({ id, module, isOverlay }: { id: string; module?: any; isOverlay?: boolean }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    if (!module) return null;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
                flex items-center gap-3 p-3 rounded-lg border 
                ${isOverlay ? 'bg-dark-800 border-primary-500 shadow-xl cursor-grabbing' : 'bg-dark-800 border-dark-700 hover:border-dark-600 cursor-grab'}
                group transition-colors
            `}
        >
            <GripVertical className="text-dark-500 group-hover:text-dark-400" size={12} />
            <div className={`p-1 rounded-md bg-dark-700 text-dark-300`}>
                <IconMapper icon={module.icon} size={14} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-[11px] leading-tight text-white truncate">{module.label}</p>
                <p className="text-[10px] text-dark-500 truncate capitalize">{module.category.replace('_', ' ')}</p>
            </div>
        </div>
    );
}

// --- Droppable Group Container ---
function DroppableGroup({
    group,
    items,
    onRemoveGroup,
    onRenameGroup
}: {
    group: SidebarGroupConfig;
    items: ModuleName[];
    onRemoveGroup: (id: string) => void;
    onRenameGroup: (id: string, name: string) => void;
}) {
    const { setNodeRef } = useSortable({
        id: group.id,
        data: {
            type: 'Group',
            group
        }
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(group.label);

    const handleSaveName = () => {
        onRenameGroup(group.id, editName);
        setIsEditing(false);
    };

    const colorClasses: Record<string, string> = {
        primary: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        green: 'bg-green-500/10 text-green-400 border-green-500/20',
        orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        teal: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
        indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
        red: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    const activeColorClass = colorClasses[group.color] || colorClasses.primary;
    const { isOver } = useSortable({ id: group.id });

    return (
        <div ref={setNodeRef} className={`bg-dark-900 border rounded-xl overflow-hidden flex flex-col h-full min-h-[300px] transition-all ${isOver ? 'border-primary-500 scale-[1.01] shadow-lg shadow-primary-500/10' : 'border-dark-700'}`}>
            {/* Header */}
            <div className={`p-3 border-b border-dark-700 flex items-center justify-between ${activeColorClass}`}>
                <div className="flex items-center gap-2 flex-1">
                    <IconMapper icon={group.icon || 'Folder'} size={16} />
                    {isEditing ? (
                        <input
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={handleSaveName}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                            className="bg-dark-800 border border-dark-600 rounded px-2 py-0.5 text-xs w-full text-white"
                        />
                    ) : (
                        <span
                            className="font-bold text-xs text-white cursor-pointer hover:underline"
                            onClick={() => setIsEditing(true)}
                        >
                            {group.label}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => onRemoveGroup(group.id)}
                    className="p-1.5 text-dark-400 hover:text-red-400 rounded-md hover:bg-dark-800 transition-colors"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            {/* Sortable Area */}
            <div className="flex-1 p-3 space-y-2">
                <SortableContext items={items} strategy={verticalListSortingStrategy}>
                    {items.map((modName) => {
                        const moduleMeta = MODULE_LIST.find(m => m.name === modName);
                        if (!moduleMeta) return null;
                        return <SortableItem key={modName} id={modName} module={moduleMeta} />;
                    })}
                </SortableContext>
                {items.length === 0 && (
                    <div className="h-20 border-2 border-dashed border-dark-700/50 rounded-lg flex items-center justify-center text-xs text-dark-500">
                        Drag items here
                    </div>
                )}
            </div>
        </div>
    );
}


export default function SidebarMenuBuilder() {
    const [selectedRole, setSelectedRole] = useState('CLUB');
    const [groups, setGroups] = useState<SidebarGroupConfig[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeDragItem, setActiveDragItem] = useState<any>(null);
    const { refreshSidebarConfigs } = usePermissions();

    // Initialize sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Fetch config on role change
    useEffect(() => {
        fetchConfig();
    }, [selectedRole]);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/permissions/sidebar/${selectedRole}`);
            if (res.data && res.data.groups) {
                setGroups(JSON.parse(res.data.groups));
            } else {
                // Fallback to default
                loadDefaults();
            }
        } catch (error) {
            // Likely 404, load defaults
            loadDefaults();
        } finally {
            setLoading(false);
        }
    };

    const loadDefaults = () => {
        // Clone from constant to avoid mutating source
        setGroups(JSON.parse(JSON.stringify(SIDEBAR_ROLE_GROUPS)));
    };

    const handleSave = async () => {
        try {
            await api.post(`/permissions/sidebar/${selectedRole}`, {
                groups: JSON.stringify(groups)
            });
            await refreshSidebarConfigs();
            toast.success('Sidebar layout saved successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save layout');
        }
    };

    const handleReset = async () => {
        if (!confirm('Are you sure? This will revert to the system default.')) return;
        try {
            await api.post(`/permissions/sidebar/reset/${selectedRole}`);
            await refreshSidebarConfigs();
            loadDefaults();
            toast.success('Reset to default');
        } catch (error) {
            toast.error('Failed to reset');
        }
    };

    // DND Logic
    const findGroupId = (itemId: string) => {
        if (groups.find(g => g.id === itemId)) return itemId; // It's a group
        if (itemId === 'available') return 'available';

        const group = groups.find(g => g.modules.includes(itemId as ModuleName));
        if (group) return group.id;

        const isAvailable = MODULE_LIST.some(m => m.name === itemId && !groups.some(g => g.modules.includes(m.name)));
        if (isAvailable) return 'available';

        return null;
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const moduleId = active.id as ModuleName;
        const moduleMeta = MODULE_LIST.find(m => m.name === moduleId);
        setActiveDragItem(moduleMeta);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeGroupId = findGroupId(activeId);
        const overGroupId = findGroupId(overId);

        if (!activeGroupId || !overGroupId || activeGroupId === overGroupId) return;

        setGroups(prev => {
            const newGroups = [...prev];

            // Logic:
            // 1. If moving between two real groups
            // 2. If moving from available to a group
            // 3. If moving from a group to available

            if (activeGroupId !== 'available' && overGroupId !== 'available') {
                const activeGroupIdx = prev.findIndex(g => g.id === activeGroupId);
                const overGroupIdx = prev.findIndex(g => g.id === overGroupId);

                const activeModules = [...newGroups[activeGroupIdx].modules];
                const overModules = [...newGroups[overGroupIdx].modules];

                const activeIndex = activeModules.indexOf(activeId as ModuleName);
                const overIndex = overModules.indexOf(overId as ModuleName);

                activeModules.splice(activeIndex, 1);
                overModules.splice(overIndex >= 0 ? overIndex : overModules.length, 0, activeId as ModuleName);

                newGroups[activeGroupIdx] = { ...newGroups[activeGroupIdx], modules: activeModules };
                newGroups[overGroupIdx] = { ...newGroups[overGroupIdx], modules: overModules };
            } else if (activeGroupId === 'available' && overGroupId !== 'available') {
                const overGroupIdx = prev.findIndex(g => g.id === overGroupId);
                const overModules = [...newGroups[overGroupIdx].modules];
                const overIndex = overModules.indexOf(overId as ModuleName);

                overModules.splice(overIndex >= 0 ? overIndex : overModules.length, 0, activeId as ModuleName);
                newGroups[overGroupIdx] = { ...newGroups[overGroupIdx], modules: overModules };
            } else if (activeGroupId !== 'available' && overGroupId === 'available') {
                const activeGroupIdx = prev.findIndex(g => g.id === activeGroupId);
                const activeModules = [...newGroups[activeGroupIdx].modules];
                const activeIndex = activeModules.indexOf(activeId as ModuleName);

                activeModules.splice(activeIndex, 1);
                newGroups[activeGroupIdx] = { ...newGroups[activeGroupIdx], modules: activeModules };
            }

            return newGroups;
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragItem(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeGroupId = findGroupId(activeId);
        const overGroupId = findGroupId(overId);

        if (!activeGroupId || !overGroupId) return;

        if (activeGroupId === overGroupId && activeGroupId !== 'available') {
            const groupIndex = groups.findIndex(g => g.id === activeGroupId);
            const oldIndex = groups[groupIndex].modules.indexOf(activeId as ModuleName);
            let newIndex = groups[groupIndex].modules.indexOf(overId as ModuleName);

            // If dropped on the group container itself instead of another item, move to end
            if (newIndex === -1 && overId === activeGroupId) {
                newIndex = groups[groupIndex].modules.length - 1;
            }

            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                setGroups(prev => {
                    const newGroups = JSON.parse(JSON.stringify(prev)); // Deep clone to be safe
                    newGroups[groupIndex].modules = arrayMove(newGroups[groupIndex].modules, oldIndex, newIndex);
                    return newGroups;
                });
            }
        }
    };

    return (
        <div className="h-[calc(100vh-200px)] flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 bg-dark-800 p-4 rounded-xl border border-dark-700">
                <div className="flex items-center gap-4">
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="bg-dark-900 border border-dark-600 text-white rounded-lg px-4 py-2 font-medium"
                    >
                        {ROLE_LIST.map(r => (
                            <option key={r.code} value={r.role}>{r.label}</option>
                        ))}
                    </select>
                    <span className="text-dark-400 text-sm border-l border-dark-600 pl-4">
                        Customizing sidebar for <strong className="text-white">{selectedRole}</strong>
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 text-dark-400 hover:text-white transition-colors"
                    >
                        <RotateCcw size={18} />
                    </button>
                    <div className="h-6 w-px bg-dark-700" />
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-lg transition-colors"
                    >
                        <Save size={18} />
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Builder Area */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
                    {/* Unused Modules / Available Sidebar Area */}
                    <div className="w-full lg:w-64 shrink-0 flex flex-col max-h-[200px] lg:max-h-full">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-dark-400 uppercase text-xs">Available Modules</h3>
                            <span className="text-[10px] bg-dark-700 text-dark-300 px-1.5 py-0.5 rounded-full">
                                {MODULE_LIST.filter(m => !groups.some(g => g.modules.includes(m.name))).length}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            <SortableContext
                                id="available"
                                items={MODULE_LIST.filter(m => !groups.some(g => g.modules.includes(m.name))).map(m => m.name)}
                                strategy={verticalListSortingStrategy}
                            >
                                {MODULE_LIST.filter(m => !groups.some(g => g.modules.includes(m.name))).map((module) => (
                                    <SortableItem key={module.name} id={module.name} module={module} />
                                ))}
                                {MODULE_LIST.filter(m => !groups.some(g => g.modules.includes(m.name))).length === 0 && (
                                    <div className="p-4 rounded-xl border border-dashed border-dark-700 text-center text-dark-500 text-xs">
                                        All modules assigned
                                    </div>
                                )}
                            </SortableContext>
                        </div>

                        <div className="mt-4 p-3 rounded-lg bg-primary-500/5 border border-primary-500/10">
                            <p className="text-[10px] text-primary-400 font-medium leading-relaxed">
                                <AlertCircle size={10} className="inline mr-1 mb-0.5" />
                                Drag modules to groups on the right to add them to the sidebar for this role.
                            </p>
                        </div>
                    </div>

                    {/* Groups Grid */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pb-4">
                            {groups.map(group => (
                                <div key={group.id} className="min-h-[300px]">
                                    <DroppableGroup
                                        group={group}
                                        items={group.modules}
                                        onRemoveGroup={(id) => {
                                            setGroups(groups.filter(g => g.id !== id));
                                        }}
                                        onRenameGroup={(id, name) => {
                                            setGroups(groups.map(g => g.id === id ? { ...g, label: name } : g));
                                        }}
                                    />
                                </div>
                            ))}

                            {/* New Group Button */}
                            <button
                                onClick={() => {
                                    const newGroup: SidebarGroupConfig = {
                                        id: `group_${Date.now()}` as any,
                                        label: 'New Group',
                                        icon: 'Folder',
                                        color: 'blue',
                                        modules: []
                                    };
                                    setGroups([...groups, newGroup]);
                                }}
                                className="min-h-[300px] border-2 border-dashed border-dark-700 hover:border-dark-500 rounded-xl flex items-center justify-center gap-2 text-dark-500 hover:text-dark-300 transition-colors"
                            >
                                <Plus size={20} />
                                <span className="text-sm font-medium">Add Group</span>
                            </button>
                        </div>
                    </div>
                </div>

                <DragOverlay>
                    {activeDragItem ? (
                        <SortableItem id={activeDragItem.name} module={activeDragItem} isOverlay />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
