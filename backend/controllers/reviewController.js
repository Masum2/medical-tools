import productModel from "../models/productModel.js";
import userModels from "../models/userModels.js";

// ✅ Add or update review
export const addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { stars, comment } = req.body;

    if (!stars || !comment) {
      return res.status(400).json({ error: "Stars and comment are required" });
    }

    const product = await productModel.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Fetch user details
    const user = await userModels.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      // Update existing review
      existingReview.stars = stars;
      existingReview.comment = comment;
    } else {
      // Add new review
      product.reviews.push({
        user: req.user._id,
        name: user.name, // ✅ original user name
        stars,
        comment,
      });
    }

    // Recalculate average rating
    product.calculateAverageRating();
    await product.save();

    res.json({
      success: true,
      message: existingReview ? "Review updated successfully" : "Review added successfully",
      averageRating: product.averageRating,
      reviews: product.reviews,
    });
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get reviews
export const getReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await productModel
      .findById(productId)
      .select("reviews averageRating");
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json({
      success: true,
      averageRating: product.averageRating,
      reviews: product.reviews,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Admin reply to review
export const replyToReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ error: "Reply text is required" });
    }

    const product = await productModel.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const review = product.reviews.id(reviewId);
    if (!review) return res.status(404).json({ error: "Review not found" });

    review.reply = reply;
    await product.save();

    res.json({
      success: true,
      message: "Reply added successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
