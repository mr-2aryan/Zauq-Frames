import { Link, useLocation } from 'react-router';

const isModifiedClick = (event) => event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

/**
 * Router link that glides to a `#id` on the current page instead of jumping.
 * Links to other pages, including anchors on other pages, navigate as usual.
 * @param {import('react-router').LinkProps & { to: string }} props
 */
export function HashLink({ to, onClick, ...rest }) {
  const { pathname } = useLocation();

  const handleClick = (event) => {
    onClick?.(event);
    if (event.defaultPrevented || isModifiedClick(event)) return;

    const [path, id] = to.split('#');
    if (!id || (path || pathname) !== pathname) return;
    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  };

  return <Link to={to} onClick={handleClick} {...rest} />;
}
