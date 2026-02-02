import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CertificateData {
    recipientName: string;
    competitionName: string;
    category: string;
    achievement: string;
    date: string;
    validationCode: string;
    rank?: number;
    totalScore?: number;
}

export class CertificateService {
    /**
     * Generate a PDF certificate for a given certificate data
     */
    async generateCertificatePdf(data: CertificateData): Promise<Buffer> {
        return new Promise(async (resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    layout: 'landscape',
                    size: 'A4',
                    margin: 0,
                });

                const buffers: Buffer[] = [];
                doc.on('data', (buffer) => buffers.push(buffer));
                doc.on('end', () => resolve(Buffer.concat(buffers)));
                doc.on('error', (err) => reject(err));

                // -- Background / Frame --
                doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
                    .strokeColor('#D4AF37') // Gold
                    .lineWidth(5)
                    .stroke();

                doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50)
                    .strokeColor('#C5A028') // Darker Gold
                    .lineWidth(2)
                    .stroke();

                // -- Header --
                const centerY = doc.page.height / 2;
                const centerX = doc.page.width / 2;

                doc.font('Helvetica-Bold')
                    .fontSize(40)
                    .fillColor('#333333')
                    .text('CERTIFICATE', 0, 100, { align: 'center' });

                doc.font('Helvetica')
                    .fontSize(20)
                    .text('OF ACHIEVEMENT', 0, 145, { align: 'center', characterSpacing: 5 });

                // -- Recipient --
                doc.font('Helvetica-Oblique')
                    .fontSize(16)
                    .fillColor('#666666')
                    .text('This is proudly presented to', 0, 200, { align: 'center' });

                doc.font('Helvetica-Bold')
                    .fontSize(36)
                    .fillColor('#1a1a1a')
                    .text(data.recipientName, 0, 230, { align: 'center' });

                doc.moveTo(centerX - 200, 270)
                    .lineTo(centerX + 200, 270)
                    .strokeColor('#D4AF37')
                    .lineWidth(2)
                    .stroke();

                // -- Details --
                doc.font('Helvetica')
                    .fontSize(16)
                    .fillColor('#666666')
                    .text('For their outstanding performance as', 0, 290, { align: 'center' });

                const achievementText = data.rank
                    ? `${getOrdinal(data.rank)} PLACE - ${data.achievement}`
                    : data.achievement;

                doc.font('Helvetica-Bold')
                    .fontSize(24)
                    .fillColor('#D4AF37')
                    .text(achievementText.toUpperCase(), 0, 315, { align: 'center' });

                doc.font('Helvetica')
                    .fontSize(18)
                    .fillColor('#333333')
                    .text(`in ${data.category} Division`, 0, 345, { align: 'center' });

                doc.font('Helvetica-Bold')
                    .fontSize(20)
                    .text(data.competitionName, 0, 380, { align: 'center' });

                if (data.totalScore) {
                    doc.fontSize(14)
                        .fillColor('#555555')
                        .text(`Score: ${data.totalScore}`, 0, 410, { align: 'center' });
                }

                // -- Dates & Signatures --
                const bottomY = doc.page.height - 100;

                doc.font('Helvetica')
                    .fontSize(12)
                    .fillColor('#333333')
                    .text(`Given on ${data.date}`, 0, 440, { align: 'center' });

                doc.text('______________________', 100, bottomY);
                doc.text('Event Organizer', 100, bottomY + 20);

                doc.text('______________________', doc.page.width - 250, bottomY);
                doc.text('Competition Director', doc.page.width - 250, bottomY + 20);

                // -- QR & Validation --
                const validationUrl = `https://app.corelink.id/verify/cert/${data.validationCode}`;
                const qrBuffer = await QRCode.toBuffer(validationUrl, { width: 100, margin: 1 });

                doc.image(qrBuffer, centerX - 50, bottomY - 20, { width: 100, height: 100 });

                doc.fontSize(8)
                    .fillColor('#999999')
                    .text(data.validationCode, centerX - 50, bottomY + 85, { width: 100, align: 'center' });

