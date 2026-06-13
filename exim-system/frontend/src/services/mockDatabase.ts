// Mock Database for client-side Demo Mode fallback
// Stores and updates trade dashboard mock data in localStorage

const STORAGE_KEYS = {
  USERS: 'sogt_mock_users',
  CUSTOMERS: 'sogt_mock_customers',
  PRODUCTS: 'sogt_mock_products',
  LEADS: 'sogt_mock_leads',
  INQUIRIES: 'sogt_mock_inquiries',
  QUOTATIONS: 'sogt_mock_quotations',
  ORDERS: 'sogt_mock_orders',
  SHIPMENTS: 'sogt_mock_shipments',
  DOCUMENTS: 'sogt_mock_documents',
  PAYMENTS: 'sogt_mock_payments',
  SUPPLIERS: 'sogt_mock_suppliers',
};

const INITIAL_USERS = [
  {
    id: 'user-admin',
    email: 'admin@sogt.com',
    password: 'Admin@123',
    firstName: 'Aditya',
    lastName: 'Phophale',
    role: 'Admin',
    isActive: true,
  },
  {
    id: 'user-sales',
    email: 'sales@sogt.com',
    password: 'Sales@123',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    role: 'Sales',
    isActive: true,
  },
  {
    id: 'user-doc',
    email: 'docs@sogt.com',
    password: 'Docs@123',
    firstName: 'Meera',
    lastName: 'Sharma',
    role: 'Documentation',
    isActive: true,
  },
  {
    id: 'user-accounts',
    email: 'accounts@sogt.com',
    password: 'Accounts@123',
    firstName: 'Anil',
    lastName: 'Mehta',
    role: 'Accounts',
    isActive: true,
  },
  {
    id: 'user-customer',
    email: 'alex.mercer@apexglobal.com',
    password: 'Customer@123',
    firstName: 'Alex',
    lastName: 'Mercer',
    role: 'Customer',
    isActive: true,
  }
];

// Force clear old mock users if they contain the old password or miss new roles to ensure clean updates
if (typeof window !== 'undefined') {
  try {
    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (storedUsers && (storedUsers.includes('password123') || !storedUsers.includes('accounts@sogt.com'))) {
      localStorage.removeItem(STORAGE_KEYS.USERS);
    }
  } catch (e) {
    console.error('Failed to clean old mock users', e);
  }
}

const INITIAL_PRODUCTS = [
  { id: 'p1', productCode: 'PRD-SP-001', name: 'Organic Green Cardamom', hsCode: '09083110', unit: 'KG', currency: 'USD', price: 18.50 },
  { id: 'p2', productCode: 'PRD-SP-002', name: 'Premium Turmeric Finger', hsCode: '09103030', unit: 'KG', currency: 'USD', price: 4.20 },
  { id: 'p3', productCode: 'PRD-AG-101', name: 'Premium Basmati Rice (1121)', hsCode: '10063020', unit: 'Metric Ton', currency: 'USD', price: 980.00 },
  { id: 'p4', productCode: 'PRD-TX-201', name: 'Raw Combed Cotton Yarn (30s)', hsCode: '52052200', unit: 'KG', currency: 'USD', price: 3.80 },
  { id: 'p5', productCode: 'PRD-HC-301', name: 'Handcrafted Jute Rugs', hsCode: '57050024', unit: 'PCS', currency: 'USD', price: 24.50 },
];

const INITIAL_CUSTOMERS = [
  { id: 'c1', customerCode: 'CST-US-101', companyName: 'Apex Foodstuffs USA Inc', contactPerson: 'John Miller', email: 'john@apexfoods.com', phone: '+1-555-0199', country: 'United States', address: '452 Broadway, New York, NY 10013', status: 'active' },
  { id: 'c2', customerCode: 'CST-EU-102', companyName: 'EuroFoods Import GmbH', contactPerson: 'Helmut Schmidt', email: 'schmidt@eurofoods.de', phone: '+49-40-52310', country: 'Germany', address: 'Alter Wandrahm 8, 20457 Hamburg', status: 'active' },
  { id: 'c3', customerCode: 'CST-ME-103', companyName: 'Al-Jamil General Trading LLC', contactPerson: 'Mustafa Al-Harbi', email: 'info@aljamil.ae', phone: '+971-4-2228990', country: 'United Arab Emirates', address: 'Deira Wharfage, Port Saeed, Dubai', status: 'active' },
  { id: 'c4', customerCode: 'CST-UK-104', companyName: 'Royal Spice House London', contactPerson: 'Sarah Jenkins', email: 'sarah@royalspice.co.uk', phone: '+44-20-7946-0958', country: 'United Kingdom', address: '12 Commercial Road, London E1 6LP', status: 'active' },
];

