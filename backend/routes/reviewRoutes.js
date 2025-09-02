import express from "express";
import { addReview, getReviews, replyToReview } from "../controllers/reviewController.js";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Add review (only signed-in user)
router.post("/:productId", requireSignIn, addReview);

// ✅ Get reviews (public)
router.get("/:productId", getReviews);

// ✅ Admin reply to a review
router.post("/:productId/review/:reviewId/reply", requireSignIn, isAdmin, replyToReview);

export default router;
