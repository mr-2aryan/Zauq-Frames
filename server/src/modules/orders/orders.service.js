import { HttpError } from '../../utils/HttpError.js';
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

const itemError = (index, field, message) =>
  HttpError.badRequest('Please check the highlighted fields.', [{ field: `items.${index}.${field}`, message }]);

/** What each item type adds to an order line, including its list and sale price. */
const ITEM_DETAILS = {
  async 'custom-frame'(item, index, { size }) {
    if (!(await uploadsService.exists(item.photoId))) {
      throw itemError(index, 'photoId', 'We could not find this photo. Please upload it again.');
    }
    return {
      name: 'Custom frame',
      photoId: item.photoId,
      photoUrl: uploadsService.getPublicUrl(item.photoId),
      crop: item.crop,
      // Custom frames are priced by size.
      listPrice: size.price,
      unitPrice: size.salePrice,
    };
  },

  async product(item, index, { catalog }) {
    const product = await productsService.findBySlug(item.productId);
    if (!product) throw itemError(index, 'productId', 'That piece is no longer available.');
    return {
      name: product.name,
      productId: product.slug,
      image: product.images[0],
      // Collection pieces cost the same in every size.
      listPrice: catalog.productPrice.price,
      unitPrice: catalog.productPrice.salePrice,
    };
  },
};

/**
 * Prices are always computed here from the catalogue — never trusted from the client.
 */
async function buildOrderLine(item, index, catalog) {
  const size = await framesService.findSizeById(item.sizeId);
  if (!size) throw itemError(index, 'sizeId', 'That frame size is not available.');

  const { listPrice, unitPrice, ...details } = await ITEM_DETAILS[item.type](item, index, { size, catalog });
  return {
    type: item.type,
    ...details,
    sizeId: size.id,
    label: `${size.width} × ${size.height} in`,
    orientation: item.orientation,
    finish: catalog.finish,
    quantity: item.quantity,
    listPrice,
    unitPrice,
    lineTotal: unitPrice * item.quantity,
  };
}

/** What anyone holding the order number may see (no contact details). */
const toPublicOrder = ({ customer, ...order }) => ({
  ...order,
  customer: { name: customer.name, city: customer.city },
});

export const ordersService = {
  async create({ customer, items }) {
    const catalog = await framesService.getCatalog();
    const lines = await Promise.all(items.map((item, index) => buildOrderLine(item, index, catalog)));
    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);

    const order = await ordersRepository.create({
      status: ORDER_STATUS.PENDING,
      customer,
      items: lines,
      currency: catalog.currency,
      promotion: catalog.promotion,
      subtotal,
      deliveryFee: catalog.deliveryFee,
      total: subtotal + catalog.deliveryFee,
    });

    return toPublicOrder(order);
  },

  async getPublicById(id) {
    const order = await ordersRepository.findById(id);
    if (!order) throw HttpError.notFound('We could not find an order with that number.');
    return toPublicOrder(order);
  },
};
