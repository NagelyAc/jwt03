import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3000/api";
const REFRESH_TOKEN_KEY = "jwt03_refresh_token";

const AuthContext = createContext(null);

const initialSession = {
  isAuthenticated: false,
  accessToken: "",
  username: "",
  email: "",
  roles: [],
  isBootstrapping: true,
};

const readRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY) || "";

const buildInitialSession = (isBootstrapping = false) => ({
  ...initialSession,
  isBootstrapping,
});

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [session, setSession] = useState(initialSession);
  const [authNotice, setAuthNotice] = useState("Esperando inicio de sesion.");
  const refreshPromiseRef = useRef(null);

  const persistRefreshToken = (token) => {
    if (!token) {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      return;
    }

    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  };

  const clearSession = (isBootstrapping = false) => {
    persistRefreshToken("");
    setSession(buildInitialSession(isBootstrapping));
  };

  const refreshAccessToken = async () => {
    const savedRefreshToken = readRefreshToken();

    if (!savedRefreshToken) {
      throw new Error("No refresh token available.");
    }

    const response = await fetch(`${API_URL}/auth/refreshtoken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken: savedRefreshToken }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.message || "Unable to refresh session.");
    }

    persistRefreshToken(payload.refreshToken);
    setSession((current) => ({
      ...current,
      isAuthenticated: true,
      accessToken: payload.accessToken,
      username: payload.username,
      email: payload.email,
      roles: payload.roles,
      isBootstrapping: false,
    }));
    setAuthNotice(`Access token renovado a las ${new Date().toLocaleTimeString()}.`);

    return payload.accessToken;
  };

  const getFreshAccessToken = async () => {
    if (!refreshPromiseRef.current) {
      refreshPromiseRef.current = refreshAccessToken().finally(() => {
        refreshPromiseRef.current = null;
      });
    }

    return refreshPromiseRef.current;
  };

  const request = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(session.accessToken
          ? { Authorization: `Bearer ${session.accessToken}` }
          : {}),
      },
    });

    if (response.status !== 401) {
      return response;
    }

    try {
      const refreshedToken = await getFreshAccessToken();

      return fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
          Authorization: `Bearer ${refreshedToken}`,
        },
      });
    } catch (error) {
      clearSession();
      setAuthNotice("La sesion expiro. Inicia sesion otra vez.");
      navigate("/login");
      throw error;
    }
  };

  const signin = async (credentials) => {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.message || "Unable to sign in.");
    }

    persistRefreshToken(payload.refreshToken);
    setSession({
      isAuthenticated: true,
      accessToken: payload.accessToken,
      username: payload.username,
      email: payload.email,
      roles: payload.roles,
      isBootstrapping: false,
    });
    setAuthNotice("Sesion iniciada. El access token se guarda solo en memoria.");
  };

  const signup = async (account) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(account),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.message || "Unable to sign up.");
    }

    return payload;
  };

  const signout = async () => {
    const savedRefreshToken = readRefreshToken();

    try {
      if (savedRefreshToken) {
        await fetch(`${API_URL}/auth/signout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken: savedRefreshToken }),
        });
      }
    } finally {
      clearSession();
      setAuthNotice("La sesion se cerro y el refresh token fue invalidado.");
      navigate("/login");
    }
  };

  useEffect(() => {
    if (!readRefreshToken()) {
      clearSession();
      return;
    }

    getFreshAccessToken().catch(() => {
      clearSession();
    });
  }, []);

  const value = {
    API_URL,
    authNotice,
    request,
    session,
    signin,
    signout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
