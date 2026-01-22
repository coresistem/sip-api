import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { CreateAssetDTO, Asset, AssetCategory } from '../../../lib/api/inventory.api';

interface InventoryFormProps {
    initialData?: Asset | null;
    categories: AssetCategory[];
    onSubmit: (data: CreateAssetDTO) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

const CONDITIONS = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'];
const STATUSES = ['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED'];

export default function InventoryForm({ initialData, categories, onSubmit, onCancel, isLoading }: InventoryFormProps) {
    const [formData, setFormData] = useState<CreateAssetDTO>({
        itemName: '',
        category: categories.length > 0 ? categories[0].name : '',
        brandModel: '', // Merged field
        quantity: 1, // Replaces serialNumber
        status: 'AVAILABLE',
        condition: 'GOOD',
        storageLocation: '',
        assignedTo: '',
        purchaseDate: '',
        purchasePrice: 0,
        supplier: '',
        notes: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                itemName: initialData.itemName,
                category: initialData.category,
                brandModel: [initialData.brand, initialData.model].filter(Boolean).join(' - '), // Combine for display
                quantity: initialData.quantity || 1,
                status: initialData.status,
                condition: initialData.condition,
                storageLocation: initialData.storageLocation || '',
                assignedTo: initialData.assignedTo || '',
                purchaseDate: initialData.purchaseDate ? new Date(initialData.purchaseDate).toISOString().split('T')[0] : '',
                purchasePrice: initialData.purchasePrice || 0,
                supplier: initialData.supplier || '',
                notes: initialData.notes || ''
            });
        } else if (categories.length > 0 && !formData.category) {
            setFormData(prev => ({ ...prev, category: categories[0].name }));
        }
    }, [initialData, categories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Split brandModel back into brand and model if possible, or just use brand
        // Approach: Save full string to brand, leave model empty? Or split?
        // User said: "Brand - Model can use 1 box". Let's assume they want to type "Hoyt - Formula Xi".
        // We will save "Hoyt" as Brand and "Formula Xi" as Model if " - " exists, otherwise all in Brand.
        let brand = formData.brandModel || '';
        let model = '';
        if (brand.includes(' - ')) {
            const parts = brand.split(' - ');
            brand = parts[0];
            model = parts.slice(1).join(' - ');
        }

        const submissionData = {
            ...formData,
            brand,
            model
        };

        delete submissionData.brandModel; // Remove temp field

        await onSubmit(submissionData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-dark-900 border border-dark-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-dark-900 border-b border-dark-700 p-4 flex items-center justify-between z-10">
                    <h2 className="text-xl font-bold font-display">
                        {initialData ? 'Edit Asset' : 'Add New Asset'}
                    </h2>
                    <button onClick={onCancel} className="text-dark-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm text-dark-400 mb-1">Item Name *</label>
                            <input
                                type="text"
                                name="itemName"
                                required
                                value={formData.itemName}
                                onChange={handleChange}
                                className="input w-full"
                                placeholder="e.g., Recurve Bow Set"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-dark-400 mb-1">Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="input w-full"
                                required
                            >
                                <option value="" disabled>Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-dark-400 mb-1">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="input w-full"
                            >
                                {STATUSES.map(stat => (
                                    <option key={stat} value={stat}>{stat.replace('_', ' ')}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm text-dark-400 mb-1">Brand - Model</label>
                            <input
                                type="text"
                                name="brandModel"
                                value={formData.brandModel || ''}
                                onChange={handleChange}
                                className="input w-full"
                                placeholder="e.g., Hoyt - Formula Xi"
                            />
                            <p className="text-xs text-dark-500 mt-1">Format: Brand - Model (e.g. Easton - X10)</p>
                        </div>

                        <div>
                            <label className="block text-sm text-dark-400 mb-1">Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                className="input w-full"
                                min="1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-dark-400 mb-1">Condition</label>
                            <select
                                name="condition"
                                value={formData.condition}
                                onChange={handleChange}
                                className="input w-full"
                            >
                                {CONDITIONS.map(cond => (
                                    <option key={cond} value={cond}>{cond}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="border-t border-dark-700 pt-4">
                        <h3 className="text-sm font-semibold text-white mb-4">Location & Assignment</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-dark-400 mb-1">Storage Location</label>
                                <input
                                    type="text"
                                    name="storageLocation"
                                    value={formData.storageLocation}
                                    onChange={handleChange}
                                    className="input w-full"
                                    placeholder="e.g., Warehouse Shelf A1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-dark-400 mb-1">Assigned To</label>
                                <input
                                    type="text"
                                    name="assignedTo"
                                    value={formData.assignedTo}
                                    onChange={handleChange}
                                    className="input w-full"
                                    placeholder="Member/Coach Name"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-dark-700 pt-4">
                        <h3 className="text-sm font-semibold text-white mb-4">Purchase Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm text-dark-400 mb-1">Purchase Date</label>
                                <input
                                    type="date"
                                    name="purchaseDate"
                                    value={formData.purchaseDate}
                                    onChange={handleChange}
                                    className="input w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-dark-400 mb-1">Price (IDR)</label>
                                <input
                                    type="number"
                                    name="purchasePrice"
                                    value={formData.purchasePrice}
                                    onChange={handleChange}
                                    className="input w-full"
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-dark-400 mb-1">Supplier</label>
                                <input
                                    type="text"
                                    name="supplier"
                                    value={formData.supplier}
                                    onChange={handleChange}
                                    className="input w-full"
                                    placeholder="Store Name"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-dark-400 mb-1">Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            className="input w-full h-24 resize-none"
                            placeholder="Additional details..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-dark-700">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn btn-ghost"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Save size={18} />
                                    Save Asset
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
