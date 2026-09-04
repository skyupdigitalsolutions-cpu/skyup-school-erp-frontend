import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes/router';
import { bootstrapAuth } from '@/features/authentication/authSlice';

/**
 * Root component. Kept deliberately thin — global providers live in main.jsx,
 * routing lives in src/routes/router.jsx. The one exception is dispatching
 * the silent session-restore attempt exactly once on first mount, since
 * ProtectedRoute needs `auth.initialized` to decide whether to show the app
 * or redirect to /login.
 */
export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  return <RouterProvider router={router} />;
}
