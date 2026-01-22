import React, { useState } from 'react';
import { X, ArrowRightCircle } from 'lucide-react';
import { Asset, UpdateAssetDTO } from '../../../lib/api/inventory.api';

interface CheckOutModalProps {
    asset: Asset;
    onConfirm: (id: string, data: UpdateAssetDTO) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function CheckOutModal({ asset, onConfirm, onCancel, isLoading }: CheckOutModalProps) {
    const [assignee, setAssignee] = useState('');
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onConfirm(asset.id, {
            status: 'IN_USE',
            assignedTo: assignee,
            storageLocation: location, // Using storageLocation to track current location while checked out
            notes: notes ? `${asset.notes ? asset.notes + '\n' : ''}[Check Out]: ${notes}` : asset.notes
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-dark-900 border border-dark-700 rounded-xl w-full max-w-md">
                <div className="p-4 border-b border-dark-700 flex items-center justify-between">
                    <h3 className="text-lg font-bold font-display text-white">Check Out Asset</h3>
                    <button onClick={onCancel} className="text-dark-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 bg-dark-800/50 border-b border-dark-700">
                    <p className="text-sm text-dark-400">Checking out item:</p>
                    <p className="font-semibold text-white">{asset.itemName}</p>
                    <p className="text-xs text-dark-400">{asset.brand} {asset.model}</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm text-dark-400 mb-1">Assign To (Coach/Member) *</label>
                        <input
                            type="text"
                            required
                            value={assignee}
                            onChange={(e) => setAssignee(e.target.value)}
                            className="input w-full"
                            placeholder="e.g. Coach Budi"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-dark-400 mb-1">Location / Unit *</label>
                        <input
                            type="text"
                            required
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="input w-full"
                            placeholder="e.g. SMAN 1 High School"
                        />
                        <p className="text-xs text-dark-500 mt-1">Where will this item be located?</p>
                    </div>

                    <div>
                        <label className="block text-sm text-dark-400 mb-1">Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="input w-full h-20 resize-none"
                            placeholder="Optional return date or specifics..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
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
                            {isLoading ? 'Processing...' : (
                                <span className="flex items-center gap-2">
                                    <ArrowRightCircle size={18} />
                                    Confirm Check Out
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
