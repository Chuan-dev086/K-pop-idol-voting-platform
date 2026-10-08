import axios from "axios";

// Create a reusable Axios instance for making API requests
const api = axios.create({
  // Get the backend API base URL from the Vite environment variable
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Request interceptor
// This function runs before every API request is sent
api.interceptors.request.use((config) => {
  // Retrieve the authentication token from localStorage
  const token = localStorage.getItem("token");

  // Add the token to the Authorization header when it exists
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Return the modified request configuration
  return config;
});

// Response interceptor
// This function handles successful responses and API errors globally
api.interceptors.response.use(
  // Return successful responses without modifying them
  (response) => response,

  // Handle errors returned by the API
  (error) => {
    // Check whether the server returned a 401 Unauthorized response
    // This usually means that the token is missing, invalid, or expired
    if (error.response?.status === 401) {
      // Remove the invalid authentication token
      localStorage.removeItem("token");

      // Remove the stored user information
      localStorage.removeItem("user");

      // Redirect the user to the login page
      window.location.href = "/login";
    }

    // Reject the promise so the original request can still
    // be handled by the calling component
    return Promise.reject(error);
  },
);

// Export the configured Axios instance
export default api;
