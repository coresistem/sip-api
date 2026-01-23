import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middleware/auth.middleware.js';
import { StorageService } from '../services/storage.service.js';

const router = Router();

// Configure multer storage (Memory Storage for Supabase Upload)
const storage = multer.memoryStorage();

// File filter to only accept images and PDFs
const fileFilter = (_req: Request, file: any, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only Images and PDF are allowed.'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    }
});

// POST /api/v1/upload/image - Upload a single image
router.post('/image', authenticate, upload.single('image'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        // Generate a unique path for the file
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(req.file.originalname);
        const storagePath = `uploads/${req.file.fieldname}-${uniqueSuffix}${ext}`;

        // Upload to Supabase
        const imageUrl = await StorageService.uploadFile(req.file, storagePath);

        res.json({
            success: true,
            data: {
                url: imageUrl,
                filename: storagePath, // Return path as filename reference
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype
            },
            message: 'Image uploaded successfully to Supabase'
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image',
            error: error.message
        });
    }
});

// POST /api/v1/upload/document - Upload a document (PDF or Image)
router.post('/document', authenticate, upload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file provided'
            });
        }

        // Generate a unique path for the file
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(req.file.originalname);
        const storagePath = `documents/requests/${uniqueSuffix}${ext}`;

        // Upload to Supabase
        const fileUrl = await StorageService.uploadFile(req.file, storagePath);

        res.json({
            success: true,
            data: {
                url: fileUrl,
                filename: storagePath,
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype
            },
            message: 'Document uploaded successfully'
        });
    } catch (error: any) {
        console.error('Upload document error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload document',
            error: error.message
        });
    }
});

// Error handling middleware for multer
router.use((err: any, _req: Request, res: Response, _next: Function) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 10MB.'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
});

export default router;
