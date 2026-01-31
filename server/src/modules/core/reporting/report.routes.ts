import { Router } from 'express';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { requireRoles, requireClubAccess } from '../../../middleware/rbac.middleware.js';
import prisma from '../../../lib/prisma.js';
import PDFDocument from 'pdfkit';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/reports/athlete/:athleteId
 * Generate PDF report for an athlete's performance
 */
router.get('/athlete/:athleteId', async (req, res) => {
    try {
        const { athleteId } = req.params;
        const { startDate, endDate } = req.query;

        // Fetch athlete with scores
        const athlete = await prisma.athlete.findUnique({
            where: { id: athleteId },
            include: {
                user: { select: { name: true, email: true, gender: true, dateOfBirth: true } },
                club: { select: { name: true } },
                scores: {
                    where: {
                        sessionDate: {
                            gte: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                            lte: endDate ? new Date(endDate as string) : new Date(),
                        },
                    },
                    orderBy: { sessionDate: 'desc' },
                },
            },
        });

        if (!athlete) {
            res.status(404).json({ success: false, message: 'Athlete not found' });
            return;
        }

        // Calculate statistics
        const totalSessions = athlete.scores.length;
        const totalArrows = athlete.scores.reduce((sum, s) => sum + s.arrowCount, 0);
        const totalScore = athlete.scores.reduce((sum, s) => sum + s.totalSum, 0);
        const averageScore = totalArrows > 0 ? (totalScore / totalArrows).toFixed(2) : '0.00';
        const bestSession = athlete.scores.reduce((best, s) => s.totalSum > (best?.totalSum || 0) ? s : best, athlete.scores[0]);
        const totalTens = athlete.scores.reduce((sum, s) => sum + s.tensCount, 0);

        // Create PDF
        const doc = new PDFDocument({ margin: 50 });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="athlete-report-${athlete.user.name.replace(/\s+/g, '-')}.pdf"`);

        // Pipe PDF to response
        doc.pipe(res);

        // Header
        doc.fontSize(24).font('Helvetica-Bold').text('Athlete Performance Report', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').fillColor('#666666')
            .text(`Generated on ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}`, { align: 'center' });

        doc.moveDown(2);

        // Athlete Info Section
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000').text('Athlete Information');
        doc.moveDown(0.5);

        const infoY = doc.y;
        doc.fontSize(11).font('Helvetica');
        doc.text(`Name: ${athlete.user.name}`, 50, infoY);
        doc.text(`Email: ${athlete.user.email}`, 50, infoY + 18);
        doc.text(`Club: ${athlete.club.name}`, 50, infoY + 36);
        doc.text(`Category: ${athlete.archeryCategory}`, 300, infoY);
        doc.text(`Skill Level: ${athlete.skillLevel}`, 300, infoY + 18);
        doc.text(`Gender: ${athlete.user.gender}`, 300, infoY + 36);

        doc.moveDown(4);

        // Draw a line separator
        doc.strokeColor('#cccccc').lineWidth(1)
            .moveTo(50, doc.y)
            .lineTo(550, doc.y)
            .stroke();

        doc.moveDown(1);

        // Performance Summary Section
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000').text('Performance Summary');
        doc.moveDown(0.5);

        // Stats boxes
        const stats = [
            { label: 'Total Sessions', value: totalSessions.toString() },
            { label: 'Total Arrows', value: totalArrows.toLocaleString() },
            { label: 'Average Score', value: `${averageScore}/10` },
            { label: 'Total 10s', value: totalTens.toString() },
        ];

        const boxWidth = 120;
        const boxHeight = 60;
        const startX = 50;

        stats.forEach((stat, i) => {
            const x = startX + (i * (boxWidth + 15));
            const y = doc.y;

            doc.rect(x, y, boxWidth, boxHeight).fillAndStroke('#f8f9fa', '#e9ecef');
            doc.fontSize(9).font('Helvetica').fillColor('#666666')
                .text(stat.label, x, y + 8, { width: boxWidth, align: 'center' });
            doc.fontSize(18).font('Helvetica-Bold').fillColor('#0ea5e9')
                .text(stat.value, x, y + 28, { width: boxWidth, align: 'center' });
        });

        doc.moveDown(5);

        // Best Session
        if (bestSession) {
            doc.fontSize(12).font('Helvetica-Bold').fillColor('#000000')
                .text(`Best Session: ${bestSession.totalSum} points on ${new Date(bestSession.sessionDate).toLocaleDateString('id-ID')}`);
        }

        doc.moveDown(2);

        // Recent Sessions Table
        doc.fontSize(16).font('Helvetica-Bold').text('Recent Sessions');
        doc.moveDown(0.5);

        // Table header
        const tableTop = doc.y;
        const tableHeaders = ['Date', 'Distance', 'Type', 'Arrows', 'Total', 'Avg'];
        const colWidths = [100, 60, 80, 60, 60, 60];
        let currentX = 50;

        doc.rect(50, tableTop, 500, 20).fill('#0ea5e9');
        doc.fontSize(10).font('Helvetica-Bold').fillColor('white');

        tableHeaders.forEach((header, i) => {
            doc.text(header, currentX + 5, tableTop + 5, { width: colWidths[i] - 10, align: i === 0 ? 'left' : 'center' });
            currentX += colWidths[i];
        });

        // Table rows
        doc.font('Helvetica').fillColor('#000000');
        let rowY = tableTop + 22;

        athlete.scores.slice(0, 10).forEach((score, i) => {
            if (rowY > 700) return; // Page break protection

            const bgColor = i % 2 === 0 ? '#ffffff' : '#f8f9fa';
            doc.rect(50, rowY, 500, 18).fill(bgColor);

            currentX = 50;
            const rowData = [
                new Date(score.sessionDate).toLocaleDateString('id-ID'),
                `${score.distance}m`,
                score.sessionType,
                score.arrowCount.toString(),
                score.totalSum.toString(),
                score.average.toFixed(2),
            ];

            doc.fillColor('#333333');
            rowData.forEach((cell, j) => {
                doc.text(cell, currentX + 5, rowY + 4, { width: colWidths[j] - 10, align: j === 0 ? 'left' : 'center' });
                currentX += colWidths[j];
            });

            rowY += 18;
        });

        // Footer
        doc.fontSize(8).fillColor('#999999')
            .text('CORE INDONESIA - Archery Management System', 50, 750, { align: 'center' });

        // Finalize PDF
        doc.end();
    } catch (error) {
        console.error('Generate athlete report error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate report' });
    }
});

/**
 * GET /api/v1/reports/club/:clubId
 * Generate PDF report for club statistics
 */
router.get('/club/:clubId', requireClubAccess, async (req, res) => {
    try {
        const { clubId } = req.params;

        const club = await prisma.club.findUnique({
            where: { id: clubId },
            include: {
                athletes: {
                    include: {
                        user: { select: { name: true } },
                        scores: {
                            take: 5,
                            orderBy: { totalSum: 'desc' },
                        },
                    },
                },
                schedules: {
                    where: {
                        startTime: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
                    },
                },
            },
        });

        if (!club) {
            res.status(404).json({ success: false, message: 'Club not found' });
            return;
        }

        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="club-report-${club.name.replace(/\s+/g, '-')}.pdf"`);

        doc.pipe(res);

        // Header
        doc.fontSize(24).font('Helvetica-Bold').text('Club Performance Report', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(18).font('Helvetica').text(club.name, { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#666666')
            .text(`Generated on ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}`, { align: 'center' });

        doc.moveDown(2);

        // Club Stats
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000').text('Club Overview');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');
        doc.text(`Total Athletes: ${club.athletes.length}`);
        doc.text(`Training Sessions (Last 30 Days): ${club.schedules.length}`);
        doc.text(`Status: ${club.status}`);

        doc.moveDown(2);

        // Top Performers
        doc.fontSize(16).font('Helvetica-Bold').text('Top Performers');
        doc.moveDown(0.5);

        const topAthletes = club.athletes
            .map(a => ({
                name: a.user.name,
                bestScore: a.scores[0]?.totalSum || 0,
                category: a.archeryCategory,
            }))
            .sort((a, b) => b.bestScore - a.bestScore)
            .slice(0, 5);

        topAthletes.forEach((athlete, i) => {
            doc.fontSize(11).font('Helvetica')
                .text(`${i + 1}. ${athlete.name} - ${athlete.bestScore} pts (${athlete.category})`);
        });

        // Footer
        doc.fontSize(8).fillColor('#999999')
            .text('CORE INDONESIA - Archery Management System', 50, 750, { align: 'center' });

        doc.end();
    } catch (error) {
        console.error('Generate club report error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate report' });
    }
});

