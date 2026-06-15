import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import CreateUser from './pages/CreateUser';
import { useAuth } from './contexts/AuthContext';
import './App.css';

function Navigation() {
  const { isLoggedIn, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="app-brand">NoteFlow</div>

      <nav className="main-nav">
        <Link to="/">Home</Link>

        {isLoggedIn ? (
          <>
            <span className="user-display">👤 {currentUser?.name}</span>

            <button
              className="logout-btn"
              data-testid="logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" data-testid="go_to_login_button">
              Go to Login
            </Link>

            <Link to="/create-user" data-testid="go_to_create_user_button">
              Create New User
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

function App() {
  return (
    <div className="app-shell">
      <BrowserRouter>
        <Navigation />

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/create-user" element={<CreateUser />} />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;