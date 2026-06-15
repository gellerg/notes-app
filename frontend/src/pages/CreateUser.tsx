import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function CreateUser() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await api.post('/users', { name, email, username, password });
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Create user failed');
    }
  };

  return (
    <div className="app auth-page">
      <form className="auth-form" data-testid="create_user_form" onSubmit={submit}>
        <h2>Create User</h2>

        <div className="form-field">
          <label htmlFor="create_name">Name</label>
          <input
            id="create_name"
            data-testid="create_user_form_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="create_email">Email</label>
          <input
            id="create_email"
            data-testid="create_user_form_email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="create_username">Username</label>
          <input
            id="create_username"
            data-testid="create_user_form_username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="create_password">Password</label>
          <input
            id="create_password"
            data-testid="create_user_form_password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="primary-button" data-testid="create_user_form_create_user" type="submit">
          Create User
        </button>
      </form>
    </div>
  );
}
