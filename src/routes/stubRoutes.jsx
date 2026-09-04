import { ComingSoon } from '@/layouts/PrincipalLayout';

/**
 * These four sections are on the product roadmap (see MODULES.md) but have no
 * backend/frontend build yet — only empty .gitkeep stubs exist under
 * src/modules/{finance,leave-management,notifications,reports}.
 * (Dashboard has since been built — see @/modules/dashboard/routes.)
 *
 * Rather than leaving the sidebar links dead (as Class Management was before),
 * each renders the real ComingSoon component so the click always resolves to
 * something visible. Swap each element for the real page as each module ships.
 */
export const stubRoutes = [
  { path: 'finance', element: <ComingSoon module="Finance" /> },
  { path: 'leave-management', element: <ComingSoon module="Leave Management" /> },
  { path: 'notices', element: <ComingSoon module="Notices & Quick Actions" /> },
  { path: 'reports', element: <ComingSoon module="Reports" /> },
];