const INITIAL_SUPPLIERS = [
  { id: 's1', supplierCode: 'SPL-SP-501', companyName: 'Kerala Spices Farmers Co-op', contactPerson: 'K. Kurian', email: 'kurian@keralaspicecoop.org', phone: '+91-484-230912', country: 'India', address: 'Spice Board Road, Cochin, Kerala', status: 'active' },
  { id: 's2', supplierCode: 'SPL-TX-502', companyName: 'Gujarat Cotton Growers Assoc.', contactPerson: 'Arvind Patel', email: 'contact@gujaratcotton.org', phone: '+91-79-2656911', country: 'India', address: 'Ashram Road, Ahmedabad, Gujarat', status: 'active' },
];

const INITIAL_LEADS = [
  { id: 'l1', firstName: 'Alexander', lastName: 'Dubois', email: 'alex@duboisimport.fr', phone: '+33-1-422789', companyName: 'Dubois Gourmet France', country: 'France', source: 'Website Inquiry', status: 'contacted', assignedToId: 'user-sales' },
  { id: 'l2', firstName: 'Kenji', lastName: 'Sato', email: 'sato@tokyofoodtrade.jp', phone: '+81-3-320091', companyName: 'Tokyo Food Trade KK', country: 'Japan', source: 'Referral', status: 'new', assignedToId: 'user-sales' },
];

const INITIAL_INQUIRIES = [
  { id: 'i1', inquiryNumber: 'INQ-2026-0001', customerId: 'c1', customer: INITIAL_CUSTOMERS[0], productId: 'p1', product: INITIAL_PRODUCTS[0], quantity: 5000, targetPrice: 17.50, status: 'Quoted', paymentTerms: 'Letter of Credit (L/C)', portOfLoading: 'Nhava Sheva Port, Mumbai', portOfDelivery: 'New York Port, USA', remarks: 'Requires Phytosanitary Certificate', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'i2', inquiryNumber: 'INQ-2026-0002', customerId: 'c2', customer: INITIAL_CUSTOMERS[1], productId: 'p3', product: INITIAL_PRODUCTS[2], quantity: 100, targetPrice: 950.00, status: 'Received', paymentTerms: '30% Advance, 70% against CAD', portOfLoading: 'Kandla Port, Gujarat', portOfDelivery: 'Hamburg Port, Germany', remarks: 'Standard packing in 25kg PP bags', createdAt: new Date().toISOString() },
];

const INITIAL_QUOTATIONS = [
  { id: 'q1', quoteNumber: 'QTN-2026-0001', inquiryId: 'i1', inquiry: INITIAL_INQUIRIES[0], customerId: 'c1', customer: INITIAL_CUSTOMERS[0], validityDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), status: 'Accepted', totalAmount: 90000.00, paymentTerms: 'Irrevocable L/C at sight', shipmentMode: 'Sea Freight', deliveryTerms: 'FOB Nhava Sheva', remarks: 'Offer valid strictly for 15 days.', createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), items: [{ productId: 'p1', product: INITIAL_PRODUCTS[0], quantity: 5000, unitPrice: 18.00, totalPrice: 90000.00 }] },
];

const INITIAL_ORDERS = [
  { id: 'o1', orderNumber: 'ORD-2026-0001', quotationId: 'q1', quotation: INITIAL_QUOTATIONS[0], customerId: 'c1', customer: INITIAL_CUSTOMERS[0], orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), expectedShipmentDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), status: 'Confirmed', totalAmount: 90000.00, paymentStatus: 'Pending', shipmentStatus: 'Scheduled', bookingReference: 'MSK-781320-IN', shippingLine: 'Maersk Line', portOfLoading: 'MUMBAI (INNSA)', portOfDelivery: 'NEW YORK (USNYC)', paymentTerms: 'L/C at sight', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
];

