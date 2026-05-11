import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

const endpointCards = [
  { title: "Publico", path: "/test/all", tone: "soft" },
  { title: "Usuario", path: "/test/user", tone: "soft" },
  { title: "Moderador", path: "/test/mod", tone: "warn" },
  { title: "Administrador", path: "/test/admin", tone: "alert" },
];

export const DashboardPage = () => {
  const { session, request, authNotice } = useAuth();
  const [responses, setResponses] = useState({});
  const [activity, setActivity] = useState("Esperando consulta.");

  const loadEndpoint = async (path) => {
    setActivity(`Consultando ${path}...`);

    try {
      const response = await request(path, { method: "GET" });
      const body = await response.text();

      setResponses((current) => ({
        ...current,
        [path]: {
          ok: response.ok,
          status: response.status,
          body,
        },
      }));
      setActivity(`Ultima consulta exitosa: ${path}.`);
    } catch (error) {
      setActivity(error.message);
    }
  };

  useEffect(() => {
    if (!session.isAuthenticated) {
      return;
    }

    loadEndpoint("/test/user");

    const intervalId = setInterval(() => {
      loadEndpoint("/test/user");
    }, 15000);

    return () => clearInterval(intervalId);
  }, [session.isAuthenticated]);

  if (session.isBootstrapping) {
    return (
      <section className="panel">
        <h2>Cargando</h2>
        <p>Espera un momento.</p>
      </section>
    );
  }

  if (!session.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <section className="dashboard-layout">
      <div className="panel">
        <h2>Panel</h2>
        <h3>{session.username}</h3>
        <p>{session.email}</p>
        <div className="button-row">
          {session.roles.map((role) => (
            <span className="role-tag" key={role}>
              {role}
            </span>
          ))}
        </div>
        <p className="muted small">{authNotice}</p>
        <p className="muted small">{activity}</p>
      </div>

      <div className="endpoint-grid">
        {endpointCards.map((card) => {
          const result = responses[card.path];

          return (
            <article className="panel endpoint-item" key={card.path}>
              <div className="endpoint-header">
                <strong>{card.title}</strong>
                <span>{card.path}</span>
              </div>
              <button
                className="primary-button"
                onClick={() => loadEndpoint(card.path)}
                type="button"
              >
                Probar endpoint
              </button>
              <div className="response-box">
                <span>{result ? `HTTP ${result.status}` : "Sin respuesta aun"}</span>
                <pre>{result?.body || "Haz clic para consultar el backend."}</pre>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
