import React, { useState, useRef, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import {
    Package,
    Upload,
    Plus,
    Trash2,
    DollarSign,
    Tag,
    Layers,
    Image as ImageIcon,
    Save,
    X,
    AlertCircle,
    Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ImageCropModal from '@/components/common/ImageCropModal';
import { api } from '@/context/AuthContext';
import marketplaceService from '@/services/marketplaceService';

// --- Types ---
interface VariantOption {
    name: string; // e.g. "XL", "Red"
    priceModifier: number; // e.g. 5000
}

interface VariantType {
    category: string; // "SIZE", "COLOR", "DRAW_WEIGHT"
    options: VariantOption[];
}

interface ProductFormValues {
    name: string;
    description: string;
    category: string;
    sku: string;
    basePrice: number;
    stock: number;
    minOrderQty: number;
    variants: VariantType[];
}

interface AddProductFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

// --- Component ---
export default function AddProductForm({ onClose, onSuccess }: AddProductFormProps) {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [croppedImageBlob, setCroppedImageBlob] = useState<Blob | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [categories, setCategories] = useState<any[]>([]);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProductFormValues>({
        defaultValues: {
            category: '', // No default, force selection or fetch will set first?
            minOrderQty: 1,
            stock: 100,
            variants: []
        }
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load Categories
    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const res = await marketplaceService.getCategories();
            if (res.success) {
                setCategories(res.data);
            }
        } catch (error) {
            console.error("Failed to load categories", error);
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            const res = await marketplaceService.createCategory(newCategoryName);
            if (res.success) {
                toast.success('Category created');
                setCategories([...categories, res.data]);
                setValue('category', res.data.slug || res.data.name); // Auto-select
                setIsCreatingCategory(false);
                setNewCategoryName('');
            }
        } catch (error) {
            toast.error('Failed to create category');
        }
    };

    // Watch variants for preview calculation
    const watchedVariants = watch('variants');
    const basePrice = watch('basePrice') || 0;

    // --- Image Handling ---
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
            setShowCropper(true);
        }
    };

    const handleCropSave = (blob: Blob) => {
        setCroppedImageBlob(blob);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setShowCropper(false);
    };

    // --- Submission ---
    const onSubmit = async (data: ProductFormValues) => {
        if (!croppedImageBlob) {
            toast.error("Please upload a product image");
            return;
        }

        setUploading(true);
        try {
            // 1. Upload Image (Mocked or Real)
            const formData = new FormData();
            formData.append('file', croppedImageBlob, 'product.jpg');
            // Assuming a generic upload endpoint exists, or we use the specific product upload flow
            // For now, we'll simulate the upload returning a URL
            // const uploadRes = await api.post('/upload', formData); 
            const designUrl = "https://placehold.co/800x800?text=Product"; // Placeholder until upload API verified

            // 2. Prepare Payload for JerseyProduct
            // Flatten variants for the backend (which expects a flat list of variants linked to product)
            // But wait, the UI groups them by Type. We need to convert.

            const payload = {
                ...data,
                designUrl,
                designThumbnail: designUrl, // Use same for now
                variants: data.variants.flatMap(v =>
                    v.options.map(opt => ({
                        category: v.category,
                        name: opt.name,
                        priceModifier: opt.priceModifier
                    }))
                )
            };

            // 3. Create Product
            // NOTE: Using the generic 'marketplace' endpoint we planned
            // If that doesn't exist yet, we might fail. 
            // We'll try the jersey creation endpoint as fallback or primary.
            await api.post('/jersey/products', payload);

            toast.success("Product created successfully!");
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Failed to create product");
        } finally {
            setUploading(false);
        }
    };

    // --- Variants Field Array ---
    const { fields, append, remove } = useFieldArray({
        control,
        name: "variants"
    });

    return (
        <div className="flex flex-col h-full bg-dark-900 text-white overflow-y-auto custom-scrollbar p-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Package className="text-primary-500" />
                        Add New Product
                    </h2>
                    <p className="text-dark-400 text-xs mt-1">Create a new item for your unified catalog.</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-dark-800 rounded-lg text-dark-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-5xl mx-auto w-full">

                {/* 1. Basic Info & Image Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left: Image Upload */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="font-semibold text-sm text-dark-300 uppercase tracking-wider">Product Image</div>

                        <div
                            className={`
                                relative aspect-square rounded-2xl border-2 border-dashed border-dark-700 bg-dark-800/50 
                                flex flex-col items-center justify-center cursor-pointer overflow-hidden group
                                hover:border-primary-500/50 hover:bg-dark-800 transition-all
                            `}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {previewUrl ? (
                                <>
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <div className="flex items-center gap-2 text-white font-medium">
                                            <Upload size={20} /> Change Photo
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-6">
                                    <div className="w-16 h-16 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-4 text-dark-400 group-hover:text-primary-400 group-hover:scale-110 transition-all">
                                        <ImageIcon size={32} />
                                    </div>
                                    <p className="font-medium text-dark-200">Click to upload</p>
                                    <p className="text-xs text-dark-500 mt-2">Square format recommended. <br />You can crop after selecting.</p>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileSelect}
                            />
                        </div>

                        {/* Drag to fit hint */}
                        {previewUrl && (
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setShowCropper(true)}
                                    className="text-xs text-primary-400 hover:text-primary-300 underline"
                                >
                                    Re-adjust Crop
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right: Basic Fields */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-dark-300 mb-1">Product Name</label>
                                <input
                                    {...register('name', { required: 'Name is required' })}
                                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary-500 transition-colors"
                                    placeholder="e.g. Hoyt Formula Xi Riser"
                                />
                                {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-1">Detailed SKU</label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-2.5 text-dark-500" size={16} />
                                    <input
                                        {...register('sku', { required: 'SKU is required' })}
                                        className="w-full bg-dark-800 border border-dark-700 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary-500 transition-colors font-mono text-sm"
                                        placeholder="HOYT-XI-001"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-1">Category</label>
                                {isCreatingCategory ? (
                                    <div className="flex gap-2">
                                        <input
                                            autoFocus
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            placeholder="New Category Name"
                                            className="w-full bg-dark-800 border border-primary-500 rounded-xl px-4 py-2 text-white focus:outline-none"
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateCategory())}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleCreateCategory}
                                            className="px-4 bg-primary-500 hover:bg-primary-600 rounded-xl text-white"
                                        >
                                            <Save size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsCreatingCategory(false)}
                                            className="px-3 bg-dark-700 hover:bg-dark-600 rounded-xl text-white"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <select
                                            {...register('category', { required: 'Category is required' })}
                                            className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary-500 transition-colors appearance-none"
                                        >
                                            <option value="">Select Category...</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.slug || cat.name}>{cat.name}</option>
                                            ))}
                                            {categories.length === 0 && (
                                                <option disabled>No categories found</option>
                                            )}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setIsCreatingCategory(true)}
                                            className="px-3 bg-dark-800 border border-dark-700 hover:border-primary-500 rounded-xl text-dark-400 hover:text-primary-500 transition-colors"
                                            title="Create New Category"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-1">Base Price (IDR)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-2.5 text-dark-400 font-medium">Rp</span>
                                    <input
                                        type="number"
                                        {...register('basePrice', { required: true, min: 0 })}
                                        className="w-full bg-dark-800 border border-dark-700 rounded-xl pl-12 pr-4 py-2 text-white focus:outline-none focus:border-primary-500 transition-colors font-mono"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-1">Stock</label>
                                    <input
                                        type="number"
                                        {...register('stock', { min: 0 })}
                                        className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-1">Min Order</label>
                                    <input
                                        type="number"
                                        {...register('minOrderQty', { min: 1 })}
                                        className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-dark-300 mb-1">Description</label>
                                <textarea
                                    {...register('description')}
                                    rows={2}
                                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary-500 transition-colors resize-none"
                                    placeholder="Describe the product features, specs, and included items..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-dark-800" />

                {/* 2. Variants Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Layers className="text-primary-500" />
                                Product Variants
                            </h3>
                            <p className="text-dark-400 text-sm">Define options like Size, Color, or Draw Weight.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => append({ category: 'SIZE', options: [{ name: '', priceModifier: 0 }] })}
                            className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white rounded-lg transition-colors border border-dark-700"
                        >
                            <Plus size={16} /> Add Variant Type
                        </button>
                    </div>

                    <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                        {fields.map((field, index) => (
                            <VariantGroup
                                key={field.id}
                                index={index}
                                control={control}
                                remove={remove}
                                register={register}
                            />
                        ))}

                        {fields.length === 0 && (
                            <div className="p-6 rounded-xl border-2 border-dashed border-dark-700 bg-dark-800/30 text-center">
                                <p className="text-dark-400 text-sm">No variants added. This product will be sold as a single item.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-4 pt-8 border-t border-dark-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl bg-dark-800 text-dark-300 hover:bg-dark-700 transition-colors font-medium border border-dark-700"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={uploading}
                        className={`
                            px-8 py-3 rounded-xl bg-primary-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-primary-500/20
                            hover:bg-primary-600 transition-all transform active:scale-95
                            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        {uploading ? 'Creating...' : (
                            <>
                                <Save size={20} /> Create Product
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Cropper Modal */}
            <ImageCropModal
                isOpen={showCropper}
                onClose={() => setShowCropper(false)}
                onSave={handleCropSave}
                imageFile={imageFile}
                aspectRatio={1} // Square for product cards
                title="Crop Product Image"
            />
        </div>
    );
}