const INITIAL_SHIPMENTS = [
  { id: 'sh1', shipmentNumber: 'SHP-2026-0001', orderId: 'o1', order: INITIAL_ORDERS[0], containerNumber: 'MSKU8901235 (40ft HC)', sealNumber: 'Msk908123', vesselName: 'Maersk Mc-Kinney Moller', voyageNumber: '2604E', billOfLadingNumber: 'MEDUM9018237', actualDepartureDate: null, estimatedArrivalDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), currentStatus: 'Booking Confirmed', customClearanceStatus: 'Documents Filed', remarks: 'Loading scheduled for tomorrow.', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
];

const INITIAL_DOCUMENTS = [
  { id: 'd1', fileName: 'Invoice_ORD-2026-0001.pdf', documentType: 'Invoice', entityType: 'Order', entityId: 'o1', referenceNumber: 'ORD-2026-0001', fileSize: 153600, contentType: 'application/pdf', fileUrl: '/uploads/invoice_mock.pdf', uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'd2', fileName: 'PackingList_ORD-2026-0001.pdf', documentType: 'Packing List', entityType: 'Order', entityId: 'o1', referenceNumber: 'ORD-2026-0001', fileSize: 102400, contentType: 'application/pdf', fileUrl: '/uploads/pk_mock.pdf', uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
];

const INITIAL_PAYMENTS = [
  { id: 'pay1', transactionNumber: 'TXN-MB-108239', orderId: 'o1', order: INITIAL_ORDERS[0], amount: 27000.00, paymentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), paymentMethod: 'Bank Wire (TT)', paymentStatus: 'Completed', remarks: '30% advance deposit received.' }
];

// Load dataset helper
const load = <T>(key: string, initial: T): T => {
  if (typeof window === 'undefined') return initial;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return initial;
  }
};

// Save dataset helper
const save = <T>(key: string, data: T) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// Initial Database Instantiation
const db = {
  users: () => load(STORAGE_KEYS.USERS, INITIAL_USERS),
  customers: () => load(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS),
  products: () => load(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS),
  leads: () => load(STORAGE_KEYS.LEADS, INITIAL_LEADS),
  inquiries: () => load(STORAGE_KEYS.INQUIRIES, INITIAL_INQUIRIES),
  quotations: () => load(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS),
  orders: () => load(STORAGE_KEYS.ORDERS, INITIAL_ORDERS),
  shipments: () => load(STORAGE_KEYS.SHIPMENTS, INITIAL_SHIPMENTS),
  documents: () => load(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS),
  payments: () => load(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS),
  suppliers: () => load(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS),
};

