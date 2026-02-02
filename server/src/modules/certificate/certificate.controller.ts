import { Request, Response } from 'express';
import { CertificateService } from './certificate.service.new';

const certificateService = new CertificateService();

export const CertificateController = {
    downloadCertificate: async (req: Request, res: Response) => {
        try {
            const { registrationId } = req.params;

            const pdfBuffer = await certificateService.getCertificateForRegistration(registrationId);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="certificate-${registrationId}.pdf"`);

            res.send(pdfBuffer);
        } catch (error: any) {
            console.error('Certificate Generation Error:', error);
            res.status(500).json({ error: error.message || 'Failed to generate certificate' });
        }
    },

    getCompetitionCertificates: async (req: Request, res: Response) => {
        try {
            const { competitionId } = req.params;
            const certificates = await certificateService.getCompetitionCertificates(competitionId);
            res.json({ success: true, data: certificates });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    generateBulk: async (req: Request, res: Response) => {
        try {
            const { competitionId } = req.params;
            const { includeParticipants } = req.body;

            const createdCerts = await certificateService.generateBulkRecords(competitionId, includeParticipants);

            res.json({
                success: true,
                message: `${createdCerts.length} certificate(s) generated`,
                data: createdCerts
            });
        } catch (error: any) {
            console.error('Bulk generate error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const cert = await certificateService.getCertificateById(id);
            if (!cert) return res.status(404).json({ success: false, message: 'Not found' });
            res.json({ success: true, data: cert });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    delete: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            await certificateService.deleteCertificate(id);
            res.json({ success: true, message: 'Deleted' });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    verify: async (req: Request, res: Response) => {
        try {
            const { code } = req.params;
            const cert = await certificateService.getCertificateByCode(code);
            if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' });
            res.json({ success: true, data: cert });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
