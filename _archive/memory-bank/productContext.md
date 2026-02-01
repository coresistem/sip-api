# 🌐 SIP Corelink Vision & Product Context

## Vision: The Genesis Tree
SIP Corelink is designed as the **"Corelink Genesis Tree"**—a powerful architectural root that connects the entire archery ecosystem. Our primary focus is building a strong, immutable foundation of inter-role integration (Athlete, Club, Coach, Judge, etc.) through a unified digital infrastructure. 

The goal is to provide a "Single User, Multiple Profiles" experience where one identity acts as the trunk, supporting various organizational branches seamlessly.

## Core Philosophies
1. **Modular Monolith**: Code is logically separated by domains (Modules) but lives in one repository to maintain a unified "Tree" structure.
2. **Root Identity**: The "Soil" of our system. Biological data (Name, DOB, Gender, NIK, WhatsApp) belongs to the `User` model, ensuring a single source of truth for identity.
3. **The Handshake Protocol**: The "Sap" that flows between branches. All cross-entity relations (e.g., Athlete -> Club) must follow a "Proposed -> Verified" handshake flow to ensure trust and data integrity.
4. **Innovation Lab (The Nursery)**:
    - **"Wow" Features**: High-impact experimental UI/UX features and standalone prototypes are isolated in `_labs/`.
    - **Strategic Focus**: By moving experimental "Wow" features to the Labs tab, we ensure the core engineering team can focus 100% on strengthening the **Genesis Tree** (Core Integration & Security).
    - Features only graduate from the Nursery to the Main Tree once the core roots are stable.

## Key Goals
- **Verification over Automation**: Prefer manual organization verification via the "Handshake" system for high-stakes data.
- **WhatsApp-First UX**: Prioritize WhatsApp for notifications and verification over Traditional Email.
- **Unified Pro Glass Aesthetic**: A premium, consistent UI design language using transparency and modern typography.
