import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, ShoppingBag, Shield, ChevronDown, Menu, ArrowLeft, ShoppingCart
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../core/contexts/AuthContext';
import { useCart } from '../../core/contexts/CartContext';
import { catalogApi, Product } from '../api/catalog.api';
import AnimatedHexLogo from '../../core/components/ui/AnimatedHexLogo';

// Categories for filter
const CATEGORIES = ['All', 'Equipment', 'Bows', 'Arrows', 'Apparel', 'Accessories', 'Training'];

// Initial Banners
const BANNERS = [
    {
        id: '1',
        title: 'Elite Series 2024',
        subtitle: 'Unleash your potential with our latest tournament gear.',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&auto=format&fit=crop&q=80',
        color: 'from-amber-500/20 to-amber-700/20'
    },
    {
        id: '2',
        title: 'New Season Prep',
        subtitle: 'Get 20% off on all training apparel this week.',
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&auto=format&fit=crop&q=80',
        color: 'from-blue-500/20 to-blue-700/20'
    }
];

export default function CatalogPage() {
    const { items: cartItems, addItem } = useCart();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [showExclusiveOnly, setShowExclusiveOnly] = useState(false);
    const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const activeCategory = searchParams.get('category') || 'All';

    // Fetch Products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await catalogApi.listProducts({ active: true });
                if (response.success) {
                    setProducts(response.data);
                }
            } catch (error) {
                console.error('Fetch products error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Filter Logic
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            // Map backend categories if needed, for now assume direct match
            const matchesCategory = activeCategory === 'All' || p.category === activeCategory;

            // Visibility Logic
            let isVisible = true;
            if (p.visibility === 'HIDDEN') isVisible = false;
            // Add more complex visibility logic here matching backend (CLUBS_ONLY etc) if needed on frontend
            // Backend usually filters sensitive stuff, but we can double check

            const matchesExclusive = !showExclusiveOnly || p.isExclusive;

            return matchesSearch && matchesCategory && isVisible && matchesExclusive;
        });
    }, [products, searchTerm, activeCategory, showExclusiveOnly]);

    const setActiveCategory = (category: string) => {
        const newSearchParams = new URLSearchParams(searchParams);
        if (category === 'All') {
            newSearchParams.delete('category');
        } else {
            newSearchParams.set('category', category);
        }
        setSearchParams(newSearchParams);
        setCategoryMenuOpen(false);
    };

    return (
        <div className="h-screen bg-dark-950/50 pb-20 overflow-y-auto overflow-x-hidden scroll-smooth">
            {/* Navbar */}
            <div className="fixed top-0 left-0 right-0 z-[50] w-full flex flex-col transition-all duration-300">
                <div className="w-full bg-dark-950/80 backdrop-blur-xl border-b border-white/10">
                    <div className="w-full h-14 border-b border-white/10 shadow-lg backdrop-blur-2xl flex justify-center">
                        <div className="w-full max-w-7xl px-4 md:px-6 flex items-center justify-between gap-4">
                            {/* Brand */}
                            <div className="flex items-center gap-6 shrink-0">
                                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                                    <AnimatedHexLogo size={28} />
                                    <span className="font-display font-black text-lg hidden md:inline tracking-tight text-white group-hover:text-amber-400 transition-colors">
                                        Csystem <span className="text-amber-400">Market</span>
                                    </span>
                                </div>

                                {/* Category Dropdown */}
                                <div className="relative hidden md:block">
                                    <button
                                        onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all border ${categoryMenuOpen
                                            ? 'bg-amber-500 text-white border-amber-400'
                                            : 'bg-white/5 text-dark-200 hover:text-white border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        <Menu size={16} />
                                        <span className="text-xs font-bold">Categories</span>
                                        <ChevronDown size={12} />
                                    </button>
                                    <AnimatePresence>
                                        {categoryMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute left-0 mt-2 w-48 bg-dark-900 border border-white/10 rounded-xl shadow-xl z-50 p-2"
                                            >
                                                {CATEGORIES.map(cat => (
                                                    <button
                                                        key={cat}
                                                        onClick={() => setActiveCategory(cat)}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm ${activeCategory === cat ? 'bg-primary-500/20 text-primary-400' : 'text-dark-400 hover:bg-white/5 hover:text-white'
                                                            }`}
                                                    >
                                                        {cat}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="flex-1 max-w-xl hidden md:flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-1.5 text-sm focus:border-amber-500/50 outline-none text-white placeholder-dark-500"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                <button
                                    // Mobile search not implemented yet
                                    // onClick={() => setMobileSearchOpen(true)}
                                    className="md:hidden p-2 text-dark-400 hover:text-white"
                                >
                                    <Search size={20} />
                                </button>

                                <button
                                    onClick={() => navigate('/commerce/cart')}
                                    className="relative p-2 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-colors"
                                >
                                    <ShoppingCart size={20} />
                                    {cartItems.length > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                                            {cartItems.length}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spacer */}
            <div className="h-20" />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 mt-6">
                {/* Hero Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative h-48 md:h-64 rounded-3xl overflow-hidden mb-12 border border-white/5 shadow-2xl"
                >
                    <img
                        src={BANNERS[0].image}
                        alt="Hero"
                        className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-r ${BANNERS[0].color} mix-blend-multiply opacity-60`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 p-8">
                        <span className="bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full mb-2 inline-block">FEATURED</span>
                        <h1 className="text-3xl md:text-5xl font-bold text-white">{BANNERS[0].title}</h1>
                        <p className="text-dark-300 mt-2 max-w-md">{BANNERS[0].subtitle}</p>
                    </div>
                </motion.div>

                {/* Filters Row */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShoppingBag className="text-primary-400" size={20} />
                        {activeCategory === 'All' ? 'All Products' : activeCategory}
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowExclusiveOnly(!showExclusiveOnly)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${showExclusiveOnly ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-dark-800 border-white/5 text-dark-400 hover:text-white'
                                }`}
                        >
                            <Shield size={14} />
                            <span>Exclusive</span>
                        </button>
                    </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-[4/5] bg-dark-800 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {filteredProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onClick={() => setSelectedProduct(product)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-dark-500" size={32} />
                        </div>
                        <h3 className="text-white font-medium">No products found</h3>
                        <p className="text-dark-400 text-sm mt-1">Try changing your filters</p>
                    </div>
                )}
            </div>

            {/* Product Detail Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <ProductDetailModal
                        product={selectedProduct}
                        onClose={() => setSelectedProduct(null)}
                        onAddToCart={(qty, size) => {
                            addItem(selectedProduct.id, qty, size); // Add logic to handle variants properly later
                            setSelectedProduct(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Sub-components located in same file for now to speed up migration, can split later

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onClick}
            className="group bg-dark-900 border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-amber-500/30 transition-all hover:shadow-lg hover:-translate-y-1"
        >
            <div className="aspect-[4/5] relative overflow-hidden bg-dark-800">
                {product.designUrl ? (
                    <img
                        src={product.designUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-dark-600">
                        <ShoppingBag size={48} />
                    </div>
                )}
                {/* Overlays */}
                {product.isExclusive && (
                    <div className="absolute top-2 left-2 bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Shield size={10} /> EXCLUSIVE
                    </div>
                )}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                        <ShoppingBag size={14} />
                    </button>
                </div>
            </div>
            <div className="p-4">
                <p className="text-xs text-dark-400 font-bold uppercase tracking-wider mb-1">{product.category}</p>
                <h3 className="text-white font-bold text-sm line-clamp-1 mb-2">{product.name}</h3>
                <p className="text-amber-400 font-black">
                    <span className="text-xs text-amber-400/60 font-medium mr-0.5">Rp</span>
                    {product.basePrice.toLocaleString()}
                </p>
            </div>
        </motion.div>
    );
}

function ProductDetailModal({ product, onClose, onAddToCart }: {
    product: Product;
    onClose: () => void;
    onAddToCart: (qty: number, size: string) => void;
}) {
    const [size, setSize] = useState('M');

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="relative w-full max-w-md bg-dark-900 border-l border-white/5 h-full shadow-2xl flex flex-col"
            >
                <div className="flex-1 overflow-y-auto">
                    <div className="aspect-square bg-dark-800 relative">
                        {product.designUrl && <img src={product.designUrl} className="w-full h-full object-cover" />}
                        <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-black/50 rounded-full text-white backdrop-blur-md">
                            <ArrowLeft size={20} />
                        </button>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">{product.name}</h2>
                            <p className="text-2xl font-black text-amber-400">Rp {product.basePrice.toLocaleString()}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-dark-300 mb-3 uppercase">Select Size</h3>
                            <div className="flex gap-2">
                                {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setSize(s)}
                                        className={`w-10 h-10 rounded-lg font-bold text-sm border transition-colors ${size === s ? 'bg-amber-500 border-amber-500 text-black' : 'border-white/10 text-dark-400 hover:border-white/30'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-dark-300 mb-2 uppercase">Description</h3>
                            <p className="text-dark-400 text-sm leading-relaxed">{product.description || 'No description available.'}</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-white/5 bg-dark-900">
                    <button
                        onClick={() => onAddToCart(1, size)}
                        className="w-full py-4 bg-amber-500 rounded-xl text-black font-bold text-lg hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
                    >
                        <ShoppingBag size={20} />
                        Add to Cart - Rp {product.basePrice.toLocaleString()}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

