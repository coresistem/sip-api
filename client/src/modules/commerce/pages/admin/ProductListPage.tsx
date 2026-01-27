import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Shirt, Loader2, Filter, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { catalogApi, Product } from '../../api/catalog.api';

// Extend Product if necessary for frontend specific props, but keeping it simple for now
// The migrated Product type from api might differ slightly from legacy, need to align.

export default function ProductListPage() {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('ALL');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const response = await catalogApi.listProducts(); // Fetch all via Supplier scope
            // Assuming response is Product[], update if it's wrapped
            if (response && response.data) {
                setProducts(response.data);
            } else if (Array.isArray(response)) {
                setProducts(response);
            } else if (response && Array.isArray((response as any).data)) {
                setProducts((response as any).data);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

        try {
            await catalogApi.deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error('Failed to delete product:', error);
            alert('Failed to delete product');
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'ALL' || product.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    return (
        <div className="max-w-7xl mx-auto p-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-display font-black text-white">Product Management</h1>
                    <p className="text-slate-400 text-sm">Manage your jersey catalog and inventory</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/jersey/admin/products/new')} // Updated route for new product
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-bold transition-colors shadow-lg shadow-amber-500/20"
                >
                    <Plus size={18} />
                    <span>New Product</span>
                </motion.button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or SKU..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-amber-500 transition-colors"
                    />
                </div>
                <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3">
                    <Filter size={16} className="text-slate-400" />
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-transparent border-none text-white focus:ring-0 py-2 text-sm outline-none"
                    >
                        <option value="ALL">All Categories</option>
                        <option value="Jersey">Jersey</option>
                        <option value="Pants">Pants</option>
                        <option value="Jacket">Jacket</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-amber-500" size={32} />
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                    <Shirt className="mx-auto text-slate-600 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-white mb-2">No products found</h3>
                    <p className="text-slate-400 text-sm">Add your first product to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredProducts.map(product => (
                            <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all shadow-lg hover:shadow-amber-500/10 backdrop-blur-sm"
                            >
                                <div className="aspect-[4/3] bg-slate-900 relative overflow-hidden">
                                    {product.designUrl ? (
                                        <img src={product.designUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                                            <Package size={48} />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 flex gap-2 z-10">
                                        <span className={`px-2 py-1 rounded text-xs font-bold backdrop-blur-md border ${product.isActive
                                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                                            }`}>
                                            {product.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="absolute top-3 left-3 flex gap-2 z-10">
                                        {/* Assuming product has stock - check type definition, might need optional chaining if not guaranteed */}
                                        {/* Since I didn't include stock in my api interface manually but backend sends it, I should update interface or cast. Cast for speed now. */}
                                        {(product as any).stock <= ((product as any).lowStockThreshold || 5) && (
                                            <span className="flex items-center gap-1 text-[10px] bg-amber-500/90 text-black font-bold px-2 py-0.5 rounded shadow-lg">
                                                Low Stock
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">{product.name}</h3>
                                            <p className="text-xs text-slate-400 font-mono">{product.sku}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-xs font-bold text-slate-400 bg-slate-700 px-2 py-1 rounded uppercase tracking-wider">
                                                {product.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-400">Stock</span>
                                            {/* Casting again for stock - need to update Type Definition properly later */}
                                            <span className={`font-bold ${(product as any).stock <= 5 ? 'text-amber-500' : 'text-white'}`}>
                                                {(product as any).stock || 0}
                                            </span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-xs text-slate-400">Price</span>
                                            <span className="font-bold text-white">{formatCurrency(product.basePrice)}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 mt-4 pt-2">
                                        <button
                                            onClick={() => navigate(`/jersey/admin/products/edit/${product.id}`)}
                                            className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:text-white hover:bg-red-600 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
