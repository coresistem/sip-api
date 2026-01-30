---
description: Comprehensive Roadmap for Archery Event Management System
---

# 🏹 Archery Event Management System Roadmap

This document outlines the implementation plan for a professional-grade Event Management System tailored for Archery Event Organizers (EOs). It follows the **Modular Monolith** architecture and creates a centralized hub for all event operations.

## 🏗️ Phase 1: Core Architecture & Setup

- [ ] **Module Structure (`client/src/modules/events`)**
    - `pages/`: Dashboard, Config, Registration, Finance, Operations.
    - `components/`: Reusable UI elements specific to events.
    - `hooks/`: Custom logic for event state management.
    - `api/`: Dedicated API clients.
- [ ] **Role-Based Access Control (RBAC)**
    - Configure `permissions.ts` to grant **EO** full control over their events.
    - Grant **Super Admin** oversight.
    - Grant **Club/Athlete** read/register access.

## 📅 Phase 2: Event Configuration (The "Setup Wizard")

- [ ] **Create Event Wizard**
    - **Basic Info**: Name, Slug, Dates, Venue (Google Maps integration), Description.
    - **Categories**: Division (Recurve, Compound, etc.), Gender, Class (U12, U15, Open), Distances.
    - **Rules & Format**: Qualification rules, Elimination format.
- [ ] **Scheduling System**
    - Drag-and-drop schedule builder.
    - Session management (Morning/Afternoon).
    - Target Layout configuration.

## 📝 Phase 3: Registration & Participants

- [ ] **Registration Portal**
    - **Athlete View**: Easy registration flow for individuals.
    - **Club View**: Bulk registration for club members.
    - **Team/Mixed Team**: Form teams from registered athletes.
- [ ] **Approval Workflow**
    - EO Dashboard to review and approve registrations.
    - Document verification (Medical, Club recommendation).
- [ ] **Payment Integration**
    - **Gateway**: Integration with Midtrans/Xendit (or similar).
    - **Manual**: Upload proof of transfer for verification.
    - **Invoicing**: Auto-generate invoices for clubs.

## 💰 Phase 4: Financial Management

- [ ] **Budgeting Tool**
    - **Planning**: Set estimated income (fees) and expenses (venue, prizes, manpower).
    - **Actuals**: Track real-time income from registrations and log actual expenses.
    - **Profit/Loss Analysis**: Real-time financial health dashboard.
- [ ] **Sponsorship Management**
    - Track sponsors and deliverables.

## 👷 Phase 5: Manpower (Staff) Management

- [ ] **Recruitment & Assignment**
    - Open recruitment for volunteers/staff.
    - Assign roles: Judges, Scorers, Field Crew, Medical.
    - **Shift Management**: Schedule shifts for the event days.
- [ ] **Compensation**
    - Track allowances/per diems.

## 📢 Phase 6: Communication & Marketing (The "Blast System")

- [ ] **Broadcast System**
    - **Channels**: WhatsApp (via API), Email, In-App Notifications.
    - **Audience**: Blast to specific groups (e.g., "All Coaches", "Unpaid Athletes").
    - **Templates**: Pre-defined messages for Schedule Updates, Payment Reminders, Results.
- [ ] **Social Media Integration**
    - **Instagram**: Auto-generate "Registration Open" or "Winners" posts/stories.
    - **Shareable Assets**: Generate dynamic images for athletes to share ("I'm Competing!").

## 🎯 Phase 7: Competition Operations

- [ ] **Scoring System**
    - **IanSEO Integration**: Robust Import/Export (CSV/XML).
    - **Native Scoring**: Mobile-friendly digital scorecard for scorers.
    - **Live Leaderboard**: Real-time results display for big screens.
- [ ] **Accreditation**
    - ID Card generation for Athletes and Officials (with QR for access control).

## 🏆 Phase 8: Post-Event & Certification

- [ ] **Certificate System**
    - **Designer**: Drag-and-drop certificate template builder.
    - **Generation**: Bulk generate e-certificates with dynamic data (Name, Rank, Score).
    - **Validation**: QR Code on certificates to verify authenticity.
- [ ] **Analytics & Reporting**
    - Event participation stats.
    - Financial report.

## 🛠️ Technical Implementation Steps

1.  **Backend**: Enhance `eo.controller.ts` to support specific "Blast" and "Certificate" endpoints.
2.  **Database**: Add/Update schemas for `Budget`, `Manpower`, `BroadcastLog`.
3.  **Frontend**: Build the EO Dashboard in `modules/events/pages/admin`.

---

**Terminology Note**: Strictly use **"Manpower"** instead of "Staff".
**Identity Note**: Ensure all participants are linked to their **Corelink CORE ID**.
