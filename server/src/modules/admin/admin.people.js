import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../../middleware/validate.js';
import { HttpError } from '../../utils/HttpError.js';
import { toPublicUser } from '../auth/auth.service.js';
import { hashPassword } from '../auth/passwords.js';
import { deleteUserSessions } from '../auth/sessions.js';
import { usersRepository } from '../auth/users.repository.js';
import { messagesRepository } from '../contact/contact.repository.js';
import { subscribersRepository } from '../newsletter/newsletter.repository.js';
import { ordersRepository } from '../orders/orders.repository.js';
import { productsRepository } from '../products/products.repository.js';
import { reviewsRepository } from '../reviews/reviews.repository.js';
import { adminPasswordProblem, newAdminSchema } from './admin.auth.js';

const digits = (phone) => String(phone ?? '').replace(/\D/g, '').slice(-10);
const csv = (rows) => `﻿${rows.map((row) => row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n')}`;
const sendCsv = (res, name, rows) => {
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', `attachment; filename="${name}-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(csv(rows));
};

export const peopleAdmin = Router();

// ---------- Customers: accounts, and buyers (everyone who has ordered, by phone) ----------

peopleAdmin.get('/customers', async (req, res) => {
  const q = String(req.query.q ?? '').toLowerCase().trim();
  const [users, orders] = await Promise.all([usersRepository.findAll(), ordersRepository.findAll()]);
  const live = orders.filter((o) => !o.deletedAt && o.status !== 'cancelled');

  const accounts = users
    .filter((u) => u.role !== 'admin')
    .map((u) => {
      const own = live.filter((o) => o.customerId === u.id);
      return { ...toPublicUser(u), orders: own.length, spent: own.reduce((s, o) => s + o.total, 0), lastOrderAt: own.map((o) => o.createdAt).sort().at(-1) ?? null };
    });

  const byPhone = new Map();
  for (const order of live) {
    const key = digits(order.customer?.phone);
    if (!key) continue;
    const buyer = byPhone.get(key) ?? { phone: order.customer.phone, name: order.customer.name, email: order.customer.email ?? '', city: order.customer.city, orders: 0, spent: 0, firstOrderAt: order.createdAt, lastOrderAt: order.createdAt, hasAccount: false };
    buyer.orders += 1;
    buyer.spent += order.total;
    if (order.createdAt > buyer.lastOrderAt) Object.assign(buyer, { lastOrderAt: order.createdAt, name: order.customer.name, city: order.customer.city, email: order.customer.email || buyer.email });
    if (order.customerId) buyer.hasAccount = true;
    byPhone.set(key, buyer);
  }
  const find = (row) => !q || `${row.name} ${row.email} ${row.phone ?? ''} ${row.city ?? ''}`.toLowerCase().includes(q);
  res.json({
    data: {
      accounts: accounts.filter(find).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      buyers: [...byPhone.values()].filter(find).sort((a, b) => b.lastOrderAt.localeCompare(a.lastOrderAt)),
    },
  });
});

peopleAdmin.get('/customers/buyers.csv', async (_req, res) => {
  const orders = (await ordersRepository.findAll()).filter((o) => !o.deletedAt && o.status !== 'cancelled');
  const byPhone = new Map();
  for (const o of orders) {
    const key = digits(o.customer?.phone);
    if (!key) continue;
    const b = byPhone.get(key) ?? { name: o.customer.name, phone: o.customer.phone, email: o.customer.email ?? '', city: o.customer.city, orders: 0, spent: 0, last: o.createdAt };
    b.orders += 1;
    b.spent += o.total;
    if (o.createdAt > b.last) b.last = o.createdAt;
    byPhone.set(key, b);
  }
  sendCsv(res, 'zauq-buyers', [['Name', 'Phone', 'Email', 'City', 'Orders', 'Spent (PKR)', 'Last order'], ...[...byPhone.values()].map((b) => [b.name, b.phone, b.email, b.city, b.orders, b.spent, b.last])]);
});

