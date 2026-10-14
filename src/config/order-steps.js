// Order steps shown to staff and clients, in order.
// If you change a `key`, change it in supabase/schema.sql too (the "status" check).
export const steps = [
  { key: 'received', label: 'Order received', client: 'We have your order and the details are being checked.' },
  { key: 'design', label: 'Design in progress', client: 'Our designers are preparing the artwork.' },
  { key: 'approval', label: 'Waiting for your approval', client: 'Please check the proof we sent and confirm.' },
  { key: 'production', label: 'Printing / production', client: 'Your job is being printed at our unit.' },
  { key: 'fabrication', label: 'Fabrication', client: 'Frames, boards or structures are being built.' },
  { key: 'qc', label: 'Quality check & packing', client: 'Every piece is being checked and packed.' },
  { key: 'dispatched', label: 'Out for delivery / installation', client: 'Your order is on the way or being installed.' },
  { key: 'completed', label: 'Completed', client: 'Delivered. Thank you for working with us.' },
];
// Extra states that sit outside the normal flow.
export const extra = [
  { key: 'hold', label: 'On hold', client: 'Your order is on hold. We will contact you.' },
  { key: 'cancelled', label: 'Cancelled', client: 'This order has been cancelled.' },
];
export const allSteps = [...steps, ...extra];
export const stepLabel = (k) => allSteps.find((s) => s.key === k)?.label ?? k;
