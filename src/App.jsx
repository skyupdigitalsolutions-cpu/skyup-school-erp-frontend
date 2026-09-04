import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes/router';

/**
 * Root component. Kept deliberately thin — global providers live in main.jsx,
 * routing lives in src/routes/router.jsx. No module UI here.
 */
export default function App() {
  return <RouterProvider router={router} />;
}
