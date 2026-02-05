
import { Express, Router } from 'express';
import path from 'path';
import { pathToFileURL } from 'url';
import prisma from './prisma.js';

export interface ModuleDefinition {
    moduleId: string;
    router: Router;
    isCore?: boolean;
}

export class ModuleLoader {
    private static app: Express;
    private static apiPrefix = '/api/v1';

    static async init(app: Express) {
        this.app = app;
        console.log('🚀 [ModuleLoader] Initializing plugins...');
        await this.loadModulesFromDb();
    }

    private static async loadModulesFromDb() {
        // Cast to any to bypass Prisma client sync issues during transition
        const modules = await (prisma as any).appModule.findMany({
            where: { isEnabled: true }
        });

        for (const mod of modules) {
            try {
                // Determine absolute path for robust Windows support
                const relativePath = mod.isCore
                    ? `src/modules/core/${mod.moduleId}/${mod.moduleId}.routes.ts`
                    : `src/plugins/${mod.moduleId}/${mod.moduleId}.routes.ts`;

                const absolutePath = path.resolve(process.cwd(), relativePath);
                const fileUrl = pathToFileURL(absolutePath).href;

                console.log(`🔌 [ModuleLoader] Attempting to load ${mod.name} from: ${fileUrl}`);

                const moduleImport = await import(fileUrl);
                const router = moduleImport.default || moduleImport.router;

                if (router) {
                    this.app.use(`${this.apiPrefix}/${mod.moduleId}`, router);
                    console.log(`✅ [ModuleLoader] Registered /api/v1/${mod.moduleId}`);
                }
            } catch (error: any) {
                console.error(`❌ [ModuleLoader] Failed to load module ${mod.moduleId}:`, error.message);
            }
        }
    }

    /**
     * Manual registration for hardcoded core routes that 
     * are not yet managed via the database.
     */
    static registerCoreRoute(path: string, router: any) {
        this.app.use(`${this.apiPrefix}/${path}`, router);
    }
}
