import { Router } from 'express';
import { z } from 'zod';
import { parseQuery, validateBody } from '../../middleware/validate.js';
import { HttpError } from '../../utils/HttpError.js';
import { emailService } from '../email/email.service.js';
import { ordersRepository } from '../orders/orders.repository.js';
import { ORDER_STATUS } from '../orders/orders.service.js';

/** Couriers that deliver across Pakistan (the tracking link is pasted by the admin). */
export const COURIERS = Object.freeze(['TCS', 'Leopards', 'M&P', 'PostEx', 'Trax', 'Call Courier', 'BlueEx', 'Pakistan Post', 'Other']);
const STATUSES = Object.values(ORDER_STATUS);

const listQuery = z.object({
  status: z.enum(STATUSES).optional(),
  q: z.string().trim().max(80).optional().default(''),
  from: z.string().trim().max(10).optional(),
  to: z.string().trim().max(10).optional(),
  payment: z.enum(['paid', 'unpaid']).optional(),
  deleted: z.enum(['true', 'false']).optional().default('false'),
  page: z.coerce.number().int().min(1).max(10_000).optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(25),
});

const statusSchema = z.object({
  status: z.enum(STATUSES),
  courier: z.enum(COURIERS).optional(),
  trackingNumber: z.string().trim().max(60).optional().default(''),
  trackingUrl: z.union([z.literal(''), z.url().max(300)]).optional().default(''),
  note: z.string().trim().max(500).optional().default(''),
  notifyCustomer: z.boolean().optional().default(true),
});
const paymentSchema = z.object({ paymentStatus: z.enum(['paid', 'unpaid']) });
const noteSchema = z.object({ text: z.string().trim().min(1, 'Write a note.').max(2000) });

const pieces = (order) => order.items.reduce((sum, item) => sum + item.quantity, 0);
const firstImage = (order) => {
  const item = order.items.find((line) => line.art || line.photoUrl || line.image);
  return item ? item.art ?? item.photoUrl ?? item.image : null;
};

const matches = (order, f) => {
  // The day in Pakistan (UTC+5), as the admin's date filters mean it.
  const day = new Date(Date.parse(order.createdAt) + 5 * 3600 * 1000).toISOString().slice(0, 10);
  const text = f.q.toLowerCase();
  return (
    (f.deleted === 'true' ? Boolean(order.deletedAt) : !order.deletedAt) &&
    (!f.status || order.status === f.status) &&
    (!f.payment || (order.paymentStatus ?? 'unpaid') === f.payment) &&
    (!f.from || day >= f.from) &&
    (!f.to || day <= f.to) &&
    (!text ||
      `${order.id} ${order.customer?.name} ${order.customer?.phone} ${order.customer?.email ?? ''} ${order.customer?.city} ${order.customer?.address}`
        .toLowerCase()
        .includes(text))
  );
};

const toRow = (order) => ({
  id: order.id,
  createdAt: order.createdAt,
  status: order.status,
  customer: { name: order.customer?.name, phone: order.customer?.phone, city: order.customer?.city },
  pieces: pieces(order),
  image: firstImage(order),
  total: order.total,
  currency: order.currency,
  paymentMethod: order.paymentMethod ?? 'cod',
  paymentStatus: order.paymentStatus ?? 'unpaid',
  deletedAt: order.deletedAt ?? null,
});

