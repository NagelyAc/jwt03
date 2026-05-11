import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { signin, authNotice } = useAuth();
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.username.trim() || !form.password.trim()) {
      setError("Completa usuario y contrasena.");
      return;
    }

    setLoading(true);

    try {
      await signin(form);
      navigate("/dashboard");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <form className="panel form-panel" onSubmit={handleSubmit}>
        <h2>Iniciar sesion</h2>

        <label>
          Usuario
          <input name="username" onChange={handleChange} value={form.username} />
        </label>
        <label>
          Contrasena
          <input
            name="password"
            onChange={handleChange}
            type="password"
            value={form.password}
          />
        </label>
        {error && <p className="error-text">{error}</p>}
        <button className="primary-button" disabled={loading} type="submit">
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <p className="muted small">{authNotice}</p>
      </form>
    </section>
  );
};
