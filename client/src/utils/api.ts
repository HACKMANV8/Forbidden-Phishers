import axios from "axios";
//@ts-ignore
import { getAuthHeaders, getAuthToken, removeAuthToken } from "./auth";
import { User } from "../types/index";

// Debug logging for production
const isDev = import.meta.env.DEV;
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
export const PYTHON_API_URL =
  import.meta.env.VITE_PYTHON_API_URL || "http://localhost:8000";

// if (!isDev) {
//   console.log("🔧 Production API Config:", {
//     baseURL: API_BASE_URL,
//     isDev,
//     env: import.meta.env.MODE,
//   });
// }

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // Increase to 2 minutes for test submission
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    // Add auth token to requests
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Debug logging for courses API
    if (config.url?.includes("/courses")) {
      console.log("🚀 API Request (Courses):", {
        method: config.method?.toUpperCase(),
        url: config.url,
        hasAuth: !!config.headers.Authorization,
        token: token ? "present" : "missing",
      });
    }
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors globally
api.interceptors.response.use(
  (response) => {
    // Debug logging for courses API
    if (
      response.config.url?.includes("/courses") &&
      response.config.method === "get"
    ) {
      console.log("✅ API Response (Courses):", {
        status: response.status,
        url: response.config.url,
        coursesCount: response.data.courses?.length || 0,
        sampleCourse: response.data.courses?.[0]
          ? {
              id: response.data.courses[0].id,
              title: response.data.courses[0].title,
              is_enrolled: response.data.courses[0].is_enrolled,
              is_bookmarked: response.data.courses[0].is_bookmarked,
            }
          : null,
      });
    }
    return response;
  },
  (error) => {
    if (!isDev) {
      console.error("❌ API Error:", {
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        message: error.message,
        baseURL: error.config?.baseURL,
      });
    }

    if (error.response?.status === 401) {
      console.log("🔐 401 Unauthorized - Clearing auth state");
      removeAuthToken();

      // Only redirect if we're not already on the auth page
      if (
        !window.location.pathname.includes("/auth") &&
        !window.location.pathname.includes("/forgot-password")
      ) {
        console.log("🔄 Redirecting to auth page");
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

export const logout = async (): Promise<{ message: string }> => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.log(
      "⚠️ Server logout failed, but continuing with local logout:",
      error
    );
  }

  // Always clear local token
  removeAuthToken();

  return { message: "Logged out successfully" };
};
export const getUserProfile = async (): Promise<{ user: User }> => {
  const response = await api.get("/auth/profile");
  return response.data;
};
