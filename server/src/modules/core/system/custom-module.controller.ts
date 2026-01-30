import { Request, Response } from 'express';
import prisma from '../../../lib/prisma.js';

// ===========================================
// MODULE CRUD (SuperAdmin only)
// ===========================================

// GET /api/v1/modules - List all modules
export const listModules = async (req: Request, res: Response) => {
    try {
        const { status, category } = req.query;

        const where: Record<string, unknown> = {};
        if (status) where.status = status;
        if (category) where.menuCategory = category;

        const modules = await prisma.customModule.findMany({
            where,
            include: {
                _count: {
                    select: { fields: true, assessments: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: modules.map(m => ({
                ...m,
                allowedRoles: m.allowedRoles ? JSON.parse(m.allowedRoles) : [],
                fieldsCount: m._count.fields,
                assessmentsCount: m._count.assessments
            }))
        });
    } catch (error) {
        console.error('List modules error:', error);
        res.status(500).json({ success: false, message: 'Failed to list modules' });
    }
};

// GET /api/v1/modules/:id - Get module with fields
export const getModule = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const module = await prisma.customModule.findUnique({
            where: { id },
            include: {
                fields: {
                    orderBy: [
                        { sectionName: 'asc' },
                        { sortOrder: 'asc' }
                    ]
                }
            }
        });

        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        // Group fields by section
        const sections: Record<string, typeof module.fields> = {};
        module.fields.forEach(field => {
            if (!sections[field.sectionName]) {
                sections[field.sectionName] = [];
            }
            sections[field.sectionName].push(field);
        });

        res.json({
            success: true,
            data: {
                ...module,
                allowedRoles: module.allowedRoles ? JSON.parse(module.allowedRoles) : [],
                sections
            }
        });
    } catch (error) {
        console.error('Get module error:', error);
        res.status(500).json({ success: false, message: 'Failed to get module' });
    }
};

// POST /api/v1/modules - Create new module
export const createModule = async (req: Request, res: Response) => {
    try {
        const userId = (req as Request & { userId?: string }).userId;
        const { name, description, icon, allowedRoles, menuCategory } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Module name is required' });
        }

        // Generate CORE ID for module
        const count = await prisma.customModule.count();
        const coreId = `CM.${String(Math.floor(count / 10000) + 1).padStart(4, '0')}.${String((count % 10000) + 1).padStart(4, '0')}`;

        const module = await prisma.customModule.create({
            data: {
                coreId,
                name,
                description,
                icon: icon || 'clipboard',
                status: 'DRAFT',
                createdById: userId!,
                allowedRoles: allowedRoles ? JSON.stringify(allowedRoles) : null,
                menuCategory
            }
        });

        res.status(201).json({
            success: true,
            data: module,
            message: 'Module created successfully'
        });
    } catch (error) {
        console.error('Create module error:', error);
        res.status(500).json({ success: false, message: 'Failed to create module' });
    }
};

// PUT /api/v1/modules/:id - Update module
export const updateModule = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, icon, status, allowedRoles, menuCategory, showInMenu } = req.body;

        const module = await prisma.customModule.update({
            where: { id },
            data: {
                name,
                description,
                icon,
                status,
                allowedRoles: allowedRoles ? JSON.stringify(allowedRoles) : undefined,
                menuCategory,
                showInMenu
            }
        });

        res.json({
            success: true,
            data: module,
            message: 'Module updated successfully'
        });
    } catch (error) {
        console.error('Update module error:', error);
        res.status(500).json({ success: false, message: 'Failed to update module' });
    }
};

// DELETE /api/v1/modules/:id - Archive module
export const deleteModule = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Soft delete by setting status to ARCHIVED
        await prisma.customModule.update({
            where: { id },
            data: { status: 'ARCHIVED' }
        });

        res.json({
            success: true,
            message: 'Module archived successfully'
        });
    } catch (error) {
        console.error('Delete module error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete module' });
    }
};

// ===========================================
// FIELD MANAGEMENT
// ===========================================

// POST /api/v1/modules/:id/fields - Add field
export const addField = async (req: Request, res: Response) => {
    try {
        const { id: moduleId } = req.params;
        const {
            sectionName, fieldName, fieldType, label,
            placeholder, isRequired, minValue, maxValue,
            options, isScored, maxScore, feedbackGood, feedbackBad, helpText
        } = req.body;

        if (!sectionName || !fieldName || !fieldType || !label) {
            return res.status(400).json({
                success: false,
                message: 'sectionName, fieldName, fieldType, and label are required'
            });
        }

        // Get max sort order for this section
        const maxOrder = await prisma.moduleField.findFirst({
            where: { moduleId, sectionName },
            orderBy: { sortOrder: 'desc' },
            select: { sortOrder: true }
        });

        const field = await prisma.moduleField.create({
            data: {
                moduleId,
                sectionName,
                fieldName,
                fieldType,
                label,
                placeholder,
                isRequired: isRequired || false,
                minValue,
                maxValue,
                options: options ? JSON.stringify(options) : null,
                isScored: isScored !== false,
                maxScore: maxScore || 1,
                feedbackGood,
                feedbackBad,
                helpText,
                sortOrder: (maxOrder?.sortOrder ?? -1) + 1
            }
        });

        res.status(201).json({
            success: true,
            data: field,
            message: 'Field added successfully'
        });
    } catch (error) {
        console.error('Add field error:', error);
        res.status(500).json({ success: false, message: 'Failed to add field' });
    }
};

