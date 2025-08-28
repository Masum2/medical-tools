import slugify from "slugify";
import categoryModel from "../models/categoryModel.js";

import fs from "fs";

// Create Category
export const createCategoryController = async (req, res) => {
  try {
    const { name, subcategories } = req.fields;
    const { photo } = req.files;

    if (!name) {
      return res.status(400).send({ message: "Name is required" });
    }

    // parse subcategories
    let parsedSubcategories = [];
    if (subcategories) {
      try {
        parsedSubcategories = JSON.parse(subcategories);
      } catch {
        parsedSubcategories = subcategories.split(",").map((s) => s.trim());
      }
    }

    const category = new categoryModel({
      name,
      slug: slugify(name),
      subcategories: parsedSubcategories,
    });

    if (photo) {
      category.photo.data = fs.readFileSync(photo.path);
      category.photo.contentType = photo.type;
    }

    await category.save();
    res.status(201).send({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Category",
    });
  }
};

// Update Category
export const updateCategoryController = async (req, res) => {
  try {
    const { name, subcategories } = req.fields;
    const { photo } = req.files;
    const { id } = req.params;

    let updateData = {};
    if (name) updateData.name = name;
    if (name) updateData.slug = slugify(name);

    if (subcategories) {
      try {
        updateData.subcategories = JSON.parse(subcategories);
      } catch {
        updateData.subcategories = subcategories.split(",").map((s) => s.trim());
      }
    }

    if (photo) {
      updateData.photo = {
        data: fs.readFileSync(photo.path),
        contentType: photo.type,
      };
    }

    const category = await categoryModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.status(200).send({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while updating category",
    });
  }
};

// get all categories
export const categoryControlller = async (req, res) => {
  try {
    const category = await categoryModel.find({});
    res.status(200).send({
      success: true,
      message: "All Categories List",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while getting all categories",
    });
  }
};


// single category
export const singleCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    res.status(200).send({
      success: true,
      message: "Get SIngle Category SUccessfully",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While getting Single Category",
    });
  }
};
//delete category
export const deleteCategoryCOntroller = async (req, res) => {
  try {
    const { id } = req.params;
    await categoryModel.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      message: "Categry Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error while deleting category",
      error,
    });
  }
};