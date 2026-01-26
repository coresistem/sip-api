import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Filter, FileText, Edit, Trash2, Download, Eye, X,
    ChevronDown, ChevronUp, MoreHorizontal, Upload, Image, File, FileSpreadsheet
} from 'lucide-react';

interface FileItem {
    id: string;
    name: string;
    type: 'document' | 'image' | 'spreadsheet' | 'other';
    size: string;
    uploadedBy: string;
    uploadDate: string;
    url?: string;
}

// Sample data
const SAMPLE_FILES: FileItem[] = [
    { id: '1', name: 'Club_Registration_2024.pdf', type: 'document', size: '2.4 MB', uploadedBy: 'Budi Santoso', uploadDate: '2024-01-15' },
    { id: '2', name: 'Training_Schedule_Q1.xlsx', type: 'spreadsheet', size: '156 KB', uploadedBy: 'Ahmad Trainer', uploadDate: '2024-01-10' },
    { id: '3', name: 'Team_Photo_2023.jpg', type: 'image', size: '4.1 MB', uploadedBy: 'Dewi Asisten', uploadDate: '2023-12-20' },
    { id: '4', name: 'Athlete_Records.xlsx', type: 'spreadsheet', size: '245 KB', uploadedBy: 'Fitri Amelia', uploadDate: '2024-02-01' },
    { id: '5', name: 'Competition_Results.pdf', type: 'document', size: '890 KB', uploadedBy: 'Ahmad Trainer', uploadDate: '2024-02-05' },
    { id: '6', name: 'Equipment_Inventory.xlsx', type: 'spreadsheet', size: '178 KB', uploadedBy: 'Gunawan Wijaya', uploadDate: '2024-01-25' },
    { id: '7', name: 'Club_Logo.png', type: 'image', size: '512 KB', uploadedBy: 'Budi Santoso', uploadDate: '2022-06-01' },
    { id: '8', name: 'Safety_Guidelines.pdf', type: 'document', size: '1.2 MB', uploadedBy: 'Ahmad Trainer', uploadDate: '2023-08-15' },
];

type SortField = 'name' | 'type' | 'size' | 'uploadedBy' | 'uploadDate';
type SortOrder = 'asc' | 'desc';

