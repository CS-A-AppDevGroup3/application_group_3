import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import AuthShell from '../components/AuthShell.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Log in"
      subtitle="Pick up your reviewers where you left off."
      footer={<>New here? <Link to="/register">Create an account</Link></>}
    >
      <form onSubmit={onSubmit} noValidate>
        {error && <p className="alert" role="alert">{error}</p>}
        <label>
          Email
          <input type="email" autoComplete="email" value={form.email} onChange={set('email')} required />
        </label>
        <label>
          Password
          <input type="password" autoComplete="current-password" value={form.password} onChange={set('password')} required />
        </label>
        <button className="btn" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      </form>
    </AuthShell>
  );
}
