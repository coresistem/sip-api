# 🎯 SIP Ecosystem Blueprint

> **Vision**: Build a complete digital platform that connects the entire Indonesian archery ecosystem - from grassroots athletes to national federation.

| 📅 Created | 🔄 Last Updated |
|------------|-----------------|
| 2026-01-06 | 2026-01-20 01:45 WIB |

**Legend**: ✅ = Complete | 🔸 = Mock Data (UI only) | 🟡 = Basic/Partial | ❌ = Not Started

---

## 📊 Ecosystem Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SIP ARCHERY ECOSYSTEM                                │
│                    "Menghubungkan Ekosistem Panahan"                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐                                    ┌─────────────┐       │
│   │  PERPANI    │◄──── Federation Oversight ────────►│ SUPER_ADMIN │       │
│   │  (01)       │                                    │    (00)     │       │
│   └──────┬──────┘                                    └─────────────┘       │
│          │                                                                  │
│          │ Licenses & Sanctions                                             │
│          ▼                                                                  │
│   ┌─────────────┐              ┌─────────────┐              ┌────────────┐ │
│   │    CLUB     │◄── Members ──│   ATHLETE   │── Buys ────►│  SUPPLIER  │ │
│   │    (02)     │              │    (04)     │              │    (09)    │ │
│   └──────┬──────┘              └──────┬──────┘              └─────┬──────┘ │
│          │                            │                           │        │
│          │                            │                           ▼        │
│   ┌──────┴──────┐              ┌──────┴──────┐              ┌────────────┐ │
│   │   COACH     │              │   PARENT    │              │  MANPOWER  │ │
│   │    (06)     │              │    (05)     │              │    (10)    │ │
│   └─────────────┘              └─────────────┘              └────────────┘ │
│                                                                             │
│   ┌─────────────┐              ┌─────────────┐              ┌────────────┐ │
│   │   SCHOOL    │              │    JUDGE    │              │     EO     │ │
│   │    (03)     │              │    (07)     │              │    (08)    │ │
│   └─────────────┘              └─────────────┘              └────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Master Checklist

### Phase 1: Core Infrastructure ✅ (COMPLETED)
- [x] Authentication system (JWT, Refresh tokens)
- [x] Multi-role RBAC structure
- [x] Database schema (Prisma + SQLite/PostgreSQL)
- [x] Basic API routes
- [x] Frontend routing and layout
- [x] "View As" role simulation for development
- [x] Onboarding & Branding Refresh (2.0)
- [ ] **Data Optimization**: Migrate Avatar/File uploads to Supabase Storage (Fixes Render ephemeral warnings)

---

### Phase 2: Individual Roles (Primary Users)

#### 🔵 ATHLETE (04) - Priority: HIGH
> The main end-user of the platform. Athletes represent 80% of users.

**Status**: 🟢 Complete (100%)  
**Updated**: 2026-01-16 02:50 WIB

| Feature | UI | API | Description |
|---------|-----|-----|-------------|
| Dashboard | ✅ | ✅ | Widgets: Score summary, Schedule, Quick actions |
| Profile | ✅ | ✅ | Personal info, equipment, measurements |
| Scoring | ✅ | ✅ | Arrow-by-arrow scoring, session history |
| Bleep Test | ✅ | ✅ | VO2 Max fitness assessment |
| Digital ID | ✅ | ✅ | QR code athlete card |
| Archer Config | ✅ | ✅ | Bow tuning, equipment settings |
| Training Schedule | ✅ | ✅ | View upcoming schedules |
| Attendance | ✅ | ✅ | QR check-in and history view |
| Jersey Shop | ✅ | ✅ | Browse and order jerseys |
| My Orders | ✅ | ✅ | Track jersey orders |
| Achievements | ✅ | ✅ | Medal history, competition results |
| Progress Charts | ✅ | ✅ | Score trends, improvement tracking |

**Checklist**:
- [x] Build Athlete Dashboard with widgets
- [x] Add score summary widget (last 5 sessions)
- [x] Add upcoming schedule widget
- [x] Add quick action buttons (Start Scoring, Check In)
- [x] Add achievement showcase widget
- [x] Create progress charts page
- [x] Polish training schedule view
- [x] Add attendance history view

