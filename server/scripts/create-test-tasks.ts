import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestTasks() {
    try {
        // Find workers
        const workers = await prisma.jerseyWorker.findMany({ take: 5 });

        if (workers.length === 0) {
            console.log('No workers found. Please add workers first via Staff Management.');
            return;
        }

        // Find orders
        const orders = await prisma.jerseyOrder.findMany({ take: 4 });

        if (orders.length === 0) {
            console.log('No orders found.');
            return;
        }

        console.log(`Found ${workers.length} workers and ${orders.length} orders`);

        const stages = ['GRADING', 'PRINTING', 'CUTTING', 'PRESS', 'SEWING', 'QC', 'PACKING'];

        // Create tasks for each order-worker combination
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            const worker = workers[i % workers.length];
            const stage = stages[i % stages.length];

            const task = await prisma.workerTask.create({
                data: {
                    workerId: worker.id,
                    orderId: order.id,
                    stage,
                    quantity: i + 1,
                    status: i === 0 ? 'PENDING' : i === 1 ? 'IN_PROGRESS' : i === 2 ? 'COMPLETED' : 'PENDING',
                    startedAt: i === 1 ? new Date() : i === 2 ? new Date(Date.now() - 3600000) : null,
                    completedAt: i === 2 ? new Date() : null,
                    actualMinutes: i === 2 ? 45 : null,
                    estimatedMinutes: 30 + i * 10,
                }
            });

            console.log(`Created task: ${stage} for order ${order.orderNo} -> ${worker.name}`);
        }

        console.log('\n✅ Test tasks created successfully!');
        console.log('Go to /jersey/worker/tasks to see them.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestTasks();
