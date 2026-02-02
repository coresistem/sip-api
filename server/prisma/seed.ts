import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { generateCoreId } from '../src/modules/core/auth/coreId.service.js';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create Super Admin
    const superAdminPassword = await bcrypt.hash('c0r3@link001', 12);
    // Use fixed ID for Super Admin as it's special, or generate? 
    // Super Admin is usually 00
    // But for consistency let's try to stick to what works. 
    // Actually, for seed, we prefer deterministic output if possible for testing.
    // BUT the user said "dont use hardcode".
    // I will use generatecoreId for all roles to be safe.
    // For Super Admin, let's just make sure we don't conflict. 
    // upsert won't update coreId if it exists.

    // Existing logic:
    // upsert by email. if exists, updates coreId to fixed value.
    // if fixed value is taken by someone else -> BOOM.

    // New logic:
    // upsert by email.
    // in create: generate new ID.
    // in update: keep existing ID (don't force update coreId) OR regenerate if missing.

    // However, I can't await inside the create object easily without preparing variables first.

    const saEmail = 'admin@sip.id';
    const saExisting = await prisma.user.findUnique({ where: { email: saEmail } });
    let saCoreId = saExisting?.coreId;
    if (!saCoreId) {
        saCoreId = await generateCoreId('SUPER_ADMIN');
    }

    const superAdmin = await prisma.user.upsert({
        where: { email: saEmail },
        update: {
            passwordHash: superAdminPassword,
            role: 'SUPER_ADMIN',
            name: 'Super Administrator',
            coreId: saCoreId,
        },
        create: {
            email: saEmail,
            passwordHash: superAdminPassword,
            name: 'Super Administrator',
            role: 'SUPER_ADMIN',
            phone: '+62812000001',
            coreId: saCoreId,
        },
    });
    console.log('✓ Super Admin created:', superAdmin.email);

    // Create Club Owner
    const clubEmail = 'owner@archeryclub.id';
    const clubExisting = await prisma.user.findUnique({ where: { email: clubEmail } });
    let clubCoreId = clubExisting?.coreId;
    if (!clubCoreId) {
        clubCoreId = await generateCoreId('CLUB');
    }

    const clubPassword = await bcrypt.hash('clubowner123', 12);
    const clubOwner = await prisma.user.upsert({
        where: { email: clubEmail },
        update: {
            passwordHash: clubPassword,
        },
        create: {
            email: clubEmail,
            passwordHash: clubPassword,
            name: 'Budi Santoso',
            role: 'CLUB',
            phone: '+62812000002',
            coreId: clubCoreId,
        },
    });
    console.log('✓ Club Owner created:', clubOwner.email);

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

    // --- PHASE 11: CLUB UNITS ---
    const unit1 = await prisma.clubUnit.upsert({
        where: { clubId_name: { clubId: club.id, name: 'Puslatda Range' } },
        update: {},
        create: {
            clubId: club.id,
            name: 'Puslatda Range',
            type: 'FIELD',
            address: 'Gelora Bung Karno, Jakarta',
            qrCode: `UNIT-${club.id.slice(-4)}-RANGE`
        }
    });

    const unit2 = await prisma.clubUnit.upsert({
        where: { clubId_name: { clubId: club.id, name: 'SMA Negeri 1 Academy' } },
        update: {},
        create: {
            clubId: club.id,
            name: 'SMA Negeri 1 Academy',
            type: 'SCHOOL',
            address: 'Lap. Upacara SMAN 1, Jakarta',
            qrCode: `UNIT-${club.id.slice(-4)}-SMA1`
        }
    });
    console.log('✓ Units created for Jakarta Archery Club');

    // Update club owner with club ID
    await prisma.user.update({
        where: { id: clubOwner.id },
        data: { clubId: club.id },
    });

    // Create Coach

    // Create Coach
    const coachEmail = 'coach@archeryclub.id';
    const coachExisting = await prisma.user.findUnique({ where: { email: coachEmail } });
    let coachCoreId = coachExisting?.coreId;
    if (!coachCoreId) {
        coachCoreId = await generateCoreId('COACH');
    }

    const coachPassword = await bcrypt.hash('coach123', 12);
    const coach = await prisma.user.upsert({
        where: { email: coachEmail },
        update: {
            passwordHash: coachPassword,
            role: 'COACH',
            name: 'Ahmad Trainer',
            coreId: coachCoreId,
        },
        create: {
            email: coachEmail,
            passwordHash: coachPassword,
            name: 'Ahmad Trainer',
            role: 'COACH',
            phone: '+62812000003',
            clubId: club.id,
            coreId: coachCoreId,
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
        let coreId = existingAthlete?.coreId;
        if (!coreId) {
            coreId = await generateCoreId('ATHLETE');
        }

        const athleteUser = await prisma.user.upsert({
            where: { email: data.email },
            update: {
                passwordHash: athletePassword,
                role: 'ATHLETE',
                name: data.name,
                coreId: coreId,
            },
            create: {
                email: data.email,
                passwordHash: athletePassword,
                name: data.name,
                role: 'ATHLETE',
                clubId: club.id,
                coreId: coreId,
                gender: data.gender,
                dateOfBirth: new Date('2005-06-15'),
            },
        });

        await prisma.athlete.upsert({
            where: { userId: athleteUser.id },
            update: {},
            create: {
                userId: athleteUser.id,
                clubId: club.id,
                archeryCategory: data.category,
                skillLevel: data.level,
                height: 165 + Math.floor(Math.random() * 20),
                weight: 55 + Math.floor(Math.random() * 25),
                bowDrawWeight: 24 + Math.floor(Math.random() * 12),
                unitId: athleteData.indexOf(data) < 6 ? unit1.id : unit2.id,
            },
        });
        console.log('✓ Athlete created:', data.name);
    }

    // Create Parent
    // Create Parent
    const parentEmail = 'parent@mail.id';
    const parentExisting = await prisma.user.findUnique({ where: { email: parentEmail } });
    let parentCoreId = parentExisting?.coreId;
    if (!parentCoreId) {
        parentCoreId = await generateCoreId('PARENT');
    }

    const parentPassword = await bcrypt.hash('parent123', 12);
    const parent = await prisma.user.upsert({
        where: { email: parentEmail },
        update: {
            passwordHash: parentPassword,
            role: 'PARENT',
            name: 'Ibu Pranata',
            coreId: parentCoreId,
        },
        create: {
            email: parentEmail,
            passwordHash: parentPassword,
            name: 'Ibu Pranata',
            role: 'PARENT',
            phone: '+62812000005',
            clubId: club.id,
            coreId: parentCoreId,
        },
    });
    console.log('✓ Parent created:', parent.email);

    // Create Perpani (Federation Admin)
    // Create Perpani (Federation Admin)
    const perpaniEmail = 'perpani@perpani.or.id';
    const perpaniExisting = await prisma.user.findUnique({ where: { email: perpaniEmail } });
    let perpaniCoreId = perpaniExisting?.coreId;
    if (!perpaniCoreId) {
        perpaniCoreId = await generateCoreId('PERPANI');
    }

    const perpaniPassword = await bcrypt.hash('perpani123', 12);
    const perpani = await prisma.user.upsert({
        where: { email: perpaniEmail },
        update: {
            passwordHash: perpaniPassword,
            role: 'PERPANI',
            name: 'Ketua Perpani DKI',
            coreId: perpaniCoreId,
        },
        create: {
            email: perpaniEmail,
            passwordHash: perpaniPassword,
            name: 'Ketua Perpani DKI',
            role: 'PERPANI',
            phone: '+62812000006',
            coreId: perpaniCoreId,
        },
    });
    console.log('✓ Perpani created:', perpani.email);

    // Create School Admin
    // Create School Admin
    const schoolEmail = 'school@sma1.sch.id';
    const schoolExisting = await prisma.user.findUnique({ where: { email: schoolEmail } });
    let schoolCoreId = schoolExisting?.coreId;
    if (!schoolCoreId) {
        schoolCoreId = await generateCoreId('SCHOOL');
    }

    const schoolPassword = await bcrypt.hash('school123', 12);
    const school = await prisma.user.upsert({
        where: { email: schoolEmail },
        update: {
            passwordHash: schoolPassword,
            role: 'SCHOOL',
            name: 'SMA Negeri 1 Jakarta',
            coreId: schoolCoreId,
        },
        create: {
            email: schoolEmail,
            passwordHash: schoolPassword,
            name: 'SMA Negeri 1 Jakarta',
            role: 'SCHOOL',
            phone: '+62215551234',
            coreId: schoolCoreId,
        },
    });
    console.log('✓ School created:', school.email);

    // Create Judge
    // Create Judge
    const judgeEmail = 'judge@perpani.or.id';
    const judgeExisting = await prisma.user.findUnique({ where: { email: judgeEmail } });
    let judgeCoreId = judgeExisting?.coreId;
    if (!judgeCoreId) {
        judgeCoreId = await generateCoreId('JUDGE');
    }

    const judgePassword = await bcrypt.hash('judge123', 12);
    const judge = await prisma.user.upsert({
        where: { email: judgeEmail },
        update: {
            passwordHash: judgePassword,
            role: 'JUDGE',
            name: 'Pak Wasit',
            coreId: judgeCoreId,
        },
        create: {
            email: judgeEmail,
            passwordHash: judgePassword,
            name: 'Pak Wasit',
            role: 'JUDGE',
            phone: '+62812000007',
            coreId: judgeCoreId,
        },
    });
    console.log('✓ Judge created:', judge.email);

    // Create Event Organizer
    // Create Event Organizer
    const eoEmail = 'eo@events.id';
    const eoExisting = await prisma.user.findUnique({ where: { email: eoEmail } });
    let eoCoreId = eoExisting?.coreId;
    if (!eoCoreId) {
        eoCoreId = await generateCoreId('EO');
    }

    const eoPassword = await bcrypt.hash('eo123456', 12);
    const eo = await prisma.user.upsert({
        where: { email: eoEmail },
        update: {
            passwordHash: eoPassword,
        },
        create: {
            email: eoEmail,
            passwordHash: eoPassword,
            name: 'Event Organizer',
            role: 'EO',
            phone: '+62812000008',
            coreId: eoCoreId,
        },
    });
    console.log('✓ Event Organizer created:', eo.email);

    // Create Supplier
    // Create Supplier
    const supplierEmail = 'supplier@archeryshop.id';
    const supplierExisting = await prisma.user.findUnique({ where: { email: supplierEmail } });
    let supplierCoreId = supplierExisting?.coreId;
    if (!supplierCoreId) {
        supplierCoreId = await generateCoreId('SUPPLIER');
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
            name: 'Supplier Archery',
            role: 'SUPPLIER',
            phone: '+62812000009',
            coreId: supplierCoreId,
        },
    });
    console.log('✓ Supplier created:', supplier.email);

    // Create Manpower
    const manpowerEmail = 'manpower@core-panahan.id';
    const manpowerExisting = await prisma.user.findUnique({ where: { email: manpowerEmail } });
    let manpowerCoreId = manpowerExisting?.coreId;
    if (!manpowerCoreId) {
        manpowerCoreId = await generateCoreId('MANPOWER');
    }

    const manpowerPassword = await bcrypt.hash('manpower123', 12);
    const manpowerUser = await prisma.user.upsert({
        where: { email: manpowerEmail },
        update: {
            passwordHash: manpowerPassword,
            role: 'MANPOWER',
            name: 'Production Manpower',
        },
        create: {
            email: manpowerEmail,
            passwordHash: manpowerPassword,
            name: 'Production Manpower',
            role: 'MANPOWER',
            phone: '+62812000010',
            coreId: manpowerCoreId,
        },
    });
    console.log('✓ Manpower User created:', manpowerUser.email);

    // Create Jersey Manpower Profile (linked to Supplier)
    let jerseyWorker = await prisma.manpower.findFirst({
        where: { email: 'worker@archeryshop.id' }
    });

    if (!jerseyWorker) {
        jerseyWorker = await prisma.manpower.create({
            data: {
                supplierId: supplier.id,
                name: 'Production Manpower',
                email: 'worker@archeryshop.id',
                role: 'MANPOWER',
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
        where: { coreId: 'CM.0001.0001' },
        update: {},
        create: {
            coreId: 'CM.0001.0001',
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
    console.log('  Super Admin:     admin@sip.id / c0r3@link001');
    console.log('  Perpani:        perpani@perpani.or.id / perpani123');
    console.log('  Club:           owner@archeryclub.id / clubowner123');
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
        { id: 'club', label: 'Club', icon: 'Building2', color: 'orange', modules: ['organization', 'finance', 'inventory', 'club_members', 'units', 'invoicing', 'enhanced_reports', 'filemanager', 'club_permissions', 'analytics', 'reports', 'manpower'] },
        { id: 'school', label: 'School', icon: 'GraduationCap', color: 'emerald', modules: ['schools', 'o2sn_registration'] },
        { id: 'parent', label: 'Parent', icon: 'Heart', color: 'purple', modules: ['payments'] },
        { id: 'eo', label: 'Event Organizer', icon: 'Calendar', color: 'teal', modules: ['events', 'event_creation', 'event_registration', 'event_results'] },
        { id: 'judge', label: 'Judge', icon: 'Scale', color: 'indigo', modules: ['score_validation'] },
        { id: 'supplier', label: 'Supplier', icon: 'Package', color: 'rose', modules: ['jersey_dashboard', 'jersey_orders', 'jersey_timeline', 'jersey_products', 'jersey_staff', 'inventory', 'manpower'] },
        { id: 'admin', label: 'Admin', icon: 'Settings', color: 'red', modules: ['admin', 'audit_logs', 'manpower'] }
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

        // Club Config
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

        // Athlete Config
        const athleteGroups = defaultGroups.filter(g => ['general', 'athlete'].includes(g.id));
        await prisma.sidebarRoleConfig.upsert({
            where: { role: 'ATHLETE' },
            update: { groups: JSON.stringify(athleteGroups) },
            create: { role: 'ATHLETE', groups: JSON.stringify(athleteGroups), updatedAt: new Date() }
        });

        // Coach Config
        const coachGroups = defaultGroups.filter(g => ['general', 'coach', 'athlete'].includes(g.id));
        await prisma.sidebarRoleConfig.upsert({
            where: { role: 'COACH' },
            update: { groups: JSON.stringify(coachGroups) },
            create: { role: 'COACH', groups: JSON.stringify(coachGroups), updatedAt: new Date() }
        });

        // School Config
        const schoolGroups = defaultGroups.filter(g => ['general', 'school', 'coach', 'athlete'].includes(g.id));
        await prisma.sidebarRoleConfig.upsert({
            where: { role: 'SCHOOL' },
            update: { groups: JSON.stringify(schoolGroups) },
            create: { role: 'SCHOOL', groups: JSON.stringify(schoolGroups), updatedAt: new Date() }
        });

        // Supplier Config
        const supplierGroups = defaultGroups.filter(g => ['general', 'supplier'].includes(g.id));
        await prisma.sidebarRoleConfig.upsert({
            where: { role: 'SUPPLIER' },
            update: { groups: JSON.stringify(supplierGroups) },
            create: { role: 'SUPPLIER', groups: JSON.stringify(supplierGroups), updatedAt: new Date() }
        });

        // Manpower Config
        const manpowerGroups = [
            defaultGroups.find(g => g.id === 'general'),
            { id: 'manpower', label: 'Production', icon: 'Hammer', color: 'emerald', modules: ['jersey_manpower_station'] }
        ].filter(Boolean);
        await prisma.sidebarRoleConfig.upsert({
            where: { role: 'MANPOWER' },
            update: { groups: JSON.stringify(manpowerGroups) },
            create: { role: 'MANPOWER', groups: JSON.stringify(manpowerGroups), updatedAt: new Date() }
        });

        console.log('✓ Sidebar Configs ready.');
    } catch (e) {
        console.error('❌ Failed to upsert Sidebar Config:', e);
    }

    // ===========================================
    // SEED MARKETPLACE PRODUCTS (Phase 29)
    // ===========================================
    console.log('🛒 Seeding Marketplace Products...');
    const marketplaceProducts = [
        {
            name: 'Standard Recurve Bow',
            description: 'Essential beginner to intermediate recurve bow. Reliable and consistent.',
            price: 1250000,
            image: 'https://images.unsplash.com/photo-1511033034032-959997701389?auto=format&fit=crop&q=80',
            category: 'Bows',
            stock: 15,
            rating: 4.8
        },
        {
            name: 'Carbon Express Arrows',
            description: 'Pack of 12 carbon arrows for high precision and durability.',
            price: 950000,
            image: 'https://images.unsplash.com/photo-1628157790906-896db8f0f08a?auto=format&fit=crop&q=80',
            category: 'Arrows',
            stock: 50,
            rating: 4.9,
            isExclusive: true
        },
        {
            name: 'Leather Arm Guard',
            description: 'Comfortable leather arm guard with adjustable straps.',
            price: 75000,
            image: 'https://images.unsplash.com/photo-1605663863456-e63d3f972007?auto=format&fit=crop&q=80',
            category: 'Accessories',
            stock: 100,
            rating: 4.5
        },
        {
            name: 'Pro Archery Jersey',
            description: 'Professional grade breathable jersey for competition.',
            price: 150000,
            image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80',
            category: 'Apparel',
            stock: 40,
            rating: 5.0
        },
        {
            name: 'Professional Bow String',
            description: 'Hand-woven fast-flight bow string for maximum energy transfer.',
            price: 125000,
            image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80',
            category: 'Accessories',
            stock: 30,
            rating: 4.7
        },
        {
            name: 'Magnetic Arrow Rest',
            description: 'Precision magnetic arrow rest for consistent high-performance results.',
            price: 185000,
            image: 'https://images.unsplash.com/photo-1563124417-6833682eb79a?auto=format&fit=crop&q=80',
            category: 'Accessories',
            stock: 25,
            rating: 4.6
        }
    ];

    for (const prod of marketplaceProducts) {
        await prisma.product.upsert({
            where: { id: `seed-prod-${prod.name.replace(/\s+/g, '-').toLowerCase()}` },
            update: prod,
            create: {
                id: `seed-prod-${prod.name.replace(/\s+/g, '-').toLowerCase()}`,
                ...prod
            }
        });
    }
    console.log('✓ Marketplace products seeded');

    // ===========================================
    // SEED LAB FEATURES (Centralized Feature Manager)
    // ===========================================
    console.log('🧪 Seeding All System Features into Labs...');
    const labFeatures = [
        // --- CORE & FOUNDATION (Integrated) ---
        {
            slug: 'auth-core',
            name: 'Multi-Role Auth',
            description: 'Unified identity system with role-switching and CoreID generation.',
            status: 'INTEGRATED',
            isPublic: true,
            routePath: '/login'
        },
        {
            slug: 'digital-card',
            name: 'Digital ID Card',
            description: 'Premium athlete identity card with real-time QR verification.',
            status: 'INTEGRATED',
            isPublic: true,
            routePath: '/digital-card'
        },

        // --- CLUB MANAGEMENT (Integrated) ---
        {
            slug: 'club-finance',
            name: 'Club Finance',
            description: 'Invoicing, payment tracking, and automated financial reporting.',
            status: 'INTEGRATED',
            isPublic: false,
            routePath: '/finance'
        },
        {
            slug: 'inventory-system',
            name: 'Inventory & Assets',
            description: 'Equipment tracking, supplier ordering, and warehouse management.',
            status: 'INTEGRATED',
            isPublic: false,
            routePath: '/inventory'
        },

        // --- ATHLETE & PERFORMANCE (Integrated/Standalone) ---
        {
            slug: 'scoring-system',
            name: 'Arrow Scoring',
            description: 'Touch-optimized arrow entry with integrated target face analytics.',
            status: 'INTEGRATED',
            isPublic: true,
            routePath: '/scoring'
        },
        {
            slug: 'bleep-test',
            name: 'Pro Bleep Test',
            description: 'AI-assisted VO2 Max calculation with immersive training cues.',
            status: 'STANDALONE',
            isPublic: true,
            routePath: '/labs/bleep-test'
        },

        // --- COMMERCE (Integrated) ---
        {
            slug: 'marketplace',
            name: 'Unified Marketplace',
            description: 'E-commerce hub for archery equipment and club gear.',
            status: 'INTEGRATED',
            isPublic: true,
            routePath: '/marketplace'
        },

        // --- DEVELOPMENT / IN PROGRESS ---
        {
            slug: 'event-wizard',
            name: 'Event Management (Wizard)',
            description: 'End-to-end tournament creation, categories, and registration flow.',
            status: 'IN_PROGRESS',
            isPublic: false,
            routePath: '/events'
        },
        {
            slug: 'onboarding-premium',
            name: 'Premium Onboarding',
            description: 'Cinematic first-time user experience with animated brand storytelling.',
            status: 'INTEGRATED',
            isPublic: true,
            routePath: '/'
        },
        {
            slug: 'assessment-builder',
            name: 'Form & Assessment Builder',
            description: 'No-code dynamic form creator for custom evaluations.',
            status: 'IN_PROGRESS',
            isPublic: false,
            routePath: '/admin/module-builder'
        },
        {
            slug: 'dropdown-search',
            name: 'Dropdown Search Control',
            description: 'Premium searchable dropdown with multi-select and fuzzy filtering.',
            status: 'STANDALONE',
            isPublic: true,
            routePath: '/labs/dropdown-search'
        },
        {
            slug: 'data-integrity',
            name: 'Data Integrity: Redundancy Guard',
            description: 'AI-assisted duplicate detector to maintain data cleanliness.',
            status: 'STANDALONE',
            isPublic: true,
            routePath: '/labs/data-integrity'
        }
    ];

    for (const lab of labFeatures) {
        await prisma.labFeature.upsert({
            where: { slug: lab.slug },
            update: lab,
            create: lab
        });
    }
    console.log(`✓ ${labFeatures.length} Features registered in Labs`);

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
