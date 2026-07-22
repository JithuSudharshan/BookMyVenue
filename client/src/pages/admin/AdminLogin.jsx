import { Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { getAdminToken } from '../../services/httpService';
import { loginAdmin } from '../../api/admin-api/adminApi';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (getAdminToken()) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormErrors({});
    setError('');

    try {
      const parsedData = loginSchema.parse(form);
      setLoading(true);
      await loginAdmin(parsedData);
      navigate('/admin', { replace: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Frontend Zod errors
        const fieldErrors = {};
        err.errors.forEach(e => {
          if (e.path[0]) fieldErrors[e.path[0]] = e.message;
        });
        setFormErrors(fieldErrors);
      } else if (err.data && err.data.errors) {
        // Backend Zod errors
        const fieldErrors = {};
        err.data.errors.forEach(e => {
          // Backend paths usually look like ['body', 'email'], we need the last element
          const field = e.path[e.path.length - 1];
          if (field) fieldErrors[field] = e.message;
        });
        setFormErrors(fieldErrors);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center p-6 bg-[radial-gradient(circle_at_top,#fff,var(--bg))]">
      <section className="w-full max-w-[430px] p-[34px] bg-surface border border-line rounded-lg shadow-admin">
        <div className="flex items-center gap-2.5 mb-[22px]">
          <div className="grid place-items-center w-[38px] h-[38px] rounded-[7px] text-white font-extrabold bg-admin-red">B</div>
          <div>
            <strong className="block text-admin-red text-[15px] font-bold">BookMyVenue</strong>
            <span className="block text-muted text-[12px]">Admin Control Panel</span>
          </div>
        </div>
        <h1 className="m-0 text-[34px] font-bold text-ink leading-tight">Admin Portal</h1>
        <p className="text-muted text-sm mt-2">Sign in to manage clients, vendors, approvals, and platform health.</p>

        <form className="grid gap-4 mt-6" onSubmit={handleSubmit}>
          <label className="block">
            <span className="block mb-2 text-[#6b5555] text-[13px] font-extrabold">Email</span>
            <div className={`flex items-center gap-2 border px-3 rounded-[7px] bg-[#fafafa] transition-colors ${
              formErrors.email ? 'border-admin-red bg-admin-red-soft' : 'border-line'
            }`}>
              <Mail size={16} className="text-[#6b5555]" />
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="w-full min-w-0 h-[38px] border-0 outline-none text-ink bg-transparent"
              />
            </div>
            {formErrors.email && <div className="text-admin-red text-xs mt-1">{formErrors.email}</div>}
          </label>
          <label className="block">
            <span className="block mb-2 text-[#6b5555] text-[13px] font-extrabold">Password</span>
            <div className={`flex items-center gap-2 border px-3 rounded-[7px] bg-[#fafafa] transition-colors ${
              formErrors.password ? 'border-admin-red bg-admin-red-soft' : 'border-line'
            }`}>
              <Lock size={16} className="text-[#6b5555]" />
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                className="w-full min-w-0 h-[38px] border-0 outline-none text-ink bg-transparent"
              />
            </div>
            {formErrors.password && <div className="text-admin-red text-xs mt-1">{formErrors.password}</div>}
          </label>
          {error ? (
            <div className="p-[10px_12px] text-admin-red bg-[#fff1f2] border border-[#fecaca] rounded-[7px] text-sm font-medium">
              {error}
            </div>
          ) : null}
          <button 
            className="min-h-[36px] w-full px-3.5 rounded-[7px] text-[13px] font-extrabold text-white bg-admin-red border border-admin-red hover:bg-admin-red-dark hover:border-admin-red-dark transition-all disabled:opacity-50" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AdminLogin;
