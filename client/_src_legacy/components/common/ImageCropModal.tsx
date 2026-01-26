import React from 'react';

interface ImageCropModalProps {
    isOpen: boolean;
    onClose: () => void;
    image: string;
    onCropComplete: (croppedImage: string) => void;
    aspect?: number;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({ isOpen, onClose, image, onCropComplete }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl max-w-lg w-full">
                <h3 className="text-xl font-bold text-white mb-4">Crop Image</h3>
                <div className="bg-slate-800 rounded-lg aspect-square mb-4 flex items-center justify-center text-slate-400">
                    Image Crop Placeholder
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
                    <button onClick={() => onCropComplete(image)} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors">Skip Crop</button>
                </div>
            </div>
        </div>
    );
};

export default ImageCropModal;
