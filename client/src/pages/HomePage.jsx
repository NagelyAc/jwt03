import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

export const HomePage = () => {
  const { session } = useAuth();

  return (
    <section className="simple-grid">
      <div className="panel">
        <h1>Bienvenido</h1>
        <p>Inicia sesion o crea una cuenta para continuar.</p>
        <div className="button-row">
          {session.isAuthenticated ? (
            <Link className="primary-button" to="/dashboard">
              Ir al panel
            </Link>
          ) : (
            <>
              <Link className="primary-button" to="/login">
                Iniciar sesion
              </Link>
              <Link className="secondary-button" to="/register">
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
    
    </section>
  );
};
