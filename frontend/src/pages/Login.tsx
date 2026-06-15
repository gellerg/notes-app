import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const r = await api.post('/login', { username, password });
      const { token, user } = r.data;
      login(token, user);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Login failed');
    }
  };

  return (
    <div className="app auth-page">
      <form className="auth-form" data-testid="login_form" onSubmit={submit}>
        <h2>Login</h2>

        <div className="form-field">
          <label htmlFor="login_username">Username</label>
          <input
            id="login_username"
            data-testid="login_form_username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="login_password">Password</label>
          <input
            id="login_password"
            data-testid="login_form_password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="primary-button" data-testid="login_form_login" type="submit">
          Login
        </button>
      </form>
    </div>
  );
}
