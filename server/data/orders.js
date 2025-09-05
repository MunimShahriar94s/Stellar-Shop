export const orders = [
  {
    id: 'ORD-2023-1008',
    customer: {
      name: 'Amanda Wilson',
      email: 'amanda.w@example.com',
      address: '432 Birch St, Portland, OR 97201'
    },
    items: [
      { id: 7, name: 'Decorative Wall Clock', price: 59.99, quantity: 1 }
    ],
    total: 59.99,
    status: 'return_requested',
    date: '2023-11-12T09:45:00',
    paymentMethod: 'Credit Card',
    returnReason: 'Item arrived damaged'
  },
  {
    id: 'ORD-2023-1009',
    customer: {
      name: 'Thomas Garcia',
      email: 'thomas.g@example.com',
      address: '901 Spruce Ave, Miami, FL 33101'
    },
    items: [
      { id: 15, name: 'Portable Bluetooth Speaker', price: 89.99, quantity: 1 }
    ],
    total: 89.99,
    status: 'returned',
    date: '2023-11-10T14:20:00',
    paymentMethod: 'PayPal',
    returnReason: 'Changed mind about the product',
    refundDate: '2023-11-15T11:30:00'
  },
  {
    id: 'ORD-2023-1001',
    customer: {
      name: 'John Smith',
      email: 'john.smith@example.com',
      address: '123 Main St, New York, NY 10001'
    },
    items: [
      { id: 1, name: 'Modern Desk Lamp', price: 49.99, quantity: 1 },
      { id: 5, name: 'Minimalist Coffee Table', price: 249.99, quantity: 1 }
    ],
    total: 299.98,
    status: 'pending',
    date: '2023-11-15T10:30:00',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'ORD-2023-1002',
    customer: {
      name: 'Emily Johnson',
      email: 'emily.j@example.com',
      address: '456 Park Ave, Boston, MA 02108'
    },
    items: [
      { id: 3, name: 'Ergonomic Office Chair', price: 199.99, quantity: 1 }
    ],
    total: 199.99,
    status: 'processing',
    date: '2023-11-16T14:45:00',
    paymentMethod: 'PayPal'
  },
  {
    id: 'ORD-2023-1003',
    customer: {
      name: 'Michael Brown',
      email: 'michael.b@example.com',
      address: '789 Oak St, Chicago, IL 60601'
    },
    items: [
      { id: 8, name: 'Wireless Charging Pad', price: 29.99, quantity: 2 },
      { id: 12, name: 'Smart Home Hub', price: 129.99, quantity: 1 }
    ],
    total: 189.97,
    status: 'shipped',
    date: '2023-11-14T09:15:00',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'ORD-2023-1004',
    customer: {
      name: 'Sarah Wilson',
      email: 'sarah.w@example.com',
      address: '321 Pine St, Seattle, WA 98101'
    },
    items: [
      { id: 6, name: 'Ceramic Plant Pot Set', price: 34.99, quantity: 3 }
    ],
    total: 104.97,
    status: 'pending',
    date: '2023-11-17T11:20:00',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'ORD-2023-1005',
    customer: {
      name: 'David Lee',
      email: 'david.l@example.com',
      address: '555 Maple Ave, San Francisco, CA 94102'
    },
    items: [
      { id: 9, name: 'Bluetooth Speaker', price: 79.99, quantity: 1 },
      { id: 11, name: 'Stainless Steel Water Bottle', price: 24.99, quantity: 2 }
    ],
    total: 129.97,
    status: 'delivered',
    date: '2023-11-13T16:30:00',
    paymentMethod: 'PayPal'
  },
  {
    id: 'ORD-2023-1006',
    customer: {
      name: 'Jennifer Martinez',
      email: 'jennifer.m@example.com',
      address: '888 Cedar St, Austin, TX 78701'
    },
    items: [
      { id: 2, name: 'Leather Sofa', price: 999.99, quantity: 1 }
    ],
    total: 999.99,
    status: 'pending',
    date: '2023-11-18T13:10:00',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'ORD-2023-1007',
    customer: {
      name: 'Robert Taylor',
      email: 'robert.t@example.com',
      address: '777 Elm St, Denver, CO 80202'
    },
    items: [
      { id: 4, name: 'Smart LED TV', price: 549.99, quantity: 1 },
      { id: 10, name: 'Wireless Earbuds', price: 89.99, quantity: 1 }
    ],
    total: 639.98,
    status: 'processing',
    date: '2023-11-16T10:05:00',
    paymentMethod: 'Credit Card'
  }
];