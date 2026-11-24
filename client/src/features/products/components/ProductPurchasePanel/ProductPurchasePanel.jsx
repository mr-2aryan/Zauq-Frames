import { useId, useState } from 'react';
import { useNavigate } from 'react-router';
import { BoxIcon, CheckCircleIcon, HangIcon } from '@/components/icons';
import { Badge, Button, Price, QuantityStepper } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { useCart } from '@/context/cart/useCart';
import { useToast } from '@/context/toast/useToast';
import { cn } from '@/utils/cn';
import { formatSizeLabel, MAT_LABELS, orientSize } from '@/utils/frames';
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
  const sizeName = useId();
  const matName = useId();
  const mats = catalog.mats ?? ['none', 'white'];
  const [sizeId, setSizeId] = useState(sizes.some((size) => size.id === DEFAULT_SIZE_ID) ? DEFAULT_SIZE_ID : sizes[0].id);
  const [mat, setMat] = useState('none');
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const orientation = product.orientation ?? 'portrait';
  const size = sizes.find((option) => option.id === sizeId) ?? sizes[0];
  const sizeLabel = formatSizeLabel(orientSize(size, orientation), { unit: true });

  const add = () =>
    addItem({
      type: 'product',
      productId: product.slug,
      name: product.name,
      image: product.image,
      // The artwork on its own (no room or frame around it), where the piece has one.
      art: product.art ?? undefined,
      sizeId: size.id,
      sizeLabel,
      // Each artwork is composed one way (most portrait; Heritage pieces landscape).
      orientation,
      mat,
      unitPrice: size.salePrice,
      listPrice: size.price,
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
        <Price amount={size.salePrice * quantity} listAmount={size.price * quantity} currency={currency} size="lg" />
        {promotion.percentOff > 0 && <Badge tone="sale">Save {promotion.percentOff}%</Badge>}
        <span className={styles.priceMeta}>
          {sizeLabel} · {finish} frame{mat === 'white' ? ' and white mat' : ''} included · ready to hang
          {quantity > 1 && ` · ${quantity} × ${formatPrice(size.salePrice, currency)}`}
        </span>
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Size</legend>
        {/* Real radio buttons styled as tiles. */}
        <div className={styles.sizes}>
          {sizes.map((option) => {
            const checked = option.id === size.id;
            return (
              <label key={option.id} className={cn(styles.sizeOption, checked && styles.sizeChecked)}>
                <input type="radio" name={sizeName} value={option.id} checked={checked} onChange={() => setSizeId(option.id)} className="sr-only" />
                <span className={styles.sizeLabel}>{formatSizeLabel(orientSize(option, orientation))}</span>
                <span className={styles.sizePrice}>{formatPrice(option.salePrice, currency)}</span>
              </label>
            );
          })}
        </div>
        <p className={styles.sizeHint}>{size.description}</p>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Mat</legend>
        <div className={styles.mats}>
          {mats.map((option) => {
            const checked = option === mat;
            return (
              <label key={option} className={cn(styles.sizeOption, styles.matOption, checked && styles.sizeChecked)}>
                <input type="radio" name={matName} value={option} checked={checked} onChange={() => setMat(option)} className="sr-only" />
                <span className={cn(styles.matSwatch, option === 'white' && styles.matSwatchWhite)} aria-hidden="true" />
                <span className={styles.sizeLabel}>{MAT_LABELS[option] ?? option}</span>
              </label>
            );
          })}
        </div>
        <p className={styles.sizeHint}>
          {mat === 'white' ? 'A white border between the frame and the artwork. Free on every size.' : 'The artwork fills the frame, edge to edge.'}
        </p>
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
          Damage covered
        </li>
      </ul>
    </div>
  );
}