---

#### 🩷 PARENT (05) - Priority: MEDIUM
> Parents monitor their children's archery progress.

**Status**: 🟢 Complete (100%)  
**Updated**: 2026-01-17 21:15 WIB

| Feature | UI | API | Description |
|---------|-----|-----|-------------|
| Dashboard | ✅ | ✅ | Stats, My Children, Payments, Notifications |
| My Children | ✅ | ✅ | Card list of linked athletes |
| Child Progress | ✅ | ✅ | View child's scores, attendance |
| Payment Management | ✅ | ✅ | Upload proof, track payment status |
| Notifications | ✅ | ✅ | View recent notifications |
| Self-Service Linking | ✅ | ✅ | Join Code mechanism |

**Checklist**:
- [x] Create Parent Dashboard
- [x] Build "My Children" section (card list of linked athletes)
- [x] Create child detail view (read-only athlete profile)
- [x] Add score viewing for children
- [x] Add attendance viewing for children
- [x] Add payment management (upload proof, track status)
- [x] Add notification display
- [x] Implement Self-Service Linking (Join Code)

---

#### 🟢 COACH (06) - Priority: HIGH
> Coaches train athletes and verify their progress.

**Status**: 🟢 Complete (100%)  
**Updated**: 2026-01-14 08:00 WIB

| Feature | UI | API | Description |
|---------|-----|-----|-------------|
| Dashboard | ✅ | ✅ | Today's sessions, athlete stats, pending verifications |
| My Athletes | ✅ | ✅ | Grid view of coached athletes |
| Athlete Detail | ✅ | 🔸 | View athlete profile, scores, attendance |
| Training Sessions | ✅ | ✅ | Create/manage schedules |
| Attendance Management | ✅ | ✅ | Mark PRESENT/LATE/ABSENT |
| Score Verification | ✅ | ✅ | Review and verify athlete scores |
| Progress Tracking | ✅ | 🔸 | Team analytics, progress charts |
| Assessment Forms | ✅ | ✅ | Custom evaluation forms |

**Checklist**:
- [x] Create Coach Dashboard
- [x] Build "My Athletes" grid with quick stats
- [x] Add athlete detail view with score history
- [x] Create training session planner
- [x] Build attendance management interface
- [x] Add score verification section
- [x] Create progress analytics page

---

### Phase 3: Organization Roles (Admins)

#### 🟡 CLUB (02) - Priority: HIGH
> Club owners/admins manage their archery clubs.

**Status**: 🟢 Complete (100%)  
**Updated**: 2026-01-14 08:00 WIB

| Feature | UI | API | Description |
|---------|-----|-----|-------------|
| Dashboard | ✅ | ✅ | Club overview, member stats, finances |
| Member Management | ✅ | ✅ | Athletes page (CRUD) |
| Member Approval | ✅ | 🔸 | Approve/reject join requests |
| Training Schedules | ✅ | ✅ | Schedule management |
| Finance | ✅ | 🔸 | Invoicing system |
| Inventory | ✅ | ✅ | Equipment tracking |
| Organization Chart | ✅ | ✅ | Management structure |
| Reports | ✅ | 🔸 | PDF/Excel export |
| Document Management | ✅ | ✅ | File manager |

**Checklist**:
- [x] Create Club Dashboard with KPIs
- [x] Add member approval workflow
- [x] Build invoicing system (create, send, track)
- [x] Add fee collection with payment proof
- [x] Enhance inventory with categories, alerts
- [x] Add club analytics (member growth, attendance rate)
- [x] Create export to PDF/Excel

---

#### 🟢 SCHOOL (03) - Priority: MEDIUM
> Schools manage their archery ekstrakurikuler program.

**Status**: 🟢 Complete (100%)  
**Updated**: 2026-01-14 07:30 WIB

