import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { homePathForRoles } from '@/lib/roleRedirect';

/**
 * Gates a portal behind a logged-in session AND, when `allowedRoles` is
 * given, behind the user actually holding one of those roles.
 *
 * Previously this only checked `!user`, so any logged-in user (teacher,
 * student, principal — whoever) could render whatever `children` the route
 * passed in, which is how a teacher/student login ended up inside
 * PrincipalLayout: nothing here ever stopped them.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {string[]} [props.allowedRoles] - roles allowed into this portal,
 *   e.g. ['teacher']. Omit to only require "logged in" (rarely what you want).
 */
export default function ProtectedRoute({ children, allowedRoles }) {
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

  if (allowedRoles && allowedRoles.length > 0) {
    const roles = (user.roles || []).map((r) => String(r).toLowerCase());
    const permitted = allowedRoles.some((r) => roles.includes(r));
    if (!permitted) {
      // Logged in, but wrong portal for this role — send them to their own
      // dashboard instead of showing someone else's, or bouncing to /login.
      return <Navigate to={homePathForRoles(user.roles)} replace />;
    }
  }

  return children;
}
