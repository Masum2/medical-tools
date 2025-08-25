import express from "express";
import { addReview, getReviews } from "../controllers/reviewController.js";


const router = express.Router();

// Add review
router.post("/:productId", addReview);

// Get reviews of a product
router.get("/:productId", getReviews);

export default router;
