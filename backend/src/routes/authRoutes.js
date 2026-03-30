import express from "express";
import { signup, login, getStatus, updatePassword  } from "../controllers/authController.js";
import { body } from "express-validator";
import { authenticate } from "../middlewares/authMiddleware.js"; // JWT middleware


const router = express.Router();

router.post(
  "/signup",
  [
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("mobile").isLength({ min: 10, max: 10 }).isNumeric().withMessage("Valid 10-digit mobile required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  signup
);

router.post(
  "/login",
  [
    body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Enter valid email"),
    body("password").notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  login
);
router.get("/status", getStatus);
router.patch("/update-password", authenticate, updatePassword);




export default router;
