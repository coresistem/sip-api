import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestOrders() {
    try {
        // Find supplier
        const supplier = await prisma.user.findFirst({
            where: { role: 'SUPPLIER' }
        });

        if (!supplier) {
            console.log('No supplier found. Please create a supplier first.');
            return;
        }

        console.log('Found supplier:', supplier.email);

        // Find a product from this supplier
        let product = await prisma.jerseyProduct.findFirst({
            where: { supplierId: supplier.id }
        });

        if (!product) {
            // Create a sample product if none exists
            product = await prisma.jerseyProduct.create({
                data: {
                    supplierId: supplier.id,
                    name: 'Jersey Archer Pro',
                    sku: 'JSY-001',
                    category: 'Jersey',
                    description: 'High quality archery jersey',
                    basePrice: 150000,
                    minOrderQty: 1,
                    isActive: true
                }
            });
            console.log('Created sample product:', product.name);
        } else {
            console.log('Using existing product:', product.name);
        }

        // Find a customer (any non-supplier user)
        const customer = await prisma.user.findFirst({
            where: { role: { not: 'SUPPLIER' } }
        });

        if (!customer) {
            console.log('No customer found.');
            return;
        }

        console.log('Found customer:', customer.email);

        // Create test orders with different statuses
        const orderStatuses = ['PENDING', 'CONFIRMED', 'PRODUCTION', 'SHIPPED'];

        for (let i = 0; i < orderStatuses.length; i++) {
            const orderNo = `JO-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${String(i + 1).padStart(3, '0')}`;

            const order = await prisma.jerseyOrder.create({
                data: {
                    orderNo,
                    customerId: customer.id,
                    supplierId: supplier.id,
                    orderType: 'INDIVIDUAL',
                    subtotal: product.basePrice * (i + 1),
                    addonsTotal: 10000 * i,
                    totalAmount: product.basePrice * (i + 1) + 10000 * i,
                    status: orderStatuses[i],
                    paymentStatus: i >= 2 ? 'PAID' : 'UNPAID',
                    shippingAddress: 'Jl. Test No. ' + (i + 1) + ', Jakarta',
                    notes: 'Test order #' + (i + 1),
                    items: {
                        create: {
                            productId: product.id,
                            recipientName: 'Test Recipient ' + (i + 1),
                            quantity: i + 1,
                            basePrice: product.basePrice,
                            variantPrices: 10000 * i,
                            lineTotal: product.basePrice * (i + 1) + 10000 * i,
                            nameOnJersey: 'ARCHER',
                            numberOnJersey: String(10 + i)
                        }
                    },
                    tracking: {
                        create: {
                            status: orderStatuses[i],
                            description: 'Order created - ' + orderStatuses[i],
                            updatedBy: supplier.id
                        }
                    }
                }
            });

            console.log(`Created order: ${order.orderNo} (${order.status})`);
        }

        console.log('\n✅ All test orders created successfully!');
        console.log('Go to /supplier/orders to see them.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestOrders();
