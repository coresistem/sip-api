import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Factory,
    Package,
    GitBranch,
    Eye,
    Loader2,
    Shield
} from 'lucide-react';
import {
    getParts,
    getAssemblies,
    createAssembly,
    approveAssembly,
    deployAssembly,
    rollbackAssembly,
    revertToDraft,
    updateAssembly,
    deleteAssembly,
    SystemPart,
    FeatureAssembly,
    FeaturePart,
} from '../../services/factory.service';
import PartsWarehouse from './factory/PartsWarehouse';
import AssemblyTree from './factory/AssemblyTree';
import LivePreview from './factory/LivePreview';
import { toast } from 'react-toastify';
import { getPartSchema } from './factory/PropsRegistry';

interface SystemModulesFactoryPageProps {
    initialAssemblyId?: string | null;
}

const SystemModulesFactoryPage: React.FC<SystemModulesFactoryPageProps> = ({ initialAssemblyId }) => {
    // Data state
    const [parts, setParts] = useState<SystemPart[]>([]);
    const [assemblies, setAssemblies] = useState<FeatureAssembly[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Selection state
    const [selectedPart, setSelectedPart] = useState<SystemPart | null>(null);
    const [selectedAssembly, setSelectedAssembly] = useState<FeatureAssembly | null>(null);
    const [previewParts, setPreviewParts] = useState<FeaturePart[]>([]);
    const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    // Effect to handle initial selection
    useEffect(() => {
        if (initialAssemblyId && assemblies.length > 0) {
            // Match by exact ID or by Code (fuzzy match)
            const found = assemblies.find(a =>
                a.id === initialAssemblyId ||
                a.code === initialAssemblyId ||
                a.code.includes(initialAssemblyId) ||
                initialAssemblyId.includes(a.code)
            );
            if (found) {
                setSelectedAssembly(found);
            }
        }
    }, [initialAssemblyId, assemblies]);

    // UI state
    const [activePanel, setActivePanel] = useState<'warehouse' | 'assembly' | 'preview'>('warehouse');

    // --- Resizable Layout State ---
    const containerRef = useRef<HTMLDivElement>(null);
    const [colWidths, setColWidths] = useState<number[]>([30, 30, 40]); // Initial percentages
    const isResizing = useRef<number | null>(null); // Index of the split being dragged
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const startResize = (index: number) => (e: React.MouseEvent) => {
        e.preventDefault();
        isResizing.current = index;
        const startX = e.clientX;
        const startWidths = [...colWidths];

        if (!containerRef.current) return;
        const containerWidth = containerRef.current.offsetWidth;

        const onMove = (moveEvent: MouseEvent) => {
            if (isResizing.current === null) return;
            const deltaX = moveEvent.clientX - startX;
            const deltaPercent = (deltaX / containerWidth) * 100;

            const newWidths = [...startWidths];
            if (index === 0) {
                // Dragging Splitter 0 (between col 0 and 1)
                const total = startWidths[0] + startWidths[1];
                const newCol0 = Math.max(15, Math.min(total - 15, startWidths[0] + deltaPercent));
                const newCol1 = total - newCol0;
                newWidths[0] = newCol0;
                newWidths[1] = newCol1;
            } else if (index === 1) {
                // Dragging Splitter 1 (between col 1 and 2)
                const total = startWidths[1] + startWidths[2];
                const newCol1 = Math.max(15, Math.min(total - 15, startWidths[1] + deltaPercent));
                const newCol2 = total - newCol1;
                newWidths[1] = newCol1;
                newWidths[2] = newCol2;
            }
            setColWidths(newWidths);
        };

        const onUp = () => {
            isResizing.current = null;
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            document.body.style.cursor = 'default';
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        document.body.style.cursor = 'col-resize';
    };

    // Load data
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [partsData, assembliesData] = await Promise.all([
                getParts(),
                getAssemblies(),
            ]);
            setParts(partsData);
            setAssemblies(assembliesData);
        } catch (err: any) {
            console.error('Failed to load factory data:', err);
            setError(err.response?.data?.error || 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const loadAssemblies = useCallback(async () => {
        try {
            const assembliesData = await getAssemblies();
            setAssemblies(assembliesData);
        } catch (err: any) {
            console.error('Failed to load assemblies:', err);
            setError(err.response?.data?.error || 'Failed to load assemblies');
        }
    }, []);

    // Handle adding part to preview
    const handleAddToPreview = (part: SystemPart) => {
        // Get default props from registry
        const schema = getPartSchema(part.code);
        const defaultProps: Record<string, any> = {};
        if (schema) {
            Object.entries(schema).forEach(([key, conf]) => {
                if (conf.defaultValue !== undefined) {
                    defaultProps[key] = conf.defaultValue;
                }
            });
        }

        // Convert SystemPart to FeaturePart for preview
        const featurePart: FeaturePart = {
            id: `temp-${Date.now()}`,
            partId: part.id,
            featureId: '',
            section: 'main',
            part: part,
            propsConfig: JSON.stringify(defaultProps),
            sortOrder: previewParts.length,
            createdAt: new Date().toISOString(),
        };

        if (!previewParts.find(p => p.partId === featurePart.partId)) {
            setPreviewParts([...previewParts, featurePart]);
        }
        setActivePanel('preview');
    };

    // Handle removing part from preview
    const handleRemoveFromPreview = (featurePartId: string) => {
        setPreviewParts(prev => prev.filter(p => p.id !== featurePartId && p.partId !== featurePartId));
        if (selectedPartId === featurePartId) {
            setSelectedPartId(null);
        }
    };

    // Handle reordering parts in preview
    const handleReorderParts = (newOrder: FeaturePart[]) => {
        setPreviewParts(newOrder.map((part, index) => ({ ...part, sortOrder: index })));
    };

    // Handle clearing all parts from preview
    const handleClearPreview = () => {
        setPreviewParts([]);
        setSelectedPartId(null);
    };

    // Handle creating new assembly (Wrapper for generic save if needed)
    const handleCreateAssembly = async (name: string, targetRole: string) => {
        try {
            const code = name.toLowerCase().replace(/\s+/g, '_') + '_v1';
            const assembly = await createAssembly({
                code,
                name,
                targetRole,
                parts: previewParts.map((part, index) => ({
                    partId: part.partId,
                    sortOrder: index,
                    propsConfig: part.propsConfig ? JSON.parse(part.propsConfig) : {},
                })),
            });
            setAssemblies([...assemblies, assembly]);
            setSelectedAssembly(assembly);
            setPreviewParts([]); // OR keep them? usually clear or load the new assembly's parts
            setActivePanel('assembly');
            toast.success('Assembly created successfully!');
        } catch (err: any) {
            console.error('Failed to create assembly:', err);
            setError(err.response?.data?.error || 'Failed to create assembly');
            toast.error('Failed to create assembly');
        }
    };

    const handleUpdatePartProps = useCallback((featurePartId: string, newProps: Record<string, any>) => {
        setPreviewParts(prev => prev.map(p => {
            if (p.id === featurePartId) {
                return { ...p, propsConfig: JSON.stringify(newProps) };
            }
            return p;
        }));
    }, []);

    // Handle approving assembly
    const handleApprove = async (assemblyId: string) => {
        try {
            const updated = await approveAssembly(assemblyId);
            setAssemblies(assemblies.map(a => a.id === assemblyId ? updated : a));
            if (selectedAssembly?.id === assemblyId) {
                setSelectedAssembly(updated);
            }
            toast.success('Assembly approved!');
        } catch (err: any) {
            console.error('Failed to approve:', err);
            toast.error(err.response?.data?.error || 'Failed to approve assembly');
        }
    };

    // Handle deploying assembly
    const handleDeploy = async (assemblyId: string) => {
        try {
            const updated = await deployAssembly(assemblyId);
            setAssemblies(assemblies.map(a => a.id === assemblyId ? updated : a));
            if (selectedAssembly?.id === assemblyId) {
                setSelectedAssembly(updated);
            }
            toast.success('Assembly deployed!');
        } catch (err: any) {
            console.error('Failed to deploy:', err);
            toast.error(err.response?.data?.error || 'Failed to deploy assembly');
        }
    };

    // Handle rollback (deployed -> approved)
    const handleRollback = async (assemblyId: string) => {
        try {
            const updated = await rollbackAssembly(assemblyId);
            setAssemblies(assemblies.map(a => a.id === assemblyId ? updated : a));
            if (selectedAssembly?.id === assemblyId) {
                setSelectedAssembly(updated);
            }
            toast.success('Assembly rolled back!');
        } catch (err: any) {
            console.error('Failed to rollback:', err);
            toast.error(err.response?.data?.error || 'Failed to rollback assembly');
        }
    };

    // Handle revert to draft (any non-deployed -> draft)
    const handleRevert = async (assemblyId: string) => {
        try {
            const updated = await revertToDraft(assemblyId);
            setAssemblies(assemblies.map(a => a.id === assemblyId ? updated : a));
            if (selectedAssembly?.id === assemblyId) {
                setSelectedAssembly(updated);
            }
            toast.success('Assembly reverted to draft!');
        } catch (err: any) {
            console.error('Failed to revert:', err);
            toast.error(err.response?.data?.error || 'Failed to revert assembly');
        }
    };

    // Handle deleting assembly - Step 1: Set pending
    const handleDeleteRequest = (assemblyId: string) => {
        console.log('[DEBUG] Delete requested for:', assemblyId);
        setPendingDeleteId(assemblyId);
        toast.info('Click Delete again to confirm, or click elsewhere to cancel', { autoClose: 3000 });
    };

    // Handle deleting assembly - Step 2: Confirm
    const handleDeleteConfirm = async () => {
        if (!pendingDeleteId) return;

        const assemblyId = pendingDeleteId;
        console.log('[DEBUG] Delete confirmed for:', assemblyId);
        setPendingDeleteId(null);

        try {
            console.log('[DEBUG] Calling deleteAssembly API...');
            await deleteAssembly(assemblyId);
            console.log('[DEBUG] Delete API succeeded!');

            setAssemblies(assemblies.filter(a => a.id !== assemblyId));
            if (selectedAssembly?.id === assemblyId) {
                setSelectedAssembly(null);
            }
            toast.success('Assembly deleted permanently');
        } catch (err: any) {
            console.error('[DEBUG] Delete failed:', err);
            console.error('[DEBUG] Error response:', err.response);
            toast.error(err.response?.data?.error || 'Failed to delete assembly');
        }
    };

    // Cancel pending delete when clicking elsewhere
    const handleCancelDelete = () => {
        if (pendingDeleteId) {
            console.log('[DEBUG] Delete cancelled');
            setPendingDeleteId(null);
        }
    };

    // Wrapper for delete - either request or confirm
    const handleDelete = (assemblyId: string) => {
        if (pendingDeleteId === assemblyId) {
            handleDeleteConfirm();
        } else {
            handleDeleteRequest(assemblyId);
        }
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-400 mx-auto mb-2" />
                    <p className="text-slate-400">Loading Factory...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <Factory className="w-12 h-12 text-red-400 mx-auto mb-2" />
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={loadData}
                        className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded text-white"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            {/* Header (Removed - handled by DashboardLayout/SuperAdminPage) */}

            {/* 3-Panel Layout */}
            <div className="flex-1 flex overflow-hidden" ref={containerRef}>
                {/* Panel 1: Parts Warehouse */}
                <div
                    className={`
                        ${activePanel === 'warehouse' ? 'flex' : 'hidden'}
                        lg:flex flex-col w-full border-r border-slate-700 bg-slate-900/30
                    `}
                    style={isDesktop ? { width: `${colWidths[0]}%` } : undefined}
                >
                    <PartsWarehouse
                        parts={parts}
                        selectedPart={selectedPart}
                        onSelectPart={setSelectedPart}
                        onAddToPreview={handleAddToPreview}
                    />
                </div>

                {/* Splitter 0 */}
                {isDesktop && (
                    <div
                        onMouseDown={startResize(0)}
                        className="w-1 bg-slate-800 hover:bg-primary-500 cursor-col-resize hover:z-50 transition-colors flex flex-col justify-center items-center flex-shrink-0"
                    >
                        <div className="h-8 w-0.5 bg-slate-600 rounded"></div>
                    </div>
                )}

                {/* Panel 2: Assembly Tree */}
                <div
                    className={`
                        ${activePanel === 'assembly' ? 'flex' : 'hidden'}
                        lg:flex flex-col w-full border-r border-slate-700 bg-slate-900/40
                    `}
                    style={isDesktop ? { width: `${colWidths[1]}%` } : undefined}
                >
                    <AssemblyTree
                        assemblies={assemblies}
                        selectedAssembly={selectedAssembly}
                        onSelectAssembly={setSelectedAssembly}
                        onApprove={handleApprove}
                        onDeploy={handleDeploy}
                        onRollback={handleRollback}
                        onRevert={handleRevert}
                        onDelete={handleDelete}
                        pendingDeleteId={pendingDeleteId}
                    />
                </div>

                {/* Splitter 1 */}
                {isDesktop && (
                    <div
                        onMouseDown={startResize(1)}
                        className="w-1 bg-slate-800 hover:bg-primary-500 cursor-col-resize hover:z-50 transition-colors flex flex-col justify-center items-center flex-shrink-0"
                    >
                        <div className="h-8 w-0.5 bg-slate-600 rounded"></div>
                    </div>
                )}

                {/* Panel 3: Live Preview */}
                <div
                    className={`
                        ${activePanel === 'preview' ? 'flex' : 'hidden'}
                        lg:flex flex-col w-full bg-slate-900/50
                    `}
                    style={isDesktop ? { width: `${colWidths[2]}%` } : undefined}
                >
                    <LivePreview
                        parts={previewParts}
                        assembly={selectedAssembly}
                        onRemovePart={handleRemoveFromPreview}
                        onReorderParts={handleReorderParts}
                        onCreateAssembly={handleCreateAssembly}
                        onClearPreview={handleClearPreview}
                        selectedPartId={selectedPartId}
                        onSelectPart={setSelectedPartId}
                        onUpdatePartProps={handleUpdatePartProps}
                    />
                </div>
            </div>
        </div>
    );
};

export default SystemModulesFactoryPage;
