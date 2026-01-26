import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, ShoppingBag, Star, Shield, ChevronRight, Tag, Info,
    Store, ShoppingCart, History, Package, CheckCircle, Truck, LayoutDashboard, ChevronDown, Menu, ArrowLeft, X, Target
} from 'lucide-react';
import { useSearchParams, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import marketplaceService, { Product } from '../services/marketplaceService';
import HexLogoFrame from '../components/ui/HexLogoFrame';

const CATEGORIES = ['All', 'Equipment', 'Bows', 'Arrows', 'Apparel', 'Accessories', 'Training'];

const BANNERS = [
    {
        id: '1',
        title: 'Elite Series 2024',
        subtitle: 'Unleash your potential with our latest tournament gear.',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&auto=format&fit=crop&q=80',
        color: 'from-amber-500/20 to-amber-700/20'
    }
];

const QUICK_LINKS = [
    { id: '1', label: 'Flash Sale', icon: Tag, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { id: '2', label: 'Top Rated', icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { id: '3', label: 'Csystem Mall', icon: ShoppingBag, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { id: '4', label: 'New Arrivals', icon: Package, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: '5', label: 'Training Prep', icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10' },
];

export default function MarketplacePage() {
    const { user } = useAuth();
    const { items: cartItems, addItem, removeItem, updateQuantity, itemCount, totalAmount } = useCart();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [showExclusiveOnly, setShowExclusiveOnly] = useState(false);
    const [ordersMenuOpen, setOrdersMenuOpen] = useState(false);
    const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [cartOpen, setCartOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [activeView, setActiveView] = useState<'catalog' | 'orders'>('catalog');
    const activeCategory = searchParams.get('category') || 'All';

    // Fetch live products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await marketplaceService.listProducts();
                if (response.success) {
                    setProducts(response.data);
                }
            } catch (error) {
                console.error('Fetch products error:', error);
                // Fallback mock data if API fails
                setProducts([
                    {
                        id: '1',
                        name: 'Premium Recurve Bow',
                        description: 'Professional grade recurve bow for advanced archers.',
                        price: 12500000,
                        image: 'https://images.unsplash.com/photo-1511084901824-1c57f5a16c98?auto=format&fit=crop&q=80&w=800',
                        category: 'Equipment',
                        stock: 5,
                        rating: 4.9,
                        isExclusive: true
                    },
                    {
                        id: '2',
                        name: 'Carbon Arrows (Set of 12)',
                        description: 'High-precision carbon arrows for consistent grouping.',
                        price: 2400000,
                        image: 'https://images.unsplash.com/photo-1600192321070-dd391183204b?auto=format&fit=crop&q=80&w=800',
                        category: 'Arrows',
                        stock: 20,
                        rating: 4.7,
                        isExclusive: false
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

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

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
            const isVisible = !p.isExclusive || !!user?.clubId;

            // Filter by "Exclusive" toggle
            const matchesExclusive = !showExclusiveOnly || p.isExclusive;

            return matchesSearch && matchesCategory && isVisible && matchesExclusive;
        });
    }, [products, searchTerm, activeCategory, user?.clubId, showExclusiveOnly]);

    return (
        <div className="min-h-screen bg-transparent text-white overflow-y-auto overflow-x-hidden scroll-smooth selection:bg-amber-500 selection:text-black scrollbar-hide">
            {/* Unified Pro Header Overlay */}
            <div className="fixed top-0 left-0 right-0 z-[100] w-full flex flex-col transition-all duration-300">
                <div className="w-full bg-dark-950/60 backdrop-blur-3xl border-b border-white/5 shadow-2xl">
                    <div className="w-full h-16 flex items-center justify-center">
                        <div className="w-full max-w-7xl px-6 flex items-center justify-between gap-4">
                            {/* Left: Branding & Categories */}
                            <div className="flex items-center gap-6 shrink-0">
                                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/dashboard')}>
                                    <HexLogoFrame size={32} />
                                    <span className="font-display font-black text-xl hidden md:inline tracking-tight text-white group-hover:text-amber-400 transition-colors">
                                        Csystem <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-200">Market</span>
                                    </span>
                                </div>

                                <div className="h-6 w-px bg-white/10 hidden md:block" />

                                <div className="relative">
                                    <button
                                        onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all border ${categoryMenuOpen
                                            ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)]'
                                            : 'bg-white/5 text-dark-200 hover:text-white border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        <Menu size={18} />
                                        <span className="text-xs font-bold hidden lg:inline">Categories</span>
                                        <ChevronDown size={14} className={`transition-transform duration-300 ${categoryMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {categoryMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                className="absolute left-0 mt-3 w-56 bg-dark-900/90 backdrop-blur-2xl p-2 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden"
                                            >
                                                {CATEGORIES.map(cat => (
                                                    <button
                                                        key={cat}
                                                        onClick={() => setActiveCategory(cat)}
                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${activeCategory === cat
                                                            ? 'bg-amber-500/20 text-amber-400'
                                                            : 'text-dark-400 hover:text-white hover:bg-white/5'
                                                            }`}
                                                    >
                                                        <span className="text-sm font-medium">{cat}</span>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Center: Search */}
                            <div className="flex-1 max-w-2xl hidden md:flex items-center gap-2">
                                <div className="relative flex-1 group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within:text-amber-400 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search for bows, arrows, or gear..."
                                        className="w-full pl-12 pr-4 h-10 bg-white/5 border border-white/10 focus:bg-white/10 focus:border-amber-500/30 focus:outline-none rounded-xl text-sm transition-all"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Right Actions */}
                            <div className="flex items-center gap-3 shrink-0">
                                <button
                                    onClick={() => setMobileSearchOpen(true)}
                                    className="md:hidden p-2 text-dark-400 hover:text-white transition-colors"
                                >
                                    <Search size={22} />
                                </button>

                                <button
                                    onClick={() => setCartOpen(true)}
                                    className="relative p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-black transition-all group shadow-lg"
                                >
                                    <ShoppingCart size={20} />
                                    {itemCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-[10px] font-black text-white flex items-center justify-center border-2 border-dark-950">
                                            {itemCount}
                                        </span>
                                    )}
                                </button>

                                <div className="relative">
                                    <button
                                        onClick={() => setOrdersMenuOpen(!ordersMenuOpen)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-bold border ${ordersMenuOpen || activeView === 'orders'
                                            ? 'bg-primary-500/20 text-primary-400 border-primary-500/30'
                                            : 'bg-white/5 text-dark-200 border-white/10 hover:text-white'
                                            }`}
                                    >
                                        <History size={18} />
                                        <span className="hidden lg:inline">Activity</span>
                                        <ChevronDown size={14} className={`transition-transform duration-300 ${ordersMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {ordersMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute right-0 mt-3 w-56 bg-dark-900/95 backdrop-blur-2xl p-2 rounded-2xl border border-white/10 shadow-2xl z-50"
                                            >
                                                <button
                                                    onClick={() => {
                                                        setActiveView('orders');
                                                        setOrdersMenuOpen(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                                                >
                                                    <History size={18} className="text-primary-400" />
                                                    <div className="text-left">
                                                        <p className="text-sm font-medium group-hover:text-primary-400 transition-colors">My Orders</p>
                                                        <p className="text-[10px] text-dark-500">Track purchase history</p>
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={() => navigate('/dashboard')}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                                                >
                                                    <LayoutDashboard size={18} className="text-emerald-400" />
                                                    <div className="text-left">
                                                        <p className="text-sm font-medium group-hover:text-emerald-400 transition-colors">Dashboard</p>
                                                        <p className="text-[10px] text-dark-500">Back to main system</p>
                                                    </div>
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary Interaction Strip */}
                {activeView === 'catalog' && (
                    <div className="relative w-full overflow-hidden bg-dark-950/40 backdrop-blur-2xl border-b border-white/5 py-2">
                        <div className="max-w-7xl mx-auto px-6 flex items-center gap-3 overflow-x-auto scrollbar-hide scroll-smooth">
                            {QUICK_LINKS.map(link => (
                                <button
                                    key={link.id}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all shrink-0 group"
                                >
                                    <div className={`w-8 h-8 rounded-lg ${link.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                        <link.icon className={link.color} size={16} />
                                    </div>
                                    <span className="text-xs font-bold text-dark-200 group-hover:text-white transition-colors whitespace-nowrap">
                                        {link.label}
                                    </span>
                                </button>
                            ))}
                            <div className="ml-auto">
                                <button
                                    onClick={() => setShowExclusiveOnly(!showExclusiveOnly)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all border shrink-0 ${showExclusiveOnly
                                        ? 'bg-amber-500 text-black border-amber-400'
                                        : 'bg-white/5 text-dark-200 border-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    <Shield size={16} className={showExclusiveOnly ? 'text-black' : 'text-amber-400'} />
                                    <span className="text-xs font-bold whitespace-nowrap uppercase">Exclusive</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Removed Spacer to allow Hero to bleed into Header area */}

            {/* Mobile Search Overlay */}
            <AnimatePresence>
                {mobileSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-x-0 top-0 h-16 bg-dark-900 border-b border-amber-500/20 z-[150] flex items-center gap-4 px-6"
                    >
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" size={18} />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search products..."
                                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-amber-500/50 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button onClick={() => setMobileSearchOpen(false)} className="p-2 text-dark-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {activeView === 'catalog' && !searchTerm && activeCategory === 'All' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative h-[70vh] md:h-[90vh] w-full overflow-hidden bg-dark-950"
                >
                    <img src={BANNERS[0].image} alt="Hero" className="w-full h-full object-cover object-[center_30%] transition-transform duration-1000 group-hover:scale-105 opacity-80" />
                    {/* Top Shadow for Navigation Readability */}
                    <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-dark-950/90 to-transparent z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent z-0" />
                    <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 md:pb-32 max-w-7xl mx-auto w-full z-20">
                        <span className="bg-amber-500 text-black text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase mb-4 inline-block">Featured Collection</span>
                        <h2 className="text-5xl md:text-9xl font-display font-black text-white mb-6 leading-none tracking-tighter drop-shadow-2xl">
                            {BANNERS[0].title}
                        </h2>
                        <p className="text-white text-base md:text-3xl max-w-4xl font-medium leading-relaxed drop-shadow-lg opacity-90">
                            {BANNERS[0].subtitle}
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
                {activeView === 'catalog' ? (
                    <div className="space-y-20">
                        {/* Hero Banner logic moved outside for edge-to-edge effect */}

                        {/* Product Grid */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold flex items-center gap-3">
                                    <Target size={24} className="text-amber-400" />
                                    {showExclusiveOnly ? 'Exclusive Gear' : 'Product Catalog'}
                                </h3>
                                <span className="text-xs font-bold text-dark-500 bg-dark-800 px-4 py-1.5 rounded-full border border-white/5">
                                    {filteredProducts.length} Items Found
                                </span>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-24 gap-4">
                                    <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-dark-400 font-bold animate-pulse uppercase tracking-wider text-xs">Loading gears...</p>
                                </div>
                            ) : filteredProducts.length === 0 ? (
                                <div className="text-center py-24 bg-dark-900/50 rounded-[3rem] border border-dashed border-white/10">
                                    <Package size={48} className="mx-auto mb-4 text-dark-600" />
                                    <h3 className="text-xl font-bold">No products found</h3>
                                    <p className="text-dark-400 mt-2">Try adjusting your filters or search terms.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                                    {filteredProducts.map(product => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            onOpen={() => setSelectedProduct(product)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <OrdersView />
                )}
            </main>

            {/* Product Detail Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <ProductDetailModal
                        product={selectedProduct}
                        onClose={() => setSelectedProduct(null)}
                        onAddToCart={async (productId, quantity, size) => {
                            await addItem(productId, quantity, size);
                            setSelectedProduct(null);
                            setCartOpen(true);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Cart Drawer */}
            <AnimatePresence>
                {cartOpen && (
                    <CartDrawer
                        items={cartItems}
                        totalAmount={totalAmount}
                        onClose={() => setCartOpen(false)}
                        onRemove={removeItem}
                        onUpdateQuantity={updateQuantity}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function ProductCard({ product, onOpen }: { product: Product; onOpen: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -8 }}
            className="group relative bg-dark-900/40 backdrop-blur-md border border-white/5 rounded-[2rem] overflow-hidden transition-all duration-500 hover:border-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer"
            onClick={onOpen}
        >
            <div className="aspect-[4/5] relative overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-dark-950/10 to-transparent" />

                {product.isExclusive && (
                    <div className="absolute top-4 left-4 bg-amber-500 text-[8px] font-black tracking-widest px-2.5 py-1.5 rounded-full text-black shadow-xl">
                        EXCLUSIVE
                    </div>
                )}

                <div className="absolute top-4 right-4 bg-dark-950/80 backdrop-blur-md px-2 py-1 rounded-lg border border-white/5 flex items-center gap-1.5 shadow-xl">
                    <Star size={10} className="text-amber-400 fill-amber-400" />
                    <span className="text-[10px] font-black text-white">{product.rating}</span>
                </div>
            </div>

            <div className="p-5 space-y-4">
                <div className="space-y-1">
                    <span className="text-[9px] font-black tracking-widest text-dark-500 uppercase">{product.category}</span>
                    <h4 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">{product.name}</h4>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <p className="text-xl font-black text-white tracking-tighter">
                        <span className="text-xs text-dark-500 font-sans mr-1">Rp</span>
                        {product.price.toLocaleString()}
                    </p>
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-amber-500 group-hover:text-black transition-all">
                        <ShoppingBag size={18} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function ProductDetailModal({ product, onClose, onAddToCart }: { product: Product; onClose: () => void; onAddToCart: (id: string, qty: number, size?: string) => void }) {
    const [selectedSize, setSelectedSize] = useState('M');
    const [quantity, setQuantity] = useState(1);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-dark-950/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="relative bg-dark-900/80 backdrop-blur-3xl w-full max-w-5xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
                <div className="md:w-1/2 h-80 md:h-auto relative overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    <button onClick={onClose} className="absolute top-6 left-6 w-12 h-12 rounded-2xl bg-dark-950/50 backdrop-blur-lg flex items-center justify-center text-white border border-white/10 hover:bg-dark-800 transition-all md:hidden">
                        <ArrowLeft size={24} />
                    </button>
                </div>

                <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto scrollbar-hide flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div className="space-y-2">
                            <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase">
                                {product.category}
                            </span>
                            <h2 className="text-3xl md:text-5xl font-display font-black text-white leading-tight break-words">{product.name}</h2>
                        </div>
                        <button onClick={onClose} className="hidden md:flex p-3 rounded-2xl bg-white/5 text-dark-400 hover:text-white transition-all">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-950/50 rounded-xl border border-white/10">
                            <Star size={16} className="text-amber-400 fill-amber-400" />
                            <span className="text-lg font-black">{product.rating}</span>
                        </div>
                        <div className="h-6 w-px bg-white/10" />
                        <span className="text-dark-400 font-bold uppercase tracking-widest text-[10px]">Stock: {product.stock} items</span>
                    </div>

                    <p className="text-dark-300 text-sm md:text-base leading-relaxed flex-1 mb-10 overflow-hidden line-clamp-6">
                        {product.description}
                    </p>

                    <div className="space-y-8 mt-auto">
                        <div className="space-y-4">
                            <h5 className="text-[10px] font-black text-dark-500 uppercase tracking-widest">Select Variant</h5>
                            <div className="flex gap-3">
                                {['S', 'M', 'L', 'XL'].map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`w-14 h-14 rounded-2xl border font-bold text-sm transition-all flex items-center justify-center
                                            ${selectedSize === size ? 'bg-amber-500 border-amber-500 text-black shadow-xl shadow-amber-500/20' : 'bg-dark-800 border-white/5 text-dark-400 hover:border-white/20'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-dark-950 border border-white/5 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-dark-500 uppercase tracking-widest mb-1">Total Price</p>
                                <p className="text-3xl font-black text-white tracking-tighter">
                                    <span className="text-sm font-sans mr-1 text-dark-400">Rp</span>
                                    {(product.price * quantity).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-4 bg-dark-800 p-2 rounded-2xl border border-white/10">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center text-dark-400 hover:text-white transition-all">-</button>
                                <span className="font-bold text-lg w-6 text-center">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center text-dark-400 hover:text-white transition-all">+</button>
                            </div>
                        </div>

                        <button
                            onClick={() => onAddToCart(product.id, quantity, selectedSize)}
                            className="w-full h-16 rounded-[2rem] bg-amber-500 text-black font-display font-black text-lg shadow-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] hover:bg-amber-400 active:scale-95"
                        >
                            <ShoppingBag size={24} />
                            Add to Cart
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function OrdersView() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await marketplaceService.listOrders();
                if (response.success) setOrders(response.data);
            } catch (error) {
                console.error('Fetch orders error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return <div className="py-24 text-center text-dark-500 animate-pulse font-bold">LOADING ACTIVITY...</div>;

    if (orders.length === 0) return (
        <div className="text-center py-24 bg-dark-900/50 rounded-[3rem] border border-white/5">
            <History size={48} className="mx-auto mb-4 text-dark-600" />
            <h3 className="text-xl font-bold">No activity yet</h3>
            <p className="text-dark-400">Your order history will appear here once you make a purchase.</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold">Purchase History</h3>
            <div className="grid gap-6">
                {orders.map(order => (
                    <div key={order.id} className="bg-dark-900/40 backdrop-blur-md border border-white/5 rounded-[2rem] overflow-hidden p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-amber-500 border border-white/5 shadow-xl">
                            <ShoppingBag size={28} />
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-1">
                            <h5 className="text-lg font-black text-white">{order.orderNo || order.id}</h5>
                            <p className="text-xs text-dark-500 font-bold uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-center md:text-right space-y-1">
                            <p className="text-2xl font-black text-white tracking-tighter">Rp {order.totalAmount.toLocaleString()}</p>
                            <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-lg border border-emerald-500/20 uppercase tracking-widest">
                                {order.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CartDrawer({ items, totalAmount, onClose, onRemove, onUpdateQuantity }: { items: any[]; totalAmount: number; onClose: () => void; onRemove: (id: string) => void; onUpdateQuantity: (id: string, q: number) => void }) {
    return (
        <div className="fixed inset-0 z-[300] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-dark-950/80 backdrop-blur-md" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-full max-w-md bg-dark-900/80 backdrop-blur-3xl h-full shadow-2xl border-l border-white/5 flex flex-col">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-2xl font-display font-black flex items-center gap-3">
                        <ShoppingBag className="text-amber-400" />
                        My Cart
                    </h3>
                    <button onClick={onClose} className="p-2 text-dark-400 hover:text-white"><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide p-8 space-y-4">
                    {items.length > 0 ? (
                        items.map(item => (
                            <div key={item.id} className="flex gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 group">
                                <img src={item.product.image} className="w-16 h-16 rounded-2xl object-cover" />
                                <div className="flex-1">
                                    <h5 className="font-bold text-white text-sm line-clamp-1">{item.product.name}</h5>
                                    <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest mt-0.5">Size: {item.size || 'M'}</p>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center gap-3 bg-dark-950 px-2 py-1 rounded-xl border border-white/5">
                                            <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="text-dark-500 hover:text-white">-</button>
                                            <span className="text-xs font-bold text-white">{item.quantity}</span>
                                            <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="text-dark-500 hover:text-white">+</button>
                                        </div>
                                        <p className="text-sm font-black text-amber-400">Rp {(item.product.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                </div>
                                <button onClick={() => onRemove(item.id)} className="text-dark-600 hover:text-rose-500"><X size={16} /></button>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                            <ShoppingBag size={64} />
                            <div>
                                <h4 className="text-xl font-bold">Cart is empty</h4>
                                <p className="text-sm">Find some elite gear to fill it up!</p>
                            </div>
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-8 bg-dark-950/50 border-t border-white/5 space-y-6 mt-auto">
                        <div className="flex justify-between items-end">
                            <span className="text-dark-500 font-bold uppercase tracking-widest text-[10px]">Total Amount</span>
                            <p className="text-3xl font-display font-black text-white tracking-tighter">
                                <span className="text-sm mr-1">Rp</span>
                                {totalAmount.toLocaleString()}
                            </p>
                        </div>
                        <button className="w-full h-16 rounded-[2rem] bg-amber-500 text-black font-display font-black text-lg shadow-2xl shadow-amber-500/20 flex items-center justify-center gap-3">
                            Checkout Now
                            <ChevronRight size={22} />
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