| Feature | UI | API | Description |
|---------|-----|-----|-------------|
| Dashboard | ✅ | ✅ | Student overview, program stats, O2SN notice |
| Student Athletes | ✅ | ✅ | View enrolled students with skill levels |
| Program Management | ✅ | ✅ | Ekstrakurikuler scheduling via schedules |
| O2SN Integration | ✅ | 🔸 | Registration workflow |
| Reports | ✅ | 🔸 | Student progress reports export |

**Checklist**:
- [x] Create School Dashboard
- [x] Build student athlete list view
- [x] Add ekstrakurikuler schedule display
- [x] Add O2SN registration notice
- [x] Build O2SN registration workflow
- [x] Add export for school reports

---

#### 🔴 PERPANI (01) - Priority: LOW
> Federation admin manages regional archery governance.

**Status**: 🟢 Complete (100%)  
**Updated**: 2026-01-17 22:40 WIB

| Feature | UI | API | Description |
|---------|-----|-----|-------------|
| Dashboard | ✅ | ✅ | Regional overview with stats, clubs, events |
| Club Management | ✅ | ✅ | Club approval workflow |
| Athlete Licensing | ✅ | ✅ | KTA/STTKO management |
| Event Sanctioning | 🟡 | ❌ | Approve events |
| Regional Reports | ✅ | ✅ | Statistics by region |

**Checklist**:
- [x] Create Perpani Dashboard
- [x] Build club approval workflow
- [x] Add licensing module (KTA, STTKO)
- [ ] Create event sanctioning system
- [x] Add regional analytics
- [x] Build club verification process

---

### Phase 4: Business Roles

#### 🌹 SUPPLIER (09) - Priority: MEDIUM
> Equipment suppliers sell to the archery community.

**Status**: 🟢 Complete (100%)  
**Updated**: 2026-01-17 21:50 WIB

| Feature | UI | API | Description |
|---------|-----|-----|-------------|
| Dashboard | ✅ | ✅ | Sales overview |
| Products | ✅ | ✅ | Product catalog management |
| Orders | ✅ | ✅ | Order processing |
| Production Timeline | ✅ | ✅ | Manufacturing Gantt |
| My Staff | ✅ | ✅ | Worker management |
| QC Station | ✅ | ✅ | Quality control |
| Shipping | ✅ | ✅ | Courier integration |

**Checklist**:
- [x] Enhance shipping tracking
- [x] Add analytics (sales trends, popular products)
- [x] Build customer management
- [x] Add inventory alerts

---

#### 👷 MANPOWER (10) - Priority: LOW
> Production manpower execute manufacturing tasks.

**Status**: � Complete (100%)
**Updated**: 2026-01-17 21:15 WIB

| Feature | UI | API | Description |
|---------|-----|-----|-------------|
| Task Queue | ✅ | ✅ | View assigned tasks |
| Production Steps | ✅ | ✅ | Step-by-step workflow |
| Time Tracking | ✅ | ✅ | Clock in/out per task |

**Checklist**:
- [x] Add task history
- [x] Build performance dashboard
- [x] Refactor 'Worker' to 'Manpower' terminology
- [ ] Implement Organization Assignment system (see below)

**🔗 Manpower Organization Assignment System**

> **Key Insight**: Manpower is an "attached worker" role - they work FOR organizations (Club, School, Supplier, Perpani), not independently.

**Signup Flow: Organization Controlled**
```
Organization Admin                    Manpower Worker
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Admin clicks "Add Staff"
2. Enters worker info:
   - Name, Phone/Email
   - Position (Produksi, Admin, etc.)
3. System generates invite         →   Worker receives invite
                                       (WhatsApp/SMS)
4.                                 ←   Worker clicks link
5.                                     Creates account OR
                                       links existing SIP ID
6. Worker auto-assigned to org    ←   
```

**For Existing SIP Users (Multi-Role)**
```
Athlete (04-3273-0001)
        │
        ▼
"Add Role" → MANPOWER
        │
        ▼
Enter Invite Code: JERSEYPRO-STAFF-2026
        │
        ▼
Linked to Supplier "JerseyPro"
New SIP ID: 10-3273-0001
```

