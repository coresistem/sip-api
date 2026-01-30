import { Request, Response } from 'express';
import prisma from '../../../../lib/prisma.js';

export const getLayout = async (req: Request, res: Response) => {
    try {
        const { key } = req.params;
        const userId = (req as any).user?.id;
        const role = (req as any).user?.role;

        // 1. Cek apakah user punya layout pribadi
        let layout = await prisma.dashboardLayout.findUnique({
            where: {
                userId_dashboardKey: {
                    userId: userId,
                    dashboardKey: key
                }
            }
        });

        // 2. Jika tidak ada, ambil default dari Super Admin untuk role ini
        if (!layout) {
            layout = await prisma.dashboardLayout.findFirst({
                where: {
                    role: role,
                    dashboardKey: key,
                    isDefault: true
                }
            });
        }

        if (!layout) {
            return res.json({ success: true, data: null });
        }

        return res.json({
            success: true,
            data: JSON.parse(layout.layoutData)
        });
    } catch (error) {
        console.error('Error fetching dashboard layout:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const saveLayout = async (req: Request, res: Response) => {
    try {
        const { key, layoutData, isDefault } = req.body;
        const userId = (req as any).user?.id;
        const role = (req as any).user?.role;

        // Jika user ingin set sebagai DEFAULT, cek apakah dia Super Admin
        if (isDefault && role !== 'SUPER_ADMIN') {
            return res.status(403).json({ success: false, message: 'Only Super Admin can set global defaults' });
        }

        if (isDefault) {
            // Simpan sebagai template global untuk role yang ditentukan
            // Kita gunakan role yang sedang disimulasikan atau role target
            const targetRole = req.body.role || role;

            await prisma.dashboardLayout.upsert({
                where: {
                    userId_dashboardKey: {
                        userId: 'GLOBAL_DEFAULT_' + targetRole, // Unique identifier for defaults
                        dashboardKey: key
                    }
                },
                update: {
                    layoutData: JSON.stringify(layoutData),
                    isDefault: true,
                    role: targetRole
                },
                create: {
                    userId: 'GLOBAL_DEFAULT_' + targetRole,
                    dashboardKey: key,
                    layoutData: JSON.stringify(layoutData),
                    isDefault: true,
                    role: targetRole
                }
            });
        } else {
            // Simpan sebagai personal layout milik user saat ini
            await prisma.dashboardLayout.upsert({
                where: {
                    userId_dashboardKey: {
                        userId: userId,
                        dashboardKey: key
                    }
                },
                update: {
                    layoutData: JSON.stringify(layoutData)
                },
                create: {
                    userId: userId,
                    dashboardKey: key,
                    layoutData: JSON.stringify(layoutData),
                    role: role
                }
            });
        }

        return res.json({ success: true, message: 'Layout saved successfully' });
    } catch (error) {
        console.error('Error saving dashboard layout:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
