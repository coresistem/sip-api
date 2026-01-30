import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Upload, Trash2, Eye, Download, Image, FileSpreadsheet, File, X, ChevronDown
} from 'lucide-react';
import { documentApi } from '@/modules/core/services/documentApi';

interface FileItem {
    id: string;
    name: string;
    type: 'document' | 'image' | 'spreadsheet' | 'other';
    size: string;
    uploadDate: string;
    uploadedBy: string;
    description?: string;
    isPublic: boolean;
    fileUrl: string;
}



const getFullFileUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    // If path starts with /, keep it relative to leverage the proxy (e.g. /uploads/...)
    if (path.startsWith('/')) return path;

    // If path is "uploads/foo.png", prepend /
    return `/${path}`;
};

const getDownloadFilename = (name: string, url: string) => {
    if (!url) return name;

    // Extract extension from URL (ignore query parameters)
    const urlParts = url.split('?')[0].split('.');
    const extension = urlParts.length > 1 ? urlParts.pop() : '';

    if (!extension || name.toLowerCase().endsWith(`.${extension.toLowerCase()}`)) {
        return name;
    }

    return `${name}.${extension}`;
};






const DOCUMENT_CATEGORIES = [
    'Photo',
    'KTP/KIA',
    'KartuKeluarga',
    'AktaLahir',
    'SuketSekolah',
    'Sertifikat',
    'Mutasi',
    'Medical',
    'Lainnya'
];

interface ProfileFileManagerProps {
    coreId: string;
    userId: string;
    userName: string;
}

import ConfirmationModal from '@/modules/core/components/common/ConfirmationModal';

