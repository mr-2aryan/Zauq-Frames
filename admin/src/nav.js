import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import CollectionsBookmarkOutlinedIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import HistoryIcon from '@mui/icons-material/History';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import MailOutlineIcon from '@mui/icons-material/MailOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutlined';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import StraightenIcon from '@mui/icons-material/Straighten';

/**
 * The sidebar: groups of pages. `badge` names a count from /dashboard/counts
 * shown next to the item; `keywords` help the quick search (Ctrl+K) find it.
 */
export const NAV = [
  { group: 'Overview', items: [{ path: '/', label: 'Dashboard', icon: SpaceDashboardOutlinedIcon, keywords: 'home sales revenue stats' }] },
  {
    group: 'Sales',
    items: [
      { path: '/orders', label: 'Orders', icon: ReceiptLongOutlinedIcon, badge: 'orders', keywords: 'order courier tracking shipping payment' },
      { path: '/customers', label: 'Customers', icon: PeopleOutlineIcon, keywords: 'buyers accounts people' },
    ],
  },
  {
    group: 'Catalogue',
    items: [
      { path: '/products', label: 'Products', icon: Inventory2OutlinedIcon, keywords: 'pieces frames art' },
      { path: '/collections', label: 'Collections', icon: CollectionsBookmarkOutlinedIcon, keywords: 'categories' },
      { path: '/pricing', label: 'Sizes & prices', icon: StraightenIcon, keywords: 'price size delivery fee promotion discount' },
      { path: '/media-library', label: 'Media library', icon: PhotoLibraryOutlinedIcon, keywords: 'images photos uploads print files' },
    ],
  },
  {
    group: 'Engagement',
    items: [
      { path: '/reviews', label: 'Reviews', icon: RateReviewOutlinedIcon, badge: 'reviews', keywords: 'ratings approve' },
      { path: '/messages', label: 'Messages', icon: MailOutlineIcon, badge: 'messages', keywords: 'inbox contact' },
      { path: '/subscribers', label: 'Subscribers', icon: MarkEmailReadOutlinedIcon, keywords: 'newsletter emails' },
    ],
  },
  {
    group: 'Team',
    items: [
      { path: '/admins', label: 'Admins', icon: AdminPanelSettingsOutlinedIcon, keywords: 'team users access' },
      { path: '/activity', label: 'Activity log', icon: HistoryIcon, keywords: 'audit history log' },
    ],
  },
];

export const NAV_ITEMS = NAV.flatMap((section) => section.items.map((item) => ({ ...item, group: section.group })));
