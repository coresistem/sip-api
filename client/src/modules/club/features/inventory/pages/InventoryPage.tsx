import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Wrench, Search, Filter, ArrowRightCircle, LogIn, Trash2, Edit2, Settings } from 'lucide-react';
import { inventoryApi, Asset, InventoryStats, CreateAssetDTO, UpdateAssetDTO, AssetCategory } from '../../../../core/lib/api/inventory.api';
import InventoryForm from '../components/InventoryForm';
import CheckOutModal from '../components/CheckOutModal';
import CategoryManager from '../components/CategoryManager';
import { toast } from 'react-toastify';

export default function InventoryPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [categories, setCategories] = useState<AssetCategory[]>([]); // Dynamic Categories
    const [stats, setStats] = useState<InventoryStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [checkOutAsset, setCheckOutAsset] = useState<Asset | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [assetsData, statsData, categoriesData] = await Promise.all([
                inventoryApi.getInventory({
                    search,
                    status: filterStatus || undefined,
                    category: filterCategory || undefined
                }),
                inventoryApi.getStats(),
                inventoryApi.getCategories()
            ]);
            setAssets(assetsData.data);
            setStats(statsData.data);
            setCategories(categoriesData.data);
        } catch (error) {
            console.error('Failed to load inventory:', error);
            // toast.error('Failed to load inventory data'); 
            // Suppress toast on load failure to avoid spam if backend is momentarily down, log usage
        } finally {
            setIsLoading(false);
        }
    };

    const loadCategoriesOnly = async () => {
        try {
            const res = await inventoryApi.getCategories();
            setCategories(res.data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        loadData();
    }, [search, filterStatus, filterCategory]);

    const handleCreate = async (data: CreateAssetDTO) => {
        setIsSubmitting(true);
        try {
            await inventoryApi.createAsset(data);
            toast.success('Asset created successfully');
            setShowAddModal(false);
            loadData();
        } catch (error) {
            toast.error('Failed to create asset');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (data: CreateAssetDTO) => {
        if (!editingAsset) return;
        setIsSubmitting(true);
        try {
            await inventoryApi.updateAsset(editingAsset.id, data);
            toast.success('Asset updated successfully');
            setEditingAsset(null);
            loadData();
        } catch (error) {
            toast.error('Failed to update asset');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this asset?')) return;
        try {
            await inventoryApi.deleteAsset(id);
            toast.success('Asset deleted');
            loadData();
        } catch (error) {
            toast.error('Failed to delete asset');
        }
    };

    const handleCheckOut = async (id: string, data: UpdateAssetDTO) => {
        setIsSubmitting(true);
        try {
            await inventoryApi.updateAsset(id, data);
            toast.success('Asset checked out successfully');
            setCheckOutAsset(null);
            loadData();
        } catch (error) {
            toast.error('Failed to check out asset');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCheckIn = async (asset: Asset) => {
        if (!window.confirm(`Check in ${asset.itemName}? This will mark it as AVAILABLE.`)) return;
        try {
            await inventoryApi.updateAsset(asset.id, {
                status: 'AVAILABLE',
                assignedTo: null,
                storageLocation: 'Storage',
                notes: asset.notes ? `${asset.notes}\n[Check In]: Returned` : undefined
            });
            toast.success('Asset returned successfully');
            loadData();
        } catch (error) {
            toast.error('Failed to return asset');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold">Inventory</h1>
                    <p className="text-dark-400">Track club equipment and assets</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowCategoryManager(true)}
                        className="btn btn-ghost border border-dark-600"
                    >
                        <Settings size={18} />
                        <span className="hidden md:inline">Categories</span>
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn btn-primary"
                    >
                        <Plus size={18} />
                        <span className="hidden md:inline">Add Asset</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
                        <p className="text-dark-400 text-sm">Total Assets</p>
                        <p className="text-3xl font-display font-bold text-white mt-1">
                            {stats.byStatus.reduce((acc, curr) => acc + curr._count, 0)}
                        </p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
                        <p className="text-dark-400 text-sm">In Use / Checked Out</p>
                        <p className="text-3xl font-display font-bold text-emerald-400 mt-1">
                            {stats.byStatus.find(s => s.status === 'IN_USE')?._count || 0}
                        </p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
                        <p className="text-dark-400 text-sm">Needs Maintenance</p>
                        <p className="text-3xl font-display font-bold text-amber-400 mt-1">
                            {stats.needsMaintenance}
                        </p>
                    </motion.div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input w-full pl-10"
                    />
                </div>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="input w-full md:w-48"
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="input w-full md:w-48"
                >
                    <option value="">All Statuses</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="IN_USE">In Use</option>
                    <option value="MAINTENANCE">Maintenance</option>
                </select>
            </div>

            {/* Asset List - Desktop Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="hidden md:block card"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-dark-400 text-sm border-b border-dark-700">
                                <th className="pb-3 pl-4">Item</th>
                                <th className="pb-3">Qty</th>
                                <th className="pb-3">Category</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3">Location / Assignee</th>
                                <th className="pb-3">Condition</th>
                                <th className="pb-3 text-right pr-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-dark-400">Loading inventory...</td>
                                </tr>
                            ) : assets.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-dark-400">No assets found</td>
                                </tr>
                            ) : (
                                assets.map((asset) => (
                                    <tr key={asset.id} className="border-b border-dark-800 hover:bg-dark-800/50">
                                        <td className="py-3 pl-4">
                                            <div>
                                                <p className="font-medium text-white">{asset.itemName}</p>
                                                <p className="text-xs text-dark-400">
                                                    {[asset.brand, asset.model].filter(Boolean).join(' - ')}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="py-3 font-medium text-white">{asset.quantity || 1}</td>
                                        <td className="py-3 text-dark-400">{asset.category}</td>
                                        <td className="py-3">
                                            <span className={`badge ${asset.status === 'AVAILABLE' ? 'badge-success' :
                                                asset.status === 'IN_USE' ? 'badge-primary' :
                                                    asset.status === 'MAINTENANCE' ? 'badge-warning' : 'badge-error'
                                                }`}>
                                                {asset.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-3 text-sm">
                                            {asset.status === 'IN_USE' ? (
                                                <div>
                                                    <p className="text-white">{asset.assignedTo}</p>
                                                    <p className="text-xs text-dark-400">{asset.storageLocation}</p>
                                                </div>
                                            ) : (
                                                <span className="text-dark-400">{asset.storageLocation || '-'}</span>
                                            )}
                                        </td>
                                        <td className="py-3 text-dark-400">{asset.condition}</td>
                                        <td className="py-3 text-right pr-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {asset.status === 'AVAILABLE' && (
                                                    <button
                                                        onClick={() => setCheckOutAsset(asset)}
                                                        className="p-1.5 text-emerald-400 hover:bg-dark-700 rounded-lg tooltip tooltip-left"
                                                        data-tip="Check Out"
                                                    >
                                                        <ArrowRightCircle size={16} />
                                                    </button>
                                                )}
                                                {asset.status === 'IN_USE' && (
                                                    <button
                                                        onClick={() => handleCheckIn(asset)}
                                                        className="p-1.5 text-amber-400 hover:bg-dark-700 rounded-lg tooltip tooltip-left"
                                                        data-tip="Check In"
                                                    >
                                                        <LogIn size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setEditingAsset(asset)}
                                                    className="p-1.5 text-primary-400 hover:bg-dark-700 rounded-lg"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(asset.id)}
                                                    className="p-1.5 text-red-400 hover:bg-dark-700 rounded-lg"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Asset List - Mobile Cards */}
            <div className="md:hidden space-y-4">
                {isLoading ? (
                    <p className="text-center text-dark-400 py-8">Loading inventory...</p>
                ) : assets.length === 0 ? (
                    <p className="text-center text-dark-400 py-8">No assets found</p>
                ) : (
                    assets.map((asset) => (
                        <motion.div
                            key={asset.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="card p-4 space-y-3"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-white text-lg">{asset.itemName}</h3>
                                    <p className="text-dark-400 text-sm">
                                        {[asset.brand, asset.model].filter(Boolean).join(' - ')}
                                    </p>
                                </div>
                                <span className={`badge ${asset.status === 'AVAILABLE' ? 'badge-success' :
                                    asset.status === 'IN_USE' ? 'badge-primary' :
                                        asset.status === 'MAINTENANCE' ? 'badge-warning' : 'badge-error'
                                    }`}>
                                    {asset.status.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <p className="text-dark-500 text-xs">Category</p>
                                    <p className="text-white">{asset.category}</p>
                                </div>
                                <div>
                                    <p className="text-dark-500 text-xs">Quantity</p>
                                    <p className="text-white">{asset.quantity || 1}</p>
                                </div>
                                <div>
                                    <p className="text-dark-500 text-xs">Location</p>
                                    <p className="text-white truncate">
                                        {asset.status === 'IN_USE' ? asset.storageLocation : (asset.storageLocation || 'Storage')}
                                    </p>
                                </div>
                                {asset.status === 'IN_USE' && (
                                    <div>
                                        <p className="text-dark-500 text-xs">Assigned To</p>
                                        <p className="text-white truncate">{asset.assignedTo}</p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-3 border-t border-dark-700 flex justify-end gap-2">
                                {asset.status === 'AVAILABLE' && (
                                    <button
                                        onClick={() => setCheckOutAsset(asset)}
                                        className="btn btn-ghost text-emerald-400 text-sm py-1 px-3 border border-emerald-400/20 hover:bg-emerald-400/10"
                                    >
                                        <ArrowRightCircle size={16} className="mr-1" /> Check Out
                                    </button>
                                )}
                                {asset.status === 'IN_USE' && (
                                    <button
                                        onClick={() => handleCheckIn(asset)}
                                        className="btn btn-ghost text-amber-400 text-sm py-1 px-3 border border-amber-400/20 hover:bg-amber-400/10"
                                    >
                                        <LogIn size={16} className="mr-1" /> Check In
                                    </button>
                                )}
                                <button
                                    onClick={() => setEditingAsset(asset)}
                                    className="p-2 text-primary-400 bg-dark-800 rounded-lg"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(asset.id)}
                                    className="p-2 text-red-400 bg-dark-800 rounded-lg"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Modals */}
            {showCategoryManager && (
                <CategoryManager
                    onClose={() => {
                        setShowCategoryManager(false);
                        loadCategoriesOnly(); // Refresh categories when closed
                    }}
                />
            )}

            {showAddModal && (
                <InventoryForm
                    categories={categories}
                    onSubmit={handleCreate}
                    onCancel={() => setShowAddModal(false)}
                    isLoading={isSubmitting}
                />
            )}

            {editingAsset && (
                <InventoryForm
                    initialData={editingAsset}
                    categories={categories}
                    onSubmit={handleUpdate}
                    onCancel={() => setEditingAsset(null)}
                    isLoading={isSubmitting}
                />
            )}

            {checkOutAsset && (
                <CheckOutModal
                    asset={checkOutAsset}
                    onConfirm={handleCheckOut}
                    onCancel={() => setCheckOutAsset(null)}
                    isLoading={isSubmitting}
                />
            )}
        </div>
    );
}
