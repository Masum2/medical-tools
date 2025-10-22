import express from "express";
import {

  createProductController,
  productCategoryController,
  productCountController,
  productFiltersController,
 productListController,

 productSubcategoryController,

 relatedProductController,
 searchProductController,
 
} from "../controllers/productController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import { getProductController } from "../controllers/productController.js";
import { getSingleProductController } from "../controllers/productController.js";
import { deleteProductController } from "../controllers/productController.js";
import { productPhotoController } from "../controllers/productController.js";
import { updateProductController } from "../controllers/productController.js";
import formidable from "express-formidable";
import multer from "multer";
const upload = multer({ dest: "uploads/" });
const router = express.Router();

//routes for create product
// Apply formidable only to specific routes
router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  upload.array("photos", 5),
  (req, res, next) => {
    console.log("FILES:", req.files);
    console.log("BODY:", req.body);
    next();
  },
  createProductController
);


//routes
router.put(
  "/update-product/:pid",
  requireSignIn,
  isAdmin,
    upload.array("photos", 5),
  (req, res, next) => {
    console.log("FILES:", req.files);
    console.log("BODY:", req.body);
    next();
  },
  updateProductController
);
// get all product
router.get('/get-product',getProductController);
//single product
router.get("/get-product/:slug", getSingleProductController);
//get photo
router.get("/product-photo/:pid", productPhotoController);

//delete rproduct
router.delete("/delete-product/:pid", deleteProductController);
// filter product
router.post('/product-filters',productFiltersController)
//product count
router.get("/product-count", productCountController);
//product per page
router.get("/product-list/:page", productListController);
// search product

//search product
router.get("/search/:keyword", searchProductController);

//similar product
router.get("/related-product/:pid/:cid", relatedProductController);
//category wise product
router.get("/product-category/:slug", productCategoryController);

// router.post("/create-order", requireSignIn, createOrderController);
router.get("/subcategory/:subSlug", productSubcategoryController);
// search product for update
// ✅ Search Route

export default router;