import express from "express";
import {
  createProductController,
  getProductController,
  getSingleProductController,
  getProductVariationController,
  productPhotoController,
  deleteProductController,
  updateProductController,
  productFiltersController,
  productCountController,
  productListController,
  searchProductController,
  relatedProductController,
  productCategoryController,
  productSubcategoryController,
} from "../controllers/productController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import multer from "multer";

const router = express.Router();

// ✅ Multer Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// ✅ Upload Middleware for variations
// ✅ Upload Middleware - colorImages field যোগ করুন
const uploadMiddleware = upload.fields([
  { name: "photos", maxCount: 5 }, // Default photos
  { name: "colorImages", maxCount: 20 }, // Color-specific photos (নতুন)
  { name: "variationPhotos", maxCount: 0 }, // পুরানো system-এর জন্য (যদি লাগে)
]);

// ==================== PRODUCT ROUTES ====================

// ✅ CREATE PRODUCT
router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  uploadMiddleware,
  createProductController
);

// ✅ UPDATE PRODUCT
router.put(
  // "/update-product/:pid",
  "/update-product/:slug",
  requireSignIn,
  isAdmin,
  uploadMiddleware, // ✅ Same middleware for consistency
  updateProductController
);

// ✅ GET ALL PRODUCTS
router.get('/get-product', getProductController);

// ✅ GET SINGLE PRODUCT
router.get("/get-product/:slug", getSingleProductController);

// ✅ GET PRODUCT VARIATION WISE
router.get("/get-product-variation/:slug", getProductVariationController); // ✅ Fixed route name

// ✅ GET PRODUCT PHOTO
router.get("/product-photo/:pid", productPhotoController);

// ✅ DELETE PRODUCT
router.delete("/delete-product/:pid", 
  requireSignIn, 
  isAdmin,
  deleteProductController
);

// ✅ FILTER PRODUCTS
router.post('/product-filters', productFiltersController);

// ✅ PRODUCT COUNT
router.get("/product-count", productCountController);

// ✅ PRODUCT PAGINATION
router.get("/product-list/:page", productListController);

// ✅ SEARCH PRODUCT
router.get("/search/:keyword", searchProductController);

// ✅ RELATED PRODUCTS
router.get("/related-product/:pid/:cid", relatedProductController);

// ✅ CATEGORY WISE PRODUCT
router.get("/product-category/:slug", productCategoryController);

// ✅ SUBCATEGORY WISE PRODUCT
router.get("/subcategory/:subSlug", productSubcategoryController);

export default router;
