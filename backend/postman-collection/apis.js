// This file contains all backend API endpoints used in the project.

export const APIs = {

  //  AUTH ROUTES

  auth: {
    signup: {
      method: "POST",
      endpoint: "/api/auth/signup",
      description: "Register a new user",
    },
    login: {
      method: "POST",
      endpoint: "/api/auth/login",
      description: "Login existing user",
    },
    getStatus: {
      method: "GET",
      endpoint: "/api/auth/status/:id",
      description: "Get user status by ID",
    },
  },

  // ADMIN ROUTES
  admin: {
    getUsers: {
      method: "GET",
      endpoint: "/api/admin/users",
      description: "Fetch all users",
    },
    approveUser: {
      method: "PATCH",
      endpoint: "/api/admin/users/:id/approve",
      description: "Approve a user by ID",
    },
    rejectUser: {
      method: "PATCH",
      endpoint: "/api/admin/users/:id/reject",
      description: "Reject a user by ID",
    },
    assignRole: {
      method: "PATCH",
      endpoint: "/api/admin/users/:id/role",
      description: "Assign a role to a user",
    },
  },

  // OFFER ROUTES
  
  offers: {
    create: {
      method: "POST",
      endpoint: "/api/offers",
      description: "Create one or multiple offers",
    },
    getAll: {
      method: "GET",
      endpoint: "/api/offers",
      description: "Get all offers",
    },
    getByRole: {
      method: "GET",
      endpoint: "/api/offers/role/:role",
      description: "Get offers by role",
    },
    update: {
      method: "PUT",
      endpoint: "/api/offers/:id",
      description: "Update offer details",
    },
    delete: {
      method: "DELETE",
      endpoint: "/api/offers/:id",
      description: "Delete an offer by ID",
    },
  },
};