/**
 * GET /api/v1/reports/export
 * Generic export endpoint with format parameter
 * Query params: type (athlete|club|scores|invoices), format (pdf|csv|xlsx), id (optional)
 */
router.get('/export', async (req, res) => {
    try {
        const { type, format, id } = req.query;
        const clubId = req.user?.clubId;

        if (!type) {
            return res.status(400).json({ success: false, message: 'Report type is required' });
        }

        // For CSV/Excel (simplified implementation)
        if (format === 'csv') {
            let data: any[] = [];
            let filename = 'export.csv';

            if (type === 'scores') {
                const scores = await prisma.scoringRecord.findMany({
                    where: clubId ? { athlete: { clubId } } : {},
                    include: { athlete: { include: { user: true } } },
                    orderBy: { sessionDate: 'desc' },
                    take: 100
                });

                data = scores.map((s: any) => ({
                    Date: new Date(s.sessionDate).toLocaleDateString('id-ID'),
                    Athlete: s.athlete?.user?.name || 'Unknown',
                    Distance: s.distance,
                    Total: s.totalSum,
                    Arrows: s.arrowCount,
                    Average: s.average.toFixed(2),
                    Tens: s.tensCount
                }));
                filename = `scores_export_${Date.now()}.csv`;
            } else if (type === 'invoices') {
                const fees = await prisma.membershipFee.findMany({
                    where: clubId ? { athlete: { clubId } } : {},
                    include: { athlete: { include: { user: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 100
                });

                data = fees.map((f: any) => ({
                    Date: new Date(f.createdAt).toLocaleDateString('id-ID'),
                    Member: f.athlete?.user?.name || 'Unknown',
                    Description: f.description,
                    Amount: f.amount,
                    Status: f.status,
                    DueDate: new Date(f.dueDate).toLocaleDateString('id-ID')
                }));
                filename = `invoices_export_${Date.now()}.csv`;
            } else if (type === 'athletes') {
                const athletes = await prisma.athlete.findMany({
                    where: clubId ? { clubId } : {},
                    include: { user: true },
                    take: 100
                });

                data = athletes.map((a: any) => ({
                    Name: a.user?.name || 'Unknown',
                    Email: a.user?.email || '',
                    Category: a.archeryCategory,
                    Level: a.skillLevel,
                    XP: a.xp,
                    Level_Num: a.level
                }));
                filename = `athletes_export_${Date.now()}.csv`;
            }

            if (data.length === 0) {
                return res.status(404).json({ success: false, message: 'No data found' });
            }

            // Convert to CSV
            const headers = Object.keys(data[0]).join(',');
            const rows = data.map(row => Object.values(row).map(v => `"${v}"`).join(',')).join('\n');
            const csv = `${headers}\n${rows}`;

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            return res.send(csv);
        }

        // For PDF, redirect to specific endpoints
        if (format === 'pdf') {
            if (type === 'athlete' && id) {
                return res.redirect(`/api/v1/reports/athlete/${id}`);
            } else if (type === 'club' && id) {
                return res.redirect(`/api/v1/reports/club/${id}`);
            }
        }

        res.status(400).json({ success: false, message: 'Invalid format or missing parameters' });
    } catch (error) {
        console.error('Export report error:', error);
        res.status(500).json({ success: false, message: 'Failed to export report' });
    }
});

export default router;
