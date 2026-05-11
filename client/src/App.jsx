import { NavLink, Route, Routes } from "react-router-dom";

import { useAuth } from "./context/AuthContext.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";

const NavBar = () => {
  const { session, signout } = useAuth();

  const isAdmin = session.roles.includes("ROLE_ADMIN");
  const isModerator = session.roles.includes("ROLE_MODERATOR");
  const isUser = session.roles.includes("ROLE_USER") || isAdmin || isModerator;

  return (
    <header className="navbar">
      <NavLink className="brand" to="/">
        Sistema
      </NavLink>

      <nav className="nav-links">
        <NavLink to="/">Inicio</NavLink>
        {!session.isAuthenticated && <NavLink to="/login">Login</NavLink>}
        {!session.isAuthenticated && <NavLink to="/register">Registro</NavLink>}
        {isUser && <NavLink to="/dashboard">Panel</NavLink>}
        {isModerator && <span className="role-tag">Moderador</span>}
        {isAdmin && <span className="role-tag">Admin</span>}
      </nav>

      {session.isAuthenticated ? (
        <div className="nav-user">
          <span>{session.username}</span>
          <button className="secondary-button" onClick={signout} type="button">
            Cerrar sesion
          </button>
        </div>
      ) : null}
    </header>
  );
};

export default function App() {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
    </div>
  );
}
