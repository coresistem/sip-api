import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { upload } from '../middleware/upload.js';
import fs from 'fs';
import path from 'path';

const router = Router();

// Get documents by SIP ID
router.get('/:sipId', async (req, res) => {
    try {
        const { sipId } = req.params;
        const documents = await prisma.generalDocument.findMany({
            where: { sipId },
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

        const { sipId, title, category, uploadedBy, uploadedById } = req.body;

        const document = await prisma.generalDocument.create({
            data: {
                sipId,
                title: title || req.file.originalname,
                category: category || 'OTHER',
                fileUrl: `/uploads/${req.file.filename}`,
                fileType: req.file.mimetype,
                fileSize: req.file.size,
                uploadedBy: uploadedBy || 'System',
                uploadedById: uploadedById || null,
            },
        });

        res.json(document);
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ message: 'Error uploading document' });
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

        // Delete file from filesystem
        const filePath = path.join(__dirname, '../../uploads', path.basename(document.fileUrl));
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
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
