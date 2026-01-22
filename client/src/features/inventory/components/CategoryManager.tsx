import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { inventoryApi, AssetCategory } from '../../../lib/api/inventory.api';
import { toast } from 'react-toastify';

interface CategoryManagerProps {
    onClose: () => void;
}

export default function CategoryManager({ onClose }: CategoryManagerProps) {
    const [categories, setCategories] = useState<AssetCategory[]>([]);
    const [newCategory, setNewCategory] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null); // Track which category to delete

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await inventoryApi.getCategories();
            // response.data is the array based on my backend implementation: res.json({ success: true, data: categories })
            // Wait, inventoryApi.getCategories returns response.data directly in the api wrapper? 
            // In api wrapper: "return response.data;" -> so it returns { success: true, data: [...] }
            // Actually let's check the api wrapper return.
            // "return response.data" -> standard axios response.data is the body.
            // so result is { success: true, data: categories }
            // modifying api call to get data.data or handle it here.

            // Let's assume the API returns the body, so we need .data
            if (response.success) {
                setCategories(response.data);
            }
        } catch (error) {
            toast.error('Failed to load categories');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        setIsSubmitting(true);
        try {
            const response = await inventoryApi.createCategory(newCategory);
            if (response.success) {
                setCategories([...categories, response.data]);
                setNewCategory('');
                toast.success('Category added');
            }
        } catch (error) {
            toast.error('Failed to add category');
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await inventoryApi.deleteCategory(deleteId);
            setCategories(categories.filter(c => c.id !== deleteId));
            toast.success('Category deleted');
        } catch (error) {
            toast.error('Failed to delete category');
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-dark-900 border border-dark-700 rounded-xl w-full max-w-md max-h-[80vh] flex flex-col">
                <div className="p-4 border-b border-dark-700 flex items-center justify-between">
                    <h3 className="text-lg font-bold font-display text-white">Manage Categories</h3>
                    <button onClick={onClose} className="text-dark-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 border-b border-dark-700">
                    <form onSubmit={handleAdd} className="flex gap-2">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="New Category Name..."
                            className="input flex-1"
                            disabled={isSubmitting}
                        />
                        <button
                            type="submit"
                            className="btn btn-primary p-2"
                            disabled={isSubmitting || !newCategory.trim()}
                        >
                            {isSubmitting ? <span className="animate-spin">...</span> : <Plus size={20} />}
                        </button>
                    </form>
                </div>

                <div className="overflow-y-auto flex-1 p-2">
                    {isLoading ? (
                        <p className="text-center text-dark-400 py-4">Loading...</p>
                    ) : categories.length === 0 ? (
                        <p className="text-center text-dark-400 py-4">No categories found.</p>
                    ) : (
                        <div className="space-y-1">
                            {categories.map(cat => (
                                <div key={cat.id} className="flex items-center justify-between p-3 bg-dark-800 rounded-lg group">
                                    <span className="text-white font-medium">{cat.name}</span>
                                    <button
                                        onClick={() => setDeleteId(cat.id)}
                                        className="text-dark-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-dark-900 border border-dark-700 rounded-xl w-full max-w-sm p-6 shadow-2xl transform transition-all scale-100">
                        <h3 className="text-lg font-bold text-white mb-2">Delete Category?</h3>
                        <p className="text-dark-300 mb-6 text-sm">
                            Are you sure you want to delete this category? Items currently using it will retain the text value, but it won't be available for new items.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="btn btn-ghost text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="btn bg-red-500 hover:bg-red-600 text-white text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
