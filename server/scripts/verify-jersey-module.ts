import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyJerseyModule() {
    console.log('🚀 Starting Jersey Module Verification...\n');

    try {
        // 1. Setup Data - Check for Supplier and Product
        console.log('1️⃣  Checking Prerequisites...');
        const product = await prisma.jerseyProduct.findFirst();
        if (!product) throw new Error('No Jersey Product found. Please seed products first.');

        let worker = await prisma.jerseyWorker.findFirst({ where: { name: 'Test Worker' } });
        if (!worker) {
            console.log('   Creating Test Worker...');
            worker = await prisma.jerseyWorker.create({
                data: {
                    name: 'Test Worker',
                    supplierId: product.supplierId,
                    role: 'Employee',
                    specialization: 'Sewing',
                    dailyCapacity: 10,
                }
            });
        }
        console.log('   ✅ Prerequisites OK');

        // 2. Simulate Customer Order
        console.log('\n2️⃣  Simulating Customer Order...');
        const orderNo = `JO-TEST-${Date.now()}`;
        const order = await prisma.jerseyOrder.create({
            data: {
                orderNo,
                customerId: product.supplierId, // Self-ordering for test
                supplierId: product.supplierId,
                totalAmount: 150000,
                subtotal: 150000, // Added required field
                addonsTotal: 0,   // Added required field
                orderType: 'INDIVIDUAL',
                shippingAddress: 'Test Address',
                status: 'PENDING',
                items: {
                    create: [{
                        productId: product.id,
                        quantity: 5,
                        basePrice: product.basePrice,
                        lineTotal: product.basePrice * 5,
                        recipientName: 'Test Customer',
                    }]
                }
            }
        });
        console.log(`   ✅ Order Created: ${order.orderNo} (ID: ${order.id})`);

        // 3. Simulate Supplier Assigning Task
        console.log('\n3️⃣  Simulating Task Assignment...');
        const task = await prisma.workerTask.create({
            data: {
                orderId: order.id,
                workerId: worker.id,
                stage: 'SEWING',
                quantity: 5,
                status: 'PENDING',
                estimatedMinutes: 60
            }
        });
        console.log(`   ✅ Task Assigned: SEWING to ${worker.name} (ID: ${task.id})`);

        // 4. Simulate Worker Starting Task
        console.log('\n4️⃣  Simulating Task Execution...');
        const startedTask = await prisma.workerTask.update({
            where: { id: task.id },
            data: {
                status: 'IN_PROGRESS',
                startedAt: new Date()
            }
        });
        console.log(`   ✅ Task Started at ${startedTask.startedAt}`);

        // Simulate work time
        const completedTask = await prisma.workerTask.update({
            where: { id: task.id },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
                actualMinutes: 45 // Done faster than estimated!
            }
        });
        console.log(`   ✅ Task Completed: Status ${completedTask.status}, Time: ${completedTask.actualMinutes}m`);

        // 5. Verification
        console.log('\n5️⃣  Final Verification...');
        const finalOrder = await prisma.jerseyOrder.findUnique({
            where: { id: order.id },
            include: { tasks: true }
        });

        if (finalOrder?.tasks.length === 1 && finalOrder.tasks[0].status === 'COMPLETED') {
            console.log('   ✅ INTEGRITY CHECK PASSED: Order has correctly linked completed task.');
        } else {
            console.error('   ❌ INTEGRITY CHECK FAILED');
        }

        // Cleanup
        console.log('\n🧹 Cleaning up test data...');
        // await prisma.workerTask.delete({ where: { id: task.id } });
        // await prisma.jerseyOrder.delete({ where: { id: order.id } }); // Cascades to items usually, but explicit clean is safer in dev
        // Keep worker for future tests

        console.log('\n✨ Verification Complete!');

    } catch (error) {
        console.error('❌ Verification Failed details:');
        console.dir(error, { depth: null });
    } finally {
        await prisma.$disconnect();
    }
}

verifyJerseyModule();
