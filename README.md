# Sistem Integrasi Panahan (SIP)

Platform manajemen klub panahan digital dengan multi-role RBAC, real-time scoring, dan analytics.

## Quick Start

### Prerequisites
- Node.js 18+
- Docker Desktop

### 1. Start Database
**Option A: Docker (PostgreSQL)**
```bash
cd d:/Antigravity/sip
docker-compose up -d
```

**Option B: Local (SQLite)**
*Useful if Docker is not available.*
1. Update `server/.env` to use `DATABASE_URL="file:./dev.db"`
2. Run setup:
```bash
cd server
npm run db:setup:local
```

### 2. Setup Backend
```bash
cd server
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

---

## Test Credentials

### Core Roles
| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Super Admin | admin@sip.id | superadmin123 | Full system access, user management |
| Perpani | perpani@perpani.or.id | perpani123 | Federation admin (National/Provincial/City) |
| Club Owner | owner@archeryclub.id | clubowner123 | Club management, member approval |
| School | school@sma1.sch.id | school123 | School archery program management |

### Individual Roles
| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Athlete | andi@athlete.id | athlete123 | Scoring, attendance, profile management |
| Parent | parent@mail.id | parent123 | Monitor linked athlete children |
| Coach | coach@archeryclub.id | coach123 | Training, attendance, athlete management |
| Judge | judge@perpani.or.id | judge123 | Event judging, certification tracking |

### Business Roles
| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Event Organizer | eo@events.id | eventorganizer123 | Event creation and management |
| Supplier | supplier@archeryshop.id | supplier123 | Equipment catalog, orders |
| Manpower | manpower@sip.id | manpower123 | Production crew, Club official, Event staff |

---

## Role Structure (Detailed)

```
📊 SIP ROLE HIERARCHY
│
│  Role Codes: 00:SUPER_ADMIN, 01:PERPANI, 02:CLUB, 03:SCHOOL, 
│              04:ATHLETE, 05:PARENT, 06:COACH, 07:JUDGE, 08:EO, 09:SUPPLIER
│              10:MANPOWER
│
├── 🔴 SUPER_ADMIN (00) - System Administrator
│   ├── SIP ID Format: 00.XXXX.XXXX
│   ├── Permissions: Full system access
│   ├── Capabilities:
│   │   ├── User management (CRUD all users)
│   │   ├── System configuration
│   │   ├── NIK verification approval (nikVerified → true)
│   │   ├── School / Club verification
│   │   ├── Perpani member approval
│   │   ├── View all AuditLog records
│   │   └── Analytics dashboard (all data)
│   └── DB Fields (User): id, email, name, role, sipId, isActive
│
├── 🔴 PERPANI (01) - Federation Admin
│   ├── SIP ID Format: 01.XXXX.XXXX
│   ├── Levels: National (01) → Provincial (01.XX) → City/Regency (01.XX.XX)
│   ├── Capabilities:
│   │   ├── Club registration approval
│   │   ├── Athlete licensing (KTA/STTKO)
│   │   ├── Event sanctioning
│   │   ├── Regional reporting
│   │   └── Manage SK Perpani documents
│   ├── DB Fields (Perpani): sipId, name, provinceId, cityId, address, phone, email, website, status
│   ├── Status Values: NO_OPERATOR, ACTIVE
│   └── Relationships: manages → Club[] (via perpaniId)
│
├── 🟡 CLUB (02) - Club Owner/Manager
│   ├── SIP ID Format: 02.XXXX.XXXX
│   ├── Capabilities:
│   │   ├── Club profile management
│   │   ├── Member approval/removal
│   │   ├── Coach assignment
│   │   ├── Training schedule (TrainingSchedule)
│   │   ├── Financial management (MembershipFee)
│   │   ├── Inventory tracking (AssetInventory)
│   │   ├── Document management (Document)
│   │   └── Organization structure (ClubOrganization)
│   ├── DB Fields (Club):
│   │   ├── Basic: sipId, name, registrationNumber, description, logoUrl
│   │   ├── Location: address, city, province, postalCode
│   │   ├── Contact: phone, email, website, whatsappHotline, instagram
│   │   ├── Perpani: isPerpaniMember, skPerpaniNo, skPerpaniDocId, perpaniId
│   │   └── Status: status (ACTIVE/INACTIVE/SUSPENDED)
│   ├── ClubOrganization Positions: CHAIRPERSON, SECRETARY, TREASURER, HEAD_COACH, CUSTOM
│   └── Relationships: owner → User, members → User[], athletes → Athlete[]
│
├── 🟢 SCHOOL (03) - School Admin
│   ├── SIP ID Format: 03.XXXX.XXXX
│   ├── Capabilities:
│   │   ├── School archery program management
│   │   ├── Student athlete tracking
│   │   ├── O2SN registration
│   │   └── Student enrollment management
│   ├── DB Fields (School):
│   │   ├── Identification: sipId, npsn (8-digit National School ID)
│   │   ├── Basic: name, address, website
│   │   ├── Location: provinceId, cityId
│   │   ├── Verification: sourceUrl (Kemendikdasmen link)
│   │   └── Status: status (NO_OPERATOR/ACTIVE)
│   ├── StudentEnrollment Fields: userId, schoolId, nisn, currentClass, joinDate, leaveDate, status
│   ├── Enrollment Status: ACTIVE, GRADUATED, TRANSFERRED
│   └── Relationships: students → StudentEnrollment[]
│
├── 🔵 ATHLETE (04) - Archer
│   ├── SIP ID Format: 04.XXXX.XXXX
│   │
│   ├── 📋 User Account (User table):
│   │   ├── id, email, name, passwordHash
│   │   ├── phone, whatsapp, avatarUrl
│   │   ├── sipId (unique), provinceId, cityId
│   │   ├── nik (16 digits), nikVerified (by SuperAdmin/Club)
│   │   ├── isStudent (true/false toggle)
│   │   ├── clubId → links to Club
│   │   ├── isActive, lastLogin
│   │   └── createdAt, updatedAt
│   │
│   ├── 🏹 Athlete Profile (Athlete table):
│   │   ├── Personal:
│   │   │   ├── dateOfBirth → auto-calculates underAgeCategory
│   │   │   ├── gender: MALE, FEMALE
│   │   │   └── nationality
│   │   │
│   │   ├── Archery Classification:
│   │   │   ├── archeryCategory: RECURVE, COMPOUND, BAREBOW, TRADITIONAL, LONGBOW
│   │   │   ├── division: Barebow, Nasional, Recurve, Compound, Traditional
│   │   │   ├── skillLevel: BEGINNER, INTERMEDIATE, ADVANCED, ELITE
│   │   │   ├── underAgeCategory: U10, U13, U15, U18, U21, Senior, Master
│   │   │   ├── dominantHand: LEFT, RIGHT
│   │   │   └── dominantEye: LEFT, RIGHT, BOTH
│   │   │
│   │   ├── Physical Measurements:
│   │   │   ├── height (cm)
│   │   │   ├── weight (kg)
│   │   │   ├── armSpan (cm)
│   │   │   └── drawLength (inch)
│   │   │
│   │   ├── Equipment Specifications:
│   │   │   ├── bowBrand, bowModel
│   │   │   ├── bowDrawWeight (lbs)
│   │   │   ├── arrowBrand, arrowSpine
│   │   │   └── (See EquipmentConfigLog for full bow tuning)
│   │   │
│   │   ├── Registration:
│   │   │   ├── athleteIdNumber (unique card number)
│   │   │   └── registrationDate
│   │   │
│   │   └── Emergency:
│   │       ├── emergencyContact (name)
│   │       ├── emergencyPhone
│   │       └── medicalNotes
│   │
│   ├── 📚 If isStudent=true (StudentEnrollment table):
│   │   ├── schoolId → links to School
│   │   ├── nisn (10-digit Nomor Induk Siswa Nasional)
│   │   ├── currentClass (e.g., "Kelas 10 IPA")
│   │   └── status: ACTIVE, GRADUATED, TRANSFERRED
│   │
│   ├── 📊 Scoring Data (ScoringRecord table):
│   │   ├── sessionDate, sessionType (TRAINING/COMPETITION/ASSESSMENT)
│   │   ├── distance (meters), targetFace
│   │   ├── arrowScores (JSON: "[[10,9,8], [10,10,9]]")
│   │   ├── totalSum, arrowCount, average
│   │   ├── tensCount, xCount
│   │   ├── weatherCondition, notes
│   │   └── isVerified (by coach)
│   │
│   ├── ⚙️ Equipment Config Log (EquipmentConfigLog table):
│   │   ├── Session: arrowsPerEnd, division, targetFace, distance
│   │   ├── Archer: drawLength (inch), drawWeight (lbs)
│   │   ├── Bow Setting: bowHeight (64"-72"), braceHeight, 
│   │   │   aTiller, bTiller, diffTiller, tillerStatus,
│   │   │   nockingPoint, nockingStatus
│   │   ├── Arrow: arrowPoint (grain), arrowLength (inch)
│   │   └── Performance: avgScoreArrow, totalScore, totalArrows, indexArrowScore
│   │
│   ├── 💰 Membership Fees (MembershipFee table):
│   │   ├── description, amount, currency (IDR), billingPeriod
│   │   ├── dueDate, status (PENDING/PAID/VERIFIED/OVERDUE/CANCELLED)
│   │   ├── paymentProofUrl, transactionDate, paymentMethod, transactionRef
│   │   └── verifiedBy, verifiedAt, rejectionReason
│   │
│   ├── 📅 Attendance (Attendance table):
│   │   ├── scheduleId, checkInTime, checkOutTime
│   │   ├── status: PRESENT, LATE, ABSENT, EXCUSED
│   │   ├── method: QR_SCAN, MANUAL, GEOLOCATION
│   │   └── latitude, longitude, locationAccuracy
│   │
│   ├── 🏆 History (HistoryLog table):
│   │   ├── logType: SCHOOL_TRANSFER, CLUB_TRANSFER, ACHIEVEMENT
│   │   ├── Transfers: fromId, fromName, fromCity, toId, toName, toCity
│   │   ├── Achievements: year, level (CITY/PROVINCE/NATIONAL/INTERNATIONAL),
│   │   │   achievement (GOLD/SILVER/BRONZE), division, distance, eventName
│   │   └── status: PENDING, APPROVED, REJECTED, COMPLETED
│   │
│   └── Relationships: belongsTo → Club, School, Parent
│
├── 🩷 PARENT (05) - Parent/Guardian
│   ├── SIP ID Format: 05.XXXX.XXXX
│   ├── Capabilities:
│   │   ├── View linked athlete children (parentOf → Athlete[])
│   │   ├── Monitor attendance (via children's Attendance records)
│   │   ├── Monitor scores (via children's ScoringRecord)
│   │   ├── Receive notifications (Notification table)
│   │   └── View/manage payments (MembershipFee via children)
│   ├── DB Fields (User): id, email, name, phone, whatsapp, sipId
│   └── Relationships: parentOf → Athlete[] (via parentId in Athlete)
│
├── 🟢 COACH (06) - Training Coach
│   ├── SIP ID Format: 06.XXXX.XXXX
│   ├── Capabilities:
│   │   ├── Training session management (TrainingSchedule)
│   │   ├── Attendance recording (mark PRESENT/LATE/ABSENT/EXCUSED)
│   │   ├── Score recording & verification (ScoringRecord → isVerified)
│   │   ├── Athlete progress tracking
│   │   └── Equipment configuration logging
│   ├── DB Fields (User): id, email, name, phone, whatsapp, sipId, clubId
│   ├── Links to: ScoringRecord (coachId), TrainingSchedule (via club)
│   ├── Certification Levels: D, C, B, A, International (stored in profile)
│   └── Relationships: belongsTo → Club, records → ScoringRecord[]
│
├── 🟣 JUDGE (07) - Competition Judge
│   ├── SIP ID Format: 07.XXXX.XXXX
│   ├── Capabilities:
│   │   ├── Event judging
│   │   ├── Score validation
│   │   ├── Rule enforcement
│   │   └── Certification tracking
│   ├── DB Fields (User): id, email, name, phone, whatsapp, sipId
│   ├── Profile Extensions (Custom): certificationLevel, disciplines[], availability
│   ├── Certification Levels: Regional, National, International
│   └── Relationships: judges → Events[] (future Event model)
│
├── 🩵 EO (08) - Event Organizer
│   ├── SIP ID Format: 08.XXXX.XXXX
│   ├── Capabilities:
│   │   ├── Event creation & management
│   │   ├── Registration handling
│   │   ├── Judge assignment
│   │   ├── Results publication
│   │   └── Certificate generation
│   ├── DB Fields (User): id, email, name, phone, whatsapp, sipId
│   ├── Profile Extensions (Custom): organizationName, eventHistory[], capabilities[]
│   └── Relationships: organizes → Events[] (future Event model)
│
└── 🌹 SUPPLIER (09) - Equipment Supplier
    ├── SIP ID Format: 09.XXXX.XXXX
    ├── Capabilities:
    │   ├── Product catalog management
    │   ├── Order processing
    │   ├── Club partnerships
    │   └── Equipment recommendations
    ├── DB Fields (User): id, email, name, phone, whatsapp, sipId
    ├── Profile Extensions (Custom): businessName, productCategories[], certifications[]
    └── Relationships: supplies → Clubs[], Products[] (future models)
```

### SIP ID Format Reference
```
Format: XX.XXXX.XXXX

First 2 digits = Role Code:
├── 00 = SUPER_ADMIN
├── 01 = PERPANI
├── 02 = CLUB
├── 03 = SCHOOL
├── 04 = ATHLETE
├── 05 = PARENT
├── 06 = COACH
├── 07 = JUDGE
├── 08 = EO (Event Organizer)
├── 09 = SUPPLIER
└── 10 = MANPOWER

Middle 4 digits = Province/City Code (BPS)
Last 4 digits = Sequential number
```

### Under-Age Categories (Auto-calculated from dateOfBirth)
```
Archery Age Categories:
├── U10    (Under 10)   → 10 years old or younger
├── U13    (Under 13)   → 13 years old or younger
├── U15    (Under 15)   → 15 years old or younger
├── U18    (Under 18)   → 18 years old or younger
├── U21    (Under 21)   → 21 years old or younger
├── Senior (21-49)      → 21-49 years old
└── Master (50+)        → 50 years old or older
```

### Database Entity Relationships (By Role)

```
══════════════════════════════════════════════════════════════════════════════
🔴 SUPER_ADMIN (00) RELATIONSHIPS
══════════════════════════════════════════════════════════════════════════════
User (SUPER_ADMIN)
├── Can READ/WRITE ALL tables
├── Manages: User[] (all users)
├── Approves: User.nikVerified → true
├── Approves: Club.status → ACTIVE
├── Approves: School.status → ACTIVE
├── Approves: Club.isPerpaniMember → true
└── Monitors: AuditLog[] (all system activity)

══════════════════════════════════════════════════════════════════════════════
🔴 PERPANI (01) RELATIONSHIPS
══════════════════════════════════════════════════════════════════════════════
User (PERPANI)
├──→ Perpani (1:1 via perpani profile)
│    ├── sipId, name, provinceId, cityId
│    ├── address, phone, email, website
│    └── status: NO_OPERATOR | ACTIVE
│
└──→ Manages Regional Clubs:
     └──→ Club[] (via Club.perpaniId)
          ├── Approves SK Perpani (skPerpaniNo, skPerpaniDocId)
          ├── Sets isPerpaniMember = true
          └── Regional oversight based on provinceId/cityId

══════════════════════════════════════════════════════════════════════════════
🟡 CLUB (02) RELATIONSHIPS
══════════════════════════════════════════════════════════════════════════════
User (CLUB_OWNER)
├──→ Club (owns, via Club.ownerId)
│    │
│    ├──→ User[] (members, via User.clubId)
│    │    ├── Role: ATHLETE, COACH, PARENT, etc.
│    │    └── Approval: PENDING → ACTIVE
│    │
│    ├──→ Athlete[] (registered athletes)
│    │    └──→ ScoringRecord[]
│    │    └──→ MembershipFee[]
│    │
│    ├──→ TrainingSchedule[]
│    │    ├── title, startTime, endTime, venue
│    │    ├── targetCategory, targetSkillLevel
│    │    ├──→ ScheduleParticipant[] ───→ Athlete
│    │    ├──→ Attendance[] ───→ User
│    │    └──→ ScoringRecord[]
│    │
│    ├──→ AssetInventory[]
│    │    ├── itemName, category, brand, model
│    │    ├── status: AVAILABLE | IN_USE | MAINTENANCE | RETIRED
│    │    ├── condition: EXCELLENT | GOOD | FAIR | POOR
│    │    └──→ AssetMaintenanceLog[]
│    │
│    ├──→ Document[]
│    │    ├── title, category, fileUrl
│    │    └── isPublic, expiryDate
│    │
│    ├──→ ClubOrganization[]
│    │    ├── position: CHAIRPERSON | SECRETARY | TREASURER | HEAD_COACH | CUSTOM
│    │    ├── name, whatsapp, email
│    │    └── termStart, termEnd, isActive
│    │
│    └──→ Perpani (optional membership)
          ├── perpaniId → Perpani record
          ├── isPerpaniMember: true/false
          └── skPerpaniNo, skPerpaniDocId

══════════════════════════════════════════════════════════════════════════════
🟢 SCHOOL (03) RELATIONSHIPS
══════════════════════════════════════════════════════════════════════════════
User (SCHOOL_ADMIN)
├──→ School (manages)
│    ├── sipId, npsn (National School ID)
│    ├── name, provinceId, cityId, address
│    ├── website, sourceUrl (Kemendikdasmen link)
│    └── status: NO_OPERATOR | ACTIVE
│
└──→ StudentEnrollment[]
     ├── userId ───→ User (student)
     ├── schoolId ───→ School
     ├── nisn (10-digit student ID)
     ├── currentClass (e.g., "Kelas 10 IPA")
     ├── joinDate, leaveDate
     └── status: ACTIVE | GRADUATED | TRANSFERRED

══════════════════════════════════════════════════════════════════════════════
🔵 ATHLETE (04) RELATIONSHIPS
══════════════════════════════════════════════════════════════════════════════
User (ATHLETE)
│
├──→ Club (member of)
│    └── via User.clubId ───→ Club.id
│
├──→ Athlete (1:1 profile)
│    ├── userId ───→ User.id
│    ├── clubId ───→ Club.id
│    ├── parentId ───→ User.id (parent)
│    │
│    ├──→ ScoringRecord[]
│    │    ├── athleteId ───→ Athlete
│    │    ├── coachId ───→ User (COACH)
│    │    ├── scheduleId ───→ TrainingSchedule
│    │    ├── arrowScores (JSON), totalSum, average
│    │    └── isVerified (by coach)
│    │
│    ├──→ MembershipFee[]
│    │    ├── athleteId ───→ Athlete
│    │    ├── amount, dueDate, status
│    │    ├── paymentProofUrl, transactionDate
│    │    └── verifiedBy ───→ User (CLUB_OWNER/ADMIN)
│    │
│    └──→ ScheduleParticipant[]
│         ├── athleteId ───→ Athlete
│         └── scheduleId ───→ TrainingSchedule
│
├──→ Attendance[]
│    ├── userId ───→ User
│    ├── scheduleId ───→ TrainingSchedule
│    ├── checkInTime, checkOutTime
│    ├── status: PRESENT | LATE | ABSENT | EXCUSED
│    └── method: QR_SCAN | MANUAL | GEOLOCATION
│
├──→ StudentEnrollment[] (if isStudent=true)
│    ├── userId ───→ User
│    ├── schoolId ───→ School
│    ├── nisn, currentClass
│    └── status: ACTIVE | GRADUATED | TRANSFERRED
│
├──→ HistoryLog[]
│    ├── userId ───→ User
│    ├── logType: SCHOOL_TRANSFER | CLUB_TRANSFER | ACHIEVEMENT
│    ├── Transfers: fromId, fromName, toId, toName
│    └── Achievements: year, level, achievement, eventName
│
└──→ EquipmentConfigLog[]
     ├── userId ───→ User
     ├── drawLength, drawWeight
     ├── braceHeight, aTiller, bTiller, nockingPoint
     └── avgScoreArrow, totalScore

══════════════════════════════════════════════════════════════════════════════
🩷 PARENT (05) RELATIONSHIPS
══════════════════════════════════════════════════════════════════════════════
User (PARENT)
│
└──→ Athlete[] (children, via Athlete.parentId)
     │
     ├── Can VIEW child's:
     │   ├── ScoringRecord[] (scores & progress)
     │   ├── Attendance[] (training attendance)
     │   ├── MembershipFee[] (payment status)
     │   ├── TrainingSchedule[] (upcoming training)
     │   └── HistoryLog[] (achievements)
     │
     └── Can MANAGE:
         ├── MembershipFee payment uploads
         └── Notification preferences

══════════════════════════════════════════════════════════════════════════════
🟢 COACH (06) RELATIONSHIPS
══════════════════════════════════════════════════════════════════════════════
User (COACH)
│
├──→ Club (member of)
│    └── via User.clubId ───→ Club.id
│
├──→ ScoringRecord[] (as recorder)
│    ├── coachId ───→ User (this coach)
│    ├── athleteId ───→ Athlete
│    ├── Can CREATE new scoring sessions
│    ├── Can UPDATE/VERIFY scores
│    └── isVerified = true (when coach approves)
│
├──→ TrainingSchedule[] (via club)
│    ├── Can VIEW all club schedules
│    └── Can CREATE/UPDATE schedules
│
├──→ Attendance[] (can mark)
│    ├── Can CREATE attendance records
│    ├── Can UPDATE status: PRESENT | LATE | ABSENT | EXCUSED
│    └── method: MANUAL (coach marks)
│
└──→ EquipmentConfigLog[]
     ├── Can VIEW athlete equipment configs
     └── Can ADVISE on settings

══════════════════════════════════════════════════════════════════════════════
🟣 JUDGE (07) RELATIONSHIPS
══════════════════════════════════════════════════════════════════════════════
User (JUDGE)
│
├── Profile Extensions:
│   ├── certificationLevel: Regional | National | International
│   ├── disciplines[]: Recurve, Compound, Barebow, etc.
│   ├── availability: dates/events
│   └── judgingHistory[]
│
└──→ [Future] Event[]
     ├── Can be assigned as judge
     ├── Can VALIDATE competition scores
     └── Can ISSUE rulings/penalties

══════════════════════════════════════════════════════════════════════════════
🩵 EO - EVENT ORGANIZER (08) RELATIONSHIPS
══════════════════════════════════════════════════════════════════════════════
User (EO)
│
├── Profile Extensions:
│   ├── organizationName
│   ├── eventHistory[]
│   └── capabilities[]
│
└──→ [Future] Event[]
     ├── Can CREATE events
     ├── Can MANAGE registrations
     ├── Can ASSIGN judges
     ├── Can PUBLISH results
     └── Can GENERATE certificates

══════════════════════════════════════════════════════════════════════════════
🌹 SUPPLIER (09) RELATIONSHIPS
══════════════════════════════════════════════════════════════════════════════
User (SUPPLIER)
│
├── Profile Extensions:
│   ├── businessName
│   ├── productCategories[]: Bows, Arrows, Targets, Accessories
│   └── certifications[]
│
└──→ [Future] Product[]
     ├── Can MANAGE product catalog
     ├── Can PROCESS orders from Clubs
     └── Can VIEW Club.AssetInventory (for recommendations)
```

### Complete Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER (Central Entity)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ id, email, name, role, sipId, phone, whatsapp, avatarUrl                   │
│ nik, nikVerified, isStudent, provinceId, cityId, clubId                    │
│ isActive, lastLogin, createdAt, updatedAt                                  │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
     ┌───────────────────────────────┼───────────────────────────────┐
     │                               │                               │
     ▼                               ▼                               ▼
┌─────────────┐              ┌──────────────┐              ┌─────────────────┐
│   ATHLETE   │              │     CLUB     │              │     SCHOOL      │
│  (1:1 link) │              │ (via clubId) │              │(via enrollment) │
├─────────────┤              ├──────────────┤              ├─────────────────┤
│ dateOfBirth │◄─────────────│ ownerId      │              │ sipId, npsn     │
│ gender      │   belongs    │ sipId, name  │              │ name, address   │
│ archeryType │              │ address      │◄──┐          │ provinceId      │
│ skillLevel  │              │ perpaniId    │   │          │ cityId          │
│ height,     │              │ status       │   │          │ sourceUrl       │
│ weight      │              └──────────────┘   │          └─────────────────┘
│ equipment   │                     │           │                   │
└─────────────┘                     │           │                   │
      │                             │           │                   │
      │                      ┌──────┴─────┐     │            ┌──────┴──────┐
      ▼                      ▼            ▼     │            ▼             │
┌─────────────┐       ┌───────────┐  ┌────────┐ │    ┌───────────────┐    │
│  SCORING    │       │ TRAINING  │  │ ASSET  │ │    │  STUDENT      │    │
│  RECORD     │       │ SCHEDULE  │  │INVENTORY│ │    │  ENROLLMENT   │◄───┘
├─────────────┤       ├───────────┤  ├────────┤ │    ├───────────────┤
│ athleteId   │       │ clubId    │  │ clubId │ │    │ userId        │
│ coachId     │       │ title     │  │ name   │ │    │ schoolId      │
│ scheduleId  │       │ startTime │  │ status │ │    │ nisn          │
│ arrowScores │       │ endTime   │  │ brand  │ │    │ currentClass  │
│ totalSum    │       │ venue     │  │ model  │ │    │ status        │
│ average     │       └───────────┘  └────────┘ │    └───────────────┘
│ isVerified  │             │                   │
└─────────────┘             │                   │
### 🏗️ Structural Hierarchy

The system distinguishes between **Organization Roles** (who manage) and **Individual Roles** (who participate).

#### 1. Organization Roles (The "Local Admins")
These roles have the power to configure **Options** for their members.
*   🔴 **SUPER_ADMIN**: The Architect. Can configure everything.
*   🔴 **PERPANI**: Federation Admin. Manages regional rules.
*   🟡 **CLUB**: Club Admin. Manages athletes, coaches, and fees.
*   🟢 **SCHOOL**: School Admin. Manages student athletes.
*   🩵 **EO**: Event Admin. Manages matches and scoring rules.

#### 2. Terminology: Mod vs Sub vs Option
*   **Mod (Module)**: High-level functional area (e.g., "Finance").
*   **Sub (SubModule)**: Specific feature set (e.g., "Invoicing", "Expenses").
*   **Option**: Granular control (Show/Hide, Edit/Add) often configurable by the Organization Admin.
    *   *Example:* A Club Admin can set the "Allow Partial Payment" **Option** to `true` inside the "Invoicing" **Sub** of the "Finance" **Mod**.

### 🧱 Module Inventory (The Blocks)

Legend:
C = Create, R = Read, U = Update, D = Delete
* = Limited to own records/organization only
- = No access
```
---

## Modular Architecture ("Lego Blocks" Concept)

The system is designed with a **Composable Architecture**, where Roles are constructed by assembling specific modules.

### 🧱 Module Inventory (The Blocks)

#### 1. Foundation (Core) 🔘
*   **Auth & Session**: Login, JWT handling, Session persistence.
*   **Profile & Identity**: Role-specific profile data (Athlete metrics, Club details).
*   **Notification Sys**: Real-time alerts and inbox.
*   **File Manager**: Centralized document upload and retrieval.

#### 2. Commerce & Finance 🟢
*   **Product Catalog**: Supplier product listings, variants, and pricing.
*   **Inventory (Simple)**: Stock tracking for standard items.
*   **Order Processing**: Shopping cart, checkout, order status workflow.
*   **Finance/Journal**: Invoicing, payment verification, financial reports.

#### 3. Manufacturing & Ops (Jersey Specific) 🟠
*   **Production Timeline**: Manufacturing Gantt chart (Design -> Pattern -> Sewing -> QC).
*   **Workstation Assign**: Task allocation to specific workers.
*   **QC & Inspection**: Quality control checkpoints and rejection handling.
*   **Courier & Logistics**: Shipping integration and tracking.
*   **Repair Handling**: Return Merchandise Authorization (RMA) flow.

#### 4. Sport & Event 🔵
*   **Scoring System**: Arrow-by-arrow real-time scoring.
*   **Training Schedule**: Session planning and calendar.
*   **Bleep Test**: VO2 Max / physical fitness assessment tools.
*   **Attendance**: QR-based check-in system.

#### 5. Admin Utilities 🔴
*   **User Management**: CRUD operations for system users.
*   **Module Builder**: Dynamic tool to enable/disable modules for specific users.
*   **Role Permissions**: Granular access control settings.

### 🏗️ Assembly Examples (Role Composition)

**Example A: Jersey Manufacturer (Complex Supplier)**
*   Composed of: `Foundation` + `Commerce` + `Manufacturing & Ops`
*   Result: Can sell products AND manage the entire production line from design to shipping.

**Example B: General Archery Shop (Simple Supplier)**
*   Composed of: `Foundation` + `Commerce`
*   Result: Can list products and sell them. No manufacturing overhead.

**Example C: Athlete (End User)**
*   Composed of: `Foundation` + `Sport & Event` + `Commerce (Buyer Mode)`
*   Result: Can record scores, attend training, and buy equipment.

---

## Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **QRCode** - QR generation

### Backend
- **Express.js** + **TypeScript**
- **Prisma ORM** - Database
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

---

## Project Structure
```
sip/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── profile/    # Role-specific profile sections
│   │   │   ├── scoring/    # Scoring components
│   │   │   └── ui/         # Base UI components
│   │   ├── context/        # React context (Auth, Theme)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   └── styles/         # Global CSS
│   └── package.json
├── server/                 # Backend (Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Database seeding
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, validation
│   │   └── utils/          # Helpers
│   └── package.json
└── docker-compose.yml      # PostgreSQL container
```

---

## Features

### ✅ Implemented
- **Multi-role RBAC** - 11 distinct user roles with granular permissions
- **Role-specific Profiles** - Custom profile pages for each role
- **Real-time Scoring** - Session-based arrow scoring with analytics
- **QR Code Attendance** - Coach/athlete attendance tracking
- **Performance Analytics** - Score trends, progress tracking
- **Financial Dashboard** - Payment tracking, invoices
- **Inventory Tracking** - Equipment management
- **Dark Theme UI** - Modern, accessible interface
- **Jersey E-commerce** - Product catalog, orders, variants pricing
- **Manpower Station** - Unified dashboard for Production Crew & Club Officials
- **QC Station** - Quality control & rejection handling
- **Repair Request Workflow** - Approval flow for rejected items
- **Courier Integration** - Shipping tracking (JNE, SiCepat, J&T)
- **Bleep Test** - VO2 Max fitness assessment tool
- **Assessment System** - Customizable athlete evaluation forms
- **Module Builder** - Dynamic modular architecture for role-based features
- **Profile Verification** - NIK & document verification flow
- **Archery Guidance** - Training resources and guides
- **Profile Backend API** - Full CRUD for role profiles
- **Province/City API** - Location data endpoints
- **Mobile Nav 2.0** - Bottom navigation with customizable shortcuts
- **Sidebar Drawer** - Collapsible sidebar with "Tab Handle" for max screen real estate
- **Club Panel Preview** - Live component previews for feature configuration

### 🔄 In Progress
- School database integration (Kemendikdasmen)
- Event/Tournament Management system
- Push Notifications integration

### 📋 Planned
- PDF Report Generation
- Mobile App (React Native)
- Live Competition Scoring

---

## Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with test data
npm run db:seed

# Open Prisma Studio (GUI)
npx prisma studio
```

---

## Environment Variables

### Server (.env)
```env
# ... existing variables ...
DATABASE_URL="file:./dev.db"  # Local SQLite
# DATABASE_URL="..."          # Production PostgreSQL (Neon)

# Supabase Storage (for Avatars & Documents)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# ...
```

### Build & Run Commands
- **Local Dev (SQLite)**: `npm run dev:local` (Starts server with local db)
- **Production Dev**: `npm run dev` (Starts server with Prod db - careful!)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sip_db"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
```

### Client (.env)
```env
VITE_API_URL="http://localhost:3000"
```

---

## Development Notes

### Code Quality Standards

#### Prisma Client Usage
Always import the shared Prisma instance instead of creating new ones:

```typescript
// ✅ CORRECT - Use shared instance
import prisma from '../lib/prisma.js';

// ❌ WRONG - Don't create new instances in controllers
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient(); // This causes connection pool issues!
```

#### Express Request Types
The `Express.Request` type is globally extended in `auth.middleware.ts`. Use `Request` directly instead of creating local `AuthRequest` interfaces:

```typescript
// ✅ CORRECT
import { Request, Response } from 'express';
export const myHandler = async (req: Request, res: Response) => {
    const userId = req.user?.id; // Globally extended
};

// ❌ WRONG - Don't create redundant local interfaces
interface AuthRequest extends Request { user?: {...} }
```

#### Unused Variables
Prefix intentionally unused variables with underscore:
```typescript
const { user: _user, data } = props; // _user indicates intentionally unused
```

---

## License
MIT © 2026 Antigravity
