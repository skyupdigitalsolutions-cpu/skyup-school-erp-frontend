import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Gates the principal (and future role) portals behind a logged-in session.
 * Waits for `initialized` (the one silent bootstrapAuth attempt on app load)
 * before deciding, so a page refresh with a valid refresh cookie doesn't
 * flash the login screen before the session is restored.
 */
export default function ProtectedRoute({ children }) {
  const { user, initialized } = useSelector((s) => s.auth);
  const location = useLocation();

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
