import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layout,
    GripVertical,
    Eye,
    EyeOff,
    Save,
    RefreshCw
} from 'lucide-react';
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
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { api } from '../../../core/contexts/AuthContext';
import { notifyLayoutUpdate } from '../../../core/hooks/useLayoutTabs';
import { toast } from 'react-toastify';

interface LayoutConfig {
    featureKey: string;
    order: string[];
    hidden: string[];
}

const AVAILABLE_FEATURES = [
    {
        key: 'event_management',
        name: 'Event Management Tabs',
        tabs: [
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'settings', label: 'Settings' },
            { id: 'rundown', label: 'Rundown' },
            { id: 'targets', label: 'Targets' },
            { id: 'budget', label: 'Budget' },
            { id: 'timeline', label: 'Timeline' },
            { id: 'registration', label: 'Registration' },
            { id: 'participants', label: 'Participants' },
            { id: 'brackets', label: 'Brackets' },
            { id: 'results', label: 'Results' },
            { id: 'certificates', label: 'Certificates' }
        ]
    },
    {
        key: 'super_admin',
        name: 'Super Admin Panel Tabs',
        tabs: [
            { id: 'overview', label: 'Overview' },
            { id: 'role-requests', label: 'Requests' },
            { id: 'events', label: 'Events' },
            { id: 'territories', label: 'Territory' },
            { id: 'sidebar', label: 'Sidebar' },
            { id: 'roles', label: 'Codes' },
            { id: 'audit-logs', label: 'Audit' },
            { id: 'troubleshoot', label: 'Debug' },
            { id: 'innovation', label: 'Labs' },
            { id: 'layouts', label: 'Layouts' },
            { id: 'restore', label: 'Restore' }
        ]
    }
];