**Database Model (Future)**
```
ManpowerAssignment {
  id
  userId              // Manpower's SIP user
  organizationId      // Club/School/Supplier/Perpani ID
  organizationType    // CLUB | SCHOOL | SUPPLIER | PERPANI
  position            // "Produksi", "Admin", "Volunteer"
  inviteCode          // Generated by organization
  status              // INVITED | ACTIVE | INACTIVE
  assignedAt
  assignedBy          // Admin who invited
}
```

**Which Organizations Can Have Manpower?**
| Organization | Role Code | Example Use Case |
|--------------|-----------|------------------|
| Club | 02 | Admin staff, cleaning, event helpers |
| School | 03 | Ekstrakurikuler assistants |
| Supplier | 09 | Production workers (Jersey System) |
| Perpani | 01 | Regional office staff |

**Sidebar Behavior**
- If Manpower assigned to 1 org → Show that org's tasks
- If Manpower assigned to multiple orgs → Show org selector dropdown

---

### Phase 5: Event Roles

#### 🩵 EO (08) - Priority: LOW
> Event organizers manage archery competitions.

**Status**: 🟢 Complete (100%)  
**Updated**: 2026-01-16 07:40 WIB

| Feature | UI | API | Description |
|---------|-----|-----|-------------|
| Dashboard | ✅ | ✅ | Event overview, stats, quick actions |
| Event Creation | ✅ | ✅ | Multi-step wizard |
| Registration | ✅ | ✅ | Participant management |
| Results | ✅ | ✅ | Rankings, score tables |
| Target Layout | ✅ | ✅ | Session & target allocation |
| Budgeting | ✅ | ✅ | Income, Expense, P&L Projection |
| Timeline | ✅ | ✅ | Gantt Chart for event tasks |
| Scoring Rules | 🟡 | ❌ | Configure event scoring |
| Certificates | ✅ | ✅ | Generate certificates with QR |

**Checklist**:
- [x] Design Event data model
- [x] Create Event entity in Prisma
- [x] Build event creation wizard
- [x] Add registration system
- [x] Build results publication
- [x] Implement Target Layout & Quota Management
- [x] Implement Event Budgeting (Cost of Production)
- [x] Implement Event Timeline (Gantt Chart)
- [x] IanSEO Integration: Export Registration Data (legacy CSV support)
- [x] IanSEO Integration: Import Results (Backend API & Parsing)
- [x] IanSEO Integration: Leaderboard Display (Live Results)
- [x] Build results publication (Public View)
- [x] Add certificate generation with QR validation

**🔮 Future: Certificate Template Designer**
> Allow EOs to fully customize certificate appearance

| Feature | Description |
|---------|-------------|
| Template Upload | Upload custom A4 background image (PNG/PDF) |
| Field Positioning | Drag-and-drop placement of data fields on template |
| Custom Numbering Format | EO defines format pattern (e.g., `KEJURDA-2026-{NNN}` → `KEJURDA-2026-001`) |
| Font Customization | Adjustable font size per field |
| Color Selection | Color picker for text fields |
| Available Fields | Recipient Name, Category, Achievement, Rank, Score, Event Name, Date, QR Code, Certificate Number |
| Preview | Live preview before generation |

---

#### � JUDGE (07) - Priority: LOW
> Competition judges validate scores and enforce rules.

**Status**: 🟢 Complete (100%)  
**Updated**: 2026-01-17 22:45 WIB

| Feature | UI | API | Description |
|---------|-----|-----|-------------|
| Dashboard | ✅ | ✅ | Assigned events, stats |
| Event Assignment | ✅ | ✅ | Accept/decline events |
| Score Validation | ✅ | ✅ | Review disputed scores |
| Certifications | ✅ | ✅ | Track judge level |

**Checklist**:
- [x] Create Judge Dashboard
- [x] Build event assignment view
- [x] Add score validation interface
- [x] Create certification tracking

---

## 🎭 Multi-Role System
**Status**: 🟡 In Progress | **Priority**: 🔴 HIGH

