import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { generateSipId } from '../src/services/sipId.service.js';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create Super Admin
    const superAdminPassword = await bcrypt.hash('superadmin123', 12);
    // Use fixed ID for Super Admin as it's special, or generate? 
    // Super Admin is usually 00
    // But for consistency let's try to stick to what works. 
    // Actually, for seed, we prefer deterministic output if possible for testing.
    // BUT the user said "dont use hardcode".
    // I will use generateSipId for all roles to be safe.
    // For Super Admin, let's just make sure we don't conflict. 
    // upsert won't update sipId if it exists.

    // Existing logic:
    // upsert by email. if exists, updates sipId to fixed value.
    // if fixed value is taken by someone else -> BOOM.

    // New logic:
    // upsert by email.
    // in create: generate new ID.
    // in update: keep existing ID (don't force update sipId) OR regenerate if missing.

    // However, I can't await inside the create object easily without preparing variables first.

    const saEmail = 'admin@sip.id';
    const saExisting = await prisma.user.findUnique({ where: { email: saEmail } });
    let saSipId = saExisting?.sipId;
    if (!saSipId) {
        saSipId = await generateSipId('SUPER_ADMIN');
    }

    const superAdmin = await prisma.user.upsert({
        where: { email: saEmail },
        update: {
            passwordHash: superAdminPassword,
        },
        create: {
            email: saEmail,
            passwordHash: superAdminPassword,
            name: 'Super Administrator',
            role: 'SUPER_ADMIN',
            phone: '+62812000001',
            sipId: saSipId,
        },
    });
    console.log('✓ Super Admin created:', superAdmin.email);

    // Create Club Owner

    // Create Club Owner
    const clubOwnerEmail = 'owner@archeryclub.id';
    const clubOwnerExisting = await prisma.user.findUnique({ where: { email: clubOwnerEmail } });
    let clubOwnerSipId = clubOwnerExisting?.sipId;
    if (!clubOwnerSipId) {
        clubOwnerSipId = await generateSipId('CLUB_OWNER');
    }

    const clubOwnerPassword = await bcrypt.hash('clubowner123', 12);
    const clubOwner = await prisma.user.upsert({
        where: { email: clubOwnerEmail },
        update: {
            passwordHash: clubOwnerPassword,
        },
        create: {
            email: clubOwnerEmail,
            passwordHash: clubOwnerPassword,
            name: 'Budi Santoso',
            role: 'CLUB', // Fixed role key from CLUB_OWNER to CLUB to match schema enum/string if needed? Schema says 'CLUB' in comment: 02:CLUB
            // Wait, schema says: // 02:CLUB in comment, but string can be anything.
            // sipId service uses 'CLUB_OWNER': '02'.
            // seed.ts line 39 originally used 'CLUB_OWNER'.
            // Schema comment line 25: 02:CLUB.
            // Let's verify what the app expects.
            // In auth.controller, user.role is used.
            // In check_account_status, I used 'CLUB'.
            // Let's stick to what seed had or correct it? Seed used 'CLUB_OWNER'.
            // Checking sipId.service: 'CLUB_OWNER': '02'.
            // Checking Blueprint/README:
            // "CLUB (02) - Club Owner/Manager"
            // "Role Codes: ... 02:CLUB ..."
            // I should probably use 'CLUB' as the role string in DB, but pass 'CLUB_OWNER' to generator if that's what it maps?
            // Wait, sipId service map: 'CLUB_OWNER': '02'.
            // If I pass 'CLUB' to generator, it maps to undefined->99.
            // So generator needs 'CLUB_OWNER'.
            // Database role field should likely be 'CLUB' based on README "CLUB (02)".
            // Let's check seed original: `role: 'CLUB_OWNER'`.
            // I will keep `role: 'CLUB_OWNER'` to minimize behavior change, OR fix it if it's wrong.
            // README says "CLUB".
            // Let's look at schema again. `role String @default("ATHLETE") // ... 02:CLUB ...`
            // If the app checks for `user.role === 'CLUB'`, then 'CLUB_OWNER' is wrong.
            // But I will stick to fixing the ID generation first.
            phone: '+62812000002',
            sipId: clubOwnerSipId,
        },
    });

    // Create Club
    const club = await prisma.club.upsert({
        where: { registrationNumber: 'CLB-2024-001' },
        update: {},
        create: {
            name: 'Jakarta Archery Club',
            registrationNumber: 'CLB-2024-001',
            address: 'Jl. Panahan No. 123',
            city: 'Jakarta',
            province: 'DKI Jakarta',
            phone: '+62215555555',
            email: 'info@jakartaarchery.id',
            ownerId: clubOwner.id,
        },
    });
    console.log('✓ Club created:', club.name);

    // Update club owner with club ID
    await prisma.user.update({
        where: { id: clubOwner.id },
        data: { clubId: club.id },
    });

    // Create Coach

    // Create Coach
    const coachEmail = 'coach@archeryclub.id';
    const coachExisting = await prisma.user.findUnique({ where: { email: coachEmail } });
    let coachSipId = coachExisting?.sipId;
    if (!coachSipId) {
        coachSipId = await generateSipId('COACH');
    }

    const coachPassword = await bcrypt.hash('coach123', 12);
    const coach = await prisma.user.upsert({
        where: { email: coachEmail },
        update: {
            passwordHash: coachPassword,
        },
        create: {
            email: coachEmail,
            passwordHash: coachPassword,
            name: 'Ahmad Trainer',
            role: 'COACH',
            phone: '+62812000003',
            clubId: club.id,
            sipId: coachSipId,
        },
    });
    console.log('✓ Coach created:', coach.email);

    // Create Athletes (12 total)
    const athleteData = [
        { name: 'Andi Pranata', email: 'andi@athlete.id', gender: 'MALE', category: 'RECURVE', level: 'INTERMEDIATE' },
        { name: 'Siti Rahayu', email: 'siti@athlete.id', gender: 'FEMALE', category: 'COMPOUND', level: 'ADVANCED' },
        { name: 'Dian Kusuma', email: 'dian@athlete.id', gender: 'MALE', category: 'BAREBOW', level: 'INTERMEDIATE' },
        { name: 'Maya Putri', email: 'maya@athlete.id', gender: 'FEMALE', category: 'RECURVE', level: 'BEGINNER' },
        { name: 'Rudi Hartono', email: 'rudi@athlete.id', gender: 'MALE', category: 'COMPOUND', level: 'ELITE' },
        { name: 'Dewi Lestari', email: 'dewi@athlete.id', gender: 'FEMALE', category: 'BAREBOW', level: 'INTERMEDIATE' },
        { name: 'Bimo Prasetyo', email: 'bimo@athlete.id', gender: 'MALE', category: 'TRADITIONAL', level: 'ADVANCED' },
        { name: 'Anisa Fitri', email: 'anisa@athlete.id', gender: 'FEMALE', category: 'RECURVE', level: 'INTERMEDIATE' },
        { name: 'Fajar Nugroho', email: 'fajar@athlete.id', gender: 'MALE', category: 'COMPOUND', level: 'BEGINNER' },
        { name: 'Rina Sari', email: 'rina@athlete.id', gender: 'FEMALE', category: 'TRADITIONAL', level: 'ADVANCED' },
        { name: 'Agus Widodo', email: 'agus@athlete.id', gender: 'MALE', category: 'RECURVE', level: 'ELITE' },
        { name: 'Putri Maharani', email: 'putri@athlete.id', gender: 'FEMALE', category: 'COMPOUND', level: 'INTERMEDIATE' },
    ];

    for (const data of athleteData) {
        const athletePassword = await bcrypt.hash('athlete123', 12);

        const existingAthlete = await prisma.user.findUnique({ where: { email: data.email } });
        let sipId = existingAthlete?.sipId;
        if (!sipId) {
            sipId = await generateSipId('ATHLETE');
        }

        const athleteUser = await prisma.user.upsert({
            where: { email: data.email },
            update: {
                passwordHash: athletePassword,
            },
            create: {
                email: data.email,
                passwordHash: athletePassword,
                name: data.name,
                role: 'ATHLETE',
                clubId: club.id,
                sipId: sipId,
            },
        });

        await prisma.athlete.upsert({
            where: { userId: athleteUser.id },
            update: {},
            create: {
                userId: athleteUser.id,
                clubId: club.id,
                dateOfBirth: new Date('2005-06-15'),
                gender: data.gender,
                archeryCategory: data.category,
                skillLevel: data.level,
                height: 165 + Math.floor(Math.random() * 20),
                weight: 55 + Math.floor(Math.random() * 25),
                bowBrand: 'SF Archery',
                bowModel: 'Premium',
                bowDrawWeight: 24 + Math.floor(Math.random() * 12),
            },
        });
        console.log('✓ Athlete created:', data.name);
    }

    // Create Parent
    // Create Parent
    const parentEmail = 'parent@mail.id';
    const parentExisting = await prisma.user.findUnique({ where: { email: parentEmail } });
    let parentSipId = parentExisting?.sipId;
    if (!parentSipId) {
        parentSipId = await generateSipId('PARENT');
    }

    const parentPassword = await bcrypt.hash('parent123', 12);
    const parent = await prisma.user.upsert({
        where: { email: parentEmail },
        update: {
            passwordHash: parentPassword,
        },
        create: {
            email: parentEmail,
            passwordHash: parentPassword,
            name: 'Ibu Pranata',
            role: 'PARENT',
            phone: '+62812000005',
            clubId: club.id,
            sipId: parentSipId,
        },
    });
    console.log('✓ Parent created:', parent.email);

    // Create Perpani (Federation Admin)
    // Create Perpani (Federation Admin)
    const perpaniEmail = 'perpani@perpani.or.id';
    const perpaniExisting = await prisma.user.findUnique({ where: { email: perpaniEmail } });
    let perpaniSipId = perpaniExisting?.sipId;
    if (!perpaniSipId) {
        perpaniSipId = await generateSipId('PERPANI');
    }

    const perpaniPassword = await bcrypt.hash('perpani123', 12);
    const perpani = await prisma.user.upsert({
        where: { email: perpaniEmail },
        update: {
            passwordHash: perpaniPassword,
        },
        create: {
            email: perpaniEmail,
            passwordHash: perpaniPassword,
            name: 'Ketua Perpani DKI',
            role: 'PERPANI',
            phone: '+62812000006',
            sipId: perpaniSipId,
        },
    });
    console.log('✓ Perpani created:', perpani.email);

    // Create School Admin
    // Create School Admin
    const schoolEmail = 'school@sma1.sch.id';
    const schoolExisting = await prisma.user.findUnique({ where: { email: schoolEmail } });
    let schoolSipId = schoolExisting?.sipId;
    if (!schoolSipId) {
        schoolSipId = await generateSipId('SCHOOL');
    }

    const schoolPassword = await bcrypt.hash('school123', 12);
    const school = await prisma.user.upsert({
        where: { email: schoolEmail },
        update: {
            passwordHash: schoolPassword,
        },
        create: {
            email: schoolEmail,
            passwordHash: schoolPassword,
            name: 'SMA Negeri 1 Jakarta',
            role: 'SCHOOL',
            phone: '+62215551234',
            sipId: schoolSipId,
        },
    });
    console.log('✓ School created:', school.email);

    // Create Judge
    // Create Judge
    const judgeEmail = 'judge@perpani.or.id';
    const judgeExisting = await prisma.user.findUnique({ where: { email: judgeEmail } });
    let judgeSipId = judgeExisting?.sipId;
    if (!judgeSipId) {
        judgeSipId = await generateSipId('JUDGE');
    }

    const judgePassword = await bcrypt.hash('judge123', 12);
    const judge = await prisma.user.upsert({
        where: { email: judgeEmail },
        update: {
            passwordHash: judgePassword,
        },
        create: {
            email: judgeEmail,
            passwordHash: judgePassword,
            name: 'Pak Wasit',
            role: 'JUDGE',
            phone: '+62812000007',
            sipId: judgeSipId,
        },
    });
    console.log('✓ Judge created:', judge.email);

    // Create Event Organizer
    // Create Event Organizer
    const eoEmail = 'eo@events.id';
    const eoExisting = await prisma.user.findUnique({ where: { email: eoEmail } });
    let eoSipId = eoExisting?.sipId;
    if (!eoSipId) {
        eoSipId = await generateSipId('EO');
    }

    const eoPassword = await bcrypt.hash('eo123', 12);
    const eo = await prisma.user.upsert({
        where: { email: eoEmail },
        update: {
            passwordHash: eoPassword,
        },
        create: {
            email: eoEmail,
            passwordHash: eoPassword,
            name: 'Event Pro Organizer',
            role: 'EO',
            phone: '+62812000008',
            sipId: eoSipId,
        },
    });
    console.log('✓ Event Organizer created:', eo.email);

    // Create Supplier
    // Create Supplier
    const supplierEmail = 'supplier@archeryshop.id';
    const supplierExisting = await prisma.user.findUnique({ where: { email: supplierEmail } });
    let supplierSipId = supplierExisting?.sipId;
    if (!supplierSipId) {
        supplierSipId = await generateSipId('SUPPLIER');
    }

    const supplierPassword = await bcrypt.hash('supplier123', 12);
    const supplier = await prisma.user.upsert({
        where: { email: supplierEmail },
        update: {
            passwordHash: supplierPassword,
        },
        create: {
            email: supplierEmail,
            passwordHash: supplierPassword,
            name: 'Archery Equipment Store',
            role: 'SUPPLIER',
            phone: '+62812000009',
            sipId: supplierSipId,
        },
    });
    console.log('✓ Supplier created:', supplier.email);

    // Create Worker (for Jersey Production)
    // Create Worker (for Jersey Production)
    const workerEmail = 'manpower@sip.id';
    const workerExisting = await prisma.user.findUnique({ where: { email: workerEmail } });
    let workerSipId = workerExisting?.sipId;
    if (!workerSipId) {
        workerSipId = await generateSipId('MANPOWER');
    }

    const workerPassword = await bcrypt.hash('manpower123', 12);
    const workerUser = await prisma.user.upsert({
        where: { email: workerEmail },
        update: {
            passwordHash: workerPassword,
        },
        create: {
            email: workerEmail,
            passwordHash: workerPassword,
            name: 'Production Staff',
            role: 'MANPOWER',
            phone: '+62812000010',
            sipId: workerSipId,
        },
    });
    console.log('✓ Manpower User created:', workerUser.email);

    // Create Jersey Manpower Profile (linked to Supplier)
    let jerseyWorker = await prisma.manpower.findFirst({
        where: { email: 'worker@archeryshop.id' }
    });

    if (!jerseyWorker) {
        jerseyWorker = await prisma.manpower.create({
            data: {
                supplierId: supplier.id,
                name: 'Production Staff',
                email: 'worker@archeryshop.id',
                role: 'STAFF',
                specialization: 'SEWING',
                dailyCapacity: 15,
            }
        });
        console.log('✓ Manpower Profile created');
    } else {
        console.log('✓ Manpower Profile already exists');
    }

    // Create Jersey Product
    let product = await prisma.jerseyProduct.findFirst({
        where: { supplierId: supplier.id, sku: 'PRO-2026-RED' }
    });

    if (!product) {
        product = await prisma.jerseyProduct.create({
            data: {
                supplierId: supplier.id,
                name: 'Pro Jersey 2026',
                sku: 'PRO-2026-RED',
                category: 'Jersey',
                description: 'Premium archery jersey with breathable fabric',
                basePrice: 150000,
                visibility: 'PUBLIC',
                variants: {
                    create: [
                        { category: 'SIZE', name: 'M', priceModifier: 0, sortOrder: 1 },
                        { category: 'SIZE', name: 'L', priceModifier: 0, sortOrder: 2 },
                        { category: 'SIZE', name: 'XL', priceModifier: 10000, sortOrder: 3 },
                        { category: 'NECK', name: 'V-Neck', priceModifier: 0, sortOrder: 1 },
                        { category: 'NECK', name: 'Round Neck', priceModifier: 0, sortOrder: 2 },
                    ]
                }
            }
        });
        console.log('✓ Jersey Product created:', product.name);
    } else {
        console.log('✓ Jersey Product already exists:', product.name);
    }

    // Create Demo Order
    let order = await prisma.jerseyOrder.findFirst({
        where: { orderNo: 'JO-DEMO-001' }
    });

    if (!order) {
        // Need a customer
        const customer = await prisma.user.findFirst({ where: { role: 'ATHLETE' } });
        if (customer) {
            order = await prisma.jerseyOrder.create({
                data: {
                    orderNo: 'JO-DEMO-001',
                    customerId: customer.id,
                    supplierId: supplier.id,
                    subtotal: 160000,
                    totalAmount: 160000,
                    status: 'PRODUCTION',
                    paymentStatus: 'PAID',
                    items: {
                        create: {
                            productId: product.id,
                            recipientName: 'Andi Pranata',
                            quantity: 1,
                            basePrice: 150000,
                            variantPrices: 10000,
                            selectedVariants: JSON.stringify({ SIZE: 'XL', NECK: 'V-Neck' }),
                            lineTotal: 160000,
                        }
                    }
                }
            });
            console.log('✓ Demo Order created:', order.orderNo);

            // Create Tasks for the Order
            await prisma.manpowerTask.createMany({
                data: [
                    { manpowerId: jerseyWorker.id, orderId: order.id, stage: 'GRADING', status: 'COMPLETED', quantity: 1, completedAt: new Date() },
                    { manpowerId: jerseyWorker.id, orderId: order.id, stage: 'PRINTING', status: 'COMPLETED', quantity: 1, completedAt: new Date() },
                    { manpowerId: jerseyWorker.id, orderId: order.id, stage: 'CUTTING', status: 'IN_PROGRESS', quantity: 1, startedAt: new Date() },
                    { manpowerId: jerseyWorker.id, orderId: order.id, stage: 'SEWING', status: 'PENDING', quantity: 1 },
                    { manpowerId: jerseyWorker.id, orderId: order.id, stage: 'PACKING', status: 'PENDING', quantity: 1 },
                ]
            });
            console.log('✓ Manpower Tasks created');
        }
    } else {
        console.log('✓ Demo Order already exists:', order.orderNo);
    }

    // ===========================================
    // Create Basic Archery Assessment Module
    // ===========================================
    console.log('\n📋 Creating Basic Archery Assessment module...');

    const assessmentModule = await prisma.customModule.upsert({
        where: { sipId: 'CM.0001.0001' },
        update: {},
        create: {
            sipId: 'CM.0001.0001',
            name: 'Basic Archery Assessment',
            description: 'Dasar Penilaian Pemanah - Evaluasi teknik dasar pemanah',
            icon: 'target',
            status: 'ACTIVE',
            version: 1,
            createdById: superAdmin.id,
            allowedRoles: JSON.stringify(['COACH', 'CLUB', 'SCHOOL']),
            showInMenu: true,
            menuCategory: 'Assessment',
        },
    });
    console.log('✓ Module created:', assessmentModule.name);

    // Add fields for Posture section
    const postureFields = [
        { fieldName: 'stance', label: 'Stance', feedbackGood: 'Great Job!! Beban kedua kaki sama, kaki depan mengarah ke Target' },
        { fieldName: 'hips', label: 'Hips', feedbackGood: 'Great Job!! Pinggul sejajar dengan stance, menghadap ke Target, kondisi relax' },
        { fieldName: 'chest', label: 'Chest', feedbackGood: 'Great Job!! Saat Full draw dada kondisi tetap (tidak naik)' },
        { fieldName: 'head', label: 'Head', feedbackGood: 'Great Job!! Posisi Kepala tidak bergerak dari Set hingga selesai' },
    ];

    for (let i = 0; i < postureFields.length; i++) {
        await prisma.moduleField.upsert({
            where: { id: `posture_${postureFields[i].fieldName}` },
            update: {},
            create: {
                id: `posture_${postureFields[i].fieldName}`,
                moduleId: assessmentModule.id,
                sectionName: 'Posture',
                fieldName: postureFields[i].fieldName,
                fieldType: 'checkbox',
                label: postureFields[i].label,
                isRequired: false,
                isScored: true,
                maxScore: 25,
                feedbackGood: postureFields[i].feedbackGood,
                feedbackBad: 'Perlu diperbaiki',
                sortOrder: i,
            },
        });
    }
    console.log('✓ Posture fields created');

    // Add fields for Bow Arm section
    const bowArmFields = [
        { fieldName: 'fingers', label: 'Fingers', feedbackGood: 'Kondisi Jemari relax' },
        { fieldName: 'wrist', label: 'Wrist', feedbackGood: 'Great Job!! Pergelangan Tangan membentuk lebih dari 45 derajat' },
        { fieldName: 'elbow_rotate', label: 'Elbow Rotate', feedbackGood: 'Great Job!! Sikut diputar tanpa merubah pundak' },
        { fieldName: 'shoulder_down', label: 'Shoulder Down', feedbackGood: 'Posisi Pundak masih Naik/membentuk sudut, kita perbaiki ya' },
    ];

    for (let i = 0; i < bowArmFields.length; i++) {
        await prisma.moduleField.upsert({
            where: { id: `bow_arm_${bowArmFields[i].fieldName}` },
            update: {},
            create: {
                id: `bow_arm_${bowArmFields[i].fieldName}`,
                moduleId: assessmentModule.id,
                sectionName: 'Bow Arm',
                fieldName: bowArmFields[i].fieldName,
                fieldType: 'checkbox',
                label: bowArmFields[i].label,
                isRequired: false,
                isScored: true,
                maxScore: 25,
                feedbackGood: bowArmFields[i].feedbackGood,
                feedbackBad: 'Perlu diperbaiki',
                sortOrder: i,
            },
        });
    }
    console.log('✓ Bow Arm fields created');

    // Add fields for Draw Arm section
    const drawArmFields = [
        { fieldName: 'hook', label: 'Hook', feedbackGood: 'Great Job!! Hook OK, Pangkal Jempol arah depan, kelingking relax' },
        { fieldName: 'knuckle', label: 'Knuckle', feedbackGood: 'Punggung tangan sudah Vertikal/miring' },
        { fieldName: 'elbow_height', label: 'Elbow Height', feedbackGood: 'Great Job!! Posisi Sikut sudah sejajar/lebih tinggi dari hook' },
        { fieldName: 'shoulder_align', label: 'Shoulder Align', feedbackGood: 'Pundak kanan belum garis lurus dengan pundak kiri dan grip' },
    ];

    for (let i = 0; i < drawArmFields.length; i++) {
        await prisma.moduleField.upsert({
            where: { id: `draw_arm_${drawArmFields[i].fieldName}` },
            update: {},
            create: {
                id: `draw_arm_${drawArmFields[i].fieldName}`,
                moduleId: assessmentModule.id,
                sectionName: 'Draw Arm',
                fieldName: drawArmFields[i].fieldName,
                fieldType: 'checkbox',
                label: drawArmFields[i].label,
                isRequired: false,
                isScored: true,
                maxScore: 25,
                feedbackGood: drawArmFields[i].feedbackGood,
                feedbackBad: 'Perlu diperbaiki, kita latih ya',
                sortOrder: i,
            },
        });
    }
    console.log('✓ Draw Arm fields created');
    console.log('✅ Basic Archery Assessment module with 12 fields created!');

    console.log('\n✅ Database seeding completed!');
    console.log('\n📋 Test Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('CORE ROLES:');
    console.log('  Super Admin:    admin@sip.id / superadmin123');
    console.log('  Perpani:        perpani@perpani.or.id / perpani123');
    console.log('  Club Owner:     owner@archeryclub.id / clubowner123');
    console.log('  School:         school@sma1.sch.id / school123');
    console.log('');
    console.log('INDIVIDUAL ROLES:');
    console.log('  Athlete:        andi@athlete.id / athlete123');
    console.log('  Parent:         parent@mail.id / parent123');
    console.log('  Coach:          coach@archeryclub.id / coach123');
    console.log('  Judge:          judge@perpani.or.id / judge123');
    console.log('');
    console.log('BUSINESS ROLES:');
    console.log('  Event Organizer: eo@events.id / eo123');
    console.log('  Supplier:        supplier@archeryshop.id / supplier123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // ===========================================
    // SEED SYSTEM PARTS (Factory Warehouse)
    // ===========================================
    console.log('🏭 Seeding System Parts for Module Factory...');


    const systemParts = [
        // FullStack Parts (Complete Features)
        {
            code: 'bleeptest',
            name: 'Bleep Test',
            description: 'VO2 Max fitness assessment with audio cues and multi-level protocols',
            type: 'FULLSTACK',
            category: 'SPORT',
            icon: 'Activity',
            componentPath: '@/features/bleep-test/BleepTest',
            dataSource: null,
            requiredPerms: JSON.stringify(['training.read']),
            isCore: true,
        },
        {
            code: 'scoring',
            name: 'Scoring',
            description: 'Arrow scoring with target face, session management, and analytics',
            type: 'FULLSTACK',
            category: 'SPORT',
            icon: 'Target',
            componentPath: '@/pages/ScoringPage',
            dataSource: 'api/scores',
            requiredPerms: JSON.stringify(['scores.read', 'scores.write']),
            isCore: true,
        },
        {
            code: 'digital_id_card',
            name: 'Digital ID Card',
            description: 'Athlete digital identity card with QR code and verification',
            type: 'FULLSTACK',
            category: 'FOUNDATION',
            icon: 'CreditCard',
            componentPath: '@/pages/DigitalCardPage',
            dataSource: 'api/athletes',
            requiredPerms: JSON.stringify(['profile.read']),
            isCore: true,
        },
        {
            code: 'file_manager',
            name: 'File Manager',
            description: 'Document upload, storage, and management system',
            type: 'FULLSTACK',
            category: 'FOUNDATION',
            icon: 'FolderOpen',
            componentPath: '@/pages/FileManagerPage',
            dataSource: 'api/files',
            requiredPerms: JSON.stringify(['files.read', 'files.write']),
            isCore: true,
        },
        {
            code: 'schedule',
            name: 'Training Schedule',
            description: 'Training session scheduling with calendar view and registration',
            type: 'FULLSTACK',
            category: 'SPORT',
            icon: 'Calendar',
            componentPath: '@/pages/SchedulesPage',
            dataSource: 'api/schedules',
            requiredPerms: JSON.stringify(['schedules.read']),
            isCore: true,
        },
        {
            code: 'attendance',
            name: 'Attendance',
            description: 'Check-in/out tracking with QR code and geolocation support',
            type: 'FULLSTACK',
            category: 'ADMIN',
            icon: 'CheckSquare',
            componentPath: '@/pages/AttendancePage',
            dataSource: 'api/attendance',
            requiredPerms: JSON.stringify(['attendance.read', 'attendance.write']),
            isCore: true,
        },
        {
            code: 'athletes_db',
            name: 'Athletes Database',
            description: 'Athlete management with profiles, equipment, and performance data',
            type: 'FULLSTACK',
            category: 'ADMIN',
            icon: 'Users',
            componentPath: '@/pages/AthletesPage',
            dataSource: 'api/athletes',
            requiredPerms: JSON.stringify(['athletes.read', 'athletes.write']),
            isCore: true,
        },
        {
            code: 'finance',
            name: 'Finance Management',
            description: 'Invoicing, payment tracking, and financial reporting',
            type: 'FULLSTACK',
            category: 'COMMERCE',
            icon: 'DollarSign',
            componentPath: '@/pages/FinancePage',
            dataSource: 'api/finance',
            requiredPerms: JSON.stringify(['finance.read', 'finance.write']),
            isCore: true,
        },
        {
            code: 'inventory',
            name: 'Inventory',
            description: 'Equipment and asset inventory management',
            type: 'FULLSTACK',
            category: 'COMMERCE',
            icon: 'Package',
            componentPath: '@/pages/InventoryPage',
            dataSource: 'api/inventory',
            requiredPerms: JSON.stringify(['inventory.read', 'inventory.write']),
            isCore: true,
        },
        {
            code: 'analytics',
            name: 'Analytics Dashboard',
            description: 'Performance analytics with charts, trends, and reports',
            type: 'FULLSTACK',
            category: 'SPORT',
            icon: 'BarChart3',
            componentPath: '@/pages/AnalyticsPage',
            dataSource: 'api/analytics',
            requiredPerms: JSON.stringify(['analytics.read']),
            isCore: true,
        },
        {
            code: 'jersey_shop',
            name: 'Jersey Shop',
            description: 'Jersey e-commerce with product catalog and order management',
            type: 'FULLSTACK',
            category: 'COMMERCE',
            icon: 'ShoppingBag',
            componentPath: '@/features/jersey/JerseyPage',
            dataSource: 'api/jersey',
            requiredPerms: JSON.stringify(['orders.read', 'orders.write']),
            isCore: true,
        },
        {
            code: 'worker_tasks',
            name: 'Worker Tasks',
            description: 'Production task management with Gantt chart timeline',
            type: 'FULLSTACK',
            category: 'COMMERCE',
            icon: 'Wrench',
            componentPath: '@/pages/WorkerTasksPage',
            dataSource: 'api/manpower/tasks',
            requiredPerms: JSON.stringify(['tasks.read', 'tasks.write']),
            isCore: true,
        },
        {
            code: 'qc_station',
            name: 'QC Station',
            description: 'Quality control inspection and rejection handling',
            type: 'FULLSTACK',
            category: 'COMMERCE',
            icon: 'ClipboardCheck',
            componentPath: '@/pages/QCStationPage',
            dataSource: 'api/qc',
            requiredPerms: JSON.stringify(['qc.read', 'qc.write']),
            isCore: true,
        },
        // Widgets (Embeddable components)
        {
            code: 'stats_card',
            name: 'Stats Card',
            description: 'Single statistic display with icon and trend indicator',
            type: 'WIDGET',
            category: 'FOUNDATION',
            icon: 'Hash',
            componentPath: '@/components/widgets/StatsCard',
            dataSource: null,
            requiredPerms: null,
            isCore: false,
        },
        {
            code: 'chart_line',
            name: 'Line Chart',
            description: 'Time series line chart for trends and progress',
            type: 'WIDGET',
            category: 'FOUNDATION',
            icon: 'TrendingUp',
            componentPath: '@/components/widgets/LineChart',
            dataSource: null,
            requiredPerms: null,
            isCore: false,
        },
        {
            code: 'chart_bar',
            name: 'Bar Chart',
            description: 'Comparison bar chart for categories and rankings',
            type: 'WIDGET',
            category: 'FOUNDATION',
            icon: 'BarChart',
            componentPath: '@/components/widgets/BarChart',
            dataSource: null,
            requiredPerms: null,
            isCore: false,
        },
        {
            code: 'recent_activity',
            name: 'Recent Activity',
            description: 'Activity feed showing recent actions and updates',
            type: 'WIDGET',
            category: 'FOUNDATION',
            icon: 'Activity',
            componentPath: '@/components/widgets/RecentActivity',
            dataSource: 'api/activity',
            requiredPerms: null,
            isCore: false,
        },
        {
            code: 'quick_actions',
            name: 'Quick Actions',
            description: 'Grid of shortcut buttons for common actions',
            type: 'WIDGET',
            category: 'FOUNDATION',
            icon: 'Zap',
            componentPath: '@/components/widgets/QuickActions',
            dataSource: null,
            requiredPerms: null,
            isCore: false,
        },
        // Form Inputs (Atomic input components)
        {
            code: 'score_input',
            name: 'Score Input',
            description: 'Arrow score input pad with target face selection',
            type: 'FORM_INPUT',
            category: 'SPORT',
            icon: 'Target',
            componentPath: '@/components/scoring/ScoreInput',
            dataSource: null,
            requiredPerms: null,
            isCore: false,
        },
        {
            code: 'date_picker',
            name: 'Date Picker',
            description: 'Calendar date selection with range support',
            type: 'FORM_INPUT',
            category: 'FOUNDATION',
            icon: 'Calendar',
            componentPath: '@/components/ui/DatePicker',
            dataSource: null,
            requiredPerms: null,
            isCore: false,
        },
        {
            code: 'file_upload',
            name: 'File Upload',
            description: 'Drag-and-drop file upload with preview',
            type: 'FORM_INPUT',
            category: 'FOUNDATION',
            icon: 'Upload',
            componentPath: '@/components/ui/FileUpload',
            dataSource: null,
            requiredPerms: null,
            isCore: false,
        },
        {
            code: 'athlete_selector',
            name: 'Athlete Selector',
            description: 'Searchable dropdown to select athletes',
            type: 'FORM_INPUT',
            category: 'SPORT',
            icon: 'UserSearch',
            componentPath: '@/components/ui/AthleteSelector',
            dataSource: 'api/athletes',
            requiredPerms: JSON.stringify(['athletes.read']),
            isCore: false,
        },
        {
            code: 'qr_scanner',
            name: 'QR Scanner',
            description: 'Camera-based QR code scanner for check-in/validation',
            type: 'FORM_INPUT',
            category: 'FOUNDATION',
            icon: 'QrCode',
            componentPath: '@/components/ui/QRScanner',
            dataSource: null,
            requiredPerms: null,
            isCore: false,
        },
    ];

    for (const part of systemParts) {
        await prisma.systemPart.upsert({
            where: { code: part.code },
            update: part,
            create: part,
        });
    }
    console.log(`✓ ${systemParts.length} System Parts seeded`);

    // ===========================================
    // SEED SIDEBAR CONFIGURATION
    // ===========================================
    console.log('🔗 Setting up Sidebar Configuration...');
    const defaultGroups = [
        { id: 'general', label: 'General', icon: 'LayoutDashboard', color: 'primary', modules: ['dashboard', 'profile', 'digitalcard', 'notifications', 'my_orders', 'catalog'] },
        { id: 'athlete', label: 'Athlete', icon: 'Target', color: 'blue', modules: ['scoring', 'achievements', 'progress', 'athlete_training_schedule', 'athlete_archery_guidance', 'bleep_test', 'archerconfig', 'attendance_history'] },
        { id: 'coach', label: 'Coach', icon: 'Users', color: 'green', modules: ['coach_analytics', 'score_validation', 'athletes', 'schedules', 'attendance'] },
        { id: 'club', label: 'Club', icon: 'Building2', color: 'orange', modules: ['organization', 'finance', 'inventory', 'member_approval', 'invoicing', 'enhanced_reports', 'filemanager', 'club_permissions', 'analytics', 'reports'] },
        { id: 'school', label: 'School', icon: 'GraduationCap', color: 'emerald', modules: ['schools', 'o2sn_registration'] },
        { id: 'parent', label: 'Parent', icon: 'Heart', color: 'purple', modules: ['payments'] },
        { id: 'eo', label: 'Event Organizer', icon: 'Calendar', color: 'teal', modules: ['events', 'event_creation', 'event_registration', 'event_results'] },
        { id: 'judge', label: 'Judge', icon: 'Scale', color: 'indigo', modules: ['score_validation'] },
        { id: 'supplier', label: 'Supplier', icon: 'Package', color: 'rose', modules: ['jersey_dashboard', 'jersey_orders', 'jersey_timeline', 'jersey_products', 'jersey_staff', 'inventory'] },
        { id: 'admin', label: 'Admin', icon: 'Settings', color: 'red', modules: ['admin', 'audit_logs'] }
    ];

    try {
        // Super Admin Config
        await prisma.sidebarRoleConfig.upsert({
            where: { role: 'SUPER_ADMIN' },
            update: { groups: JSON.stringify(defaultGroups) },
            create: {
                role: 'SUPER_ADMIN',
                groups: JSON.stringify(defaultGroups),
                updatedAt: new Date()
            }
        });

        // Club Owner Config
        const clubGroups = defaultGroups.filter(g => ['general', 'club', 'coach', 'athlete'].includes(g.id));
        await prisma.sidebarRoleConfig.upsert({
            where: { role: 'CLUB' },
            update: { groups: JSON.stringify(clubGroups) },
            create: {
                role: 'CLUB',
                groups: JSON.stringify(clubGroups),
                updatedAt: new Date()
            }
        });

        console.log('✓ Sidebar Configs ready.');
    } catch (e) {
        console.error('❌ Failed to upsert Sidebar Config:', e);
    }

    console.log('🌱 Seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
