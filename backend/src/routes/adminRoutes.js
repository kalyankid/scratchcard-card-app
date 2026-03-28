import express from "express";
import { adminLogin ,registerAdmin ,getUsers, approveUser, rejectUser, assignRole, getUsersWithPurchases, approvePurchase, rejectPurchase, getPendingPurchases, getAllPurchases } from "../controllers/adminController.js";
import { authenticate, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", adminLogin);
router.post("/register", registerAdmin);

router.get("/users", getUsers);
router.patch("/users/:id/approve", approveUser);
router.patch("/users/:id/reject", rejectUser);
router.patch("/users/:id/role", assignRole);
router.get("/users", authenticate, isAdmin, getUsers);
router.patch("/users/:id/approve", authenticate, isAdmin, approveUser);
router.patch("/users/:id/reject", authenticate, isAdmin, rejectUser);
router.patch("/users/:id/role", authenticate, isAdmin, assignRole);
router.get("/users-purchases", (req, res, next) => {
  req.user = { role: "admin" }; // Fake admin
  next();
}, getUsersWithPurchases);


router.get("/purchase/pending", getPendingPurchases);
router.patch("/purchase/:purchaseId/approve",approvePurchase);
router.patch("/purchase/:purchaseId/reject", rejectPurchase);
router.get("/purchase", getAllPurchases); 


export default router;