// PUT /api/v1/modules/:moduleId/fields/:fieldId - Update field
export const updateField = async (req: Request, res: Response) => {
    try {
        const { fieldId } = req.params;
        const updateData = req.body;

        if (updateData.options && typeof updateData.options !== 'string') {
            updateData.options = JSON.stringify(updateData.options);
        }

        const field = await prisma.moduleField.update({
            where: { id: fieldId },
            data: updateData
        });

        res.json({
            success: true,
            data: field,
            message: 'Field updated successfully'
        });
    } catch (error) {
        console.error('Update field error:', error);
        res.status(500).json({ success: false, message: 'Failed to update field' });
    }
};

// DELETE /api/v1/modules/:moduleId/fields/:fieldId - Delete field
export const deleteField = async (req: Request, res: Response) => {
    try {
        const { fieldId } = req.params;

        await prisma.moduleField.delete({
            where: { id: fieldId }
        });

        res.json({
            success: true,
            message: 'Field deleted successfully'
        });
    } catch (error) {
        console.error('Delete field error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete field' });
    }
};

// ===========================================
// ASSESSMENT RECORDS
// ===========================================

// POST /api/v1/assessments - Create assessment
export const createAssessment = async (req: Request, res: Response) => {
    try {
        const userId = (req as Request & { userId?: string }).userId;
        const {
            moduleId, athleteId, fieldValues,
            assessmentType, coachNotes, assessmentDate
        } = req.body;

        if (!moduleId || !athleteId || !fieldValues) {
            return res.status(400).json({
                success: false,
                message: 'moduleId, athleteId, and fieldValues are required'
            });
        }

        // Get module fields for scoring
        const moduleFields = await prisma.moduleField.findMany({
            where: { moduleId }
        });

        // Calculate section scores
        const values = typeof fieldValues === 'string' ? JSON.parse(fieldValues) : fieldValues;
        const sectionScores: Record<string, number> = {};
        const sectionMaxScores: Record<string, number> = {};

        moduleFields.forEach(field => {
            if (field.isScored) {
                if (!sectionMaxScores[field.sectionName]) {
                    sectionMaxScores[field.sectionName] = 0;
                    sectionScores[field.sectionName] = 0;
                }
                sectionMaxScores[field.sectionName] += field.maxScore;

                if (values[field.fieldName]) {
                    sectionScores[field.sectionName] += field.maxScore;
                }
            }
        });

        // Convert to percentages
        const sectionPercentages: Record<string, number> = {};
        Object.keys(sectionScores).forEach(section => {
            sectionPercentages[section] = Math.round(
                (sectionScores[section] / sectionMaxScores[section]) * 100
            );
        });

        // Calculate total
        const totalMax = Object.values(sectionMaxScores).reduce((a, b) => a + b, 0);
        const totalScore = Object.values(sectionScores).reduce((a, b) => a + b, 0);
        const totalPercentage = Math.round((totalScore / totalMax) * 100);

        // Generate assessment number
        const now = new Date();
        const dateStr = `${now.getFullYear().toString().slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        const assessmentNo = `${dateStr}`;

        const assessment = await prisma.assessmentRecord.create({
            data: {
                assessmentNo,
                moduleId,
                athleteId,
                assessedById: userId!,
                fieldValues: JSON.stringify(values),
                sectionScores: JSON.stringify(sectionPercentages),
                totalScore: totalPercentage,
                assessmentType: assessmentType || 'POST_TEST',
                coachNotes,
                assessmentDate: assessmentDate ? new Date(assessmentDate) : new Date(),
                status: 'COMPLETED'
            },
            include: {
                module: true,
                athlete: {
                    include: { user: true }
                }
            }
        });

        res.status(201).json({
            success: true,
            data: assessment,
            message: 'Assessment created successfully'
        });
    } catch (error) {
        console.error('Create assessment error:', error);
        res.status(500).json({ success: false, message: 'Failed to create assessment' });
    }
};

// GET /api/v1/assessments/:id - Get assessment with details
export const getAssessment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const assessment = await prisma.assessmentRecord.findUnique({
            where: { id },
            include: {
                module: {
                    include: {
                        fields: {
                            orderBy: [
                                { sectionName: 'asc' },
                                { sortOrder: 'asc' }
                            ]
                        }
                    }
                },
                athlete: {
                    include: { user: true }
                }
            }
        });

        if (!assessment) {
            return res.status(404).json({ success: false, message: 'Assessment not found' });
        }

        // Parse JSON fields
        const fieldValues = JSON.parse(assessment.fieldValues);
        const sectionScores = assessment.sectionScores ? JSON.parse(assessment.sectionScores) : {};

        // Generate feedback per field
        const fieldFeedback: Record<string, { checked: boolean; feedback: string }> = {};
        assessment.module.fields.forEach(field => {
            const isChecked = !!fieldValues[field.fieldName];
            fieldFeedback[field.fieldName] = {
                checked: isChecked,
                feedback: isChecked ? (field.feedbackGood || 'Good!') : (field.feedbackBad || 'Needs improvement')
            };
        });

        res.json({
            success: true,
            data: {
                ...assessment,
                fieldValues,
                sectionScores,
                fieldFeedback
            }
        });
    } catch (error) {
        console.error('Get assessment error:', error);
        res.status(500).json({ success: false, message: 'Failed to get assessment' });
    }
};

// GET /api/v1/assessments - List assessments (filtered by athlete, module, etc.)
export const listAssessments = async (req: Request, res: Response) => {
    try {
        const { athleteId, moduleId, assessedById, limit = '20' } = req.query;

        const where: Record<string, unknown> = {};
        if (athleteId) where.athleteId = athleteId;
        if (moduleId) where.moduleId = moduleId;
        if (assessedById) where.assessedById = assessedById;

        const assessments = await prisma.assessmentRecord.findMany({
            where,
            include: {
                module: { select: { id: true, name: true, icon: true } },
                athlete: {
                    include: {
                        user: { select: { id: true, name: true, email: true } }
                    }
                }
            },
            orderBy: { assessmentDate: 'desc' },
            take: parseInt(limit as string, 10)
        });

        res.json({
            success: true,
            data: assessments.map(a => ({
                ...a,
                sectionScores: a.sectionScores ? JSON.parse(a.sectionScores) : {}
            }))
        });
    } catch (error) {
        console.error('List assessments error:', error);
        res.status(500).json({ success: false, message: 'Failed to list assessments' });
    }
};

// POST /api/v1/assessments/:id/feedback - Generate AI feedback
export const generateFeedback = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const assessment = await prisma.assessmentRecord.findUnique({
            where: { id },
            include: {
                module: { include: { fields: true } },
                athlete: { include: { user: true } }
            }
        });

        if (!assessment) {
            return res.status(404).json({ success: false, message: 'Assessment not found' });
        }

        const _fieldValues = JSON.parse(assessment.fieldValues);
        const sectionScores = assessment.sectionScores ? JSON.parse(assessment.sectionScores) : {};
        const athleteName = assessment.athlete.user.name;

        // Generate feedback based on scores (simplified AI simulation)
        let feedback = '';

        if (assessment.totalScore && assessment.totalScore >= 80) {
            feedback = `Alhamdulillah... Kak ${athleteName}, Skor sudah diatas rata-rata loh.. `;
            feedback += `Tapi masih banyak PR nih, coba deh melakukan cycle shoot dengan perlahan dari stance hingga follow through menggunakan beban busur yg lebih rendah atau pakai karet untuk Meningkatkan kepekaan dalam menjalankan proses cycle shoot. `;
            feedback += `Yuk kita liat masalahnya ada dimana aja sih??`;
        } else if (assessment.totalScore && assessment.totalScore >= 50) {
            feedback = `Hai Kak ${athleteName}! Skormu ${assessment.totalScore} sudah cukup baik. `;

            // Find sections that need improvement
            const weakSections = Object.entries(sectionScores)
                .filter(([_, score]) => (score as number) < 75)
                .map(([section]) => section);

            if (weakSections.length > 0) {
                feedback += `Bagian yang perlu diperbaiki: ${weakSections.join(', ')}. `;
            }
            feedback += `Semangat berlatih ya!`;
        } else {
            feedback = `Hai Kak ${athleteName}, hasil penilaianmu ${assessment.totalScore}. `;
            feedback += `Jangan khawatir, ini adalah langkah awal untuk menjadi lebih baik. `;
            feedback += `Fokus berlatih teknik dasar, pasti bisa jika dilatih. Semangat!`;
        }

        // Update assessment with feedback
        await prisma.assessmentRecord.update({
            where: { id },
            data: { aiFeedback: feedback }
        });

        res.json({
            success: true,
            data: { feedback },
            message: 'Feedback generated successfully'
        });
    } catch (error) {
        console.error('Generate feedback error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate feedback' });
    }
};
