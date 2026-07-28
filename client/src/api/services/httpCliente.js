import axios from "axios";
import Cookies from "js-cookie";

// ─── Instancia con baseURL desde .env ────────────────────────────────────────
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: true,
});

// ─── Interceptor de REQUEST ───────────────────────────────────────────────────
instance.interceptors.request.use(
  (config) => {
    const tokenSecurity = Cookies.get("tokenTEMPLATE");
    const currenUserApp = Cookies.get("idTEMPLATE");

    if (tokenSecurity) {
      config.headers.Authorization = `Bearer ${tokenSecurity}`;
    }
    if (currenUserApp) {
      config.headers.currenuserapp = currenUserApp;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Interceptor de RESPONSE ──────────────────────────────────────────────────
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("tokenTEMPLATE");
      Cookies.remove("idTEMPLATE");

      window.location.href = "/pages/login";
    }
    return Promise.reject(error);
  }
);

// ─── Métodos genéricos ────────────────────────────────────────────────────────
const genericRequest = {
  get:    (url, params, config = {}) => instance.get(url,  { params: params || {}, ...config }),
  post:   (url, body,   config = {}) => instance.post(url,   body,   config),
  put:    (url, body,   config = {}) => instance.put(url,    body,   config),
  delete: (url,         config = {}) => instance.delete(url, config),
};

export default genericRequest;