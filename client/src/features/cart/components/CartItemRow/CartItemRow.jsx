import { Link } from 'react-router';
import { TrashIcon } from '@/components/icons';
import { Price, QuantityStepper } from '@/components/ui';
import { productPath } from '@/config/routes';
import { resolveAssetUrl } from '@/services/apiClient';
import { formatOrientation } from '@/utils/frames';
import styles from './CartItemRow.module.css';

/**
 * One line in the cart.
 * @param {{ item: import('@/context/cart/cartReducer').CartItem, onQuantityChange: (quantity: number) => void, onRemove: () => void }} props
 */
export function CartItemRow({ item, onQuantityChange, onRemove }) {
  const isProduct = item.type === 'product';
  const image = isProduct ? item.image : resolveAssetUrl(item.photo?.url ?? item.image);

  return (
    <li className={styles.row}>
      <div className={styles.media}>
        <img
          src={image}
          alt=""
          className={styles.image}
          style={item.crop ? { objectPosition: `${item.crop.x}% ${item.crop.y}%` } : undefined}
        />
      </div>
      <div className={styles.info}>
        {isProduct ? (
          <Link to={productPath(item.productId)} className={styles.name}>
            {item.name}
          </Link>
        ) : (
          <span className={styles.name}>{item.name}</span>
        )}
        <span className={styles.meta}>
          {item.sizeLabel} · {formatOrientation(item.orientation)} · black frame
        </span>
        {!isProduct && item.photo?.name && <span className={styles.meta}>Your photo: {item.photo.name}</span>}
        <Price amount={item.unitPrice} listAmount={item.listPrice} currency={item.currency} size="sm" className={styles.unit} />
      </div>
      <div className={styles.controls}>
        <QuantityStepper size="sm" value={item.quantity} onChange={onQuantityChange} label={`Quantity of ${item.name}`} />
        <Price amount={item.unitPrice * item.quantity} currency={item.currency} className={styles.total} />
        <button type="button" className={styles.remove} onClick={onRemove} aria-label={`Remove ${item.name} (${item.sizeLabel}) from cart`}>
          <TrashIcon size={18} />
          <span>Remove</span>
        </button>
      </div>
    </li>
  );
}
