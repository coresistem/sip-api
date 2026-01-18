import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, ArrowLeft, Package, Image, Trash2, Edit, Eye,
    EyeOff, ShoppingBag, Layers, Save, X, Shirt, Ruler, Upload, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    JerseyProduct, ProductVariant, listProducts, createProduct, updateProduct,
    deleteProduct, addVariant, deleteVariant, formatCurrency,
    VARIANT_CATEGORIES, uploadImage
} from '../services/jerseyApi';

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

    // Also handle already converted format or uc format
    if (url.includes('drive.google.com/uc')) {
        return url;
    }

    // Return original URL for other image hosts
    return url;
};

// Default variants for new products
const DEFAULT_VARIANTS: Omit<ProductVariant, 'id' | 'productId' | 'sortOrder'>[] = [
    // Sizes
    { category: 'SIZE', name: 'S', priceModifier: 0, isDefault: true },
    { category: 'SIZE', name: 'M', priceModifier: 0, isDefault: false },
    { category: 'SIZE', name: 'L', priceModifier: 0, isDefault: false },
    { category: 'SIZE', name: 'XL', priceModifier: 10000, isDefault: false },
    { category: 'SIZE', name: 'XXL', priceModifier: 15000, isDefault: false },
    { category: 'SIZE', name: 'XXXL', priceModifier: 20000, isDefault: false },
    // Neck
    { category: 'NECK', name: 'Round Neck', priceModifier: 0, isDefault: true },
    { category: 'NECK', name: 'V-Neck', priceModifier: 10000, isDefault: false },
    { category: 'NECK', name: 'Polo Collar', priceModifier: 15000, isDefault: false },
    // Sleeve
    { category: 'SLEEVE', name: 'Short Sleeve', priceModifier: 0, isDefault: true },
    { category: 'SLEEVE', name: 'Long Sleeve', priceModifier: 15000, isDefault: false },
    { category: 'SLEEVE', name: 'Hoodie', priceModifier: 25000, isDefault: false },
];