export default function ProfileFileManager({ coreId, userId, userName }: ProfileFileManagerProps) {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadTitle, setUploadTitle] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(DOCUMENT_CATEGORIES[0]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileToDelete, setFileToDelete] = useState<string | null>(null);
    const [showCropModal, setShowCropModal] = useState(false);
    const [imageForCrop, setImageForCrop] = useState<File | null>(null);

    // Lock body scroll when any modal is open
    useEffect(() => {
        if (showUploadModal || showCropModal) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = 'unset'; };
        }
    }, [showUploadModal, showCropModal]);

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'document': return <FileText className="text-blue-400" size={20} />;
            case 'image': return <Image className="text-green-400" size={20} />;
            case 'spreadsheet': return <FileSpreadsheet className="text-emerald-400" size={20} />;
            default: return <File className="text-dark-400" size={20} />;
        }
    };

    // Fetch documents on mount
    useEffect(() => {
        if (coreId) {
            loadDocuments();
        }
    }, [coreId]);

    const loadDocuments = async () => {
        try {
            if (!coreId) return;
            const docs = await documentApi.getByCoreId(coreId);

            // Map GeneralDocument to FileItem
            const fileItems: FileItem[] = docs.map(d => ({
                id: d.id,
                name: d.title,
                type: 'document', // Simplified for UI
                size: (d.fileSize / 1024 / 1024).toFixed(2) + ' MB',
                uploadDate: new Date(d.createdAt).toISOString().split('T')[0],
                uploadedBy: d.uploadedBy,
                description: d.category,
                isPublic: d.isPublic,
                fileUrl: d.fileUrl
            }));

            setFiles(fileItems);
        } catch (error) {
            console.error('Error loading documents:', error);
        }
    };

    const handleDeleteClick = (id: string) => {
        setFileToDelete(id);
    };

    const handleConfirmDelete = async () => {
        if (!fileToDelete) return;
        try {
            await documentApi.delete(fileToDelete);
            setFiles(prev => prev.filter(f => f.id !== fileToDelete));
        } catch (error) {
            console.error('Error deleting file:', error);
            // Consider using a Toast here in future
            console.log('Failed to delete file');
        } finally {
            setFileToDelete(null);
        }
    };

    const handleFileSelect = (file: File) => {
        // Upload directly without cropping for all file types
        setSelectedFile(file);
    };

    const handleCroppedImage = (blob: Blob) => {
        // Convert blob to File (workaround for TypeScript)
        const file = Object.assign(blob, {
            name: 'profile-photo.jpg',
            lastModified: Date.now(),
        }) as File;
        setSelectedFile(file);
        setShowCropModal(false);
        setImageForCrop(null);
    };

    const handleUploadSubmit = async () => {
        if (!selectedFile || !uploadTitle || !coreId) return;

        try {
            const finalTitle = `${userName} - ${uploadTitle}`;

            await documentApi.upload(
                selectedFile,
                coreId,
                finalTitle,
                userName,
                userId,
                selectedCategory
            );

            await loadDocuments(); // Reload list
            setShowUploadModal(false);
            setUploadTitle('');
            setSelectedFile(null);
            setSelectedCategory(DOCUMENT_CATEGORIES[0]);
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload file');
        }
    };

    return (
        <div className="card mt-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    File Manager
                </h2>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-sm flex items-center gap-2 transition-colors"
                >
                    <Upload size={16} />
                    Upload File
                </button>
            </div>

            <div className="space-y-3">
                {files.length === 0 ? (
                    <div className="p-8 text-center bg-dark-800/50 rounded-lg border border-dark-700 border-dashed">
                        <FileText className="w-10 h-10 text-dark-500 mx-auto mb-3" />
                        <p className="text-dark-400">No files uploaded yet</p>
                    </div>
                ) : (
                    files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg border border-dark-700 hover:border-dark-600 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center">
                                    {getFileIcon(file.type)}
                                </div>
                                <div>
                                    <p className="font-medium text-sm">{file.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-dark-400">
                                        <span>{file.size}</span>
                                        <span>•</span>
                                        <span>Uploaded by {file.uploadedBy} on {file.uploadDate}</span>
                                        <span className="px-2 py-0.5 rounded-full bg-dark-700 text-xs text-primary-400 border border-dark-600">
                                            {file.description || 'Other'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a
                                    href={getFullFileUrl(file.fileUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors inline-flex items-center justify-center"
                                    title="Preview"
                                >
                                    <Eye size={16} />
                                </a>
                                <a
                                    href={getFullFileUrl(file.fileUrl)}
                                    download={getDownloadFilename(file.name, file.fileUrl)}
                                    className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors inline-flex items-center justify-center"
                                    title="Download"
                                >
                                    <Download size={16} />
                                </a>
                                <button
                                    onClick={() => handleDeleteClick(file.id)}
                                    className="p-2 text-dark-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Custom Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!fileToDelete}
                onClose={() => setFileToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete File"
                message="Are you sure you want to delete this file? This action cannot be undone."
                variant="danger"
                confirmLabel="Delete"
            />

            {/* Upload Modal */}
            {createPortal(
                <AnimatePresence>
                    {showUploadModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-950/95 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="card w-full max-w-md p-6 border border-dark-700 shadow-xl"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Upload className="w-5 h-5 text-primary-400" />
                                        Upload Document
                                    </h3>
                                    <button onClick={() => setShowUploadModal(false)} className="text-dark-400 hover:text-white">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="label">Category</label>
                                        <div className="relative">
                                            <select
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                className="input w-full appearance-none cursor-pointer"
                                            >
                                                {DOCUMENT_CATEGORIES.map((cat) => (
                                                    <option key={cat} value={cat}>
                                                        {cat}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="label">Document Title</label>
                                        <input
                                            type="text"
                                            className="input w-full"
                                            placeholder="e.g., Medical Certificate 2024"
                                            value={uploadTitle}
                                            onChange={(e) => setUploadTitle(e.target.value)}
                                            autoFocus
                                        />
                                    </div>

                                    <div>
                                        <label className="label">File</label>
                                        <div
                                            className="border-2 border-dashed border-dark-600 rounded-lg p-6 text-center hover:border-primary-500/50 transition-colors cursor-pointer bg-dark-800/50 relative"
                                        >
                                            <input
                                                type="file"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        handleFileSelect(e.target.files[0]);
                                                    }
                                                }}
                                            />
                                            <FileText className="w-8 h-8 mx-auto mb-2 text-dark-400" />
                                            <p className="text-sm text-dark-300">
                                                {selectedFile ? selectedFile.name : 'Click to select file'}
                                            </p>
                                            <p className="text-xs text-dark-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setShowUploadModal(false)}
                                        className="btn btn-secondary flex-1"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUploadSubmit}
                                        disabled={!uploadTitle || !selectedFile}
                                        className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Upload
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* Crop Modal removed for File Manager */}
        </div>
    );
}
