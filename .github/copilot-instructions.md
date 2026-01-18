# AI Coding Agent Instructions - SIP (Sistem Integrasi Panahan)

## Project Overview
**SIP** is a full-stack archery club management platform with multi-role RBAC, real-time scoring, and analytics. Built with React 18 (Vite) frontend and Express.js + Prisma backend, using PostgreSQL + Redis infrastructure.

## Architecture & Data Flow

### Stack & Services
- **Client**: React 18 + Vite + Tailwind CSS + Socket.IO client
- **Server**: Express.js + TypeScript + Prisma ORM
- **Database**: PostgreSQL (production), SQLite (development)
- **Cache/Realtime**: Redis + Socket.IO for real-time score updates
- **Deployment**: Docker Compose (PostgreSQL 16, Redis 7)

### Core Entities & RBAC Model
6 user roles with strict hierarchical permissions defined in [server/src/middleware/rbac.middleware.ts](server/src/middleware/rbac.middleware.ts#L18-L71):
- **SUPER_ADMIN** (100): System-wide control; auditing
- **CLUB_OWNER** (80): Club management; finances; user management
- **COACH** (60): Athlete scoring; attendance; schedule management
- **STAFF** (50): Inventory; attendance verification; basic finance view
- **ATHLETE** (30): Own profile/scores; leaderboard; attendance view
- **PARENT** (20): Child profile/progress; billing view; payment proof upload

Use `requireRoles()` and `hasPermission()` utilities for endpoint protection. Example: [server/src/routes/score.routes.ts#L13](server/src/routes/score.routes.ts#L13)

### Data Flow Pattern: Authentication
1. Client login (email/password) → [auth.controller.ts](server/src/controllers/auth.controller.ts#L32)
2. Server validates password (bcryptjs), generates JWT tokens (access: 15m, refresh: 7d)
3. Client stores tokens in `localStorage` and attaches to all API requests via [AuthContext.tsx](client/src/context/AuthContext.tsx#L47-L52) axios interceptor
4. Token refresh on 401 response is automatic; failed refresh clears localStorage and redirects to `/login`

### Protected Routes Pattern
All protected API routes require `authenticate` middleware first, then optionally `requireRoles`:
```typescript
router.post('/submit', authenticate, requireRoles(Role.COACH), async (req, res) => {
  // req.user is set by authenticate middleware
  // Contains: userId, email, role, clubId
});
```

### Real-Time Features
- Socket.IO events for live score submission and leaderboard updates
- Separate socket namespaces per feature (e.g., `/scores`, `/attendance`)
- Client connects via `socket.io-client` in page components

## Critical Developer Workflows

### Local Setup (Required Order)
```bash
# 1. Start infrastructure
docker-compose up -d

# 2. Server setup
cd server && npm install
npm run db:generate    # Generate Prisma client
npm run db:push        # Apply schema to PostgreSQL
npm run db:seed        # Load test data (6 roles, test users)
npm run dev            # Start on http://localhost:3000

# 3. Client setup (new terminal)
cd client && npm install
npm run dev            # Start Vite on http://localhost:5173
```

### Database
- Schema: [server/prisma/schema.prisma](server/prisma/schema.prisma)
- **db:push**: Sync dev schema without migrations (OK for rapid iteration)
- **db:migrate**: Create formal migration (for production changes)
- **db:studio**: Launch Prisma Studio GUI at http://localhost:5555
- Test data (email/password): See [README.md](README.md#L33-L39)

### Common Tasks
- **Add new role**: Update Prisma `Role` enum, add permissions to `ROLE_PERMISSIONS` in rbac.middleware.ts
- **Add API endpoint**: Create route in `routes/`, add validation with `express-validator`, protect with `authenticate` + `requireRoles`
- **Add page**: Create in `client/src/pages/`, use `useAuth()` hook for user context, add route in [client/src/App.tsx](client/src/App.tsx#L17-L29)

## Project-Specific Conventions

### Naming Conventions
- **Routes**: RESTful, prefixed with `/api/v1/` (e.g., `/api/v1/scores/submit`)
- **Database models**: PascalCase (Athlete, ScoringRecord, User)
- **API responses**: `{ success: boolean, data?: T, message?: string, errors?: [] }`
- **Enums**: SCREAMING_SNAKE_CASE (SUPER_ADMIN, ACTIVE, MALE)

### Response Format
All endpoints return structured JSON:
```json
{ "success": true, "data": {...}, "message": "Action succeeded" }
{ "success": false, "message": "Error description", "errors": [{field, msg}] }
```

### Validation Pattern
Use `express-validator` with field-level rules before controller logic:
```typescript
const rules = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 })
];
router.post('/endpoint', rules, authController.action);
// Controller reads errors via validationResult(req)
```

### File Organization
- **Routes** define endpoints and validation
- **Controllers** handle business logic and response formatting
- **Services**: Currently empty—future layer for shared business logic
- **Middleware**: Authentication, RBAC, logging
- **Lib**: Utilities (prisma.ts, JWT helpers)

### Frontend State Management
- **AuthContext**: Global user, login state, token refresh
- **Page components**: Use `useAuth()` hook for role-based UI
- **API calls**: `axios` instance from AuthContext with token auto-injection
- **Layout**: [DashboardLayout.tsx](client/src/components/layout/DashboardLayout.tsx) wraps authenticated pages; [LoginPage.tsx](client/src/pages/auth/LoginPage.tsx) handles unauthenticated access

## Integration Points

### Backend-Frontend Communication
- **REST API** for CRUD operations and authentication
- **Socket.IO** for real-time features (scoring updates, attendance changes)
- **CORS**: Configured for `http://localhost:5173` (dev); controlled by `CORS_ORIGIN` env var

### External Dependencies
- **Prisma**: Auto-generated migrations; update schema and run `db:push` or `db:migrate`
- **JWT tokens**: `JWT_SECRET` and `JWT_REFRESH_SECRET` from `.env` (stored in localStorage)
- **Bcryptjs**: Password hashing in login/register; always use bcrypt for new password fields
- **Socket.IO**: Rooms by club/feature; rooms join on auth

### Environment Variables
Server `.env` must include:
```
POSTGRES_URL=postgresql://sip_admin:sip_secure_password_2024@localhost:5432/sip_database
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
CORS_ORIGIN=http://localhost:5173
```

Client `.env.local`:
```
VITE_API_URL=http://localhost:3000/api/v1
```

## Performance & Features in Development
- ✅ Multi-role RBAC with permission-based UI rendering
- ✅ Real-time scoring and analytics
- ✅ QR code attendance
- ✅ Financial dashboards
- 🔄 **PDF reports** (pdfkit installed; not yet integrated)
- 🔄 **Push notifications** (socket.io-client ready; not yet implemented)

When implementing new features, check existing pages ([Analytics](client/src/pages/AnalyticsPage.tsx), [Finance](client/src/pages/FinancePage.tsx), [Scoring](client/src/pages/ScoringPage.tsx)) for established patterns (Chart.js for visualization, multi-role logic).
