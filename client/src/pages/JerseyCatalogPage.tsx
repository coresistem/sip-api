import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, ShoppingCart, Package, Image, Check, Plus, Minus, X,
    Shirt, Ruler, Layers, User, Hash, MapPin, FileText
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
    JerseyProduct, ProductVariant, CartItem, OrderCalculation,
    listProducts, getProduct, calculateOrderTotal, createOrder,
    formatCurrency, VARIANT_CATEGORIES
} from '../services/jerseyApi';
import { useAuth } from '../context/AuthContext';

// Helper to convert image URLs - handles local uploads and Google Drive links
const getDirectImageUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;

    // Handle local uploads - prepend server URL
    if (url.startsWith('/uploads')) {
        return `http://localhost:3000${url}`;
    }

    // Convert Google Drive sharing link to direct view URL
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^\/]+)/);
    if (driveMatch) {
        return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
    }

    if (url.includes('drive.google.com/uc')) {
        return url;
    }

    return url;
};


interface JerseyCatalogPageProps {
    mockProducts?: JerseyProduct[];
}

const JerseyCatalogPage: React.FC<JerseyCatalogPageProps> = ({ mockProducts }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState<JerseyProduct[]>(mockProducts || []);
    const [isLoading, setIsLoading] = useState(!mockProducts);
    const [selectedProduct, setSelectedProduct] = useState<JerseyProduct | null>(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Order form state
    const [orderForm, setOrderForm] = useState<{
        selectedVariants: Record<string, string>;
        quantity: number;
        recipientName: string;
        nameOnJersey: string;
        numberOnJersey: string;
        shippingAddress: string;
        notes: string;
    }>({
        selectedVariants: {},
        quantity: 1,
        recipientName: user?.name || '',
        nameOnJersey: '',
        numberOnJersey: '',
        shippingAddress: '',
        notes: ''
    });

    // Calculated price
    const [calculatedPrice, setCalculatedPrice] = useState<OrderCalculation | null>(null);

    useEffect(() => {
        if (!mockProducts) {
            loadProducts();
        }
    }, [mockProducts]);

    useEffect(() => {
        if (selectedProduct && Object.keys(orderForm.selectedVariants).length > 0) {
            calculatePrice();
        }
    }, [orderForm.selectedVariants, orderForm.quantity, selectedProduct]);

    const loadProducts = async () => {
        try {
            setIsLoading(true);
            const data = await listProducts({ active: true });
            setProducts(data);
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const openOrderModal = async (product: JerseyProduct) => {
        try {
            const fullProduct = await getProduct(product.id);
            setSelectedProduct(fullProduct);

            // Set default variants
            const defaults: Record<string, string> = {};
            VARIANT_CATEGORIES.forEach(cat => {
                const defaultVariant = fullProduct.variants.find(v => v.category === cat.id && v.isDefault);
                if (defaultVariant) {
                    defaults[cat.id] = defaultVariant.name;
                } else {
                    const firstVariant = fullProduct.variants.find(v => v.category === cat.id);
                    if (firstVariant) defaults[cat.id] = firstVariant.name;
                }
            });

            setOrderForm({
                ...orderForm,
                selectedVariants: defaults,
                quantity: fullProduct.minOrderQty || 1,
                recipientName: user?.name || ''
            });

            setShowOrderModal(true);
        } catch (error) {
            console.error('Failed to load product:', error);
        }
    };

    const calculatePrice = async () => {
        if (!selectedProduct) return;

        try {
            const result = await calculateOrderTotal([{
                productId: selectedProduct.id,
                selectedVariants: orderForm.selectedVariants,
                quantity: orderForm.quantity
            }]);
            setCalculatedPrice(result);
        } catch (error) {
            console.error('Failed to calculate price:', error);
        }
    };

    const handleVariantSelect = (category: string, name: string) => {
        setOrderForm({
            ...orderForm,
            selectedVariants: { ...orderForm.selectedVariants, [category]: name }
        });
    };

    const handleQuantityChange = (delta: number) => {
        const minQty = selectedProduct?.minOrderQty || 1;
        const newQty = Math.max(minQty, orderForm.quantity + delta);
        setOrderForm({ ...orderForm, quantity: newQty });
    };

    const handleSubmitOrder = async () => {
        if (!selectedProduct || !calculatedPrice) return;

        try {
            setIsSubmitting(true);
            const order = await createOrder({
                supplierId: selectedProduct.supplierId,
                items: [{
                    productId: selectedProduct.id,
                    selectedVariants: orderForm.selectedVariants,
                    quantity: orderForm.quantity,
                    recipientName: orderForm.recipientName,
                    nameOnJersey: orderForm.nameOnJersey,
                    numberOnJersey: orderForm.numberOnJersey
                }],
                orderType: 'INDIVIDUAL',
                shippingAddress: orderForm.shippingAddress,
                notes: orderForm.notes
            });

            setShowOrderModal(false);
            setShowCart(true);
            alert(`Order berhasil dibuat! No. Order: ${order.orderNo}`);
            navigate('/my-orders');
        } catch (error) {
            console.error('Failed to create order:', error);
            alert('Gagal membuat order. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Group variants by category
    const getVariantsByCategory = (variants: ProductVariant[]) => {
        const grouped: Record<string, ProductVariant[]> = {};
        variants.forEach(v => {
            if (!grouped[v.category]) grouped[v.category] = [];
            grouped[v.category].push(v);
        });
        return grouped;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-300" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Shirt className="w-7 h-7 text-purple-400" />
                            Katalog Jersey
                        </h1>
                        <p className="text-slate-400 text-sm">Pilih desain jersey favoritmu</p>
                    </div>
                </div>
                <Link
                    to="/my-orders"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                >
                    <ShoppingCart className="w-5 h-5" />
                    Pesanan Saya
                </Link>
            </div>

            {/* Products Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20">
                    <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-300 mb-2">Belum Ada Produk</h3>
                    <p className="text-slate-500">Produk jersey akan segera tersedia</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -5 }}
                            className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden cursor-pointer hover:border-purple-500/50 transition-all group"
                            onClick={() => openOrderModal(product)}
                        >
                            {/* Product Image */}
                            <div className="relative h-56 bg-slate-700/50 overflow-hidden">
                                {product.designUrl ? (
                                    <img
                                        src={getDirectImageUrl(product.designUrl)}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        referrerPolicy="no-referrer"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <Image className="w-16 h-16 text-slate-600" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                                    <span className="text-white font-medium flex items-center gap-2">
                                        <ShoppingCart className="w-4 h-4" />
                                        Pesan Sekarang
                                    </span>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-white mb-1">{product.name}</h3>
                                <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                                    {product.description || 'Jersey berkualitas tinggi'}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs text-slate-500">Mulai dari</span>
                                        <div className="text-xl font-bold text-purple-400">
                                            {formatCurrency(product.basePrice)}
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        Min. {product.minOrderQty || 1} pcs
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Order Modal */}
            <AnimatePresence>
                {showOrderModal && selectedProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto"
                        onClick={() => setShowOrderModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-800 rounded-2xl w-full max-w-3xl border border-slate-700 my-8"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-slate-700">
                                <h2 className="text-xl font-semibold text-white">Pesan Jersey</h2>
                                <button
                                    onClick={() => setShowOrderModal(false)}
                                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left: Product Info & Variants */}
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-24 h-24 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                                            {selectedProduct.designUrl ? (
                                                <img src={getDirectImageUrl(selectedProduct.designUrl)} alt={selectedProduct.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <Shirt className="w-8 h-8 text-slate-500" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">{selectedProduct.name}</h3>
                                            <p className="text-slate-400 text-sm">{selectedProduct.description}</p>
                                            <p className="text-purple-400 font-semibold mt-1">
                                                {formatCurrency(selectedProduct.basePrice)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Variant Selection */}
                                    {VARIANT_CATEGORIES.map(category => {
                                        const categoryVariants = selectedProduct.variants.filter(v => v.category === category.id);
                                        if (categoryVariants.length === 0) return null;

                                        return (
                                            <div key={category.id}>
                                                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                                    {category.id === 'SIZE' && <Ruler className="w-4 h-4" />}
                                                    {category.id === 'SLEEVE' && <Layers className="w-4 h-4" />}
                                                    {category.id === 'NECK' && <Shirt className="w-4 h-4" />}
                                                    {category.label}
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {categoryVariants.map(variant => (
                                                        <button
                                                            key={variant.id}
                                                            onClick={() => handleVariantSelect(category.id, variant.name)}
                                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${orderForm.selectedVariants[category.id] === variant.name
                                                                ? 'bg-purple-500 text-white'
                                                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                                }`}
                                                        >
                                                            {variant.name}
                                                            {variant.priceModifier > 0 && (
                                                                <span className="text-xs ml-1 opacity-75">
                                                                    +{formatCurrency(variant.priceModifier).replace('Rp', '')}
                                                                </span>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Quantity */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Jumlah</label>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleQuantityChange(-1)}
                                                className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                                            >
                                                <Minus className="w-4 h-4 text-slate-300" />
                                            </button>
                                            <span className="text-xl font-bold text-white w-12 text-center">
                                                {orderForm.quantity}
                                            </span>
                                            <button
                                                onClick={() => handleQuantityChange(1)}
                                                className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                                            >
                                                <Plus className="w-4 h-4 text-slate-300" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Order Details */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1 flex items-center gap-1">
                                            <User className="w-4 h-4" /> Nama Penerima
                                        </label>
                                        <input
                                            type="text"
                                            value={orderForm.recipientName}
                                            onChange={(e) => setOrderForm({ ...orderForm, recipientName: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1 flex items-center gap-1">
                                                <Shirt className="w-4 h-4" /> Nama di Jersey
                                            </label>
                                            <input
                                                type="text"
                                                value={orderForm.nameOnJersey}
                                                onChange={(e) => setOrderForm({ ...orderForm, nameOnJersey: e.target.value.toUpperCase() })}
                                                placeholder="ARCHER"
                                                maxLength={15}
                                                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white uppercase focus:border-purple-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1 flex items-center gap-1">
                                                <Hash className="w-4 h-4" /> Nomor Punggung
                                            </label>
                                            <input
                                                type="text"
                                                value={orderForm.numberOnJersey}
                                                onChange={(e) => setOrderForm({ ...orderForm, numberOnJersey: e.target.value })}
                                                placeholder="10"
                                                maxLength={3}
                                                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1 flex items-center gap-1">
                                            <MapPin className="w-4 h-4" /> Alamat Pengiriman
                                        </label>
                                        <textarea
                                            value={orderForm.shippingAddress}
                                            onChange={(e) => setOrderForm({ ...orderForm, shippingAddress: e.target.value })}
                                            placeholder="Alamat lengkap..."
                                            rows={2}
                                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1 flex items-center gap-1">
                                            <FileText className="w-4 h-4" /> Catatan
                                        </label>
                                        <textarea
                                            value={orderForm.notes}
                                            onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                                            placeholder="Catatan tambahan (opsional)"
                                            rows={2}
                                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none resize-none"
                                        />
                                    </div>

                                    {/* Price Summary */}
                                    {calculatedPrice && (
                                        <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
                                            <div className="flex justify-between text-slate-400">
                                                <span>Harga Dasar ({orderForm.quantity}x)</span>
                                                <span>{formatCurrency(calculatedPrice.subtotal)}</span>
                                            </div>
                                            {calculatedPrice.addonsTotal > 0 && (
                                                <div className="flex justify-between text-amber-400">
                                                    <span>Tambahan Varian</span>
                                                    <span>+{formatCurrency(calculatedPrice.addonsTotal)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-slate-600">
                                                <span>Total</span>
                                                <span className="text-purple-400">{formatCurrency(calculatedPrice.totalAmount)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 p-6 border-t border-slate-700">
                                <button
                                    onClick={() => setShowOrderModal(false)}
                                    className="flex-1 px-4 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSubmitOrder}
                                    disabled={isSubmitting || !orderForm.recipientName || !orderForm.shippingAddress}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-5 h-5" />
                                            Pesan Sekarang
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default JerseyCatalogPage;