// --- Sub-component for Variant Group ---
function VariantGroup({ index, control, remove, register }: any) {
    const { fields, append, remove: removeOption } = useFieldArray({
        control,
        name: `variants.${index}.options`
    });

    return (
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 relative group">
            <button
                type="button"
                onClick={() => remove(index)}
                className="absolute right-4 top-4 text-dark-500 hover:text-red-400 transition-colors"
            >
                <Trash2 size={16} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-dark-400 uppercase mb-2">Variant Name</label>
                    <select
                        {...register(`variants.${index}.category`)}
                        className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:border-primary-500 outline-none"
                    >
                        <option value="SIZE">Size</option>
                        <option value="COLOR">Color</option>
                        <option value="DRAW_WEIGHT">Draw Weight</option>
                        <option value="DRAW_LENGTH">Draw Length</option>
                        <option value="DEXTERITY">Dexterity (RH/LH)</option>
                        <option value="MATERIAL">Material</option>
                    </select>
                </div>

                <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-dark-400 uppercase mb-2">Options</label>
                    <div className="space-y-3">
                        {fields.map((option: any, optIndex: number) => (
                            <div key={option.id} className="flex items-center gap-3">
                                <input
                                    {...register(`variants.${index}.options.${optIndex}.name`)}
                                    placeholder="Option Name (e.g. XL, Red, 30#)"
                                    className="flex-1 bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:border-primary-500 outline-none"
                                />
                                <div className="relative w-32">
                                    <span className="absolute left-3 top-2 text-dark-500 text-xs">+Rp</span>
                                    <input
                                        type="number"
                                        {...register(`variants.${index}.options.${optIndex}.priceModifier`)}
                                        placeholder="0"
                                        className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-9 pr-3 py-2 text-white text-sm focus:border-primary-500 outline-none font-mono"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeOption(optIndex)}
                                    className="p-2 text-dark-500 hover:text-red-400 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => append({ name: '', priceModifier: 0 })}
                            className="text-xs text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1 mt-2"
                        >
                            <Plus size={12} /> Add Option
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
