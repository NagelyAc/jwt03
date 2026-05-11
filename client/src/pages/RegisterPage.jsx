import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

const roleOptions = [
  { label: "Usuario", value: "user" },
  { label: "Moderador", value: "moderator" },
  { label: "Administrador", value: "admin" },
];

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    roles: ["user"],
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleRoleChange = (role) => {
    setForm((current) => ({
      ...current,
      roles: [role],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (form.username.trim().length < 3) {
      setError("El usuario debe tener al menos 3 caracteres.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError("Ingresa un correo valido.");
      return;
    }

    if (form.password.length < 6) {
      setError("La contrasena debe tener minimo 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      await signup(form);
      setNotice("Cuenta creada. Ya puedes iniciar sesion.");
      setTimeout(() => navigate("/login"), 800);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <form className="panel form-panel" onSubmit={handleSubmit}>
        <h2>Registro</h2>
        <label>
          Usuario
          <input name="username" onChange={handleChange} value={form.username} />
        </label>
        <label>
          Correo
          <input name="email" onChange={handleChange} type="email" value={form.email} />
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

        <div className="role-row">
          {roleOptions.map((role) => (
            <button
              className={form.roles.includes(role.value) ? "role-button active" : "role-button"}
              key={role.value}
              onClick={() => handleRoleChange(role.value)}
              type="button"
            >
              {role.label}
            </button>
          ))}
        </div>

        {error && <p className="error-text">{error}</p>}
        {notice && <p className="success-text">{notice}</p>}
        <button className="primary-button" disabled={loading} type="submit">
          {loading ? "Creando..." : "Registrarme"}
        </button>
      </form>

    </section>
  );
};
