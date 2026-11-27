import { createHmac } from 'node:crypto';
import { env } from '../../config/env.js';
import { createRepository } from '../../lib/createRepository.js';

/**
 * The admin activity log: every change made in the admin (and every admin
 * sign-in), who made it, from where, and whether it worked. Entries are only
 * ever added. Each is signed together with the one before it (a hash chain), so
 * editing or deleting an entry later breaks the chain and `verify()` shows where.
 */
const activityRepository = createRepository('admin_activity');
const KEY = env.adminLogKey || 'zauq-admin-activity';
if (!env.adminLogKey && env.isProduction) console.warn('ADMIN_LOG_KEY is not set: the admin activity log is signed with a default key.');

const sign = (prev, entry) =>
  createHmac('sha256', KEY)
    .update(`${prev}|${JSON.stringify(entry)}`)
    .digest('hex');

let lastHash = null;
let queue = Promise.resolve();

async function latestHash() {
  if (lastHash === null) {
    const all = await activityRepository.findAll();
    lastHash = all.length ? all[all.length - 1].hash : 'start';
  }
  return lastHash;
}

/** The part of an entry that is signed (everything but its own hash). */
const signedPart = ({ at, adminId, adminEmail, area, action, item, result, ip, prev }) => ({ at, adminId, adminEmail, area, action, item, result, ip, prev });

/**
 * Adds one entry. Writes are queued one at a time so the chain stays in order.
 * @param {import('express').Request} req
 * @param {{ area: string, action: string, item?: string, result?: number, admin?: { id: string|null, email: string } }} what
 */
export function logActivity(req, { area, action, item = '', result = 200, admin = req.admin }) {
  queue = queue
    .then(async () => {
      const prev = await latestHash();
      const entry = {
        at: new Date().toISOString(),
        adminId: admin?.id ?? null,
        adminEmail: admin?.email ?? '',
        area,
        action,
        item: String(item ?? '').slice(0, 200),
        result,
        ip: req.ip ?? '',
        prev,
      };
      const hash = sign(prev, entry);
      await activityRepository.create({ ...entry, hash });
      lastHash = hash;
    })
    .catch((error) => console.error('Could not write the admin activity log:', error.message));
  return queue;
}

const ACTIONS = { POST: 'created', PUT: 'updated', PATCH: 'updated', DELETE: 'deleted' };

/** Records every admin change (non-GET request) once it has been answered. Controllers may set `res.locals.activity`. */
export function recordAdminChanges(req, res, next) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.path.startsWith('/auth/')) return next();
  // Read the path now: by the time the response has finished, Express has put the full URL back.
  const relative = req.path;
  const area = relative.split('/').filter(Boolean)[0] ?? 'admin';
  res.on('finish', () => {
    if (!req.admin) return;
    const custom = res.locals.activity ?? {};
    logActivity(req, {
      area: custom.area ?? area,
      action: custom.action ?? `${ACTIONS[req.method] ?? req.method.toLowerCase()} ${area}`,
      item: custom.item ?? relative,
      result: res.statusCode,
    });
  });
  return next();
}

/** A Pakistan calendar day (YYYY-MM-DD) as its first or last instant in UTC, or null if it isn't a date. */
function pakistanDay(day, end = false) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day ?? '')) return null;
  const time = Date.parse(`${day}T${end ? '23:59:59.999' : '00:00:00.000'}+05:00`);
  return Number.isNaN(time) ? null : new Date(time).toISOString();
}

export const activityService = {
  async list({ admin, area, from, to, q, result, page = 1, limit = 50 } = {}) {
    const all = (await activityRepository.findAll()).reverse();
    const text = q?.toLowerCase();
    const start = pakistanDay(from);
    const end = pakistanDay(to, true);
    const items = all.filter(
      (entry) =>
        (!admin || entry.adminEmail === admin) &&
        (!area || entry.area === area) &&
        (!start || entry.at >= start) &&
        (!end || entry.at <= end) &&
        (!result || (result === 'ok' ? entry.result < 400 : entry.result >= 400)) &&
        (!text || `${entry.area} ${entry.action} ${entry.item} ${entry.adminEmail} ${entry.ip}`.toLowerCase().includes(text)),
    );
    const first = (page - 1) * limit;
    return { items: items.slice(first, first + limit), total: items.length, page, pages: Math.max(1, Math.ceil(items.length / limit)) };
  },

  async filters() {
    const all = await activityRepository.findAll();
    return {
      admins: [...new Set(all.map((entry) => entry.adminEmail).filter(Boolean))].sort(),
      areas: [...new Set(all.map((entry) => entry.area))].sort(),
    };
  },

  /** Re-checks the whole chain; returns the first broken entry, if any. */
  async verify() {
    await queue;
    const all = await activityRepository.findAll();
    let prev = 'start';
    for (const entry of all) {
      if (entry.prev !== prev || sign(prev, signedPart(entry)) !== entry.hash) {
        return { ok: false, checked: all.length, brokenAt: { id: entry.id, at: entry.at, action: entry.action } };
      }
      prev = entry.hash;
    }
    return { ok: true, checked: all.length };
  },

  async csv(filters) {
    const { items } = await this.list({ ...filters, page: 1, limit: 100_000 });
    const cell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = [['When (UTC)', 'Admin', 'Area', 'Action', 'Item', 'Result', 'IP'], ...items.map((e) => [e.at, e.adminEmail, e.area, e.action, e.item, e.result, e.ip])];
    return rows.map((row) => row.map(cell).join(',')).join('\r\n');
  },
};