export const handleMockRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const method = options.method?.toUpperCase() || 'GET';
  const body = options.body ? JSON.parse(options.body as string) : null;

  // Simulate server latency
  await new Promise(resolve => setTimeout(resolve, 300));

  // --- AUTH ENDPOINTS ---
  if (endpoint.startsWith('/auth/login')) {
    if (method === 'POST') {
      const { email, password } = body;
      const user = db.users().find(u => u.email === email && u.password === password);
      if (user) {
        return {
          message: 'Login successful',
          token: 'mock-jwt-token-123456789',
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          }
        };
      }
      throw new Error('Invalid email or password');
    }
  }

  // --- CUSTOMERS ENDPOINTS ---
  if (endpoint.startsWith('/customers')) {
    const customers = db.customers();
    if (method === 'GET') return customers;
    if (method === 'POST') {
      const newCustomer = {
        id: 'c-' + Date.now(),
        customerCode: 'CST-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
        status: 'active',
        ...body
      };
      customers.push(newCustomer);
      save(STORAGE_KEYS.CUSTOMERS, customers);
      return newCustomer;
    }
  }

  // --- PRODUCTS ENDPOINTS ---
  if (endpoint.startsWith('/products')) {
    const products = db.products();
    if (method === 'GET') return products;
    if (method === 'POST') {
      const newProduct = {
        id: 'p-' + Date.now(),
        productCode: 'PRD-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
        ...body
      };
      products.push(newProduct);
      save(STORAGE_KEYS.PRODUCTS, products);
      return newProduct;
    }
  }

  // --- LEADS ENDPOINTS ---
  if (endpoint.startsWith('/leads')) {
    const leads = db.leads();
    if (method === 'GET') return leads;
    if (method === 'POST') {
      const newLead = {
        id: 'l-' + Date.now(),
        status: 'new',
        ...body
      };
      leads.push(newLead);
      save(STORAGE_KEYS.LEADS, leads);
      return newLead;
    }
  }

  // --- INQUIRIES ENDPOINTS ---
  if (endpoint.startsWith('/inquiries')) {
    const inquiries = db.inquiries();
    if (method === 'GET') return inquiries;
    if (method === 'POST') {
      const customer = db.customers().find(c => c.id === body.customerId);
      const product = db.products().find(p => p.id === body.productId);
      const newInq = {
        id: 'i-' + Date.now(),
        inquiryNumber: 'INQ-2026-' + Math.floor(1000 + Math.random() * 9000),
        status: 'Received',
        customer,
        product,
        createdAt: new Date().toISOString(),
        ...body
      };
      inquiries.push(newInq);
      save(STORAGE_KEYS.INQUIRIES, inquiries);
      return newInq;
    }
  }

  // --- QUOTATIONS ENDPOINTS ---
  if (endpoint.startsWith('/quotations')) {
    const quotations = db.quotations();
    if (method === 'GET') return quotations;
    if (method === 'POST') {
      const customer = db.customers().find(c => c.id === body.customerId);
      const inquiry = db.inquiries().find(i => i.id === body.inquiryId);
      const itemsWithProducts = (body.items || []).map((it: any) => ({
        ...it,
        product: db.products().find(p => p.id === it.productId)
      }));
      const newQuote = {
        id: 'q-' + Date.now(),
        quoteNumber: 'QTN-2026-' + Math.floor(1000 + Math.random() * 9000),
        status: 'Draft',
        customer,
        inquiry,
        createdAt: new Date().toISOString(),
        items: itemsWithProducts,
        ...body
      };
      quotations.push(newQuote);
      save(STORAGE_KEYS.QUOTATIONS, quotations);
      return newQuote;
    }
  }

  // --- ORDERS ENDPOINTS ---
  if (endpoint.startsWith('/orders')) {
    const orders = db.orders();
    if (method === 'GET') return orders;
    if (method === 'POST') {
      const customer = db.customers().find(c => c.id === body.customerId);
      const quotation = db.quotations().find(q => q.id === body.quotationId);
      const newOrder = {
        id: 'o-' + Date.now(),
        orderNumber: 'ORD-2026-' + Math.floor(1000 + Math.random() * 9000),
        status: 'Confirmed',
        paymentStatus: 'Pending',
        shipmentStatus: 'Scheduled',
        customer,
        quotation,
        createdAt: new Date().toISOString(),
        ...body
      };
      orders.push(newOrder);
      save(STORAGE_KEYS.ORDERS, orders);
      return newOrder;
    }
  }

  // --- SHIPMENTS ENDPOINTS ---
  if (endpoint.startsWith('/shipments')) {
    const shipments = db.shipments();
    if (method === 'GET') return shipments;
    if (method === 'POST') {
      const order = db.orders().find(o => o.id === body.orderId);
      const newShipment = {
        id: 'sh-' + Date.now(),
        shipmentNumber: 'SHP-2026-' + Math.floor(1000 + Math.random() * 9000),
        currentStatus: 'In Transit',
        customClearanceStatus: 'Cleared',
        order,
        createdAt: new Date().toISOString(),
        ...body
      };
      shipments.push(newShipment);
      save(STORAGE_KEYS.SHIPMENTS, shipments);
      return newShipment;
    }
  }

  // --- DOCUMENTS ENDPOINTS ---
  if (endpoint.startsWith('/documents')) {
    const documents = db.documents();
    if (method === 'GET') return documents;
    if (method === 'POST') {
      const newDoc = {
        id: 'd-' + Date.now(),
        uploadedAt: new Date().toISOString(),
        fileUrl: '/uploads/invoice_mock.pdf',
        ...body
      };
      documents.push(newDoc);
      save(STORAGE_KEYS.DOCUMENTS, documents);
      return newDoc;
    }
    if (method === 'DELETE') {
      const id = endpoint.split('/').pop();
      const updated = documents.filter(d => d.id !== id);
      save(STORAGE_KEYS.DOCUMENTS, updated);
      return { success: true };
    }
  }

  // --- PAYMENTS ENDPOINTS ---
  if (endpoint.startsWith('/payments')) {
    const payments = db.payments();
    if (method === 'GET') return payments;
    if (method === 'POST') {
      const order = db.orders().find(o => o.id === body.orderId);
      const newPayment = {
        id: 'pay-' + Date.now(),
        transactionNumber: 'TXN-MB-' + Math.floor(100000 + Math.random() * 900000),
        paymentDate: new Date().toISOString(),
        paymentStatus: 'Completed',
        order,
        ...body
      };
      payments.push(newPayment);
      save(STORAGE_KEYS.PAYMENTS, payments);

      // Update order payment status
      const ordersList = db.orders();
      const orderIdx = ordersList.findIndex(o => o.id === body.orderId);
      if (orderIdx !== -1) {
        ordersList[orderIdx].paymentStatus = 'Completed';
        save(STORAGE_KEYS.ORDERS, ordersList);
      }

      return newPayment;
    }
  }

  // --- SUPPLIERS ENDPOINTS ---
  if (endpoint.startsWith('/suppliers')) {
    const suppliers = db.suppliers();
    if (method === 'GET') return suppliers;
    if (method === 'POST') {
      const newSupplier = {
        id: 's-' + Date.now(),
        supplierCode: 'SPL-SP-' + Math.floor(100 + Math.random() * 900),
        status: 'active',
        ...body
      };
      suppliers.push(newSupplier);
      save(STORAGE_KEYS.SUPPLIERS, suppliers);
      return newSupplier;
    }
  }

  // --- DASHBOARD REPORTS STATS ENDPOINT ---
  if (endpoint.includes('/reports/dashboard') || endpoint.includes('/dashboard/stats') || endpoint.startsWith('/reports')) {
    const orders = db.orders();
    const payments = db.payments();
    const shipments = db.shipments();
    const customers = db.customers();

    const totalRevenue = payments.reduce((acc, pay) => acc + (pay.amount || 0), 0);
    const activeOrders = orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length;
    const pendingLC = orders.filter(o => o.paymentStatus === 'Pending' || o.paymentTerms.includes('L/C')).length;

    // Compile dynamic charts
    const monthlyRevenue = [
      { month: 'Jan', revenue: totalRevenue * 0.2 },
      { month: 'Feb', revenue: totalRevenue * 0.15 },
      { month: 'Mar', revenue: totalRevenue * 0.25 },
      { month: 'Apr', revenue: totalRevenue * 0.1 },
      { month: 'May', revenue: totalRevenue * 0.3 },
      { month: 'Jun', revenue: totalRevenue }
    ];

    const shipmentsByStatus = [
      { name: 'In Transit', value: shipments.filter(s => s.currentStatus.includes('Transit')).length || 2 },
      { name: 'Customs', value: shipments.filter(s => s.customClearanceStatus.includes('Filed')).length || 1 },
      { name: 'Delivered', value: shipments.filter(s => s.currentStatus.includes('Delivered')).length || 5 },
      { name: 'Pending', value: shipments.filter(s => s.currentStatus.includes('Booking')).length || 1 }
    ];

    const topProducts = [
      { name: 'Green Cardamom', value: 45000 },
      { name: 'Basmati Rice', value: 32000 },
      { name: 'Turmeric Fingers', value: 13000 }
    ];

    return {
      stats: {
        totalRevenue,
        activeOrders,
        pendingLC,
        activeShipments: shipments.length,
        totalCustomers: customers.length,
      },
      charts: {
        monthlyRevenue,
        shipmentsByStatus,
        topProducts
      }
    };
  }

  throw new Error(`Mock endpoint ${method} ${endpoint} not handled`);
};
