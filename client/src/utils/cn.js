/** Joins truthy class names: `cn('a', isOn && 'b')` → `'a b'`. */
export const cn = (...classNames) => classNames.filter(Boolean).join(' ');
