/**
 * Line icons. All are decorative (aria-hidden) — give the surrounding link or
 * button an accessible name.
 */

function IconBase({ size = 20, strokeWidth = 1.8, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function SparkleIcon({ size = 14, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...rest}>
      <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
    </svg>
  );
}

export const SearchIcon = (p) => (
  <IconBase {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></IconBase>
);
export const UserIcon = (p) => (
  <IconBase {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></IconBase>
);
export const BagIcon = (p) => (
  <IconBase {...p}><path d="M5 8h14l-1.2 12H6.2z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></IconBase>
);
export const MenuIcon = (p) => (
  <IconBase {...p}><path d="M4 7h16M4 12h16M4 17h16" /></IconBase>
);
export const CloseIcon = (p) => (
  <IconBase {...p}><path d="M6 6l12 12M18 6L6 18" /></IconBase>
);
export const ArrowRightIcon = (p) => (
  <IconBase {...p}><path d="M5 12h14M13 6l6 6-6 6" /></IconBase>
);
export const ChevronRightIcon = (p) => (
  <IconBase {...p}><path d="M9 6l6 6-6 6" /></IconBase>
);
export const TruckIcon = (p) => (
  <IconBase {...p}><path d="M2 6h12v10H2zM14 9h4l3 3v4h-7z" /><circle cx="6" cy="18" r="1.8" /><circle cx="17" cy="18" r="1.8" /></IconBase>
);
export const HangIcon = (p) => (
  <IconBase {...p}><circle cx="12" cy="4" r="1.3" /><path d="M12 5.3L5 11M12 5.3L19 11" /><rect x="4" y="11" width="16" height="10" rx="1" /></IconBase>
);
export const CheckCircleIcon = (p) => (
  <IconBase {...p}><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.7 2.7L16 9.8" /></IconBase>
);
export const BrushIcon = (p) => (
  <IconBase {...p}><path d="M4 20l7-7" /><path d="M14.5 3.5l6 6-7 7-6-6z" /></IconBase>
);
export const BoxIcon = (p) => (
  <IconBase {...p}><path d="M3 7l9-4 9 4-9 4z" /><path d="M3 7v10l9 4 9-4V7M12 11v10" /></IconBase>
);
export const ClockIcon = (p) => (
  <IconBase {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></IconBase>
);
export const OfficeIcon = (p) => (
  <IconBase {...p}><rect x="4" y="3" width="11" height="18" /><path d="M15 9h5v12h-5M7 7h2M7 11h2M7 15h2M11 7h1M11 11h1M11 15h1" /></IconBase>
);
export const GiftIcon = (p) => (
  <IconBase {...p}><rect x="3" y="9" width="18" height="12" /><path d="M3 9h18M12 9v12M12 9c-2-4-6-4-6-1.5S9 9 12 9zM12 9c2-4 6-4 6-1.5S15 9 12 9z" /></IconBase>
);
export const HotelIcon = (p) => (
  <IconBase {...p}><path d="M3 20V8l9-4 9 4v12" /><path d="M9 20v-5h6v5M8 10h1M15 10h1" /></IconBase>
);
export const ImageIcon = (p) => (
  <IconBase {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M21 17l-5-5-9 8" /></IconBase>
);
export const UploadIcon = (p) => (
  <IconBase {...p}><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></IconBase>
);
export const TrashIcon = (p) => (
  <IconBase {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></IconBase>
);
export const FilterIcon = (p) => (
  <IconBase {...p}><path d="M4 6h16M7 12h10M10 18h4" /></IconBase>
);
export const WhatsAppIcon = (p) => (
  <IconBase {...p}>
    <path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z" />
    <path d="M9 9.5c.5 2 2 3.5 4 4.5l1.3-1.2 2 .9c-.2 1.3-1.3 2-2.6 1.8-3-.6-5.4-3-6-6-.2-1.3.5-2.4 1.8-2.6l.9 2z" />
  </IconBase>
);
export const InstagramIcon = (p) => (
  <IconBase {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></IconBase>
);
export const FacebookIcon = (p) => (
  <IconBase {...p}><path d="M15 3h-2a4 4 0 0 0-4 4v3H7v4h2v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h2z" /></IconBase>
);
export const MailIcon = (p) => (
  <IconBase {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></IconBase>
);
