import { Router } from 'express';
import { z } from 'zod';
import { parseQuery } from '../../middleware/validate.js';
import { usersRepository } from '../auth/users.repository.js';
import { messagesRepository } from '../contact/contact.repository.js';
import { subscribersRepository } from '../newsletter/newsletter.repository.js';
import { ordersRepository } from '../orders/orders.repository.js';
import { reviewsRepository } from '../reviews/reviews.repository.js';

const RANGES = { today: 1, '7d': 7, '30d': 30, '90d': 90, all: null };
const query = z.object({ range: z.enum(Object.keys(RANGES)).optional().default('30d') });

/** The start of day `daysAgo` days back, in Pakistan time (UTC+5). */
function startOfDay(daysAgo) {
  const pk = new Date(Date.now() + 5 * 3600_000);
  pk.setUTCHours(0, 0, 0, 0);
  return new Date(pk.getTime() - daysAgo * 86_400_000 - 5 * 3600_000);
}
const pkDay = (iso) => new Date(Date.parse(iso) + 5 * 3600_000).toISOString().slice(0, 10);

export const dashboardAdmin = Router();

dashboardAdmin.get('/', async (req, res) => {
  const { range } = parseQuery(query, req.query);
  const days = RANGES[range];
  const since = days ? startOfDay(days - 1).toISOString() : '';
  const [allOrders, users, messages, reviews, subscribers] = await Promise.all([
    ordersRepository.findAll(),
    usersRepository.findAll(),
    messagesRepository.findAll(),
    reviewsRepository.findAll(),
    subscribersRepository.findAll(),
  ]);
  // Oldest first (as stored).
  const orders = allOrders.filter((order) => !order.deletedAt);
  const inRange = orders.filter((order) => order.createdAt >= since);
  const counted = inRange.filter((order) => order.status !== 'cancelled');
  const revenue = counted.reduce((sum, order) => sum + order.total, 0);

  // Orders and revenue per day (Pakistan time), for the chart.
  const seriesDays = days ?? Math.min(365, Math.max(1, Math.ceil((Date.now() - Date.parse(orders[0]?.createdAt ?? new Date().toISOString())) / 86_400_000) + 1));
  const series = Array.from({ length: seriesDays }, (_, i) => ({ day: pkDay(startOfDay(seriesDays - 1 - i).toISOString()), orders: 0, revenue: 0 }));
  const byDay = new Map(series.map((point) => [point.day, point]));
  for (const order of counted) {
    const point = byDay.get(pkDay(order.createdAt));
    if (point) {
      point.orders += 1;
      point.revenue += order.total;
    }
  }

  // Best-selling pieces (by frames sold) in the range.
  const sold = new Map();
  for (const order of counted) {
    for (const item of order.items) {
      const key = item.type === 'custom-frame' ? 'custom-frame' : item.productId;
      const entry = sold.get(key) ?? { key, name: item.type === 'custom-frame' ? 'Custom photo frames' : item.name, image: item.art ?? item.image ?? null, quantity: 0, revenue: 0 };
      entry.quantity += item.quantity;
      entry.revenue += item.lineTotal;
      sold.set(key, entry);
    }
  }

  const statusCounts = {};
  for (const order of orders) statusCounts[order.status] = (statusCounts[order.status] ?? 0) + 1;
  const customers = users.filter((user) => user.role !== 'admin');

  res.json({
    data: {
      range,
      totals: {
        orders: counted.length,
        revenue,
        averageOrder: counted.length ? Math.round(revenue / counted.length) : 0,
        pieces: counted.reduce((sum, order) => sum + order.items.reduce((n, item) => n + item.quantity, 0), 0),
        newCustomers: customers.filter((user) => user.createdAt >= since).length,
        cancelled: inRange.length - counted.length,
      },
      toDo: {
        pending: statusCounts.pending ?? 0,
        confirmed: statusCounts.confirmed ?? 0,
        inProduction: statusCounts.in_production ?? 0,
        shipped: statusCounts.shipped ?? 0,
        unpaidDelivered: orders.filter((order) => order.status === 'delivered' && (order.paymentStatus ?? 'unpaid') !== 'paid').length,
        newMessages: messages.filter((message) => (message.status ?? 'new') === 'new').length,
        pendingReviews: reviews.filter((review) => review.status === 'pending').length,
      },
      series,
      topProducts: [...sold.values()].sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue).slice(0, 6),
      recentOrders: [...orders]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 8)
        .map((order) => ({ id: order.id, createdAt: order.createdAt, status: order.status, name: order.customer?.name, city: order.customer?.city, total: order.total })),
      audience: { customers: customers.length, subscribers: subscribers.filter((s) => (s.status ?? 'subscribed') === 'subscribed').length },
    },
  });
});

/** The newest orders, for the alert bell (polled by the admin). */
dashboardAdmin.get('/latest-orders', async (_req, res) => {
  const orders = (await ordersRepository.findAll()).filter((order) => !order.deletedAt).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ data: { items: orders.slice(0, 12).map((o) => ({ id: o.id, createdAt: o.createdAt, name: o.customer?.name, city: o.customer?.city, total: o.total, status: o.status })) } });
});

/** Small counts for the sidebar badges (polled with the bell). */
dashboardAdmin.get('/counts', async (_req, res) => {
  const [orders, messages, reviews] = await Promise.all([ordersRepository.findAll(), messagesRepository.findAll(), reviewsRepository.findAll()]);
  res.json({
    data: {
      orders: orders.filter((order) => !order.deletedAt && order.status === 'pending').length,
      messages: messages.filter((message) => (message.status ?? 'new') === 'new').length,
      reviews: reviews.filter((review) => review.status === 'pending').length,
    },
  });
});
