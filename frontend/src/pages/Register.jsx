import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import AuthShell from '../components/AuthShell.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    if (form.password !== form.confirm) {
      setFieldErrors({ confirm: 'Passwords do not match' });
      return;
    }
    setBusy(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.fieldErrors && Object.keys(err.fieldErrors).length ? '' : err.message);
      setFieldErrors(err.fieldErrors || {});
    } finally {
      setBusy(false);
    }
  }

  const Field = ({ id, label, type = 'text', auto, hint }) => (
    <label>
      {label}
      <input type={type} autoComplete={auto} value={form[id]} onChange={set(id)} required aria-invalid={Boolean(fieldErrors[id])} />
      {fieldErrors[id] ? <span className="field-error">{fieldErrors[id]}</span> : hint && <span className="hint">{hint}</span>}
    </label>
  );

  return (
    <AuthShell
      title="Create your account"
      subtitle="Upload a handout and study from it, nothing else."
      footer={<>Already registered? <Link to="/login">Log in</Link></>}
    >
      <form onSubmit={onSubmit} noValidate>
        {error && <p className="alert" role="alert">{error}</p>}
        {Field({ id: 'name', label: 'Full name', auto: 'name' })}
        {Field({ id: 'email', label: 'Email', type: 'email', auto: 'email' })}
        {Field({ id: 'password', label: 'Password', type: 'password', auto: 'new-password', hint: 'At least 8 characters' })}
        {Field({ id: 'confirm', label: 'Confirm password', type: 'password', auto: 'new-password' })}
        <button className="btn" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
      </form>
    </AuthShell>
  );
}
