import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import helmet from 'helmet';
import prisma from './lib/prisma.js';

// Route imports
// Auth & Profile
import authRoutes from './modules/core/auth/auth.routes.js';
import profileRoutes from './modules/core/profile/profile.routes.js';
import roleRequestRoutes from './modules/core/auth/role-request.routes.js';


// Athlete
import athleteRoutes from './modules/athlete/athlete.routes.js';
import certificateRoutes from './modules/certificate/certificate.routes.js';
import configRoutes from './modules/athlete/config.routes.js';

// Club Management
import clubRoutes from './modules/club/club.routes.js';
import clubMemberRoutes from './modules/club/club-member.routes.js';
import clubOrganizationRoutes from './modules/club/club-organization.routes.js';
import clubUnitRoutes from './modules/club/club-unit.routes.js';
import attendanceRoutes from './modules/club/attendance.routes.js';
import financeRoutes from './modules/club/finance.routes.js';
import inventoryRoutes from './modules/club/inventory.routes.js';
import coachRoutes from './modules/club/manpower/coach.routes.js';
import manpowerRoutes from './modules/club/manpower/manpower.routes.js';
import schoolRoutes from './modules/club/school/school.routes.js';
import perpaniRoutes from './modules/club/perpani/perpani.routes.js';

// Event & Competition
import scoreRoutes from './modules/event/routes/score.routes.js';
import scheduleRoutes from './modules/event/routes/schedule.routes.js';
import eoRoutes from './modules/event/routes/eo.routes.js';
import eventRoutes from './modules/event/routes/event.routes.js';
import judgeRoutes from './modules/event/routes/judge.routes.js';
import categoryRoutes from './modules/event/category.routes.js';
import matchRoutes from './modules/event/routes/match.routes.js';

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

// Commerce & Jersey Module
import jerseyRoutes from './modules/commerce/routes/jersey.routes.js';
import marketplaceCategoryRoutes from './modules/commerce/routes/category.routes.js';
import marketplaceRoutes from './modules/commerce/routes/marketplace.routes.js';
import courierRoutes from './modules/commerce/routes/courier.routes.js';
import labRoutes from './modules/labs/routes/lab.routes.js';


const app = express();
const httpServer = createServer(app);

// CORS configuration - allowing credentials and specific origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:3000',
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

// Register all routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/athletes`, athleteRoutes);
app.use(`${API_PREFIX}/config`, configRoutes);
app.use(`${API_PREFIX}/scores`, scoreRoutes);
app.use(`${API_PREFIX}/schedules`, scheduleRoutes);
app.use(`${API_PREFIX}/attendance`, attendanceRoutes);
app.use(`${API_PREFIX}/finance`, financeRoutes);
app.use(`${API_PREFIX}/inventory`, inventoryRoutes);
app.use(`${API_PREFIX}/reports`, reportRoutes);
app.use(`${API_PREFIX}/profile`, profileRoutes);
app.use(`${API_PREFIX}/analytics`, analyticsRoutes);
app.use(`${API_PREFIX}/uploads`, uploadRoutes);
app.use(`${API_PREFIX}/jersey`, jerseyRoutes);
app.use(`${API_PREFIX}/marketplace/categories`, marketplaceCategoryRoutes);
app.use(`${API_PREFIX}/marketplace`, marketplaceRoutes);
app.use(`${API_PREFIX}/documents`, documentRoutes);
app.use(`${API_PREFIX}/clubs`, clubRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/certificates`, certificateRoutes);
app.use(`${API_PREFIX}/club-members`, clubMemberRoutes);
app.use(`${API_PREFIX}/club-organizations`, clubOrganizationRoutes);
app.use(`${API_PREFIX}/club-units`, clubUnitRoutes);
app.use(`${API_PREFIX}/coaches`, coachRoutes);
app.use(`${API_PREFIX}/couriers`, courierRoutes);
app.use(`${API_PREFIX}/modules`, customModuleRoutes);
app.use(`${API_PREFIX}/eo`, eoRoutes);
app.use(`${API_PREFIX}/events`, eventRoutes);
app.use(`${API_PREFIX}/judges`, judgeRoutes);
app.use(`${API_PREFIX}/locations`, locationRoutes);
app.use(`${API_PREFIX}/manpower`, manpowerRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);
app.use(`${API_PREFIX}/perpani`, perpaniRoutes);
app.use(`${API_PREFIX}/public`, publicRoutes);
app.use(`${API_PREFIX}/role-requests`, roleRequestRoutes);
app.use(`${API_PREFIX}/integration`, integrationRoutes);
app.use(`${API_PREFIX}/schools`, schoolRoutes);
app.use(`${API_PREFIX}/permissions/sidebar`, sidebarRoutes);
app.use(`${API_PREFIX}/troubleshoot`, troubleshootRoutes);
app.use(`${API_PREFIX}/git`, gitRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
app.use(`${API_PREFIX}/labs`, labRoutes);
app.use(`${API_PREFIX}/layout`, layoutRoutes);
app.use(`${API_PREFIX}/matches`, matchRoutes);


app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
