import { HttpError } from '../../utils/HttpError.js';
import { emailService } from '../email/email.service.js';
import { framesService } from '../frames/frames.service.js';
import { productsService } from '../products/products.service.js';
import { uploadsService } from '../uploads/uploads.service.js';
import { ordersRepository } from './orders.repository.js';

export const ORDER_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PRODUCTION: 'in_production',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
});

/** Order to door, in days (matches the shop's "7–10 days"). */
const DELIVERY_DAYS = Object.freeze({ min: 7, max: 10 });

/** The last ten digits, so 0323 5992853 and +92 323 5992853 match. */
const phoneDigits = (value) => String(value ?? '').replace(/\D/g, '').slice(-10);

const itemError = (index, field, message) =>
  HttpError.badRequest('Please check the highlighted fields.', [{ field: `items.${index}.${field}`, message }]);

/** What each item type adds to an order line. Both are priced by frame size. */
const ITEM_DETAILS = {
  async 'custom-frame'(item, index) {
    if (!(await uploadsService.exists(item.photoId))) {
      throw itemError(index, 'photoId', 'We could not find this photo. Please upload it again.');
    }
    return {
      name: 'Custom frame',
      photoId: item.photoId,
      photoUrl: uploadsService.getPublicUrl(item.photoId),
      crop: item.crop,
    };
  },

  async product(item, index) {
    const product = await productsService.findBySlug(item.productId);
    if (!product) throw itemError(index, 'productId', 'That piece is no longer available.');
    // `art`: the flat artwork (small copy), for showing the piece in its frame — in emails, say.
    return { name: product.name, productId: product.slug, image: product.cardImage ?? product.images[0], art: product.art, orientation: product.orientation ?? 'portrait' };
  },
};

/**
 * Prices are always computed here from the catalogue — never trusted from the client.
 */
async function buildOrderLine(item, index, catalog) {
  const size = await framesService.findSizeById(item.sizeId);
  if (!size) throw itemError(index, 'sizeId', 'That frame size is not available.');

  // Collection pieces have a fixed orientation; custom frames use the one chosen.
  const { orientation = item.orientation, ...details } = await ITEM_DETAILS[item.type](item, index);
  const [width, height] = orientation === 'landscape' ? [size.height, size.width] : [size.width, size.height];
  return {
    type: item.type,
    ...details,
    sizeId: size.id,
    label: `${width} × ${height} in`,
    orientation,
    finish: catalog.finish,
    // The mat is free: it never changes the price.
    mat: item.mat,
    quantity: item.quantity,
    listPrice: size.price,
    unitPrice: size.salePrice,
    lineTotal: size.salePrice * item.quantity,
  };
}

/** What anyone holding the order number may see (no contact details). */
const toPublicOrder = ({ customer, customerId: _owner, ...order }) => ({
  ...order,
  customer: { name: customer.name, city: customer.city },
});

export const ordersService = {
  /** `customerId` links the order to a signed-in account (its order history). */
  async create({ customer, items, paymentMethod = 'cod' }, customerId = null) {
    const catalog = await framesService.getCatalog();
    const lines = await Promise.all(items.map((item, index) => buildOrderLine(item, index, catalog)));
    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);

    const order = await ordersRepository.create({
      status: ORDER_STATUS.PENDING,
      // Every status change is appended here, for "Track your order".
      history: [{ status: ORDER_STATUS.PENDING, at: new Date().toISOString() }],
      customer,
      customerId,
      paymentMethod,
      items: lines,
      currency: catalog.currency,
      promotion: catalog.promotion,
      subtotal,
      deliveryFee: catalog.deliveryFee,
      total: subtotal + catalog.deliveryFee,
    });

    // The "thank you" email — sent in the background, so it never holds up (or fails) the order.
    void emailService.sendOrderUpdate(order);
    return toPublicOrder(order);
  },

  /**
   * Moves an order to a new status (recorded in its history) and emails the
   * customer about it. For the studio's order management.
   */
  async updateStatus(id, status) {
    if (!Object.values(ORDER_STATUS).includes(status)) throw HttpError.badRequest('Unknown order status.');
    const order = await ordersRepository.findById(id);
    if (!order) throw HttpError.notFound('We could not find an order with that number.');
    if (order.status === status) return toPublicOrder(order);
    const updated = await ordersRepository.update(id, { status, history: [...(order.history ?? []), { status, at: new Date().toISOString() }] });
    void emailService.sendOrderUpdate(updated);
    return toPublicOrder(updated);
  },

  /**
   * Tracking details for an order, given its number and the phone it was placed with.
   * A wrong number and a wrong phone get the same answer, so order numbers can't be probed.
   */
  async track(id, phone) {
    const order = await ordersRepository.findById(id);
    const given = phoneDigits(phone);
    if (!order || given.length < 10 || phoneDigits(order.customer.phone) !== given) {
      throw HttpError.notFound('We couldn’t find an order with that number and phone number.');
    }

    const placed = Date.parse(order.createdAt);
    const afterDays = (days) => new Date(placed + days * 86_400_000).toISOString();
    return {
      id: order.id,
      status: order.status,
      history: order.history ?? [{ status: ORDER_STATUS.PENDING, at: order.createdAt }],
      placedAt: order.createdAt,
      updatedAt: order.updatedAt,
      estimatedDelivery: { from: afterDays(DELIVERY_DAYS.min), to: afterDays(DELIVERY_DAYS.max) },
      customer: { firstName: order.customer.name.split(' ')[0], city: order.customer.city },
      items: order.items.map(({ type, name, label, orientation, quantity, image, photoUrl }) => ({
        type,
        name,
        label,
        orientation,
        quantity,
        image: image ?? photoUrl,
      })),
      paymentMethod: order.paymentMethod ?? 'cod',
      currency: order.currency,
      total: order.total,
    };
  },

  /** A signed-in customer's orders, newest first, with what the account page needs. */
  async listForCustomer(customerId) {
    const orders = await ordersRepository.findAllBy('customerId', customerId);
    return orders
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(({ customer, customerId: _owner, ...order }) => ({
        ...order,
        history: order.history ?? [{ status: ORDER_STATUS.PENDING, at: order.createdAt }],
        customer: { name: customer.name, city: customer.city, address: customer.address, phone: customer.phone },
      }));
  },

  async getPublicById(id) {
    const order = await ordersRepository.findById(id);
    if (!order) throw HttpError.notFound('We could not find an order with that number.');
    return toPublicOrder(order);
  },
};
