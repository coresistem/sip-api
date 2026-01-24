import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, ShoppingBag, Star, Shield, ChevronRight, Tag, Info,
    Store, ShoppingCart, History, Package, CheckCircle, Truck, LayoutDashboard, ChevronDown, Menu, ArrowLeft, X
} from 'lucide-react';
import HexLogoFrame from '../../../../components/ui/HexLogoFrame';
import { useSearchParams, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { useCart } from '../../../../context/CartContext';
import marketplaceService, { Product } from '../../../../services/marketplaceService';

// Product Data is now fetched from the API

const CATEGORIES = ['All', 'Equipment', 'Bows', 'Arrows', 'Apparel', 'Accessories', 'Training'];

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

const QUICK_LINKS = [
    { id: '1', label: 'Flash Sale', icon: Tag, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { id: '2', label: 'Top Rated', icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { id: '3', label: 'Csystem Mall', icon: ShoppingBag, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { id: '4', label: 'New Arrivals', icon: Package, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: '5', label: 'Training Prep', icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10' },
];

export default function CatalogPage() {
    const { user } = useAuth();
    const { items: cartItems, addItem, removeItem, updateQuantity, itemCount, totalAmount, refreshCart } = useCart();
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
        <div className="h-screen bg-dark-950/50 pb-20 overflow-y-auto overflow-x-hidden scroll-smooth">
            {/* Marketplace Navbar - FLOATING GLASS LEVEL UP */}
            {/* Unified Pro Header Overlay - WRAPPER FOR BOTH */}
            <div className="fixed top-0 left-0 right-0 z-[100] w-full flex flex-col transition-all duration-300">
                {/* Main Navbar Part */}
                <div className="w-full bg-dark-950/80 backdrop-blur-xl border-b border-white/10">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full h-14 glass-strong border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-2xl flex justify-center"
                    >
                        <div className="w-full max-w-5xl px-6 flex items-center justify-between gap-4">
                            {/* Left: Branding & Categories */}
                            <div className="flex items-center gap-6 shrink-0">
                                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                                    <HexLogoFrame size={28} />
                                    <span className="font-display font-black text-lg hidden md:inline tracking-tight text-white group-hover:text-amber-400 transition-colors">
                                        Csystem <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-200">Market</span>
                                    </span>
                                </div>

                                <div className="h-6 w-px bg-white/10 hidden md:block" />

                                {/* Categories Dropdown */}
                                <div className="relative">
                                    <motion.button
                                        whileHover={{
                                            scale: 1.02,
                                            boxShadow: "0 0 15px rgba(251, 191, 36, 0.2)",
                                            borderColor: "rgba(251, 191, 36, 0.3)"
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all border ${categoryMenuOpen
                                            ? 'bg-amber-500 text-white shadow-[0_0_15px_rgba(251,191,36,0.5)] border-amber-400'
                                            : 'bg-white/5 text-dark-200 hover:text-white border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        <Menu size={16} />
                                        <span className="text-xs font-bold hidden lg:inline">Categories</span>
                                        <ChevronDown size={12} className={`transition-transform duration-300 ${categoryMenuOpen ? 'rotate-180' : ''}`} />
                                    </motion.button>

                                    <AnimatePresence>
                                        {categoryMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                className="absolute left-0 mt-3 w-56 glass-strong p-2 rounded-2xl border border-white/5 shadow-2xl z-50 overflow-hidden"
                                            >
                                                <div className="p-3 border-b border-white/5 mb-1">
                                                    <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Select Category</p>
                                                </div>
                                                {CATEGORIES.map(cat => (
                                                    <button
                                                        key={cat}
                                                        onClick={() => setActiveCategory(cat)}
                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${activeCategory === cat
                                                            ? 'bg-primary-500/20 text-primary-400'
                                                            : 'text-dark-400 hover:text-white hover:bg-white/5'
                                                            }`}
                                                    >
                                                        <div className={`w-1.5 h-1.5 rounded-full transition-all ${activeCategory === cat ? 'bg-primary-500 scale-125' : 'bg-dark-600 group-hover:bg-dark-400'}`} />
                                                        <span className="text-sm font-medium">{cat}</span>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Center: Search Overlay */}
                            <div className="flex-1 max-w-2xl hidden md:flex items-center gap-2">
                                <div className="relative flex-1 group">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within:text-amber-400 transition-colors" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search products, gear, jerseys..."
                                        className="input w-full pl-10 h-8 bg-white/5 border-white/10 focus:bg-white/10 focus:border-amber-500/30 focus:shadow-[0_0_10px_rgba(251,191,36,0.1)] rounded-lg text-xs transition-all"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-2 rounded-lg bg-white/5 text-dark-400 hover:text-white border border-white/10 transition-all shadow-sm"
                                >
                                    <Filter size={16} />
                                </motion.button>
                            </div>

                            {/* Right Cluster: Actions & Shop */}
                            <div className="flex items-center gap-2 md:gap-3 shrink-0">
                                {/* Mobile Search Toggle (only on mobile) */}
                                <button
                                    onClick={() => setMobileSearchOpen(true)}
                                    className="md:hidden p-2 text-dark-400 hover:text-white transition-colors"
                                >
                                    <Search size={18} />
                                </button>


                                {/* Checkout */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all group"
                                >
                                    <ShoppingCart size={18} />
                                    <motion.span
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[8px] font-black text-white flex items-center justify-center border border-dark-950"
                                    >
                                        {itemCount}
                                    </motion.span>
                                </motion.button>

                                <div className="relative">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setOrdersMenuOpen(!ordersMenuOpen)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs font-bold border ${ordersMenuOpen || activeView === 'orders'
                                            ? 'bg-primary-500/20 text-primary-400 border-primary-500/30'
                                            : 'bg-white/5 text-dark-200 border-white/10 hover:text-white'
                                            }`}
                                    >
                                        <History size={16} />
                                        <span className="hidden md:inline">Activity</span>
                                        <ChevronDown size={12} className={`transition-transform duration-300 ${ordersMenuOpen ? 'rotate-180' : ''}`} />
                                    </motion.button>

                                    <AnimatePresence>
                                        {ordersMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute right-0 mt-2 w-56 glass-strong p-2 rounded-2xl border border-white/5 shadow-2xl z-50 mb-10"
                                            >
                                                <div className="p-2 border-b border-white/5 mb-1">
                                                    <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Shop Activity</p>
                                                </div>
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
                                                        <p className="text-[10px] text-dark-500">Track current & past orders</p>
                                                    </div>
                                                </button>
                                                <NavLink
                                                    to="/order-history?tab=transactions"
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                                                >
                                                    <CheckCircle size={18} className="text-emerald-400" />
                                                    <span className="text-sm font-medium group-hover:text-emerald-400 transition-colors">Full History</span>
                                                </NavLink>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Dash / Shop Toggle - ICON ONLY */}
                                {user?.role === 'SUPPLIER' ? (
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => navigate('/jersey/admin')}
                                        className="p-2.5 rounded-lg bg-emerald-500 text-white shadow-lg transition-all"
                                        title="Admin Center"
                                    >
                                        <LayoutDashboard size={18} />
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        whileHover={{
                                            scale: 1.1,
                                            backgroundColor: "rgba(255, 255, 255, 1)",
                                            color: "#000"
                                        }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => navigate('/add-role', { state: { requestedRole: 'SUPPLIER' } })}
                                        className="p-2.5 rounded-lg bg-white/90 text-black shadow-xl transition-all"
                                        title="Open Shop"
                                    >
                                        <Store size={18} />
                                    </motion.button>
                                )}
                            </div>
                        </div>

                        {/* Mobile Search Overlay */}
                        <AnimatePresence>
                            {mobileSearchOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="absolute inset-x-0 top-0 h-16 glass-strong border-b border-primary-500/20 z-[60] flex justify-center"
                                >
                                    <div className="w-full max-w-5xl px-6 flex items-center gap-4">
                                        <div className="relative flex-1 flex items-center group">
                                            <Search className="absolute left-3 text-amber-500" size={18} />
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="Search products, gear, jerseys..."
                                                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-amber-500/50 outline-none transition-all placeholder:text-dark-500"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Escape' && setMobileSearchOpen(false)}
                                            />
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setMobileSearchOpen(false)}
                                            className="p-2 rounded-xl bg-white/5 text-dark-400 hover:text-white"
                                        >
                                            <X size={20} />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Secondary Interaction Strip - Integrated into Fixed Header */}
                {activeView === 'catalog' && (
                    <div
                        className="relative left-1/2 -translate-x-1/2 w-screen flex py-1 md:py-2 bg-dark-950/70 backdrop-blur-xl shadow-lg border-b border-white/5 transition-all overflow-hidden"
                        style={{
                            maskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
                            WebkitMaskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)'
                        }}
                    >
                        <div
                            className="w-full flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 scroll-smooth"
                        >
                            {/* Dynamic Spacer - Start */}
                            <div style={{ minWidth: 'max(24px, calc((100vw - 1100px) / 2))' }} className="shrink-0" />

                            {QUICK_LINKS.map(link => (
                                <div key={link.id} className="relative group/tooltip">
                                    <motion.button
                                        whileHover={{ y: -2, scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex items-center gap-2 px-2.5 md:px-3 py-1.5 md:py-2 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all shrink-0 group"
                                    >
                                        <div className={`w-7 h-7 rounded-lg ${link.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                            <link.icon className={link.color} size={16} />
                                        </div>
                                        <span className="hidden sm:inline text-xs font-bold text-dark-200 group-hover:text-white transition-colors whitespace-nowrap">
                                            {link.label}
                                        </span>
                                    </motion.button>

                                    {/* Tooltip */}
                                    <div className="sm:hidden absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-dark-800 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-300 translate-y-2 group-hover/tooltip:translate-y-0 whitespace-nowrap z-50 border border-white/10 shadow-xl">
                                        {link.label}
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-dark-800 rotate-45 border-r border-b border-white/10" />
                                    </div>
                                </div>
                            ))}
                            <div className="ml-auto group/tooltip relative">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowExclusiveOnly(!showExclusiveOnly)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-2xl transition-all border shrink-0 group ${showExclusiveOnly
                                        ? 'bg-amber-500 text-white border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                                        : 'bg-white/5 text-dark-200 border-white/5 hover:bg-white/10 hover:border-white/10'
                                        }`}
                                >
                                    <Shield size={16} className={showExclusiveOnly ? 'text-white' : 'text-amber-400'} />
                                    <span className="hidden sm:inline text-xs font-bold whitespace-nowrap uppercase">Exclusive</span>
                                </motion.button>

                                {/* Tooltip for Mobile */}
                                <div className="sm:hidden absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-amber-500 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-300 translate-y-2 group-hover/tooltip:translate-y-0 whitespace-nowrap z-50 border border-amber-400 shadow-xl">
                                    Toggle Exclusive
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-500 rotate-45 border-r border-b border-amber-400" />
                                </div>
                            </div>
                            {/* Dynamic Spacer - End */}
                            <div style={{ minWidth: 'max(24px, calc((100vw - 1100px) / 2))' }} className="shrink-0" />
                        </div>
                    </div>
                )}
            </div>
            {/* LARGE Spacer for Combined Fixed Header (Navbar + Icons) */}
            <div className="w-full h-24 flex-shrink-0" />

            {/* View Switcher action strip - aligned with Catalog button */}
            {
                activeView === 'orders' && (
                    <div className="sticky top-16 z-40 w-full flex justify-center py-4 bg-dark-950/40 backdrop-blur-sm border-b border-white/5">
                        <div className="w-full max-w-5xl px-6">
                            <motion.button
                                onClick={() => setActiveView('catalog')}
                                className="flex items-center gap-2 text-primary-400 font-bold text-xs"
                            >
                                <ArrowLeft size={14} />
                                Back to Market
                            </motion.button>
                        </div>
                    </div>
                )
            }

            {/* Floating Cart Button - Relocated to Bottom Right */}
            <div className="fixed bottom-24 right-6 lg:bottom-12 lg:right-12 z-50 flex items-center gap-3">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCartOpen(true)}
                    className="relative w-12 h-12 rounded-2xl glass-strong border border-white/10 flex items-center justify-center text-white shadow-2xl"
                >
                    <ShoppingBag size={20} />
                    {cartItems.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-black text-[10px] font-black rounded-full flex items-center justify-center shadow-lg">
                            {cartItems.length}
                        </span>
                    )}
                </motion.button>
            </div>

            {/* Main Content Scrollable Area */}
            <div className="flex flex-col items-center w-full">
                {/* Hero Banner Section */}
                <div className="w-full max-w-5xl px-6 mt-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative h-48 md:h-64 rounded-[2rem] overflow-hidden group shadow-2xl border border-white/5"
                    >
                        {/* Banner Image with high-end treatment */}
                        <img
                            src={BANNERS[0].image}
                            alt="Hero"
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-r ${BANNERS[0].color} mix-blend-multiply opacity-60`} />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent" />

                        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <span className="bg-amber-500 text-black text-[10px] font-black tracking-[0.2em] px-3 py-1 rounded-full uppercase mb-4 inline-block shadow-lg">Featured</span>
                                <h1 className="text-3xl md:text-5xl font-display font-black text-white mb-2 leading-tight">
                                    {BANNERS[0].title}
                                </h1>
                                <p className="text-dark-300 text-sm md:text-base max-w-md font-medium">
                                    {BANNERS[0].subtitle}
                                </p>
                            </motion.div>
                        </div>

                        {/* Pagination Dots (Mock) */}
                        <div className="absolute bottom-6 right-8 flex gap-2">
                            <div className="w-8 h-1.5 rounded-full bg-amber-500 shadow-lg shadow-amber-500/30" />
                            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                        </div>
                    </motion.div>
                </div>



                {/* View Conditional Content */}
                <div className="w-full max-w-5xl px-6 space-y-12 mt-12 pb-24">
                    {activeView === 'catalog' ? (
                        <>
                            {filteredProducts.length > 0 ? (
                                <section className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-bold flex items-center gap-3">
                                            <Tag size={18} className="text-primary-400" />
                                            {showExclusiveOnly ? 'Club Member Exclusive' : 'Explore Market'}
                                        </h2>
                                        <span className="text-xs text-dark-500 font-medium bg-dark-800 px-3 py-1 rounded-full">
                                            {filteredProducts.length} Items Found
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                                        {filteredProducts.map(product => (
                                            <ProductCard
                                                key={product.id}
                                                product={{
                                                    ...product,
                                                    onClick: () => setSelectedProduct(product)
                                                }}
                                            />
                                        ))}
                                    </div>
                                </section>
                            ) : (
                                <div className="text-center py-20">
                                    <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4 text-dark-600">
                                        <Search size={32} />
                                    </div>
                                    <h3 className="text-lg font-medium text-white mb-1">No products found</h3>
                                    <p className="text-dark-400">Try adjusting your filters or search terms.</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <OrdersView />
                    )}
                </div>
            </div >

            {/* Product Detail Modal/Drawer Overlay */}
            <AnimatePresence>
                {
                    selectedProduct && (
                        <ProductDetailDrawer
                            product={selectedProduct}
                            onClose={() => setSelectedProduct(null)}
                            onAddToCart={async (productId, quantity, size) => {
                                await addItem(productId, quantity, size);
                                setSelectedProduct(null);
                                setCartOpen(true);
                            }}
                        />
                    )
                }
            </AnimatePresence >

            {/* Cart Drawer */}
            <AnimatePresence>
                {
                    cartOpen && (
                        <CartDrawer
                            items={cartItems}
                            onClose={() => setCartOpen(false)}
                            onRemove={removeItem}
                            onUpdateQuantity={updateQuantity}
                            totalAmount={totalAmount}
                        />
                    )
                }
            </AnimatePresence >
        </div >
    );
}

function ProductCard({ product }: { product: any }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={{
                y: -5,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
                borderColor: "rgba(251, 191, 36, 0.3)"
            }}
            onClick={() => product.onClick?.()}
            className="group relative bg-dark-900/50 border border-white/5 rounded-[1.2rem] md:rounded-[1.5rem] overflow-hidden transition-all duration-500 shadow-[0_8px_25px_rgba(0,0,0,0.3)] backdrop-blur-sm cursor-pointer"
        >
            <div className="aspect-[4/5] overflow-hidden relative">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Image Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent opacity-80" />

                {product.isDedicated && (
                    <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-amber-500 text-[7px] md:text-[8px] font-black tracking-widest px-2 py-1 md:px-2.5 md:py-1.5 rounded-full text-black flex items-center gap-1 shadow-xl">
                        <Shield size={7} />
                        EXCLUSIVE
                    </div>
                )}

                {/* Star Rating Badge - Top Right */}
                <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-dark-950/80 backdrop-blur-md px-1.5 py-0.5 md:px-2 md:py-1 rounded-md md:rounded-lg border border-white/5 flex items-center gap-1 shadow-xl">
                    <Star size={8} className="text-amber-400 fill-amber-400 md:w-2.5 md:h-2.5" />
                    <span className="text-[9px] md:text-[10px] font-black text-white">{product.rating}</span>
                </div>

                {/* Quick Add Button - Bottom Right */}
                <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4">
                    <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: '#fbbf24', color: '#000' }}
                        whileTap={{ scale: 0.9 }}
                        className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/10 backdrop-blur-md text-white border border-white/10 flex items-center justify-center shadow-2xl transition-all"
                    >
                        <ShoppingBag size={14} className="md:w-4 md:h-4" />
                    </motion.button>
                </div>
            </div>

            <div className="p-2 md:p-5 space-y-1.5 md:space-y-4">
                <div className="space-y-0.5 md:space-y-1">
                    <span className="text-[7px] md:text-[9px] font-black tracking-[0.2em] text-dark-400 uppercase">
                        {product.category}
                    </span>
                    <h3 className="font-display font-bold text-xs md:text-base text-white group-hover:text-amber-400 transition-colors line-clamp-1 tracking-tight">
                        {product.name}
                    </h3>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-sm md:text-lg font-display font-black text-white tracking-tighter">
                        <span className="text-[9px] md:text-[10px] text-dark-500 mr-0.5 md:mr-1 font-sans">Rp</span>
                        {product.price.toLocaleString()}
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            // Logic for direct add-to-cart could go here
                        }}
                        className="text-[9px] md:text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-colors"
                    >
                        View
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}

function ProductDetailDrawer({ product, onClose, onAddToCart }: {
    product: Product;
    onClose: () => void;
    onAddToCart: (productId: string, quantity: number, size: string) => void
}) {
    const [selectedSize, setSelectedSize] = useState('M');
    const [quantity] = useState(1);

    if (!product) return null;

    const handleAddToCart = () => {
        onAddToCart(product.id, quantity, selectedSize);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex justify-end"
        >
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onClose}
                className="absolute inset-0 bg-dark-950/80 backdrop-blur-md"
            />

            {/* Side Sheet */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-lg bg-dark-900 h-full shadow-2xl border-l border-white/5 flex flex-col"
            >
                {/* Header Actions */}
                <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-center">
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-dark-950/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-dark-800 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex gap-2">
                        <button className="w-10 h-10 rounded-full bg-dark-950/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-dark-800 transition-colors">
                            <ShoppingCart size={18} />
                        </button>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
                    {/* Hero Image */}
                    <div className="aspect-[4/5] w-full overflow-hidden">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Detailed Info */}
                    <div className="p-8 space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="bg-amber-500/10 text-amber-400 text-[10px] font-black tracking-[0.2em] px-3 py-1 rounded-full uppercase">
                                    {product.category}
                                </span>
                                <div className="flex items-center gap-1.5 bg-dark-950/50 px-3 py-1.5 rounded-xl border border-white/5">
                                    <Star size={14} className="text-amber-400 fill-amber-400" />
                                    <span className="text-sm font-black text-white">{product.rating}</span>
                                    <span className="text-xs text-dark-500 font-medium ml-1">(120 Reviews)</span>
                                </div>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-display font-black text-white leading-tight">
                                {product.name}
                            </h2>

                            <p className="text-dark-400 text-sm md:text-base leading-relaxed">
                                {product.description || 'Premium tournament-grade gear designed for professional performance and durability.'}
                            </p>
                        </div>

                        {/* Variant Selection (Reference Style) */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-dark-500 translate-y-1 uppercase tracking-widest">Select Size</h4>
                            <div className="flex gap-3">
                                {['S', 'M', 'L', 'XL'].map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`w-14 h-14 rounded-2xl border font-display font-black text-sm transition-all flex items-center justify-center
                                            ${selectedSize === size
                                                ? 'bg-amber-500 border-amber-500 text-black shadow-[0_4px_20px_rgba(251,191,36,0.3)]'
                                                : 'bg-dark-800 border-white/5 text-dark-400 hover:border-white/20'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Additional Meta */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-[1.5rem] bg-dark-950/50 border border-white/5 space-y-1">
                                <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Availability</p>
                                <p className="text-sm font-black text-emerald-400">In Stock (12 units)</p>
                            </div>
                            <div className="p-4 rounded-[1.5rem] bg-dark-950/50 border border-white/5 space-y-1">
                                <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Delivery</p>
                                <p className="text-sm font-black text-white">2-3 Business Days</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Footer CTA */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-dark-900 border-t border-white/5 backdrop-blur-xl">
                    <div className="flex items-center gap-6">
                        <div className="flex-shrink-0">
                            <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Total Price</p>
                            <p className="text-2xl font-display font-black text-white tracking-tighter">
                                <span className="text-[10px] text-dark-500 mr-1 font-sans">Rp</span>
                                {product.price.toLocaleString()}
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02, backgroundColor: '#fbbf24' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAddToCart}
                            className="flex-1 h-14 rounded-2xl bg-white text-black font-display font-black text-base shadow-2xl flex items-center justify-center gap-3 transition-colors"
                        >
                            <ShoppingBag size={20} />
                            Add to Cart
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
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
                if (response.success) {
                    setOrders(response.data);
                }
            } catch (error) {
                console.error('Fetch orders error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin mb-4" />
                <p className="text-sm font-bold">Loading orders...</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-20 bg-dark-900/50 rounded-[2rem] border border-white/5">
                <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4 text-dark-600">
                    <History size={32} />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">No orders yet</h3>
                <p className="text-dark-400">Your purchase history will appear here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display font-black text-white">Purchase History</h2>
                <div className="px-4 py-1 bg-dark-800 rounded-full border border-white/5">
                    <span className="text-xs font-bold text-dark-400">{orders.length} Orders</span>
                </div>
            </div>

            <div className="space-y-6">
                {orders.map(order => (
                    <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-dark-900/50 border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-sm"
                    >
                        {/* Order Header */}
                        <div className="p-6 md:p-8 bg-white/5 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-amber-500">
                                    <ShoppingBag size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-white font-black text-lg">{order.id}</h4>
                                    <p className="text-xs text-dark-500 font-bold uppercase tracking-widest">{order.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="hidden md:block text-right">
                                    <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Total Amount</p>
                                    <p className="text-xl font-display font-black text-white">Rp {order.totalAmount.toLocaleString()}</p>
                                </div>
                                <div className="px-4 py-2 bg-amber-500 text-black rounded-xl font-bold text-xs shadow-lg shadow-amber-500/20">
                                    {order.status}
                                </div>
                            </div>
                        </div>

                        {/* Order Content & Tracking */}
                        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Items Summary */}
                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-dark-500 uppercase tracking-widest">Order Summary</h4>
                                <div className="space-y-4">
                                    {order.items.map(item => (
                                        <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                            <img src={item.product.image} alt={item.product.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                                            <div className="flex-1 py-1">
                                                <h5 className="text-sm font-black text-white">{item.product.name}</h5>
                                                <p className="text-xs text-dark-500 font-medium">{item.size || 'Standard Edition'}</p>
                                                <p className="text-sm font-display font-black text-amber-400 mt-2">Rp {item.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-dark-500 uppercase tracking-widest">Order Tracking</h4>
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <Truck size={18} className="text-amber-400" />
                                        <span className="text-sm font-bold text-white">Status: {order.status}</span>
                                    </div>
                                    <p className="text-xs text-dark-500 mt-2 italic">Standard delivery in progress...</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 md:p-8 bg-dark-950/30 border-t border-white/5 flex gap-4">
                            <button className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/5 text-dark-200 text-xs font-bold hover:text-white hover:bg-white/10 transition-all">
                                View Invoice
                            </button>
                            <button className="px-6 py-2.5 rounded-xl bg-white text-black text-xs font-black shadow-lg shadow-white/5 hover:bg-amber-500 transition-all">
                                Track Package live
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function CartDrawer({ items, onClose, onRemove, onUpdateQuantity, totalAmount }: {
    items: any[];
    onClose: () => void;
    onRemove: (id: string) => void;
    onUpdateQuantity: (id: string, qty: number) => void;
    totalAmount: number;
}) {

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex justify-end"
        >
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onClose}
                className="absolute inset-0 bg-dark-950/80 backdrop-blur-md"
            />

            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-md bg-dark-900 h-full shadow-2xl border-l border-white/5 flex flex-col"
            >
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-dark-950/30">
                    <div className="flex items-center gap-3">
                        <ShoppingBag size={22} className="text-amber-400" />
                        <h2 className="text-xl font-display font-black text-white">My Cart</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl bg-white/5 text-dark-400 flex items-center justify-center hover:text-white hover:bg-white/10 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                    {items.length > 0 ? (
                        items.map((item) => (
                            <motion.div
                                key={item.cartId}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-4 p-3 rounded-2xl bg-white/5 border border-white/5"
                            >
                                <div className="flex justify-between items-start">
                                    <h4 className="text-sm font-black text-white truncate pr-2">{item.product.name}</h4>
                                    <button
                                        onClick={() => onRemove(item.id)}
                                        className="text-dark-500 hover:text-rose-400 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                <p className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mt-0.5">Size: {item.size || 'N/A'}</p>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="flex items-center bg-dark-800 rounded-lg border border-white/5 overflow-hidden">
                                        <button
                                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                            className="w-6 h-6 flex items-center justify-center hover:bg-white/5 text-dark-400"
                                        >
                                            -
                                        </button>
                                        <span className="w-8 text-center text-xs font-bold text-white">{item.quantity}</span>
                                        <button
                                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                            className="w-6 h-6 flex items-center justify-center hover:bg-white/5 text-dark-400"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <p className="text-sm font-display font-black text-amber-400">
                                        <span className="text-[9px] mr-1">Rp</span>
                                        {(item.product.price * item.quantity).toLocaleString()}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-40 text-center px-12 pt-20">
                            <ShoppingBag size={48} className="mb-4" />
                            <p className="text-lg font-bold">Your cart is empty</p>
                            <p className="text-xs">Time to find some elite gear!</p>
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-8 bg-dark-950/50 border-t border-white/5 space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-dark-500 uppercase tracking-widest">
                                <span>Subtotal</span>
                                <span className="text-white">Rp {totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-dark-500 uppercase tracking-widest">
                                <span>Shipping</span>
                                <span className="text-emerald-400 font-black">FREE</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                            <span className="text-lg font-display font-black text-white uppercase tracking-tighter">Total Price</span>
                            <span className="text-2xl font-display font-black text-white tracking-tighter">
                                <span className="text-xs mr-1">Rp</span>
                                {totalAmount.toLocaleString()}
                            </span>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full h-16 rounded-2xl bg-amber-500 text-black font-display font-black text-base shadow-[0_10px_30px_rgba(251,191,36,0.3)] flex items-center justify-center gap-3"
                        >
                            Proceed to Checkout
                            <ChevronRight size={20} />
                        </motion.button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
