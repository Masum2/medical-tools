import productModel from "../models/productModel.js";


// ✅ Add review
export const addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, stars, comment } = req.body;

    if (!name || !stars || !comment) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const product = await productModel.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Push review
    product.reviews.push({ name, stars, comment });

    // Recalculate average
    product.calculateAverageRating();

    await product.save();

    res.json({
      success: true,
      message: "Review added successfully",
      averageRating: product.averageRating,
      reviews: product.reviews,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get reviews
export const getReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await productModel.findById(productId).select("reviews averageRating");
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