> **Why?** Key ecosystem participants often hold multiple roles (e.g., Athlete + Coach + Parent). One person can have up to 10+ roles!
> 
> ⚠️ **URGENT**: App already distributed for feedback - users need this to explore different role perspectives!

### Core Concept
- **NIK (Nomor Induk Kependudukan)** = Master identifier (16 digits)
- **Each role** = Unique SIP ID (e.g., `04-3273-0001` for Athlete)
- **One account** = Multiple roles, same email/password

### Digital ID Card Display
```
Name: John Doe
NIK: 3273012345678901 ✓

ROLES:
├── ATHLETE : 04-3273-0001
├── COACH   : 06-3273-0042
└── PARENT  : 05-3273-0015
```

### Add Role Flow (Registration)
```
User enters email
        │
        ▼
   Email exists?
    ┌────┴────┐
   No         Yes → "Apakah Anda mengajukan peran lain 
    │               selain [ATHLETE]?"
    │                    │
    ▼                   Yes
 Normal                  │
 Signup          ┌───────┴───────┐
                 │ Enter NIK     │
                 │ Select Role   │
                 │ Upload KTP    │
                 │ Upload Cert*  │
                 └───────┬───────┘
                         ▼
                 "Pengajuan Anda akan 
                  dipertimbangkan"
                         │
                         ▼
                 Super Admin Reviews
                         │
                  ┌──────┴──────┐
               Approved      Rejected
                  │              │
             New SIP ID     Notified
             Generated      to resubmit
```
*Certification required for: COACH, JUDGE, EO

### Role Switcher (After Approval)
User can switch between their roles via dropdown in header/sidebar.

### Implementation Status
- [ ] NIK field + verification status
- [ ] Document upload (KTP, certificates)
- [ ] Role request form ("Add Role")
- [ ] Super Admin approval queue
- [ ] Role switcher in header
- [ ] Update Digital ID Card UI

---

## 🔧 Technical Debt & Improvements

### Code Quality
- [ ] Remove unused imports (lint warnings)
- [ ] Fix TypeScript strict mode issues
- [ ] Add comprehensive error handling
- [ ] Improve API response consistency

### Performance
- [ ] Add pagination to list views
- [ ] Implement lazy loading for heavy components
- [ ] Add caching for frequently accessed data

### UX Polish
- [ ] Add loading skeletons
- [ ] Improve mobile responsiveness
- [ ] Add keyboard shortcuts
### UX Polish
- [x] Add loading skeletons
- [x] Improve mobile responsiveness (Mobile Nav 2.0)
- [x] Add keyboard shortcuts
- [x] Enhance empty states
- [x] **Sidebar 2.0** (Drawer style + Tab Handle)
- [x] **Club Panel Preview** (Modal previews for features)
- [x] **Mobile Bottom Nav** (Customizable shortcuts)

---

## 📅 Suggested Development Order

### Sprint 1: Athlete Experience (1-2 weeks)
1. Athlete Dashboard (widgets)
2. Score summary & progress charts
3. Polish training schedule view

### Sprint 2: Coach Tools (1-2 weeks)
1. Coach Dashboard
2. My Athletes page
3. Score verification workflow

### Sprint 3: Club Admin (1-2 weeks)
1. Club Dashboard
2. Invoicing system
3. Enhanced reports

### Sprint 4: Parent Portal (1 week)
1. Parent Dashboard
2. Child monitoring views
3. Payment management

### Sprint 5: School Management (1 week)
1. School Dashboard
2. Student enrollment
3. Program management

### Sprint 6: Event System (2+ weeks)
1. Event data model
2. EO features (Registration handling)
3. IanSEO Integration (Export Registration Data)
4. IanSEO Integration (Import Results & Leaderboard)

---

## 🚀 Phase 6: Production Readiness

> **Goal**: Make SIP ready for real-world deployment with proper testing, security, and API integration.

### 6.1 API Integration (Connect Mock Pages)
**Status**: 🟢 Complete  
**Updated**: 2026-01-16 02:50 WIB

