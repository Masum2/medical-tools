import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {  categoryControlller, createCategoryController, deleteCategoryCOntroller, singleCategoryController, updateCategoryController } from "../controllers/createCategoryController.js";
const router = express.Router();
import formidable from "express-formidable";
import categoryModel from "../models/categoryModel.js";
// route
// create category api
router.post('/create-category',requireSignIn,isAdmin,formidable(),createCategoryController);
// update category
router.put('/update-category/:id',requireSignIn,isAdmin,formidable(),updateCategoryController);
// get category 
router.get('/get-category',categoryControlller);
// single category
router.get('/single-category/:slug',singleCategoryController);
// delete category
router.delete('/delete-category/:id',requireSignIn,isAdmin,deleteCategoryCOntroller)
// Get category photo
router.get("/category-photo/:id", async (req, res) => {
  try {
    const category = await categoryModel.findById(req.params.id).select("photo");
    if (category.photo && category.photo.data) {
      res.set("Content-Type", category.photo.contentType);
      return res.send(category.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error while getting photo", error });
  }
});

export default router;