                doc.end();

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Find or create a certificate record and return its PDF buffer
     */
    async getCertificateForRegistration(registrationId: string): Promise<Buffer> {
        const registration = await prisma.competitionRegistration.findUnique({
            where: { id: registrationId },
            include: {
                athlete: { include: { user: true } },
                category: true,
                competition: true,
            }
        });

        if (!registration) throw new Error('Registration not found');

        // Check if certificate already exists
        let cert = await prisma.certificate.findFirst({
            where: {
                recipientId: registration.athleteId,
                competitionId: registration.competitionId
            }
        });

        // Check if certificate exists by record (if not found by athlete ID)
        if (!cert) {
            const code = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

            let achievement = 'PARTICIPANT';
            if (registration.rank === 1) achievement = 'WINNER';
            if (registration.rank === 2) achievement = 'RUNNER UP';
            if (registration.rank === 3) achievement = '2nd RUNNER UP';

            cert = await prisma.certificate.create({
                data: {
                    competitionId: registration.competitionId,
                    recipientId: registration.athleteId,
                    recipientName: registration.athlete.user.name,
                    category: `${registration.category.ageClass} - ${registration.category.division}`,
                    achievement: achievement,
                    rank: registration.rank,
                    totalScore: registration.qualificationScore,
                    validationCode: code,
                    validationUrl: `https://app.corelink.id/verify/cert/${code}`
                }
            });
        } else {
            await prisma.certificate.update({
                where: { id: cert.id },
                data: { downloadCount: { increment: 1 } }
            });
        }

        const pdfBuffer = await this.generateCertificatePdf({
            recipientName: cert.recipientName,
            competitionName: registration.competition.name,
            category: cert.category,
            achievement: cert.achievement,
            rank: cert.rank || undefined,
            totalScore: cert.totalScore || undefined,
            date: cert.issuedAt.toLocaleDateString('en-ID', { dateStyle: 'long' }),
            validationCode: cert.validationCode
        });

        return pdfBuffer;
    }

    // == BULK LOGIC ==

    async getCompetitionCertificates(competitionId: string) {
        return prisma.certificate.findMany({
            where: { competitionId },
            include: {
                competition: { select: { name: true, startDate: true } },
                athlete: { select: { id: true, user: { select: { name: true } } } }
            },
            orderBy: [{ category: 'asc' }, { rank: 'asc' }]
        });
    }

    async generateBulkRecords(competitionId: string, includeParticipants: boolean) {
        const competition = await prisma.competition.findUnique({
            where: { id: competitionId },
            include: {
                registrations: {
                    include: {
                        athlete: {
                            include: { user: { select: { name: true } } }
                        },
                        category: { select: { categoryLabel: true, ageClass: true, gender: true, division: true } }
                    },
                    orderBy: [
                        { categoryId: 'asc' },
                        { qualificationScore: 'desc' }
                    ]
                }
            }
        });

        if (!competition) throw new Error('Competition not found');

        const createdCerts = [];
        const baseUrl = process.env.BASE_URL || 'http://localhost:5173';

        // Group registrations by category
        const categoryGroups: { [key: string]: typeof competition.registrations } = {};
        for (const reg of competition.registrations) {
            const catName = reg.category?.categoryLabel || `${reg.category.ageClass} - ${reg.category.division}`;
            if (!categoryGroups[catName]) categoryGroups[catName] = [];
            categoryGroups[catName].push(reg);
        }

        for (const [categoryName, regs] of Object.entries(categoryGroups)) {
            regs.sort((a, b) => (b.qualificationScore || 0) - (a.qualificationScore || 0));

            let currentRank = 1;
            for (let i = 0; i < regs.length; i++) {
                const reg = regs[i];
                const rank = currentRank++;

                if (!includeParticipants && rank > 3) continue;

                const existing = await prisma.certificate.findFirst({
                    where: { competitionId, recipientId: reg.athleteId }
                });

                if (!existing) {
                    const code = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

                    let templateType = 'DEFAULT';
                    if (rank === 1) templateType = 'GOLD';
                    else if (rank === 2) templateType = 'SILVER';
                    else if (rank === 3) templateType = 'BRONZE';

                    let achievement = 'PARTICIPANT';
                    if (rank <= 3) achievement = `${rank}${getOrdinal(rank)} Place`;

                    const cert = await prisma.certificate.create({
                        data: {
                            competitionId,
                            recipientName: reg.athlete?.user?.name || 'Unknown',
                            recipientId: reg.athleteId,
                            category: categoryName,
                            achievement,
                            rank: rank <= 3 ? rank : null,
                            totalScore: reg.qualificationScore,
                            validationCode: code,
                            validationUrl: `${baseUrl}/verify/cert/${code}`,
                            templateType
                        }
                    });
                    createdCerts.push(cert);
                }
            }
        }
        return createdCerts;
    }

    async deleteCertificate(id: string) {
        return prisma.certificate.delete({ where: { id } });
    }

    async getCertificateById(id: string) {
        return prisma.certificate.findUnique({
            where: { id },
            include: {
                competition: { select: { name: true, location: true, startDate: true, endDate: true } }
            }
        });
    }

    async getCertificateByCode(code: string) {
        return prisma.certificate.findUnique({
            where: { validationCode: code },
            include: {
                competition: { select: { name: true, location: true, startDate: true, endDate: true } },
                athlete: { select: { user: { select: { name: true, email: true } } } }
            }
        });
    }
}

function getOrdinal(n: number): string {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
