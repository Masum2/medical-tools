import mongoose from "mongoose";

// ✅ Review Schema
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User ID (required)
    name: { type: String, required: true }, // Display name
    stars: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    reply: { type: String, default: "" }, // Admin reply
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: 0 },

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    subcategories: [String],

    quantity: { type: Number },
    brand: [{ type: String }],
    color: [{ type: String }],
    size: [{ type: String }],

    photos: [{ data: Buffer, contentType: String }],
    shipping: { type: Boolean, default: false },

    reviews: [reviewSchema],
    averageRating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ Helper function to calculate average rating
productSchema.methods.calculateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
  } else {
    const sum = this.reviews.reduce((acc, r) => acc + r.stars, 0);
    this.averageRating = parseFloat((sum / this.reviews.length).toFixed(1));
  }
  return this.averageRating;
};

export default mongoose.model("Product", productSchema);
