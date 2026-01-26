import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ChevronLeft, Save, Upload, Loader2, DollarSign, Tag, Shirt, Barcode } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../../../context/AuthContext';

interface ProductFormData {
    name: string;
    sku: string;
    category: string;
    basePrice: number;
    description: string;
    minOrderQty: number;
    isActive: boolean;
}

export default function ProductEditor() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [designUrl, setDesignUrl] = useState<string>('');
    const [designThumbnail, setDesignThumbnail] = useState<string>('');

    const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<ProductFormData>({
        defaultValues: {
            isActive: true,
            minOrderQty: 1,
            basePrice: 0
        }
    });

    useEffect(() => {
        if (isEditMode) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/jersey/products/${id}`);
            const product = response.data.data;
            reset({
                name: product.name,
                sku: product.sku,
                category: product.category,
                basePrice: product.basePrice,
                description: product.description,
                minOrderQty: product.minOrderQty,
                isActive: product.isActive
            });
            setDesignUrl(product.designUrl);
            setDesignThumbnail(product.designThumbnail);
        } catch (error) {
            console.error('Failed to fetch product:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data: ProductFormData) => {
        try {
            setIsSubmitting(true);
            const payload = {
                ...data,
                designUrl,
                designThumbnail
            };

            if (isEditMode) {
                await api.put(`/jersey/products/${id}`, payload);
            } else {
                await api.post('/jersey/products', payload);
            }

            navigate('/jersey/admin/products');
        } catch (error) {
            console.error('Failed to save product:', error);
            alert('Failed to save product. Please check your inputs and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // File Upload Handler (Reused from existing logic)
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            setIsLoading(true);
            const response = await api.post('/upload/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setDesignUrl(response.data.url);
            setDesignThumbnail(response.data.url); // Use same URL for thumbnail for now
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && isEditMode) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-primary-500" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/jersey/admin/products')}
                    className="p-2 rounded-lg bg-dark-800 text-dark-400 hover:text-white transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold font-display gradient-text">
                        {isEditMode ? 'Edit Product' : 'New Product'}
                    </h1>
                    <p className="text-dark-400 text-sm">Manage product details and pricing</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Main Info Card */}
                <div className="glass-panel p-6 rounded-xl space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-dark-300 mb-1">Product Name</label>
                            <div className="relative">
                                <Shirt className="absolute left-3 top-2.5 text-dark-400" size={18} />
                                <input
                                    {...register('name', { required: 'Product name is required' })}
                                    className="w-full bg-dark-900 border border-dark-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-primary-500 transition-colors"
                                    placeholder="e.g. Pro Archer Jersey 2024"
                                />
                            </div>
                            {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>}
                        </div>

                        {/* SKU */}
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-1">SKU (Stock Keeping Unit)</label>
                            <div className="relative">
                                <Barcode className="absolute left-3 top-2.5 text-dark-400" size={18} />
                                <input
                                    {...register('sku', { required: 'SKU is required' })}
                                    className="w-full bg-dark-900 border border-dark-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-primary-500 transition-colors"
                                    placeholder="e.g. JSY-001"
                                />
                            </div>
                            {errors.sku && <span className="text-red-500 text-xs mt-1">{errors.sku.message}</span>}
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-1">Category</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-2.5 text-dark-400" size={18} />
                                <select
                                    {...register('category', { required: 'Category is required' })}
                                    className="w-full bg-dark-900 border border-dark-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-primary-500 transition-colors appearance-none"
                                >
                                    <option value="">Select Category</option>
                                    <option value="Jersey">Jersey</option>
                                    <option value="Pants">Pants</option>
                                    <option value="Jacket">Jacket</option>
                                    <option value="Accessories">Accessories</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            {errors.category && <span className="text-red-500 text-xs mt-1">{errors.category.message}</span>}
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-1">Base Price (IDR)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 text-dark-400" size={18} />
                                <input
                                    type="number"
                                    {...register('basePrice', { required: 'Price is required', min: 0 })}
                                    className="w-full bg-dark-900 border border-dark-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-primary-500 transition-colors"
                                    placeholder="0"
                                />
                            </div>
                            {errors.basePrice && <span className="text-red-500 text-xs mt-1">{errors.basePrice.message}</span>}
                        </div>

                        {/* Min Order Qty */}
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-1">Min. Order Qty</label>
                            <input
                                type="number"
                                {...register('minOrderQty', { required: true, min: 1 })}
                                className="w-full bg-dark-900 border border-dark-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary-500 transition-colors"
                                placeholder="1"
                            />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-dark-300 mb-1">Description</label>
                            <textarea
                                {...register('description')}
                                rows={4}
                                className="w-full bg-dark-900 border border-dark-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary-500 transition-colors resize-none"
                                placeholder="Product details..."
                            />
                        </div>
                    </div>
                </div>

                {/* Image Upload */}
                <div className="glass-panel p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-white mb-4">Product Image</h3>
                    <div className="flex items-start gap-6">
                        <div className="w-32 h-32 rounded-lg bg-dark-800 border-2 border-dashed border-dark-600 flex items-center justify-center overflow-hidden">
                            {designUrl ? (
                                <img src={designUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <Shirt className="text-dark-600" size={32} />
                            )}
                        </div>
                        <div className="flex-1">
                            <label className="inline-flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white rounded-lg cursor-pointer transition-colors border border-dark-600">
                                <Upload size={18} />
                                <span>Upload Image</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                            </label>
                            <p className="text-xs text-dark-400 mt-2">
                                Recommended: 800x800px, JPG or PNG.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/jersey/admin/products')}
                        className="px-6 py-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isSubmitting}
                        type="submit"
                        className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Product
                    </motion.button>
                </div>
            </form>
        </div>
    );
}