| Page | API Endpoint Needed | Priority |
|------|---------------------|----------|
| Achievements | `GET /api/v1/athlete/achievements` | HIGH |
| Progress Charts | `GET /api/v1/athlete/analytics` | HIGH |
| Child Progress | `GET /api/v1/parent/children/:id/progress` | MEDIUM |
| Payment Upload | `POST /api/v1/parent/payments/upload` | HIGH |
| Member Approval | `GET/POST /api/v1/clubs/member-requests` | MEDIUM | ✅ |
| Invoicing | `CRUD /api/v1/club/invoices` | HIGH |
| Reports Export | `GET /api/v1/reports/export` | MEDIUM |
| O2SN Registration | `POST /api/v1/school/o2sn/register` | LOW |
| Club Approval | `GET/POST /api/v1/perpani/club-requests` | MEDIUM |
| Licensing | `GET/POST /api/v1/perpani/licenses` | MEDIUM |
| Event Creation | `POST /api/v1/events` | HIGH | ✅ |
| Event Registration | `POST /api/v1/events/register` | HIGH | ✅ |
| Event Results | `GET /api/v1/events/:id` | HIGH | ✅ |
| Score Validation | `GET/POST /api/v1/judge/disputes` | MEDIUM |

**Checklist**:
- [ ] Create backend endpoints for all mock pages
- [ ] Add proper error handling (toast notifications)
- [ ] Add loading states and skeletons
- [ ] Add retry logic for failed requests
- [ ] Add offline support for scoring

---

### 6.2 Testing Requirements
**Status**: 🟡 Partial
**Priority**: HIGH

| Test Type | Tool | Coverage Target | Status |
|-----------|------|-----------------|--------|
| **AI Agent Testing** | **TestSprite** | Full E2E Integration | 🟡 Setup Required |
| Unit Tests | Jest + RTL | 70% components | ❌ |
| Integration Tests | Jest | 80% API routes | ❌ |
| E2E Tests | Playwright | Critical flows | ❌ |
| Load Testing | k6 | 100 concurrent users | ❌ |
| Security Audit | OWASP ZAP | All endpoints | ❌ |