const SupplierProductsPage: React.FC = () => {
    const [products, setProducts] = useState<JerseyProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<JerseyProduct | null>(null);
    const [showVariantsModal, setShowVariantsModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<JerseyProduct | null>(null);

    // Product form state
    const [productForm, setProductForm] = useState({
        name: '',
        sku: '',
        category: 'Jersey',
        description: '',
        designUrl: '',
        basePrice: '',
        minOrderQty: '1',
        visibility: 'PUBLIC' as 'PUBLIC' | 'CLUBS_ONLY' | 'SPECIFIC'
    });
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Variant form state
    const [newVariant, setNewVariant] = useState({
        category: 'SIZE',
        name: '',
        priceModifier: ''
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setIsLoading(true);
            const data = await listProducts();
            setProducts(data);
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateProduct = async () => {
        if (!productForm.name || !productForm.basePrice || !productForm.sku || !productForm.category) return;

        try {
            const newProduct = await createProduct({
                name: productForm.name,
                sku: productForm.sku,
                category: productForm.category,
                description: productForm.description,
                designUrl: productForm.designUrl,
                basePrice: parseFloat(productForm.basePrice),
                minOrderQty: parseInt(productForm.minOrderQty) || 1,
                visibility: productForm.visibility,
                variants: DEFAULT_VARIANTS
            });
            setProducts([newProduct, ...products]);
            setShowProductModal(false);
            resetForm();
        } catch (error) {
            console.error('Failed to create product:', error);
        }
    };

    const handleUpdateProduct = async () => {
        if (!editingProduct || !productForm.name || !productForm.basePrice) return;

        try {
            const updated = await updateProduct(editingProduct.id, {
                name: productForm.name,
                sku: productForm.sku,
                category: productForm.category,
                description: productForm.description,
                designUrl: productForm.designUrl,
                basePrice: parseFloat(productForm.basePrice),
                minOrderQty: parseInt(productForm.minOrderQty) || 1,
                visibility: productForm.visibility
            });
            setProducts(products.map(p => p.id === updated.id ? updated : p));
            setShowProductModal(false);
            setEditingProduct(null);
            resetForm();
        } catch (error) {
            console.error('Failed to update product:', error);
        }
    };

    const handleToggleActive = async (product: JerseyProduct) => {
        try {
            const updated = await updateProduct(product.id, { isActive: !product.isActive });
            setProducts(products.map(p => p.id === updated.id ? { ...p, isActive: updated.isActive } : p));
        } catch (error) {
            console.error('Failed to toggle product:', error);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Yakin ingin menonaktifkan produk ini?')) return;

        try {
            await deleteProduct(id);
            setProducts(products.map(p => p.id === id ? { ...p, isActive: false } : p));
        } catch (error) {
            console.error('Failed to delete product:', error);
        }
    };

    const handleAddVariant = async () => {
        if (!selectedProduct || !newVariant.name || !newVariant.priceModifier) return;

        try {
            const variant = await addVariant(selectedProduct.id, {
                category: newVariant.category,
                name: newVariant.name,
                priceModifier: parseFloat(newVariant.priceModifier),
                isDefault: false
            });

            setSelectedProduct({
                ...selectedProduct,
                variants: [...selectedProduct.variants, variant]
            });
            setProducts(products.map(p =>
                p.id === selectedProduct.id
                    ? { ...p, variants: [...p.variants, variant] }
                    : p
            ));
            setNewVariant({ category: 'SIZE', name: '', priceModifier: '' });
        } catch (error) {
            console.error('Failed to add variant:', error);
        }
    };

    const handleDeleteVariant = async (variantId: string) => {
        if (!selectedProduct) return;

        try {
            await deleteVariant(variantId);
            const updatedVariants = selectedProduct.variants.filter(v => v.id !== variantId);
            setSelectedProduct({ ...selectedProduct, variants: updatedVariants });
            setProducts(products.map(p =>
                p.id === selectedProduct.id
                    ? { ...p, variants: updatedVariants }
                    : p
            ));
        } catch (error) {
            console.error('Failed to delete variant:', error);
        }
    };

    const resetForm = () => {
        setProductForm({ name: '', sku: '', category: 'Jersey', description: '', designUrl: '', basePrice: '', minOrderQty: '1', visibility: 'PUBLIC' });
    };

    const openEditModal = (product: JerseyProduct) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            sku: product.sku || '',
            category: product.category || 'Jersey',
            description: product.description || '',
            designUrl: product.designUrl || '',
            basePrice: String(product.basePrice),
            minOrderQty: String(product.minOrderQty),
            visibility: product.visibility || 'PUBLIC'
        });
        setShowProductModal(true);
    };

    const openVariantsModal = (product: JerseyProduct) => {
        setSelectedProduct(product);
        setShowVariantsModal(true);
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
                            Kelola Produk Jersey
                        </h1>
                        <p className="text-slate-400 text-sm">Tambah dan kelola desain jersey Anda</p>
                    </div>
                </div>
                <button
                    onClick={() => { resetForm(); setEditingProduct(null); setShowProductModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Tambah Produk
                </button>
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
                    <p className="text-slate-500 mb-6">Mulai dengan menambahkan produk jersey pertama Anda</p>
                    <button
                        onClick={() => setShowProductModal(true)}
                        className="px-6 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
                    >
                        Tambah Produk Pertama
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-slate-800/50 backdrop-blur-sm rounded-xl border ${product.isActive ? 'border-slate-700' : 'border-red-500/30'
                                } overflow-hidden hover:border-purple-500/50 transition-all`}
                        >
                            {/* Product Image */}
                            <div className="relative h-48 bg-slate-700/50">
                                {product.designUrl ? (
                                    <img
                                        src={getDirectImageUrl(product.designUrl)}
                                        alt={product.name}
                                        className="w-full h-full object-contain bg-slate-800"
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                            // Hide broken image and show placeholder
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <Image className="w-16 h-16 text-slate-600" />
                                    </div>
                                )}
                                {!product.isActive && (
                                    <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center">
                                        <span className="text-red-400 font-semibold">Nonaktif</span>
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <button
                                        onClick={() => handleToggleActive(product)}
                                        className={`p-2 rounded-lg ${product.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                            } hover:bg-opacity-30 transition-colors`}
                                        title={product.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                                    >
                                        {product.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-white mb-1">{product.name}</h3>
                                <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                                    {product.description || 'Tidak ada deskripsi'}
                                </p>

                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-xl font-bold text-purple-400">
                                        {formatCurrency(product.basePrice)}
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-400 text-sm">
                                        <ShoppingBag className="w-4 h-4" />
                                        {product.ordersCount || 0} order
                                    </div>
                                </div>

                                {/* Variant Summary */}
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {Object.entries(getVariantsByCategory(product.variants)).slice(0, 3).map(([cat, vars]) => (
                                        <span key={cat} className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded">
                                            {cat}: {vars.length}
                                        </span>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditModal(product)}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => openVariantsModal(product)}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                                    >
                                        <Layers className="w-4 h-4" />
                                        Varian
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Product Modal */}
            <AnimatePresence>
                {showProductModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowProductModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-800 rounded-2xl w-full max-w-lg border border-slate-700"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-slate-700">
                                <h2 className="text-xl font-semibold text-white">
                                    {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
                                </h2>
                                <button
                                    onClick={() => setShowProductModal(false)}
                                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Nama Produk *</label>
                                    <input
                                        type="text"
                                        value={productForm.name}
                                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                        placeholder="Jersey Archer Pro"
                                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">SKU *</label>
                                        <input
                                            type="text"
                                            value={productForm.sku}
                                            onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                                            placeholder="JRS-001"
                                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Kategori *</label>
                                        <select
                                            value={productForm.category}
                                            onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                                        >
                                            <option value="Jersey">Jersey</option>
                                            <option value="Pants">Pants</option>
                                            <option value="Jacket">Jacket</option>
                                            <option value="Accessories">Accessories</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Visibility</label>
                                    <select
                                        value={productForm.visibility}
                                        onChange={(e) => setProductForm({ ...productForm, visibility: e.target.value as 'PUBLIC' | 'CLUBS_ONLY' | 'SPECIFIC' })}
                                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                                    >
                                        <option value="PUBLIC">Publik - Semua orang dapat melihat</option>
                                        <option value="CLUBS_ONLY">Klub Only - Hanya member klub</option>
                                        <option value="SPECIFIC">Spesifik - Klub tertentu saja</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Deskripsi</label>
                                    <textarea
                                        value={productForm.description}
                                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                        placeholder="Deskripsi produk..."
                                        rows={3}
                                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Gambar Desain</label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                try {
                                                    setIsUploadingImage(true);
                                                    const url = await uploadImage(file);
                                                    setProductForm({ ...productForm, designUrl: url });
                                                } catch (error) {
                                                    console.error('Failed to upload image:', error);
                                                    alert('Gagal mengunggah gambar');
                                                } finally {
                                                    setIsUploadingImage(false);
                                                }
                                            }
                                        }}
                                        className="hidden"
                                    />
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploadingImage}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-600 transition-colors disabled:opacity-50"
                                        >
                                            {isUploadingImage ? (
                                                <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                                            ) : (
                                                <><Upload className="w-4 h-4" /> Pilih Gambar</>
                                            )}
                                        </button>
                                        {productForm.designUrl && (
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={productForm.designUrl.startsWith('/uploads') ? `http://localhost:3000${productForm.designUrl}` : productForm.designUrl}
                                                    alt="Preview"
                                                    className="w-12 h-12 object-cover rounded-lg border border-slate-600"
                                                />
                                                <span className="text-sm text-green-400">✓ Uploaded</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Harga Dasar (IDR) *</label>
                                        <input
                                            type="number"
                                            value={productForm.basePrice}
                                            onChange={(e) => setProductForm({ ...productForm, basePrice: e.target.value })}
                                            placeholder="150000"
                                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Min. Order</label>
                                        <input
                                            type="number"
                                            value={productForm.minOrderQty}
                                            onChange={(e) => setProductForm({ ...productForm, minOrderQty: e.target.value })}
                                            placeholder="1"
                                            min="1"
                                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {!editingProduct && (
                                    <div className="bg-slate-700/50 rounded-lg p-3 text-sm text-slate-400">
                                        <p className="font-medium text-slate-300 mb-1">Varian Default</p>
                                        <p>Produk baru akan otomatis memiliki varian ukuran (S-XXXL), kerah, dan lengan dengan harga standar.</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 p-6 border-t border-slate-700">
                                <button
                                    onClick={() => setShowProductModal(false)}
                                    className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={editingProduct ? handleUpdateProduct : handleCreateProduct}
                                    disabled={!productForm.name || !productForm.basePrice}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="w-4 h-4" />
                                    {editingProduct ? 'Simpan' : 'Buat Produk'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Variants Modal */}
            <AnimatePresence>
                {showVariantsModal && selectedProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowVariantsModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-800 rounded-2xl w-full max-w-2xl border border-slate-700 max-h-[80vh] overflow-hidden flex flex-col"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-slate-700">
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Kelola Varian</h2>
                                    <p className="text-slate-400 text-sm">{selectedProduct.name}</p>
                                </div>
                                <button
                                    onClick={() => setShowVariantsModal(false)}
                                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Add new variant */}
                                <div className="bg-slate-700/30 rounded-lg p-4">
                                    <h3 className="text-sm font-medium text-slate-300 mb-3">Tambah Varian Baru</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        <select
                                            value={newVariant.category}
                                            onChange={(e) => setNewVariant({ ...newVariant, category: e.target.value })}
                                            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                                        >
                                            {VARIANT_CATEGORIES.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            value={newVariant.name}
                                            onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                                            placeholder="Nama (misal: XL)"
                                            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                value={newVariant.priceModifier}
                                                onChange={(e) => setNewVariant({ ...newVariant, priceModifier: e.target.value })}
                                                placeholder="+10000"
                                                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                                            />
                                            <button
                                                onClick={handleAddVariant}
                                                disabled={!newVariant.name || !newVariant.priceModifier}
                                                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Existing variants by category */}
                                {VARIANT_CATEGORIES.map(category => {
                                    const categoryVariants = selectedProduct.variants.filter(v => v.category === category.id);
                                    if (categoryVariants.length === 0) return null;

                                    return (
                                        <div key={category.id}>
                                            <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                                <Ruler className="w-4 h-4" />
                                                {category.label}
                                            </h3>
                                            <div className="space-y-2">
                                                {categoryVariants.map(variant => (
                                                    <div
                                                        key={variant.id}
                                                        className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-white font-medium">{variant.name}</span>
                                                            {variant.isDefault && (
                                                                <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">
                                                                    Default
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className={`font-medium ${variant.priceModifier > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                                                                {variant.priceModifier > 0 ? `+${formatCurrency(variant.priceModifier)}` : 'Gratis'}
                                                            </span>
                                                            <button
                                                                onClick={() => handleDeleteVariant(variant.id)}
                                                                className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="p-6 border-t border-slate-700">
                                <button
                                    onClick={() => setShowVariantsModal(false)}
                                    className="w-full px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                                >
                                    Selesai
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SupplierProductsPage;
