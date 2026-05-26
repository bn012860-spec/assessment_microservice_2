import axios from "axios";

function resolveBaseUrl() {
  const raw = import.meta.env.VITE_API_URL;
  if (!raw) return "";

  // If a Docker-internal host leaks to browser config, fallback to same-origin proxy.
  if (typeof window !== "undefined" && raw.includes("assessment-api")) {
    return "";
  }

  return raw;
}

const api = axios.create({
  baseURL: resolveBaseUrl()
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function isTokenExpired(token) {
  if (!token) return true;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const { exp } = JSON.parse(jsonPayload);
    return Date.now() >= exp * 1000;
  } catch (e) {
    return true;
  }
}

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If we get a 401, clear the local storage and notify the app
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setAuthToken(null);
      window.dispatchEvent(new Event("auth-change"));
    }
    return Promise.reject(error);
  }
);

const storedToken = localStorage.getItem("token");
if (storedToken) {
  if (isTokenExpired(storedToken)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthToken(null);
  } else {
    setAuthToken(storedToken);
  }
}

export const assessments = {
  list: (params) => api.get("/api/assessments", { params }),
  get: (id) => api.get(`/api/assessments/${id}`),
  create: (data) => api.post("/api/assessments", data),
  update: (id, data) => api.put(`/api/assessments/${id}`, data),
  delete: (id) => api.delete(`/api/assessments/${id}`),
  start: (id) => api.post(`/api/assessments/${id}/start`),
  getAttempt: (attemptId) => api.get(`/api/assessments/attempts/${attemptId}`),
  getAttemptSubmissions: (attemptId) => api.get(`/api/assessments/attempts/${attemptId}/submissions`),
  listAttempts: (assessmentId) => api.get(`/api/assessments/${assessmentId}/attempts`)
};

export default api;