peopleAdmin.get('/customers/:id', async (req, res) => {
  const user = await usersRepository.findById(req.params.id);
  if (!user || user.role === 'admin') throw HttpError.notFound('We could not find that customer.');
  const orders = (await ordersRepository.findAllBy('customerId', user.id)).filter((o) => !o.deletedAt).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ data: { customer: toPublicUser(user), orders: orders.map((o) => ({ id: o.id, createdAt: o.createdAt, status: o.status, total: o.total })) } });
});

// ---------- Admins ----------

peopleAdmin.get('/admins', async (_req, res) => {
  const admins = (await usersRepository.findAll()).filter((u) => u.role === 'admin').map(toPublicUser);
  res.json({ data: { items: admins } });
});

/** Creates an admin, or makes an existing customer account an admin (with this new password). */
peopleAdmin.post('/admins', validateBody(newAdminSchema), async (req, res) => {
  const { name, email, password } = req.body;
  const problem = adminPasswordProblem(password, email);
  if (problem) throw HttpError.badRequest('Please check the highlighted fields.', [{ field: 'password', message: problem }]);
  const existing = await usersRepository.findOneBy('email', email);
  if (existing?.role === 'admin') throw HttpError.conflict('That person is already an admin.');
  const passwordHash = await hashPassword(password);
  const admin = existing
    ? await usersRepository.update(existing.id, { role: 'admin', name, passwordHash, adminSince: new Date().toISOString() })
    : await usersRepository.create({ name, email, phone: '', address: '', city: '', role: 'admin', passwordHash, adminSince: new Date().toISOString() });
  if (existing) await deleteUserSessions(existing.id);
  res.locals.activity = { area: 'admins', action: existing ? 'made a customer an admin' : 'added an admin', item: email };
  res.status(201).json({ data: { admin: toPublicUser(admin) } });
});

/** Removes admin access (the account stays, as a customer) and signs it out everywhere. */
peopleAdmin.delete('/admins/:id', async (req, res) => {
  if (req.params.id === req.admin.id) throw HttpError.badRequest('You can’t remove your own admin access.');
  const user = await usersRepository.findById(req.params.id);
  if (!user || user.role !== 'admin') throw HttpError.notFound('We could not find that admin.');
  const admins = (await usersRepository.findAll()).filter((u) => u.role === 'admin');
  if (admins.length <= 1) throw HttpError.badRequest('Keep at least one admin.');
  await usersRepository.update(user.id, { role: null });
  await deleteUserSessions(user.id);
  res.locals.activity = { area: 'admins', action: 'removed admin access', item: user.email };
  res.json({ data: { removed: true } });
});

// ---------- Newsletter subscribers ----------

peopleAdmin.get('/subscribers', async (req, res) => {
  const status = String(req.query.status ?? 'subscribed');
  const q = String(req.query.q ?? '').toLowerCase().trim();
  const all = (await subscribersRepository.findAll()).map((s) => ({ ...s, status: s.status ?? 'subscribed' }));
  const counts = { subscribed: all.filter((s) => s.status === 'subscribed').length, unsubscribed: all.filter((s) => s.status === 'unsubscribed').length, all: all.length };
  const items = all.filter((s) => (status === 'all' || s.status === status) && (!q || s.email.includes(q))).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ data: { items, counts } });
});

peopleAdmin.get('/subscribers/export.csv', async (_req, res) => {
  const all = (await subscribersRepository.findAll()).filter((s) => (s.status ?? 'subscribed') === 'subscribed');
  sendCsv(res, 'zauq-subscribers', [['Email', 'Since', 'Source'], ...all.map((s) => [s.email, s.createdAt, s.source ?? ''])]);
});

peopleAdmin.patch('/subscribers/:id', validateBody(z.object({ status: z.enum(['subscribed', 'unsubscribed']) })), async (req, res) => {
  const updated = await subscribersRepository.update(req.params.id, { status: req.body.status });
  if (!updated) throw HttpError.notFound('No such subscriber.');
  res.locals.activity = { area: 'subscribers', action: `marked ${req.body.status}`, item: updated.email };
  res.json({ data: { subscriber: updated } });
});

