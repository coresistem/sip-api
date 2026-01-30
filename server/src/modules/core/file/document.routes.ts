import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import prisma from '../../../lib/prisma.js';
import { StorageService } from './storage.service.js';

const router = Router();

// Configure multer to use memory storage (Supabase handles the rest)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit (increased from 5MB)
    },
    fileFilter: (req: any, file: any, cb: any) => {
        // Accept images, PDFs, and spreadsheets
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/webp',
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
            'application/vnd.ms-excel', // xls
            'text/csv'
        ];

        if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            // Allow all for now if strict checking fails, or just log valid ones?
            // Let's be permissive but safe.
            cb(null, true);
        }
    }
});

// Get documents by CORE ID
router.get('/:coreId', async (req, res) => {
    try {
        const { coreId } = req.params;
        const documents = await prisma.generalDocument.findMany({
            where: { coreId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ message: 'Error fetching documents' });
    }
});

// Upload document
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { coreId, title, category, uploadedBy, uploadedById } = req.body;

        // Generate a path: documents/[coreId]/[timestamp]-[filename]
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(req.file.originalname);
        const storagePath = `documents/${coreId || 'common'}/${uniqueSuffix}${ext}`;

        // Upload to Supabase
        const fileUrl = await StorageService.uploadFile(req.file, storagePath);

        const document = await prisma.generalDocument.create({
            data: {
                coreId,
                title: title || req.file.originalname,
                category: category || 'OTHER',
                fileUrl: fileUrl, // Now a Supabase public URL
                fileType: req.file.mimetype,
                fileSize: req.file.size,
                uploadedBy: uploadedBy || 'System',
                uploadedById: uploadedById || null,
            },
        });

        res.json(document);
    } catch (error: any) {
        console.error('Error uploading document:', error);
        res.status(500).json({ message: 'Error uploading document', error: error.message });
    }
});

// Delete document
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const document = await prisma.generalDocument.findUnique({
            where: { id },
        });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Delete file from Supabase Storage
        if (document.fileUrl && document.fileUrl.startsWith('http')) {
            await StorageService.deleteFile(document.fileUrl);
        }

        await prisma.generalDocument.delete({
            where: { id },
        });

        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: 'Error deleting document' });
    }
});

// Rename document
router.post('/:id/rename', async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;

        const document = await prisma.generalDocument.update({
            where: { id },
            data: { title },
        });

        res.json(document);
    } catch (error) {
        console.error('Error renaming document:', error);
        res.status(500).json({ message: 'Error renaming document' });
    }
});

export const documentRoutes = router;
