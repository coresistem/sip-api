import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCw, Check, Upload } from 'lucide-react';

interface AvatarCropModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (croppedImage: Blob) => void;
    imageFile: File | null;
}

export default function AvatarCropModal({ isOpen, onClose, onSave, imageFile }: AvatarCropModalProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    // Load image when file changes
    useEffect(() => {
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImageSrc(e.target?.result as string);
                setScale(1);
                setPosition({ x: 0, y: 0 });
            };
            reader.readAsDataURL(imageFile);
        }
    }, [imageFile]);

    // Load image element
    useEffect(() => {
        if (imageSrc) {
            const img = new Image();
            img.onload = () => {
                imageRef.current = img;
            };
            img.src = imageSrc;
        }
    }, [imageSrc]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = 'unset'; };
        }
    }, [isOpen]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (isDragging) {
            const touch = e.touches[0];
            setPosition({
                x: touch.clientX - dragStart.x,
                y: touch.clientY - dragStart.y
            });
        }
    };

    const handleSave = () => {
        if (!canvasRef.current || !imageRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = 256; // Output size
        canvas.width = size;
        canvas.height = size;

        // Calculate crop area
        const cropSize = 200; // Visible circle size
        const centerX = cropSize / 2;
        const centerY = cropSize / 2;

        // Draw square crop
        ctx.beginPath();
        // ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.rect(0, 0, size, size);
        ctx.closePath();
        ctx.clip();

        // Draw image
        const img = imageRef.current;
        const ratio = size / cropSize;

        // Calculate destination dimensions (scaled by zoom AND output ratio)
        const destWidth = img.width * scale * ratio;
        const destHeight = img.height * scale * ratio;

        // Calculate destination position (center of canvas + offset - half dimension)
        const destX = (size / 2) + (position.x * ratio) - (destWidth / 2);
        const destY = (size / 2) + (position.y * ratio) - (destHeight / 2);

        ctx.drawImage(
            img,
            destX,
            destY,
            destWidth,
            destHeight
        );

        canvas.toBlob((blob) => {
            if (blob) {
                onSave(blob);
            }
        }, 'image/jpeg', 0.9);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-950/95 backdrop-blur-md"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-dark-900 rounded-2xl border border-dark-700 w-full max-w-md p-6"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Upload className="w-5 h-5 text-primary-400" />
                                Adjust Profile Photo
                            </h3>
                            <button onClick={onClose} className="text-dark-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Crop Area */}
                        <div
                            className="relative w-full aspect-square bg-dark-800 rounded-xl overflow-hidden cursor-move mb-4"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleMouseUp}
                        >
                            {/* Image */}
                            {imageSrc && (
                                <img
                                    src={imageSrc}
                                    alt="Preview"
                                    className="absolute pointer-events-none select-none"
                                    style={{
                                        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${scale})`,
                                        left: '50%',
                                        top: '50%',
                                        maxWidth: 'none'
                                    }}
                                    draggable={false}
                                />
                            )}

                            {/* Square Outline Guide */}
                            <div className="absolute inset-0 pointer-events-none">
                                {/* Dark overlay with square cutout */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div
                                        className="relative"
                                        style={{
                                            width: '200px',
                                            height: '200px'
                                        }}
                                    >
                                        {/* Square border guide (matches rounded-2xl of profile) */}
                                        <div
                                            className="absolute inset-0 rounded-2xl border-4 border-white/80 shadow-[0_0_0_1000px_rgba(0,0,0,0.6)]"
                                        />
                                        {/* Corner guides */}
                                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-white/80 rounded" />
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-white/80 rounded" />
                                        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-1 h-4 bg-white/80 rounded" />
                                        <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-1 h-4 bg-white/80 rounded" />
                                    </div>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="absolute bottom-2 left-0 right-0 text-center">
                                <span className="text-xs text-white/80 bg-dark-900/80 px-3 py-1 rounded-full">
                                    Drag to adjust position
                                </span>
                            </div>
                        </div>

                        {/* Zoom Controls */}
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <button
                                onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                                className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
                            >
                                <ZoomOut size={20} />
                            </button>
                            <div className="flex-1 h-2 bg-dark-800 rounded-full relative">
                                <div
                                    className="h-full bg-primary-500 rounded-full transition-all"
                                    style={{ width: `${((scale - 0.5) / 1.5) * 100}%` }}
                                />
                                <input
                                    type="range"
                                    min="0.5"
                                    max="2"
                                    step="0.1"
                                    value={scale}
                                    onChange={(e) => setScale(parseFloat(e.target.value))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                            <button
                                onClick={() => setScale(s => Math.min(2, s + 0.1))}
                                className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
                            >
                                <ZoomIn size={20} />
                            </button>
                            <button
                                onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }}
                                className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
                                title="Reset"
                            >
                                <RotateCw size={18} />
                            </button>
                        </div>

                        {/* Hidden canvas for cropping */}
                        <canvas ref={canvasRef} className="hidden" />

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 rounded-xl bg-dark-800 text-dark-300 hover:bg-dark-700 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 px-4 py-3 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors font-medium flex items-center justify-center gap-2"
                            >
                                <Check size={18} />
                                Save Photo
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
