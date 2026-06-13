import { Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { getAdminToken } from '../../services/httpService';
import { loginAdmin } from '../../services/adminService';

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
    <main className="login-page">
      <section className="login-panel">
        <div className="brand-block login-brand">
          <div className="brand-mark">B</div>
          <div>
            <strong>BookMyVenue</strong>
            <span>Admin Control Panel</span>
          </div>
        </div>
        <h1>Admin Portal</h1>
        <p>Sign in to manage clients, vendors, approvals, and platform health.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <div className={`input-shell ${formErrors.email ? 'error' : ''}`}>
              <Mail size={16} />
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              />
            </div>
            {formErrors.email && <div className="field-error" style={{ color: 'var(--danger-color, #ef4444)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{formErrors.email}</div>}
          </label>
          <label>
            <span>Password</span>
            <div className={`input-shell ${formErrors.password ? 'error' : ''}`}>
              <Lock size={16} />
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              />
            </div>
            {formErrors.password && <div className="field-error" style={{ color: 'var(--danger-color, #ef4444)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{formErrors.password}</div>}
          </label>
          {error ? <div className="form-error">{error}</div> : null}
          <button className="primary-button full-width" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AdminLogin;
