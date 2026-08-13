import { useState, type FormEvent } from 'react';
import { useLogin } from '../api/hooks';

// Sign-in screen. Users are created only from the CLI (finance admin create) —
// while there are none, we show the command instead of the form.
// The admin variant (/admin path) is visually distinct: high-contrast theme
// via body.admin-theme plus an explicit badge, so it is always clear where
// you are signing in.
export default function AuthScreen({ needsSetup, admin }: { needsSetup: boolean; admin: boolean }) {
  const login = useLogin();

  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const brand = (
    <div className="auth-brand">
      Finance{admin && <span className="admin-badge">admin</span>}
    </div>
  );

  if (needsSetup) {
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          {brand}
          <div className="auth-note">
            No users yet. Create an admin on the server and reload the page:
          </div>
          <code className="auth-cmd">docker compose run --rm api admin create</code>
        </div>
      </div>
    );
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    login.mutate(
      { login: loginValue, password },
      { onError: (err) => setError(err instanceof Error ? err.message : String(err)) },
    );
  };

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        {brand}
        <div className="auth-note">{admin ? 'Admin sign in' : 'Sign in'}</div>
        <input
          className="f"
          placeholder="Login"
          autoFocus
          autoComplete="username"
          value={loginValue}
          onChange={(e) => setLoginValue(e.currentTarget.value)}
        />
        <input
          className="f"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
        />
        {error !== null && <div className="auth-err">{error}</div>}
        <button type="submit" className="btn-primary" disabled={login.isPending}>
          Sign in
        </button>
      </form>
    </div>
  );
}