peopleAdmin.delete('/subscribers/:id', async (req, res) => {
  const record = await subscribersRepository.findById(req.params.id);
  if (!record) throw HttpError.notFound('No such subscriber.');
  await subscribersRepository.delete(record.id);
  res.locals.activity = { area: 'subscribers', action: 'deleted subscriber', item: record.email };
  res.json({ data: { deleted: true } });
});

// ---------- Contact messages ----------

const MESSAGE_STATUSES = ['new', 'read', 'replied', 'archived'];

peopleAdmin.get('/messages', async (req, res) => {
  const status = String(req.query.status ?? 'inbox');
  const all = (await messagesRepository.findAll()).map((m) => ({ ...m, status: m.status ?? 'new' })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const counts = Object.fromEntries(MESSAGE_STATUSES.map((s) => [s, all.filter((m) => m.status === s).length]));
  const items = all.filter((m) => (status === 'inbox' ? m.status !== 'archived' : status === 'all' || m.status === status));
  res.json({ data: { items, counts } });
});

peopleAdmin.patch('/messages/:id', validateBody(z.object({ status: z.enum(MESSAGE_STATUSES) })), async (req, res) => {
  const updated = await messagesRepository.update(req.params.id, { status: req.body.status });
  if (!updated) throw HttpError.notFound('No such message.');
  res.locals.activity = { area: 'messages', action: `marked ${req.body.status}`, item: updated.name };
  res.json({ data: { message: updated } });
});

peopleAdmin.delete('/messages/:id', async (req, res) => {
  const record = await messagesRepository.findById(req.params.id);
  if (!record) throw HttpError.notFound('No such message.');
  await messagesRepository.delete(record.id);
  res.locals.activity = { area: 'messages', action: 'deleted message', item: record.name };
  res.json({ data: { deleted: true } });
});

// ---------- Reviews (moderation) ----------

const REVIEW_STATUSES = ['pending', 'approved', 'rejected'];
const reviewEdit = z.object({
  status: z.enum(REVIEW_STATUSES).optional(),
  name: z.string().trim().min(2).max(40).optional(),
  city: z.string().trim().max(40).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  text: z.string().trim().min(10).max(1000).optional(),
  adminNote: z.string().trim().max(500).optional(),
});

peopleAdmin.get('/reviews', async (req, res) => {
  const status = String(req.query.status ?? 'pending');
  const q = String(req.query.q ?? '').toLowerCase().trim();
  const [all, products] = await Promise.all([reviewsRepository.findAll(), productsRepository.findAll()]);
  const names = new Map(products.map((p) => [p.slug, p.name]));
  const rows = all.map((r) => ({ ...r, status: r.status ?? 'approved', productName: names.get(r.productId) ?? r.productId })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const counts = Object.fromEntries(REVIEW_STATUSES.map((s) => [s, rows.filter((r) => r.status === s).length]));
  const items = rows.filter((r) => (status === 'all' || r.status === status) && (!q || `${r.productName} ${r.name} ${r.city ?? ''} ${r.text}`.toLowerCase().includes(q)));
  res.json({ data: { items, counts } });
});

peopleAdmin.patch('/reviews/:id', validateBody(reviewEdit), async (req, res) => {
  const updated = await reviewsRepository.update(req.params.id, req.body);
  if (!updated) throw HttpError.notFound('No such review.');
  res.locals.activity = { area: 'reviews', action: req.body.status ? `review ${req.body.status}` : 'edited review', item: `${updated.name} on ${updated.productId}` };
  res.json({ data: { review: updated } });
});

peopleAdmin.delete('/reviews/:id', async (req, res) => {
  const record = await reviewsRepository.findById(req.params.id);
  if (!record) throw HttpError.notFound('No such review.');
  await reviewsRepository.delete(record.id);
  res.locals.activity = { area: 'reviews', action: 'deleted review', item: `${record.name} on ${record.productId}` };
  res.json({ data: { deleted: true } });
});