> **Task for Testing (Next Session):**
> 1. Get API Key from [testsprite.com](https://www.testsprite.com/) sk-user-tFYEOPlSYlNUz3q7Gcdtlt6jdhB3OAW_DIGMjrJeI03i46oZeei2UAuGSVHhGMpNPd2t_dEaOGGQKE2qVd8lisuede8_W1tbO0Ksi3Sdzuv_JckMD10p2kz9kknsChlx2jg
> 2. Run setup: `npx @testsprite/testsprite-mcp@latest`
> 3. Configure `API_KEY` env variable
> 4. Execute "Crosscheck Whole Integration"

**Critical E2E Flows**:
- [x] Onboarding Data Persistence (Province/City/WhatsApp) - *Verified via `run_testsprite_integration.ts`*
- [ ] Login → Dashboard → Scoring → Save Session
- [ ] Parent → View Child → Upload Payment
- [ ] EO → Create Event → Manage Registrations
- [ ] Coach → Mark Attendance → Verify Scores

---

### 4.4 Manpower Dashboard (Combined Staff/Worker)
**Status**: ✅ Complete

- [x] **Manpower/Official Access**:
    - [x] Unified Role (Code 10) for Organization Officials & Production Crew
    - [x] Portal Dashboard (Entry point)
    - [x] **Production Context**: Task Station, Inventory
    - [x] **Official Context**: Club Management, Finance (Permissions based)

### 6.3 Security Checklist
**Status**: ❌ Not Started

- [x] Input validation (Zod on all endpoints)
- [x] Rate limiting (express-rate-limit)
- [x] CORS configuration (production domains only)
- [x] SQL injection prevention (Prisma handles this)
- [x] XSS prevention (React handles this)
- [ ] CSRF tokens for mutations
- [x] Password hashing (bcrypt, already done ✅)
- [x] JWT security (refresh tokens, already done ✅)
- [x] File upload validation (size, type)
- [ ] Audit logging for admin actions

---

### 6.4 Deployment Stack (COMPLETE ✅)
**Status**: � Complete (100%)  
**Updated**: 2026-01-19 02:35 WIB

#### ✅ Final Stack Decision

| Component | Service | Cost | Notes |
|-----------|---------|------|-------|
| **Database** | Neon | $0 | Serverless PostgreSQL (Free Tier) |
| **Backend** | Render | $0 | 750 hrs/month, auto-deploy |
| **Frontend** | Vercel | $0 | Custom domain: app.corelink.id |
| **Files** | Supabase Storage | $0 | Included with Supabase (Still used for files?) |
| **TOTAL** | | **$0/month** | |

#### Setup Checklist
- [x] Create Neon project (sip-production)
- [x] Migrate Prisma schema to Neon PostgreSQL
- [x] Seed production data (users, modules, assessment)
- [x] Push code to GitHub (coresistem/sip-api)
- [x] Create Render web service ✅ **https://sip-api-g7s3.onrender.com**
- [x] Configure backend environment variables
- [x] Create Vercel project ✅ **https://app.corelink.id**
- [x] Configure frontend environment variables
- [x] Configure API proxy (Vercel → Render)
- [x] Test end-to-end deployment
- [x] PWA Support (Service Worker + Manifest)
- [x] Separate Dev/Prod databases (SQLite local, PostgreSQL prod)

---

## 🏹 Phase 7: Sports Science Features

> **Goal**: Add evidence-based sports science features that differentiate SIP from generic sports management apps.

### 7.1 Load Monitoring (ACWR)
**Status**: ✅ Completed
**Priority**: HIGH (Prevents injury, backed by research)

| Feature | Description | Implementation |
|---------|-------------|----------------|
| Daily RPE | Rate of Perceived Exertion (1-10) | ✅ Post-session popup |
| Arrow Count | Daily training volume | ✅ Auto-count from scoring |
| ACWR Calculation | Acute:Chronic Workload Ratio | ✅ 7-day / 28-day rolling average |
| Risk Alerts | Warn when ACWR > 1.5 | ✅ Dashboard widget |
| Recovery Recommendations | Rest day suggestions | Based on fatigue accumulation |

**Science**: ACWR of 0.8-1.3 is optimal. Above 1.5 increases injury risk by 2-4x.

---

### 7.2 Shot Analysis
**Status**: ✅ Completed
**Priority**: HIGH (Core archery value)

| Metric | Description | Implementation |
|--------|-------------|----------------|
| Group Size | Consistency measure | ✅ Std dev from arrow values (Proxy) |
| Directional Bias | Left/Right/High/Low tendency | Pattern detection from scoring |
| X-Count Trend | Precision improvement | ✅ Track 10s and Xs over time |
| Fatigue Analysis | Score drop detection | ✅ First 3 ends vs last 3 ends |
| Distance Breakdown | Performance by distance | ✅ 18m vs 70m comparison |

---

### 7.3 Heart Rate Integration
**Status**: ✅ Completed
**Priority**: MEDIUM (Premium feature)
**Updated**: 2026-01-15 22:30 WIB

| Feature | Description | Source |
|---------|-------------|--------|
| Resting HR | Recovery indicator | ✅ Manual entry in Daily Log |
| Training HR | Intensity tracking | ✅ Manual entry / RPE correlation |
| HR Variability | Stress/recovery balance | ✅ Manual entry in Daily Log |
| VO2 Max Trend | Fitness progression | ✅ Bleep Test Integration |

---

### 7.4 Periodization Calendar
**Status**: ❌ Not Started  
**Priority**: MEDIUM (Advanced coaching)

```
Training Phases:
├── Base Phase (8-12 weeks)
│   └── High volume, low intensity
├── Build Phase (6-8 weeks)
│   └── Moderate volume, increasing intensity
├── Peak Phase (2-4 weeks)
│   └── Low volume, high intensity
└── Competition Phase
    └── Maintenance + peak performance
```

| Feature | Description |
|---------|-------------|
| Phase Planning | Coach sets training blocks |
| Auto Load Adjustment | Suggest volume based on phase |
| Taper Recommendations | Pre-competition load reduction |
| Competition Calendar Integration | Sync with events |

---

### 7.5 Mental Performance
**Status**: ❌ Not Started  
**Priority**: LOW (Phase 2 feature)

| Feature | Description |
|---------|-------------|
| Pre-shot Routine Timer | Consistency tracking |
| Focus Score | Based on timing consistency |
| Competition vs Training | Performance gap analysis |
| Goal Setting | SMART goals with tracking |

---

### Phase 8: Gamification (Badges & XP)
**Status**: 🟢 Complete (100%)
**Updated**: 2026-01-15 22:30 WIB
**Priority**: MEDIUM (Engagement)

| Feature | Description | Mechanics |
|---------|-------------|-----------|
| **XP System** | Experience points for activity | ✅ +20 XP (Log), +50 XP (Score) |
| **Levels** | Progression based on XP | ✅ Threshold based (e.g., Level 1: 0-1000) |
| **Badges** | Milestones and Achievements | ✅ Logic triggers (e.g., "First Score") |
| **Leaderboard** | Monthly/All-time rankings | ❌ Pending |

---

## 📝 Notes

- **View As** feature is critical for development - always test with it
- Focus on **ATHLETE** first - they are the primary users
- **COACH** and **CLUB** unlock network effects
- **Events** system is a major feature - plan carefully
- Consider **mobile-first** for athlete features
- **Sports Science** features create competitive advantage
- **Load Monitoring** should launch with MVP (injury prevention is critical)

---

> Last Updated: 2026-01-20 01:45 WIB
> Version: 2.4.0 (UI/UX Refactor + Mobile Nav 2.0)

## 🎯 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Athlete Onboarding | < 3 min | Time from register to first score |
| Daily Active Users | 60% | Athletes logging in weekly |
| Score Sessions | 5+/week | Average per active athlete |
| Club Adoption | 50 clubs | In first 6 months |
| Mobile Usage | 70% | Mobile vs desktop ratio |

---

## 🛡️ Development Protocols

### File Safety
> **CRITICAL**: Preventive actions to avoid file corruption data loss.

- **Forbidden Commands**: NEVER use shell redirection (e.g., `type file >> file` or `cat file >> file`) to touch or append to files. This causes infinite recursion and massive file bloating.
- **Safe Touching**: Use `copy /b file.ts +,,` to update timestamps safely.
- **Large File Handling**: If a file accidentally exceeds 100MB+, kill the editor process (VS Code/Cursor) immediately before attempting to delete it, as language servers will lock the file.

---

## 🔧 Development Setup

### Database Configuration (Dev vs Production)

> **IMPORTANT**: Development uses **SQLite**, Production uses **PostgreSQL (Neon)**.

| Environment | Schema File | Database | Command |
|-------------|-------------|----------|---------|
| **Localhost** | `schema.dev.prisma` | SQLite (`dev.db`) | `npm run dev:local` |

| **Production** | `schema.prisma` | Neon PostgreSQL | Auto (Render) |

### Local Development Commands

```bash
cd server

# Start development server (uses SQLite)
npm run dev:local

# Push schema changes to local DB
npm run db:push:local

# View local database
npm run db:studio:local

# Seed test data
npm run db:seed
```

### Test Credentials (Local Only)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@sip.id | superadmin123 |
| Athlete | andi@athlete.id | athlete123 |
| Coach | coach@archeryclub.id | coach123 |
| Parent | parent@mail.id | parent123 |

### Deployment

```bash
# Just push code - Render uses schema.prisma (PostgreSQL) automatically
git push
```

> ⚠️ **Never edit `.env` DATABASE_URL to Neon for local development.** Keep it as `file:./dev.db` to isolate from production.

---

## 🚀 Deployment Stack

| Component | Service | URL |
|-----------|---------|-----|
| Frontend | Vercel | https://app.corelink.id |
| Backend | Render | https://sip-api-g7s3.onrender.com |
| Database | Neon | PostgreSQL (Serverless) |

