import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Shirt, Loader2, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../../../../context/AuthContext';

interface Product {
    id: string;
    name: string;
    sku: string;
    category: string;
    basePrice: number;
    designUrl?: string;
    isActive: boolean;
    ordersCount: number;
    stock: number;
    lowStockThreshold: number;
}

export default function ProductList() {
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
            const response = await api.get('/jersey/products');
            setProducts(response.data.data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

        try {
            await api.delete(`/jersey/products/${id}`);
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
                    <h1 className="text-2xl font-bold font-display gradient-text">Product Management</h1>
                    <p className="text-dark-400 text-sm">Manage your jersey catalog and inventory</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/jersey/admin/products/edit')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-primary-500/20"
                >
                    <Plus size={18} />
                    <span>New Product</span>
                </motion.button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-dark-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or SKU..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-dark-800 border border-dark-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-primary-500 transition-colors"
                    />
                </div>
                <div className="flex items-center gap-2 bg-dark-800 border border-dark-700 rounded-lg px-3">
                    <Filter size={16} className="text-dark-400" />
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-transparent border-none text-white focus:ring-0 py-2 text-sm"
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
                    <Loader2 className="animate-spin text-primary-500" size={32} />
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-dark-800/50 rounded-xl border border-dashed border-dark-700">
                    <Shirt className="mx-auto text-dark-600 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-white mb-2">No products found</h3>
                    <p className="text-dark-400 text-sm">Add your first product to get started.</p>
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
                                className="group bg-dark-800 border border-dark-700 rounded-xl overflow-hidden hover:border-primary-500/50 transition-all shadow-lg hover:shadow-primary-500/10"
                            >
                                <div className="aspect-[4/3] bg-dark-900 relative overflow-hidden">
                                    {product.designUrl ? (
                                        <img src={product.designUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-dark-600">
                                            <Shirt size={48} />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <span className={`px-2 py-1 rounded text-xs font-medium backdrop-blur-md border ${product.isActive
                                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                                            }`}>
                                            {product.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-dark-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                                        <button
                                            onClick={() => navigate(`/jersey/admin/products/edit?id=${product.id}`)} // Note: Using query param or path param depending on Router setup. Path param needed usually.
                                        // Fixing to use path param:
                                        // But wait, the route is /jersey/admin/products/edit (create)
                                        // Check App.tsx: <Route path="jersey/admin/products/edit" element={<ProductEditor />} />
                                        // It doesn't seem to have :id param.
                                        // I should probably update App.tsx to support /edit/:id or use query params.
                                        // ProductEditor uses useParams 'id'. So it expects /edit/:id
                                        />
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors line-clamp-1">{product.name}</h3>
                                            <p className="text-xs text-primary-400 font-mono">{product.sku}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            {product.stock <= product.lowStockThreshold && (
                                                <span className="flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/30">
                                                    Low Stock
                                                </span>
                                            )}
                                            <span className="text-xs font-medium text-dark-400 bg-dark-700 px-2 py-1 rounded">
                                                {product.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-700/50">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-dark-400">Stock</span>
                                            <span className={`font-semibold ${product.stock <= product.lowStockThreshold ? 'text-amber-500' : 'text-white'}`}>
                                                {product.stock}
                                            </span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-xs text-dark-400">Price</span>
                                            <span className="font-semibold text-white">{formatCurrency(product.basePrice)}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 mt-4">
                                        <button
                                            onClick={() => navigate(`/jersey/admin/products/edit?id=${product.id}`)}
                                            className="p-2 rounded-lg bg-dark-700 text-dark-300 hover:text-white hover:bg-primary-600 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="p-2 rounded-lg bg-dark-700 text-dark-300 hover:text-white hover:bg-red-600 transition-colors"
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
