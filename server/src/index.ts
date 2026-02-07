import 'dotenv/config';
// Trigger restart: 2 update
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { ModuleLoader } from './lib/module-loader.js';
import path from 'path';
import helmet from 'helmet';
import prisma from './lib/prisma.js';

// Route imports
// Auth & Profile
import authRoutes from './modules/core/auth/auth.routes.js';
import profileRoutes from './modules/core/profile/profile.routes.js';
import roleRequestRoutes from './modules/core/auth/role-request.routes.js';


// Athlete (Non-Core - Disabled for Transition)
// import athleteRoutes from './modules/athlete/athlete.routes.js';
// import certificateRoutes from './modules/certificate/certificate.routes.js';
// import configRoutes from './modules/athlete/config.routes.js';

// Club Management (Non-Core - Disabled for Transition)
// import clubRoutes from './modules/club/club.routes.js';
// import clubMemberRoutes from './modules/club/club-member.routes.js';
// import clubOrganizationRoutes from './modules/club/club-organization.routes.js';
// import clubUnitRoutes from './modules/club/club-unit.routes.js';
// import attendanceRoutes from './modules/club/attendance.routes.js';
// import financeRoutes from './modules/club/finance.routes.js';
// import inventoryRoutes from './modules/club/inventory.routes.js';
// import coachRoutes from './modules/club/manpower/coach.routes.js';
// import manpowerRoutes from './modules/club/manpower/manpower.routes.js';
// import schoolRoutes from './modules/club/school/school.routes.js';
// import perpaniRoutes from './modules/club/perpani/perpani.routes.js';

// Event & Competition (Non-Core - Disabled for Transition)
// import scoreRoutes from './modules/event/routes/score.routes.js';
// import scheduleRoutes from './modules/event/routes/schedule.routes.js';
// import eoRoutes from './modules/event/routes/eo.routes.js';
// import eventRoutes from './modules/event/routes/event.routes.js';
// import judgeRoutes from './modules/event/routes/judge.routes.js';
// import categoryRoutes from './modules/event/category.routes.js';
// import matchRoutes from './modules/event/routes/match.routes.js';

// Core & System
import analyticsRoutes from './modules/core/analytics/analytics.routes.js';
import reportRoutes from './modules/core/reporting/report.routes.js';
import uploadRoutes from './modules/core/file/upload.routes.js';
import { documentRoutes } from './modules/core/file/document.routes.js'; // Check export type
import locationRoutes from './modules/core/location/location.routes.js';
import notificationRoutes from './modules/core/notification/notification.routes.js';
import publicRoutes from './modules/core/system/public.routes.js';
import sidebarRoutes from './modules/core/system/sidebar.routes.js';
import troubleshootRoutes from './modules/core/system/troubleshoot.routes.js';
import gitRoutes from './modules/core/system/git.routes.js';
import customModuleRoutes from './modules/core/system/custom-module.routes.js';
import dashboardRoutes from './modules/core/dashboard/routes/dashboard.routes.js';
import integrationRoutes from './modules/core/integration/integration.routes.js';
import layoutRoutes from './modules/core/system/layout.routes.js';

// Commerce & Jersey Module (Non-Core - Disabled for Transition)
// import jerseyRoutes from './modules/commerce/routes/jersey.routes.js';
// import marketplaceCategoryRoutes from './modules/commerce/routes/category.routes.js';
// import marketplaceRoutes from './modules/commerce/routes/marketplace.routes.js';
// import courierRoutes from './modules/commerce/routes/courier.routes.js';
import labRoutes from './modules/labs/routes/lab.routes.js';


const app = express();
const httpServer = createServer(app);

// CORS configuration - allowing credentials and specific origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'http://127.0.0.1:3000',
    'http://localhost:5188',
    'http://127.0.0.1:5188',
    'http://192.168.1.11:5175',
    process.env.FRONTEND_URL,
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

const io = new SocketIOServer(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
    }
});

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

const API_PREFIX = '/api/v1';

// Main System Startup
async function bootstrap() {
    try {
        console.log('🏁 [System] Starting SIP Core V3.0...');

        // 1. Initialize Dynamic Modules
        await ModuleLoader.init(app);

        // 2. Register Mandatory Core routes (The Roots)
        ModuleLoader.registerCoreRoute('auth', authRoutes);
        ModuleLoader.registerCoreRoute('profile', profileRoutes);
        ModuleLoader.registerCoreRoute('dashboard', dashboardRoutes);
        ModuleLoader.registerCoreRoute('role-requests', roleRequestRoutes);
        ModuleLoader.registerCoreRoute('permissions/sidebar', sidebarRoutes);
        ModuleLoader.registerCoreRoute('layout', layoutRoutes);

        // 3. Register System routes (The Trunk)
        ModuleLoader.registerCoreRoute('uploads', uploadRoutes);
        ModuleLoader.registerCoreRoute('documents', documentRoutes);
        ModuleLoader.registerCoreRoute('locations', locationRoutes);
        ModuleLoader.registerCoreRoute('notifications', notificationRoutes);
        ModuleLoader.registerCoreRoute('integration', integrationRoutes);
        ModuleLoader.registerCoreRoute('public', publicRoutes);
        ModuleLoader.registerCoreRoute('analytics', analyticsRoutes);
        ModuleLoader.registerCoreRoute('reports', reportRoutes);
        ModuleLoader.registerCoreRoute('modules', customModuleRoutes);
        ModuleLoader.registerCoreRoute('troubleshoot', troubleshootRoutes);
        ModuleLoader.registerCoreRoute('git', gitRoutes);
        ModuleLoader.registerCoreRoute('labs', labRoutes);

        // 4. Global Health Check
        app.get('/health', (req, res) => {
            res.json({ status: 'ok', timestamp: new Date().toISOString(), plugins: 'registered' });
        });

        // 5. Start Server
        const PORT = process.env.PORT || 5000;
        httpServer.listen(PORT, () => {
            console.log(`🚀 [System] Server running on port ${PORT}`);
        });

    } catch (err) {
        console.error('🔥 [System] Bootstrap failed:', err);
        process.exit(1);
    }
}

bootstrap();

export default app;
