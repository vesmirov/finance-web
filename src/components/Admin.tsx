import { useState, type FormEvent } from 'react';
import {
  useAdminCreateUser,
  useAdminDeleteUser,
  useAdminResetPassword,
  useAdminUsers,
  useLogout,
} from '../api/hooks';
import type { AdminUser } from '../api/types';

const MIN_PASSWORD_LEN = 8;

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

// User management in the Django-admin spirit: a plain table plus a create
// form, rendered in the high-contrast admin theme. The page is reachable only
// by typing /admin — the regular UI never links to it.
export default function AdminScreen({ selfLogin }: { selfLogin: string }) {
  const usersQ = useAdminUsers(true);
  const createUser = useAdminCreateUser();
  const deleteUser = useAdminDeleteUser();
  const resetPassword = useAdminResetPassword();
  const logout = useLogout();

  const [rowError, setRowError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const handleResetPassword = (user: AdminUser) => {
    setRowError(null);
    const raw = window.prompt(`New password for "${user.login}" (min ${MIN_PASSWORD_LEN} characters):`);
    if (raw === null) return;
    if (raw.length < MIN_PASSWORD_LEN) {
      setRowError(`Password must be at least ${MIN_PASSWORD_LEN} characters.`);
      return;
    }
    resetPassword.mutate(
      { id: user.id, password: raw },
      { onError: (err) => setRowError(errMsg(err)) },
    );
  };

  const handleDelete = (user: AdminUser) => {
    setRowError(null);
    if (!window.confirm(`Delete user "${user.login}"? This cannot be undone.`)) return;
    deleteUser.mutate(user.id, { onError: (err) => setRowError(errMsg(err)) });
  };

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const trimmed = login.trim();
    if (trimmed === '') {
      setFormError('Login is required.');
      return;
    }
    if (password.length < MIN_PASSWORD_LEN) {
      setFormError(`Password must be at least ${MIN_PASSWORD_LEN} characters.`);
      return;
    }
    createUser.mutate(
      { login: trimmed, password, is_admin: isAdmin },
      {
        onSuccess: () => {
          setLogin('');
          setPassword('');
          setIsAdmin(false);
        },
        onError: (err) => setFormError(errMsg(err)),
      },
    );
  };

  return (
    <div className="wrap">
      <section className="screen">
        <div className="plan-head">
          <span className="brand">
            Finance<span className="admin-badge">admin</span>
          </span>
          <span className="spacer" />
          <button type="button" className="btn-ghost" onClick={() => logout.mutate()}>
            Sign out
          </button>
        </div>

        <div className="block set-card">
          <div className="block-head">
            <span className="block-title">Users</span>
          </div>
          {usersQ.isPending && <div className="loading">Loading…</div>}
          {usersQ.isError && <div className="admin-err">Failed to load users: {errMsg(usersQ.error)}</div>}
          {usersQ.data !== undefined && (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>id</th>
                  <th>login</th>
                  <th>role</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {usersQ.data.map((user) => {
                  const self = user.login === selfLogin;
                  return (
                    <tr key={user.id}>
                      <td className="admin-id">{user.id}</td>
                      <td>{user.login}</td>
                      <td>{user.is_admin && <span className="admin-mark">admin</span>}</td>
                      <td className="admin-actions">
                        <button
                          type="button"
                          className="btn-ghost btn-small"
                          onClick={() => handleResetPassword(user)}
                        >
                          Reset password
                        </button>
                        <button
                          type="button"
                          className="btn-ghost btn-small"
                          disabled={self}
                          title={self ? 'You cannot delete your own account' : undefined}
                          onClick={() => handleDelete(user)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {rowError !== null && <div className="admin-err">{rowError}</div>}
        </div>

        <div className="block set-card">
          <div className="block-head">
            <span className="block-title">Add user</span>
          </div>
          <form className="admin-form" onSubmit={handleCreate}>
            <input
              className="f"
              placeholder="Login"
              autoComplete="off"
              value={login}
              onChange={(e) => setLogin(e.currentTarget.value)}
            />
            <input
              className="f"
              type="password"
              placeholder={`Password (min ${MIN_PASSWORD_LEN} characters)`}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
            <label className="admin-check">
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.currentTarget.checked)}
              />
              admin
            </label>
            <button type="submit" className="btn-primary" disabled={createUser.isPending}>
              Add user
            </button>
          </form>
          {formError !== null && <div className="admin-err">{formError}</div>}
        </div>
      </section>
    </div>
  );
}