// --- Sortable Tab Item ---
function SortableTabItem({
    id,
    label,
    isHidden,
    onToggleVisibility
}: {
    id: string;
    label: string;
    isHidden: boolean;
    onToggleVisibility: (id: string) => void;
}) {
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
        zIndex: isDragging ? 100 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isDragging ? 'bg-dark-700 border-primary-500 shadow-xl opacity-90' :
                isHidden ? 'bg-dark-800/30 border-dark-800 opacity-60' : 'bg-dark-800/50 border-dark-700 hover:border-dark-600'
                }`}
        >
            <div className="flex items-center gap-4">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-dark-500 hover:text-white transition-colors"
                >
                    <GripVertical size={16} />
                </div>
                <div>
                    <p className="font-bold text-sm text-white">{label}</p>
                    <p className="text-[10px] font-mono text-dark-500 uppercase">{id}</p>
                </div>
            </div>

            <button
                onClick={() => onToggleVisibility(id)}
                className={`p-2 rounded-lg transition-all ${isHidden ? 'text-red-400 bg-red-400/10 hover:bg-red-400/20' : 'text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20'
                    }`}
                title={isHidden ? 'Hidden' : 'Visible'}
            >
                {isHidden ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    );
}

export default function LayoutManagerTab() {
    const [configs, setConfigs] = useState<Record<string, LayoutConfig>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchConfigs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/layout');
            if (res.data.success) {
                const configMap: Record<string, LayoutConfig> = {};

                // Process each config from DB
                res.data.data.forEach((c: any) => {
                    configMap[c.featureKey] = c;
                });

                // Sync with AVAILABLE_FEATURES: Ensure all defined tabs are in the order array
                AVAILABLE_FEATURES.forEach(feature => {
                    const currentConfig = configMap[feature.key] || {
                        featureKey: feature.key,
                        order: [],
                        hidden: []
                    };

                    let newOrder = [...currentConfig.order];

                    // 1. Remove deprecated tabs (that are no longer in feature.tabs)
                    newOrder = newOrder.filter(id => feature.tabs.some(t => t.id === id));

                    // 2. Add missing tabs (that are in feature.tabs but not in order)
                    feature.tabs.forEach(tab => {
                        if (!newOrder.includes(tab.id)) {
                            newOrder.push(tab.id);
                        }
                    });

                    // 3. Deduplicate
                    newOrder = [...new Set(newOrder)];

                    configMap[feature.key] = {
                        ...currentConfig,
                        order: newOrder
                    };
                });

                setConfigs(configMap);
            }
        } catch (error) {
            console.error('Failed to fetch layouts:', error);
            toast.error('Failed to load layout configurations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    const handleToggleVisibility = (featureKey: string, tabId: string) => {
        setConfigs(prev => {
            const current = prev[featureKey] || { featureKey, order: [], hidden: [] };
            const isHidden = current.hidden.includes(tabId);
            const newHidden = isHidden
                ? current.hidden.filter(id => id !== tabId)
                : [...current.hidden, tabId];

            return {
                ...prev,
                [featureKey]: { ...current, hidden: newHidden }
            };
        });
    };

    const handleDragEnd = (event: DragEndEvent, featureKey: string) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const feature = AVAILABLE_FEATURES.find(f => f.key === featureKey);
        if (!feature) return;

        setConfigs(prev => {
            const current = prev[featureKey] || {
                featureKey,
                order: feature.tabs.map(t => t.id),
                hidden: []
            };

            const oldIndex = current.order.indexOf(active.id as string);
            const newIndex = current.order.indexOf(over.id as string);

            return {
                ...prev,
                [featureKey]: {
                    ...current,
                    order: arrayMove(current.order, oldIndex, newIndex)
                }
            };
        });
    };

    const handleSave = async (featureKey: string) => {
        setSaving(true);
        try {
            const config = configs[featureKey];
            if (!config) return;

            const res = await api.post(`/layout/${featureKey}`, { config });
            if (res.data.success) {
                notifyLayoutUpdate(featureKey, res.data.data);
                toast.success(`Layout for ${featureKey} saved!`);
            }
        } catch (error) {
            console.error('Save failed:', error);
            toast.error('Failed to save layout');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async (featureKey: string) => {
        if (!confirm('This will reset the layout to system defaults. Are you sure?')) return;
        setSaving(true);
        try {
            // We can treat "empty" or "null" config as reset, depending on backend.
            // Or ideally, the backend DELETE endpoint.
            // For now, let's just save the DEFAULT order associated with AVAILABLE_FEATURES.
            const feature = AVAILABLE_FEATURES.find(f => f.key === featureKey);
            if (!feature) return;

            const defaultConfig: LayoutConfig = {
                featureKey,
                order: feature.tabs.map(t => t.id),
                hidden: []
            };

            const res = await api.post(`/layout/${featureKey}`, { config: defaultConfig });
            if (res.data.success) {
                setConfigs(prev => ({
                    ...prev,
                    [featureKey]: defaultConfig
                }));
                notifyLayoutUpdate(featureKey, defaultConfig);
                toast.success(`Layout for ${featureKey} reset to defaults!`);
            }
        } catch (error) {
            console.error('Reset failed:', error);
            toast.error('Failed to reset layout');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <RefreshCw className="animate-spin text-primary-500" />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Layout className="text-primary-400" />
                        UI Layout Manager
                    </h2>
                    <p className="text-dark-400 text-sm">Organize tabs and feature visibility across the platform via Drag & Drop.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {AVAILABLE_FEATURES.map(feature => {
                    const config = configs[feature.key] || {
                        featureKey: feature.key,
                        order: feature.tabs.map(t => t.id),
                        hidden: []
                    };

                    // State is now sanitized in fetchConfigs, so we can trust config.order
                    // But we still filter to ensure we only render tabs that actually exist in the definition
                    const displayOrder = config.order.filter(id => feature.tabs.some(t => t.id === id));

                    return (
                        <div key={feature.key} className="card p-6 border-dark-700/50 flex flex-col h-full bg-dark-900/40">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{feature.name}</h3>
                                    <p className="text-xs text-dark-500 mt-1">Order and visibility for this module</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleReset(feature.key)}
                                        disabled={saving}
                                        className="p-2.5 bg-dark-800 hover:bg-dark-700 text-dark-400 hover:text-white rounded-xl transition-all disabled:opacity-50"
                                        title="Reset to Defaults"
                                    >
                                        <RefreshCw size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleSave(feature.key)}
                                        disabled={saving}
                                        className="p-2.5 bg-primary-500 hover:bg-primary-400 text-black rounded-xl transition-all disabled:opacity-50 group"
                                        title="Save Configuration"
                                    >
                                        <Save size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1">
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={(e) => handleDragEnd(e, feature.key)}
                                >
                                    <SortableContext
                                        items={displayOrder}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="space-y-2">
                                            {displayOrder.map((tabId) => {
                                                const tab = feature.tabs.find(t => t.id === tabId);
                                                if (!tab) return null;
                                                const isHidden = config.hidden.includes(tabId);

                                                return (
                                                    <SortableTabItem
                                                        key={tabId}
                                                        id={tabId}
                                                        label={tab.label}
                                                        isHidden={isHidden}
                                                        onToggleVisibility={(id) => handleToggleVisibility(feature.key, id)}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
