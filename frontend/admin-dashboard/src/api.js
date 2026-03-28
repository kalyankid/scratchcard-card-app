// src/api.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: `${BASE_URL}/api/admin`,
  headers: {
    "Content-Type": "application/json",
  },
});

// INTERCEPTOR: ONLY FOR PROTECTED ROUTES
api.interceptors.request.use(
  (config) => {
    // Skip token for /users-purchases
    if (config.url === "/users-purchases") {
      console.log("Skipping token for /users-purchases");
      return config;
    }

    const token = localStorage.getItem("adminToken");
    console.log("API Request →", config.url);
    console.log("Token found:", !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Authorization header set");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Exported helpers
export const fetchUsers = () => api.get("/users");
export const approveUser = (id) => api.patch(`/users/${id}/approve`);
export const rejectUser = (id) => api.patch(`/users/${id}/reject`);
export const assignRole = (id, role) => api.patch(`/users/${id}/role`, { role });

export const fetchApprovedUsers = async () => {
  const res = await fetchUsers();
  return { data: res.data.filter((u) => u.status === "approved") };
};

export const fetchPendingUsers = async () => {
  const res = await fetchUsers();
  return { data: res.data.filter((u) => u.status === "pending") };
};

export const fetchRejectedUsers = async () => {
  const res = await fetchUsers();
  return { data: res.data.filter((u) => u.status === "rejected") };
};

export const fetchUsersWithPurchases = () => api.get("/users-purchases");


export const fetchAllPurchases = () => api.get("/purchase"); // all purchases

export const fetchPendingPurchases = () => api.get("/purchase/pending");

export const approvePurchase = (id) => api.patch(`/purchase/${id}/approve`);
export const rejectPurchase = (id) => api.patch(`/purchase/${id}/reject`);

// ADMIN uploads a proof for a user's purchase
export const adminUploadPaymentScreenshot = (formData, token) =>
  axios.post(`${BASE_URL}/api/purchase/admin-upload-screenshot`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });


export default api;