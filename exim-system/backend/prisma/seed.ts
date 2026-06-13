import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable must be defined');
}

let prisma: PrismaClient;

if (connectionString.startsWith('file:') || connectionString.startsWith('sqlite:')) {
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
  const adapter = new PrismaBetterSqlite3({ url: connectionString });
  prisma = new PrismaClient({ adapter });
} else {
  prisma = new PrismaClient();
}

const roles = ['Admin', 'Sales', 'Documentation', 'Accounts', 'Customer'] as const;

async function main() {
  console.log('Clearing database tables...');
  
  // Delete in correct dependency order
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.document.deleteMany();
  await prisma.shipmentStatusHistory.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.quotationItem.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  console.log('Seeding roles...');
  const roleRecords: Record<string, { id: string }> = {};
  for (const roleName of roles) {
    const role = await prisma.role.create({
      data: {
        name: roleName,
        description: `${roleName} role`,
      },
    });
    roleRecords[roleName] = { id: role.id };
  }

  console.log('Seeding users...');
  const users = [
    { email: 'admin@sogt.com', firstName: 'Admin', lastName: 'User', role: 'Admin', password: 'Admin@123' },
    { email: 'sales@sogt.com', firstName: 'Sales', lastName: 'Specialist', role: 'Sales', password: 'Sales@123' },
    { email: 'docs@sogt.com', firstName: 'Documentation', lastName: 'Officer', role: 'Documentation', password: 'Docs@123' },
    { email: 'accounts@sogt.com', firstName: 'Accounts', lastName: 'Auditor', role: 'Accounts', password: 'Accounts@123' },
    { email: 'customer@sogt.com', firstName: 'Customer', lastName: 'Representative', role: 'Customer', password: 'Customer@123' },
  ];

  const userRecords: Record<string, any> = {};
  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    const dbUser = await prisma.user.create({
      data: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        passwordHash,
        roleId: roleRecords[user.role].id,
        isActive: true,
      },
    });
    userRecords[user.email] = dbUser;
  }

  console.log('Seeding products...');
  const productsData = [
    { productCode: 'PROD-ENA', name: 'ZENITH ENA (Extra Neutral Alcohol)', hsCode: '22071000', unit: 'Liters', price: 1.25, currency: 'USD' },
    { productCode: 'PROD-WSUGAR', name: 'OM HARVEST White Refined Sugar (S30)', hsCode: '17019910', unit: 'Metric Tons', price: 580.00, currency: 'USD' },
    { productCode: 'PROD-BSUGAR', name: 'OM HARVEST Brown Sugar', hsCode: '17011490', unit: 'Metric Tons', price: 640.00, currency: 'USD' },
    { productCode: 'PROD-MOLASSES', name: 'ZENITH MOLASSES', hsCode: '17031000', unit: 'Metric Tons', price: 210.00, currency: 'USD' },
    { productCode: 'PROD-ERICKSHAW', name: 'SHIVAA E-Rickshaws', hsCode: '87038000', unit: 'Units', price: 1850.00, currency: 'USD' },
    { productCode: 'PROD-EBIKE', name: 'SHIVAA E-Bikes', hsCode: '87116000', unit: 'Units', price: 620.00, currency: 'USD' },
    { productCode: 'PROD-POLYMER', name: 'Shivaa Polymers (Resins)', hsCode: '39011000', unit: 'Metric Tons', price: 1180.00, currency: 'USD' },
    { productCode: 'PROD-CITRIC', name: 'Globichem Citric Acid', hsCode: '29181400', unit: 'Metric Tons', price: 920.00, currency: 'USD' },
    { productCode: 'PROD-MALIC', name: 'Globichem Malic Acid', hsCode: '29181990', unit: 'Metric Tons', price: 1450.00, currency: 'USD' },
  ];

  const productRecords: Record<string, any> = {};
  for (const prod of productsData) {
    const dbProd = await prisma.product.create({
      data: {
        productCode: prod.productCode,
        name: prod.name,
        hsCode: prod.hsCode,
        unit: prod.unit,
        price: prod.price,
        currency: prod.currency,
      },
    });
    productRecords[prod.productCode] = dbProd;
  }

  console.log('Seeding customers...');
  const customersData = [
    { customerCode: 'CUST-2026-001', companyName: 'Apex Global Trading LLC', contactPerson: 'Alex Mercer', email: 'alex.mercer@apexglobal.com', phone: '+1 (555) 019-2834', country: 'United States', address: '100 Wall Street, Floor 24, New York, NY 10005', gstVatNumber: 'US-998273615', status: 'active' },
    { customerCode: 'CUST-2026-002', companyName: 'Eurasia Logistics GmbH', contactPerson: 'Sophia Schmidt', email: 's.schmidt@eurasialogistics.de', phone: '+49 89 2019382', country: 'Germany', address: 'Leopoldstraße 23, 80802 Munich', gstVatNumber: 'DE-811223344', status: 'active' },
    { customerCode: 'CUST-2026-003', companyName: 'Nippon Sunrise Ventures', contactPerson: 'Kenji Sato', email: 'k.sato@nipponsunrise.co.jp', phone: '+81 3 5555 0142', country: 'Japan', address: 'Chiyoda-ku, Marunouchi 1-chome, Tokyo 100-0005', gstVatNumber: 'JP-778899001', status: 'active' },
    { customerCode: 'CUST-2026-004', companyName: 'Pacific Harvest Exports', contactPerson: 'Liam Miller', email: 'liam.miller@pachargest.com.au', phone: '+61 2 9876 5432', country: 'Australia', address: '42 George St, Sydney, NSW 2000', gstVatNumber: 'AU-556677889', status: 'inactive' },
    { customerCode: 'CUST-2026-005', companyName: 'Trans-Sahara Minerals Group', contactPerson: 'Fatima Diop', email: 'f.diop@transsahara.org', phone: '+221 33 821 4455', country: 'Senegal', address: 'Avenue Cheikh Anta Diop, Dakar', gstVatNumber: 'SN-443322110', status: 'blocked' },
  ];

  const customerRecords: Record<string, any> = {};
  for (const cust of customersData) {
    const dbCust = await prisma.customer.create({
      data: cust,
    });
    customerRecords[cust.customerCode] = dbCust;
  }

  // Links customer user email to customer record
  console.log('Seeding customer links...');
  await prisma.user.update({
    where: { email: 'customer@sogt.com' },
    data: {
      email: 'alex.mercer@apexglobal.com', // Let's make Apex Global the customer user
    }
  });

  console.log('Seeding leads...');
  const lead1 = await prisma.lead.create({
    data: {
      leadNumber: 'LEAD-2026-001',
      customerId: customerRecords['CUST-2026-001'].id,
      source: 'Website Inquiry',
      assignedTo: userRecords['sales@sogt.com'].id,
      status: 'Qualified',
      notes: 'Interested in White Sugar (S30) shipments for East Coast US retail.',
    }
  });

  console.log('Seeding inquiries...');
  const inquiry1 = await prisma.inquiry.create({
    data: {
      inquiryNumber: 'INQ-2026-001',
      customerId: customerRecords['CUST-2026-001'].id,
      productId: productRecords['PROD-WSUGAR'].id,
      quantity: 50,
      targetPrice: 560.00,
      notes: 'Require standard grade S30 packaging.',
      status: 'Quoted',
    }
  });

  const inquiry2 = await prisma.inquiry.create({
    data: {
      inquiryNumber: 'INQ-2026-002',
      customerId: customerRecords['CUST-2026-003'].id,
      productId: productRecords['PROD-MOLASSES'].id,
      quantity: 100,
      targetPrice: 200.00,
      notes: 'Sugarcane molasses for distillation.',
      status: 'Received',
    }
  });

  console.log('Seeding quotations...');
  const quotation1 = await prisma.quotation.create({
    data: {
      quotationNumber: 'QT-2026-031',
      customerId: customerRecords['CUST-2026-001'].id,
      currency: 'USD',
      subTotal: 29000.00,
      taxTotal: 0.00,
      grandTotal: 29000.00,
      validUntil: new Date('2026-07-15'),
      revision: 1,
      status: 'Approved',
      items: {
        create: {
          productId: productRecords['PROD-WSUGAR'].id,
          quantity: 50,
          unitPrice: 580.00,
          totalPrice: 29000.00,
        }
      }
    }
  });

  const quotation2 = await prisma.quotation.create({
    data: {
      quotationNumber: 'QT-2026-032',
      customerId: customerRecords['CUST-2026-003'].id,
      currency: 'USD',
      subTotal: 21000.00,
      taxTotal: 0.00,
      grandTotal: 21000.00,
      validUntil: new Date('2026-07-20'),
      revision: 1,
      status: 'Sent',
      items: {
        create: {
          productId: productRecords['PROD-MOLASSES'].id,
          quantity: 100,
          unitPrice: 210.00,
          totalPrice: 21000.00,
        }
      }
    }
  });

  console.log('Seeding orders...');
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-0501',
      customerId: customerRecords['CUST-2026-001'].id,
      quotationId: quotation1.id,
      currency: 'USD',
      totalAmount: 29000.00,
      advanceAmount: 5800.00,
      balanceAmount: 23200.00,
      paymentTerms: '20% Advance TT, 80% against scanned BL copy',
      incoterms: 'FOB Nhava Sheva Port, Mumbai',
      status: 'Production In Process',
      expectedDispatchDate: new Date('2026-06-15'),
      items: {
        create: {
          productId: productRecords['PROD-WSUGAR'].id,
          quantity: 50,
          unitPrice: 580.00,
          totalPrice: 29000.00,
        }
      }
    }
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-0489',
      customerId: customerRecords['CUST-2026-003'].id,
      currency: 'USD',
      totalAmount: 21000.00,
      advanceAmount: 4200.00,
      balanceAmount: 16800.00,
      paymentTerms: '100% Sight Letter of Credit',
      incoterms: 'CIF Yokohama Port, Tokyo',
      status: 'Shipment Ready',
      expectedDispatchDate: new Date('2026-06-18'),
      items: {
        create: {
          productId: productRecords['PROD-MOLASSES'].id,
          quantity: 100,
          unitPrice: 210.00,
          totalPrice: 21000.00,
        }
      }
    }
  });

  const order3 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-0466',
      customerId: customerRecords['CUST-2026-004'].id,
      currency: 'USD',
      totalAmount: 118000.00,
      advanceAmount: 0.00,
      balanceAmount: 118000.00,
      paymentTerms: 'Net 30 Days CAD',
      incoterms: 'CFR Melbourne Port',
      status: 'Shipped',
      expectedDispatchDate: new Date('2026-05-20'),
      items: {
        create: {
          productId: productRecords['PROD-POLYMER'].id,
          quantity: 100,
          unitPrice: 1180.00,
          totalPrice: 118000.00,
        }
      }
    }
  });

  console.log('Seeding suppliers...');
  const supplier1 = await prisma.supplier.create({
    data: {
      name: 'Saraswati Agri Mills Ltd',
      contactPerson: 'Rajesh Kumar',
      country: 'India',
      email: 'info@saraswatiagri.com',
      phone: '+91 98765 43210'
    }
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      name: 'Indo-Ganges Spinning Mills',
      contactPerson: 'Amit Sharma',
      country: 'India',
      email: 'supply@indoganges.com',
      phone: '+91 11 2345 6789'
    }
  });

  console.log('Seeding purchase orders...');
  const po1 = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2026-1001',
      supplierId: supplier1.id,
      orderId: order1.id,
      currency: 'USD',
      totalAmount: 23200.00,
      expectedDeliveryDate: new Date('2026-06-10'),
      status: 'In Production'
    }
  });

  const po2 = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2026-1002',
      supplierId: supplier2.id,
      orderId: order2.id,
      currency: 'USD',
      totalAmount: 16800.00,
      expectedDeliveryDate: new Date('2026-06-12'),
      status: 'Delivered'
    }
  });

  console.log('Seeding shipments...');
  const shipment1 = await prisma.shipment.create({
    data: {
      shipmentNumber: 'SH-2026-8092',
      orderId: order3.id,
      containerNumber: 'MSKU8827164',
      blNumber: 'BL-998273615',
      shippingLine: 'Maersk Line',
      vesselName: 'MAERSK MC-KINNEY MOLLER',
      freightForwarder: 'DHL Global Forwarding',
      portOfLoading: 'Nhava Sheva Port, India',
      portOfDischarge: 'Melbourne Port, Australia',
      etd: new Date('2026-05-24'),
      eta: new Date('2026-06-12'),
      status: 'In Transit',
      statusHistory: {
        createMany: {
          data: [
            { status: 'Booking Confirmed', notes: 'Container booked with shipping line' },
            { status: 'Container Stuffed', notes: 'Cargo loaded and sealed at warehouse' },
            { status: 'Vessel Departed', notes: 'Departed from port of loading Nhava Sheva' }
          ]
        }
      }
    }
  });

  console.log('Seeding documents...');
  // Apex Order 1 Documents
  await prisma.document.create({
    data: {
      entityType: 'Order',
      entityId: order1.id,
      documentType: 'Invoice',
      fileName: 'Invoice_ORD-2026-0501.pdf',
      fileSize: 104288,
      contentType: 'application/pdf',
      s3Key: 'uploads/Invoice_ORD-2026-0501.pdf',
      fileUrl: '/uploads/Invoice_ORD-2026-0501.pdf',
      uploadedBy: userRecords['docs@sogt.com'].id,
    }
  });

  await prisma.document.create({
    data: {
      entityType: 'Order',
      entityId: order1.id,
      documentType: 'Packing List',
      fileName: 'PackingList_ORD-2026-0501.pdf',
      fileSize: 85934,
      contentType: 'application/pdf',
      s3Key: 'uploads/PackingList_ORD-2026-0501.pdf',
      fileUrl: '/uploads/PackingList_ORD-2026-0501.pdf',
      uploadedBy: userRecords['docs@sogt.com'].id,
    }
  });

  // Steel Order 3 Documents
  await prisma.document.create({
    data: {
      entityType: 'Order',
      entityId: order3.id,
      documentType: 'Bill of Lading',
      fileName: 'BL_ORD-2026-0466.pdf',
      fileSize: 145920,
      contentType: 'application/pdf',
      s3Key: 'uploads/BL_ORD-2026-0466.pdf',
      fileUrl: '/uploads/BL_ORD-2026-0466.pdf',
      uploadedBy: userRecords['docs@sogt.com'].id,
    }
  });

  console.log('Seeding payments...');
  await prisma.payment.create({
    data: {
      invoiceNumber: 'INV-2026-1001',
      orderId: order1.id,
      invoiceAmount: 29000.00,
      receivedAmount: 5800.00,
      pendingAmount: 23200.00,
      dueDate: new Date('2026-06-30'),
      status: 'Partially Paid',
    }
  });

  await prisma.payment.create({
    data: {
      invoiceNumber: 'INV-2026-1002',
      orderId: order2.id,
      invoiceAmount: 21000.00,
      receivedAmount: 21000.00,
      pendingAmount: 0.00,
      dueDate: new Date('2026-06-08'),
      status: 'Paid',
    }
  });

  await prisma.payment.create({
    data: {
      invoiceNumber: 'INV-2026-1003',
      orderId: order3.id,
      invoiceAmount: 118000.00,
      receivedAmount: 0.00,
      pendingAmount: 118000.00,
      dueDate: new Date('2026-06-15'),
      status: 'Pending',
    }
  });

  console.log('Seeding notifications...');
  await prisma.notification.create({
    data: {
      userId: userRecords['admin@sogt.com'].id,
      title: 'Overdue Balance Alert',
      message: 'Order ORD-2026-0466 has a pending payment of $118,000.00 which is due soon.',
      type: 'Alert',
      readStatus: false,
    }
  });

  await prisma.notification.create({
    data: {
      userId: userRecords['docs@sogt.com'].id,
      title: 'Upload Request',
      message: 'Please upload the Bill of Lading for order ORD-2026-0489.',
      type: 'Info',
      readStatus: false,
    }
  });

  console.log('Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
