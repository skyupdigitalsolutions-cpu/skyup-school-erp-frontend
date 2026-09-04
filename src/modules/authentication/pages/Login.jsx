import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '@/features/authentication/authSlice';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useSelector((s) => s.auth);

  const [schoolCode, setSchoolCode] = useState(localStorage.getItem('tenantSlug') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loading = status === 'loading';

  async function handleSubmit(e) {
    e.preventDefault();
    const slug = schoolCode.trim().toLowerCase();
    if (!slug) return;

    // Written BEFORE the login call so the axios request interceptor attaches
    // X-Tenant-Id: <slug> to this very request (see lib/axios.js).
    localStorage.setItem('tenantSlug', slug);

    const result = await dispatch(login({ email: email.trim().toLowerCase(), password }));
    if (login.fulfilled.match(result)) {
      const redirectTo = location.state?.from?.pathname || '/principal/dashboard';
      navigate(redirectTo, { replace: true });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            SE
          </div>
          <div>
            <p className="font-bold text-gray-900 leading-tight">School ERP</p>
            <p className="text-[11px] text-gray-400 leading-tight">Sign in to continue</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4"
        >
          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="schoolCode" className="block text-xs font-semibold text-gray-600 mb-1.5">
              School Code
            </label>
            <input
              id="schoolCode"
              name="schoolCode"
              type="text"
              autoComplete="organization"
              placeholder="demo"
              value={schoolCode}
              onChange={(e) => setSchoolCode(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-gray-600 mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="principal@demo.school"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-gray-600 mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-[11px] text-gray-400 mt-5">
          Demo school — use School Code <span className="font-mono text-gray-500">demo</span>, e.g.{' '}
          <span className="font-mono text-gray-500">principal@demo.school</span> / Password123!
        </p>
      </div>
    </div>
  );
}
