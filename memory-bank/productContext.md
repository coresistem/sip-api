# SIP Corelink Vision & Product Context

## Vision
SIP Corelink is designed as a **Modular Monolith** connecting various roles in the archery ecosystem (Athlete, Club, Coach, Judge, etc.) through a unified digital infrastructure. The primary goal is to provide a "Single User, Multiple Profiles" experience where one identity can seamlessly interact across different organizations and roles.

## Core Philosophies
1. **Modular Monolith**: Code is logically separated by domains (Modules) but lives in one repository.
2. **Root Identity**: Biological and core identity data (Name, DOB, Gender, NIK, WhatsApp) belongs to the `User` model, not individual profiles.
3. **The Handshake Protocol**: All cross-entity relations (e.g., Athlete -> Club integration) must follow a "Proposed -> Verified" handshake flow.
4. **Innovation Lab**: Experimental or standalone features are developed in `_labs/` and managed via the `InnovationControlPanel` before being integrated into core modules.

## Key Goals
- **Verification over Automation**: Prefer manual organization verification via the "Handshake" system for high-stakes data.
- **WhatsApp-First UX**: Prioritize WhatsApp for notifications and verification over Traditional Email.
- **Unified Pro Glass Aesthetic**: A premium, consistent UI design language using transparency and modern typography.
