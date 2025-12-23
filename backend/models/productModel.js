// productModel.js
import mongoose from "mongoose";

// ✅ Review Schema
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    reply: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// ✅ Variation Schema (পুরানো সিস্টেম - size-color combination)
const variationSchema = new mongoose.Schema({
  size: { type: String, required: true },
  color: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number, default: 0 },
  quantity: { type: Number, required: true, default: 0 },
  photos: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    }
  ],
  sku: { type: String } // Optional: Unique SKU
});

// ✅ Color Variation Schema (নতুন সিস্টেম)

// productModel.js - শুধু প্রয়োজনীয় অংশগুলো দেখানো হচ্ছে

// ✅ Color Variation Schema (আপডেট করা)
const colorVariationSchema = new mongoose.Schema({
  size: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number, default: 0 },
  quantity: { type: Number, required: true, default: 0 },
  sku: { type: String } // Optional: Unique SKU
}, { _id: false }); // _id: false কারণ array-তে থাকবে

// ✅ Color Images Schema
const colorImageSchema = new mongoose.Schema({
  color: { type: String, required: true },
  images: [{
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  }]
}, { _id: false });

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
     videoUrl: {
    type: String,
    default: ''
  },
    
    // ✅ Product Type
    useSimpleProduct: { 
      type: Boolean, 
      default: true 
    },
    
    // ✅ Base price (যদি simple product হয়)
    basePrice: { 
      type: Number, 
      default: 0 
    },
    baseDiscountPrice: { 
      type: Number, 
      default: 0 
    },
    baseQuantity: { 
      type: Number, 
      default: 0 
    },

    categories: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Category",
      required: true 
    }],
    subcategories: [{ type: String }],

    // ✅ Available options for filtering
    availableSizes: [{ type: String }],
    availableColors: [{ type: String }],
    brand: [{ type: String }],

    // ✅ OLD SYSTEM: Variations array (পুরানো system)
    variations: [variationSchema],

    // ✅ NEW SYSTEM: Color-based variations (Map হিসেবে)
    colorVariations: {
      type: Map,
      of: [colorVariationSchema],
      default: {}
    },

    // ✅ Color-specific images
    colorImages: [colorImageSchema],

    shipping: { type: Boolean, default: false },
    reviews: [reviewSchema],
    averageRating: { type: Number, default: 0 },

    // ✅ Default photos
    defaultPhotos: [
      {
        url: { type: String },
        public_id: { type: String },
      },
    ],

    // ✅ Price range
    minPrice: { type: Number, default: 0 },
    maxPrice: { type: Number, default: 0 },
    totalQuantity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ Pre-save middleware আপডেট করুন
productSchema.pre('save', function(next) {
  if (!this.useSimpleProduct && this.colorVariations && this.colorVariations.size > 0) {
    let totalQty = 0;
    let minPrice = Infinity;
    let maxPrice = 0;
    
    // Calculate from color variations
    for (const [color, variations] of this.colorVariations) {
      variations.forEach(variation => {
        totalQty += variation.quantity;
        const effectivePrice = variation.discountPrice > 0 ? variation.discountPrice : variation.price;
        if (effectivePrice < minPrice) minPrice = effectivePrice;
        if (effectivePrice > maxPrice) maxPrice = effectivePrice;
        
        // Generate SKU if not exists
        if (!variation.sku) {
          variation.sku = `${this.slug}-${color}-${variation.size}`.toUpperCase().replace(/\s+/g, '-');
        }
      });
    }
    
    this.totalQuantity = totalQty;
    this.minPrice = minPrice === Infinity ? 0 : minPrice;
    this.maxPrice = maxPrice;
    
    // Set available colors and sizes
    const colors = Array.from(this.colorVariations.keys());
    const sizes = new Set();
    
    for (const variations of this.colorVariations.values()) {
      variations.forEach(v => sizes.add(v.size));
    }
    
    this.availableColors = colors;
    this.availableSizes = Array.from(sizes);
  } else if (this.useSimpleProduct) {
    // For simple product
    this.totalQuantity = this.baseQuantity;
    const effectivePrice = this.baseDiscountPrice > 0 ? this.baseDiscountPrice : this.basePrice;
    this.minPrice = effectivePrice;
    this.maxPrice = this.basePrice;
  }
  
  next();
});
export default mongoose.model("Product", productSchema);