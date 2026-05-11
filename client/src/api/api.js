import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // sends cookies automatically — no Authorization header needed
});

// ─────────────────────────────────────────────
// REFRESH TOKEN QUEUE
// If multiple requests fail with 401 at the same time,
// we queue them and retry all once the token is refreshed.
// ─────────────────────────────────────────────

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

// ─────────────────────────────────────────────
// REQUEST INTERCEPTOR
// Backend uses httpOnly cookie-based auth (req.cookies.accessToken).
// Do NOT attach an Authorization header — it is ignored by the backend.
// withCredentials: true above is all that's needed to send cookies.
// ─────────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    // Strip Content-Type for FormData so the browser sets the correct boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─────────────────────────────────────────────
// RESPONSE INTERCEPTOR
// ─────────────────────────────────────────────

api.interceptors.response.use(
  (response) => {
    // Guard against nginx/proxy returning an HTML error page
    const ct = response.headers?.["content-type"] || "";
    if (ct.includes("text/html")) {
      const err = new Error("API returned HTML instead of JSON.");
      err.isHtmlResponse = true;
      return Promise.reject(err);
    }
    return response;
  },

  async (error) => {
    const original = error.config;

    // ── 401 handling: attempt a silent token refresh ──────────────────────
    if (error.response?.status === 401 && !original._retry) {
      // If a refresh is already in flight, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(original))
          .catch((err) => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        // POST /auth/refresh reads the refreshToken cookie and
        // sets a fresh accessToken cookie in the response.
        await api.post("/auth/refresh");

        processQueue(null); // retry all queued requests
        return api(original); // retry the original request
      } catch (refreshError) {
        processQueue(refreshError);
        // Refresh failed — clear any stale client state and redirect to login
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;