async function filtered(query) {
  const f = parseQuery(listQuery, query);
  const all = await ordersRepository.findAll();
  const items = all.filter((order) => matches(order, f)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { f, items };
}

async function load(id) {
  const order = await ordersRepository.findById(String(id).toUpperCase());
  if (!order) throw HttpError.notFound('We could not find that order.');
  return order;
}

export const ordersAdmin = Router();

ordersAdmin.get('/', async (req, res) => {
  const { f, items } = await filtered(req.query);
  const start = (f.page - 1) * f.limit;
  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  for (const order of await ordersRepository.findAll()) if (!order.deletedAt) counts[order.status] = (counts[order.status] ?? 0) + 1;
  res.json({ data: { items: items.slice(start, start + f.limit).map(toRow), total: items.length, page: f.page, pages: Math.max(1, Math.ceil(items.length / f.limit)), counts, couriers: COURIERS } });
});

ordersAdmin.get('/export.csv', async (req, res) => {
  const { items } = await filtered(req.query);
  const cell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const rows = [
    ['Order', 'Date', 'Status', 'Customer', 'Phone', 'Email', 'City', 'Address', 'Pieces', 'Items', 'Subtotal', 'Delivery', 'Total', 'Payment', 'Paid'],
    ...items.map((o) => [
      o.id,
      o.createdAt,
      o.status,
      o.customer?.name,
      o.customer?.phone,
      o.customer?.email,
      o.customer?.city,
      o.customer?.address,
      pieces(o),
      o.items.map((i) => `${i.quantity}x ${i.name} ${i.label}${i.mat === 'white' ? ' (white mat)' : ''}`).join('; '),
      o.subtotal,
      o.deliveryFee,
      o.total,
      o.paymentMethod ?? 'cod',
      o.paymentStatus ?? 'unpaid',
    ]),
  ];
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', `attachment; filename="zauq-orders-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(`﻿${rows.map((row) => row.map(cell).join(',')).join('\r\n')}`);
});

ordersAdmin.get('/:id', async (req, res) => {
  res.json({ data: { order: await load(req.params.id), couriers: COURIERS } });
});

/** Status (with courier and tracking when shipped), recorded in the history; emails the customer unless told not to. */
ordersAdmin.patch('/:id/status', validateBody(statusSchema), async (req, res) => {
  const order = await load(req.params.id);
  const { status, courier, trackingNumber, trackingUrl, note, notifyCustomer } = req.body;
  const now = new Date().toISOString();
  const shipping = { ...(order.shipping ?? {}) };
  if (courier) Object.assign(shipping, { courier, trackingNumber, trackingUrl });
  if (status === ORDER_STATUS.SHIPPED && !shipping.shippedAt) shipping.shippedAt = now;
  if (status === ORDER_STATUS.DELIVERED && !shipping.deliveredAt) shipping.deliveredAt = now;
  const entry = { status, at: now, by: req.admin.email, note, notified: notifyCustomer };
  const updated = await ordersRepository.update(order.id, { status, shipping, history: [...(order.history ?? []), entry] });
  if (notifyCustomer) void emailService.sendOrderUpdate(updated);
  res.locals.activity = { area: 'orders', action: `status → ${status}${notifyCustomer ? ' (customer emailed)' : ''}`, item: order.id };
  res.json({ data: { order: updated } });
});

ordersAdmin.patch('/:id/payment', validateBody(paymentSchema), async (req, res) => {
  const order = await load(req.params.id);
  const updated = await ordersRepository.update(order.id, { paymentStatus: req.body.paymentStatus, paidAt: req.body.paymentStatus === 'paid' ? new Date().toISOString() : null });
  res.locals.activity = { area: 'orders', action: `payment → ${req.body.paymentStatus}`, item: order.id };
  res.json({ data: { order: updated } });
});

/** Internal notes: only ever seen in the admin. */
ordersAdmin.post('/:id/notes', validateBody(noteSchema), async (req, res) => {
  const order = await load(req.params.id);
  const notes = [...(order.adminNotes ?? []), { text: req.body.text, at: new Date().toISOString(), by: req.admin.email }];
  const updated = await ordersRepository.update(order.id, { adminNotes: notes });
  res.locals.activity = { area: 'orders', action: 'added a note', item: order.id };
  res.status(201).json({ data: { order: updated } });
});

/** Moves an order to the recycle bin (it can be restored). */
ordersAdmin.delete('/:id', async (req, res) => {
  const order = await load(req.params.id);
  await ordersRepository.update(order.id, { deletedAt: new Date().toISOString(), deletedBy: req.admin.email });
  res.locals.activity = { area: 'orders', action: 'moved to recycle bin', item: order.id };
  res.json({ data: { deleted: true } });
});

ordersAdmin.post('/:id/restore', async (req, res) => {
  const order = await load(req.params.id);
  const updated = await ordersRepository.update(order.id, { deletedAt: null, deletedBy: null });
  res.locals.activity = { area: 'orders', action: 'restored from recycle bin', item: order.id };
  res.json({ data: { order: updated } });
});

/** Deletes for good, only from the recycle bin. */
ordersAdmin.delete('/:id/permanent', async (req, res) => {
  const order = await load(req.params.id);
  if (!order.deletedAt) throw HttpError.badRequest('Move the order to the recycle bin first.');
  await ordersRepository.delete(order.id);
  res.locals.activity = { area: 'orders', action: 'deleted permanently', item: order.id };
  res.json({ data: { deleted: true } });
});