export default function FileManagerPage() {
    const [files, setFiles] = useState<FileItem[]>(SAMPLE_FILES);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [sortField, setSortField] = useState<SortField>('uploadDate');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewFile, setViewFile] = useState<FileItem | null>(null);
    const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

    useEffect(() => {
        setTimeout(() => setLoading(false), 500);
    }, []);

    // Sorting
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return null;
        return sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
    };

    // Filtering & Sorting
    const sortedFiles = [...files]
        .filter(f => {
            const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                f.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === 'all' || f.type === typeFilter;
            return matchesSearch && matchesType;
        })
        .sort((a, b) => {
            let aVal = '', bVal = '';
            switch (sortField) {
                case 'name': aVal = a.name; bVal = b.name; break;
                case 'type': aVal = a.type; bVal = b.type; break;
                case 'size': aVal = a.size; bVal = b.size; break;
                case 'uploadedBy': aVal = a.uploadedBy; bVal = b.uploadedBy; break;
                case 'uploadDate': aVal = a.uploadDate; bVal = b.uploadDate; break;
            }
            return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        });

    // Selection
    const toggleSelectAll = () => {
        if (selectedFiles.length === sortedFiles.length) {
            setSelectedFiles([]);
        } else {
            setSelectedFiles(sortedFiles.map(f => f.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedFiles(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // CRUD Actions
    const handleView = (file: FileItem) => {
        setViewFile(file);
        setShowViewModal(true);
        setActionMenuOpen(null);
    };

    const handleDeleteClick = (file: FileItem) => {
        setFileToDelete(file);
        setShowDeleteModal(true);
        setActionMenuOpen(null);
    };

    const confirmDelete = () => {
        if (!fileToDelete) return;
        setFiles(prev => prev.filter(f => f.id !== fileToDelete.id));
        setShowDeleteModal(false);
        setFileToDelete(null);
    };

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'document': return <FileText className="text-blue-400" size={20} />;
            case 'image': return <Image className="text-green-400" size={20} />;
            case 'spreadsheet': return <FileSpreadsheet className="text-emerald-400" size={20} />;
            default: return <File className="text-dark-400" size={20} />;
        }
    };

    const getTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            'document': 'bg-blue-500/20 text-blue-400',
            'image': 'bg-green-500/20 text-green-400',
            'spreadsheet': 'bg-emerald-500/20 text-emerald-400',
            'other': 'bg-dark-600 text-dark-400',
        };
        return colors[type] || colors['other'];
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold">File Manager</h1>
                    <p className="text-dark-400">Documents and media ({files.length} files)</p>
                </div>
                <button onClick={() => setShowUploadModal(true)} className="btn btn-primary">
                    <Upload size={18} />
                    Upload File
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex gap-3 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10 w-full"
                        />
                    </div>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="input"
                    >
                        <option value="all">All Types</option>
                        <option value="document">Documents</option>
                        <option value="image">Images</option>
                        <option value="spreadsheet">Spreadsheets</option>
                    </select>
                </div>

                {selectedFiles.length > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-dark-400">{selectedFiles.length} selected</span>
                        <button className="btn btn-secondary text-sm py-1.5">
                            <Download size={16} />
                            Download
                        </button>
                        <button className="btn btn-danger text-sm py-1.5">
                            <Trash2 size={16} />
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-dark-700/50">
                                <th className="text-left p-4 w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedFiles.length === sortedFiles.length && sortedFiles.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-dark-500 bg-dark-800"
                                    />
                                </th>
                                <th className="text-left p-4">
                                    <button onClick={() => handleSort('name')} className="flex items-center gap-1 text-sm font-semibold text-dark-300 hover:text-white">
                                        Name {getSortIcon('name')}
                                    </button>
                                </th>
                                <th className="text-left p-4 hidden md:table-cell">
                                    <button onClick={() => handleSort('type')} className="flex items-center gap-1 text-sm font-semibold text-dark-300 hover:text-white">
                                        Type {getSortIcon('type')}
                                    </button>
                                </th>
                                <th className="text-left p-4 hidden lg:table-cell">
                                    <button onClick={() => handleSort('size')} className="flex items-center gap-1 text-sm font-semibold text-dark-300 hover:text-white">
                                        Size {getSortIcon('size')}
                                    </button>
                                </th>
                                <th className="text-left p-4 hidden lg:table-cell">
                                    <button onClick={() => handleSort('uploadedBy')} className="flex items-center gap-1 text-sm font-semibold text-dark-300 hover:text-white">
                                        Uploaded By {getSortIcon('uploadedBy')}
                                    </button>
                                </th>
                                <th className="text-left p-4 hidden md:table-cell">
                                    <button onClick={() => handleSort('uploadDate')} className="flex items-center gap-1 text-sm font-semibold text-dark-300 hover:text-white">
                                        Date {getSortIcon('uploadDate')}
                                    </button>
                                </th>
                                <th className="text-right p-4 w-20">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i} className="border-b border-dark-800/50">
                                        <td colSpan={7} className="p-4">
                                            <div className="h-10 bg-dark-800/50 rounded animate-pulse" />
                                        </td>
                                    </tr>
                                ))
                            ) : sortedFiles.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center">
                                        <FileText className="w-12 h-12 mx-auto mb-4 text-dark-500" />
                                        <p className="text-dark-400">No files found</p>
                                    </td>
                                </tr>
                            ) : (
                                sortedFiles.map((file, index) => (
                                    <motion.tr
                                        key={file.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.02 }}
                                        className={`border-b border-dark-800/50 hover:bg-dark-800/30 transition-colors ${selectedFiles.includes(file.id) ? 'bg-primary-500/10' : ''}`}
                                    >
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedFiles.includes(file.id)}
                                                onChange={() => toggleSelect(file.id)}
                                                className="w-4 h-4 rounded border-dark-500 bg-dark-800"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {getFileIcon(file.type)}
                                                <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden md:table-cell">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getTypeBadge(file.type)}`}>
                                                {file.type}
                                            </span>
                                        </td>
                                        <td className="p-4 hidden lg:table-cell text-dark-400 text-sm">{file.size}</td>
                                        <td className="p-4 hidden lg:table-cell text-dark-400 text-sm">{file.uploadedBy}</td>
                                        <td className="p-4 hidden md:table-cell text-dark-400 text-sm">
                                            {new Date(file.uploadDate).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right relative">
                                            <button
                                                onClick={() => setActionMenuOpen(actionMenuOpen === file.id ? null : file.id)}
                                                className="p-2 rounded-lg hover:bg-dark-700/50 text-dark-400 hover:text-white transition-colors"
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>

                                            <AnimatePresence>
                                                {actionMenuOpen === file.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        className="absolute right-4 top-12 z-10 w-36 py-1 rounded-lg glass-strong shadow-lg"
                                                    >
                                                        <button onClick={() => handleView(file)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-700/50">
                                                            <Eye size={16} /> View
                                                        </button>
                                                        <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-700/50">
                                                            <Download size={16} /> Download
                                                        </button>
                                                        <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-700/50">
                                                            <Edit size={16} /> Rename
                                                        </button>
                                                        <button onClick={() => handleDeleteClick(file)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-dark-700/50">
                                                            <Trash2 size={16} /> Delete
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {sortedFiles.length > 0 && (
                    <div className="p-4 border-t border-dark-700/50 flex items-center justify-between text-sm text-dark-400">
                        <span>Showing {sortedFiles.length} of {files.length} files</span>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            <AnimatePresence>
                {showDeleteModal && fileToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80"
                        onClick={() => setShowDeleteModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="card w-full max-w-md p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold mb-2">Delete File</h3>
                            <p className="text-dark-400 mb-6">
                                Are you sure you want to delete <strong className="text-white">{fileToDelete.name}</strong>?
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button onClick={() => setShowDeleteModal(false)} className="btn btn-secondary">Cancel</button>
                                <button onClick={confirmDelete} className="btn btn-danger">Delete</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* View Modal */}
            <AnimatePresence>
                {showViewModal && viewFile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80"
                        onClick={() => setShowViewModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="card w-full max-w-lg p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold">File Details</h3>
                                <button onClick={() => setShowViewModal(false)} className="text-dark-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-xl bg-dark-800/50 flex items-center justify-center">
                                    {getFileIcon(viewFile.type)}
                                </div>
                                <div>
                                    <h4 className="text-xl font-semibold break-all">{viewFile.name}</h4>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getTypeBadge(viewFile.type)}`}>
                                        {viewFile.type}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-dark-500 uppercase">Size</label>
                                    <p className="font-medium">{viewFile.size}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-dark-500 uppercase">Uploaded By</label>
                                    <p className="font-medium">{viewFile.uploadedBy}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-dark-500 uppercase">Upload Date</label>
                                    <p className="font-medium">{new Date(viewFile.uploadDate).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button className="btn btn-primary flex-1">
                                    <Download size={16} /> Download
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80"
                        onClick={() => setShowUploadModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="card w-full max-w-lg p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold">Upload File</h3>
                                <button onClick={() => setShowUploadModal(false)} className="text-dark-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="border-2 border-dashed border-dark-600 rounded-xl p-8 text-center hover:border-primary-500/50 transition-colors cursor-pointer">
                                <Upload className="w-12 h-12 mx-auto mb-4 text-dark-400" />
                                <p className="text-dark-300 mb-2">Drag and drop files here</p>
                                <p className="text-sm text-dark-500">or click to browse</p>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowUploadModal(false)} className="btn btn-secondary flex-1">Cancel</button>
                                <button className="btn btn-primary flex-1">
                                    <Upload size={16} /> Upload
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
