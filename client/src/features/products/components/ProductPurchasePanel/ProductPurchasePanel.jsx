import { useState } from 'react';
import { useNavigate } from 'react-router';
import { BoxIcon, CheckCircleIcon, HangIcon } from '@/components/icons';
import { Badge, Button, Chip, Price, QuantityStepper } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { useCart } from '@/context/cart/useCart';
import { useToast } from '@/context/toast/useToast';
import { formatSizeLabel } from '@/utils/frames';
import { formatPrice } from '@/utils/formatPrice';
import { DeliveryCheck } from '../DeliveryCheck/DeliveryCheck.jsx';
import styles from './ProductPurchasePanel.module.css';

/** The size shown in product photography, pre-selected when available. */
const DEFAULT_SIZE_ID = '18x24';

/**
 * Size choice, price, quantity and add-to-cart for a collection piece.
 * @param {{ product: import('@/services/productsApi').Product, catalog: import('@/services/framesApi').FrameCatalog }} props
 */
export function ProductPurchasePanel({ product, catalog }) {
  const { sizes, currency, finish, promotion } = catalog;
  const [sizeId, setSizeId] = useState(sizes.some((size) => size.id === DEFAULT_SIZE_ID) ? DEFAULT_SIZE_ID : sizes[0].id);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const size = sizes.find((option) => option.id === sizeId) ?? sizes[0];
  const sizeLabel = formatSizeLabel(size, { unit: true });

  const add = () =>
    addItem({
      type: 'product',
      productId: product.slug,
      name: product.name,
      image: product.image,
      sizeId: size.id,
      sizeLabel,
      // Collection artworks are composed in portrait.
      orientation: 'portrait',
      unitPrice: product.salePrice,
      listPrice: product.price,
      currency,
      quantity,
    });

  const handleAdd = () => {
    add();
    showToast(`Added to cart — ${product.name}, ${sizeLabel}`);
  };

  const handleBuyNow = () => {
    add();
    navigate(ROUTES.cart);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.priceBox}>
        <Price amount={product.salePrice * quantity} listAmount={product.price * quantity} currency={currency} size="lg" />
        {promotion.percentOff > 0 && <Badge tone="sale">Save {promotion.percentOff}%</Badge>}
        <span className={styles.priceMeta}>
          {sizeLabel} · {finish} frame included · ready to hang
          {quantity > 1 && ` · ${quantity} × ${formatPrice(product.salePrice, currency)}`}
        </span>
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          Size <span className={styles.legendNote}>· same price in every size</span>
        </legend>
        <div className={styles.sizes}>
          {sizes.map((option) => (
            <Chip key={option.id} shape="tile" selected={option.id === size.id} onClick={() => setSizeId(option.id)}>
              <span className={styles.sizeLabel}>{formatSizeLabel(option)}</span>
            </Chip>
          ))}
        </div>
        <p className={styles.sizeHint}>{size.description}</p>
      </fieldset>

      <div className={styles.buyRow}>
        <QuantityStepper value={quantity} onChange={setQuantity} />
        <Button size="lg" className={styles.add} onClick={handleAdd}>
          Add to cart
        </Button>
      </div>
      <Button variant="dark" size="lg" block onClick={handleBuyNow}>
        Buy now
      </Button>

      <DeliveryCheck deliveryFee={catalog.deliveryFee} currency={currency} />

      <ul className={styles.perks}>
        <li>
          <HangIcon size={22} />
          Ready to hang
        </li>
        <li>
          <BoxIcon size={22} />
          Packed securely
        </li>
        <li>
          <CheckCircleIcon size={22} />
          Damage? We fix it
        </li>
      </ul>
    </div>
  );
}
