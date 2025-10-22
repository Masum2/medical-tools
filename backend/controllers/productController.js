import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import fs from "fs";
import slugify from "slugify";

// ------------------ CREATE PRODUCT ------------------
import { v2 as cloudinary } from "cloudinary";







export const createProductController = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      quantity,
      brand,
      color,
      size,
      shipping,
      category,
      categories,
      subcategories,
    } = req.body;

    // ✅ Individual Field Validation
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    if (price === undefined) {
      return res.status(400).json({ success: false, message: "Price is required" });
    }

    if (quantity === undefined) {
      return res.status(400).json({ success: false, message: "Quantity is required" });
    }

    let parsedCategories = [];
    if (categories) {
      parsedCategories = Array.isArray(categories) ? categories : JSON.parse(categories);
    }

    if (!category && parsedCategories.length === 0) {
      return res.status(400).json({ success: false, message: "Category is required" });
    }

    // ✅ Upload photos to Cloudinary if files exist
    let uploadedPhotos = [];
    if (req.files && req.files.length > 0) {
      uploadedPhotos = await Promise.all(
        req.files.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "products",
          });
          fs.unlinkSync(file.path); // remove temp file
          return { url: result.secure_url, public_id: result.public_id };
        })
      );
    }

    // ✅ Create Product
    const product = new productModel({
      name,
      slug: slugify(name),
      description,
      price,
      discountPrice: discountPrice || 0,
      quantity,
      brand: Array.isArray(brand) ? brand : JSON.parse(brand || "[]"),
      color: Array.isArray(color) ? color : JSON.parse(color || "[]"),
      size: Array.isArray(size) ? size : JSON.parse(size || "[]"),
      shipping: shipping === "true" || shipping === true,
      category: category
        ? category
        : parsedCategories[0],
      categories: category
        ? [category]
        : parsedCategories,
      subcategories: subcategories
        ? Array.isArray(subcategories)
          ? subcategories
          : JSON.parse(subcategories)
        : [],
      photos: uploadedPhotos,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "You Have already upload this product",
      error: error.message,
    });
  }
};


// ------------------ GET ALL PRODUCTS ------------------
export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category", "name slug") // শুধু দরকারি ফিল্ড
      .select("-photos.data")            // buffer বাদ দিলাম
      .limit(12)
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};

// ------------------ GET SINGLE PRODUCT ------------------
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");

    res.status(200).send({
      success: true,
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error fetching single product",
      error,
    });
  }
};

// ------------------ GET PRODUCT PHOTO ------------------
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photos");

    if (!product || !product.photos || product.photos.length === 0) {
      return res.status(404).send({ success: false, message: "No photo found" });
    }

    // multiple photos: তুমি চাইলে index query দিয়ে deliver করতে পারো
    const index = req.query.index ? parseInt(req.query.index) : 0;
    const photo = product.photos[index];
    if (!photo || !photo.data) {
      return res.status(404).send({ success: false, message: "No photo at this index" });
    }

    res.set("Content-Type", photo.contentType);
    return res.send(photo.data);
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error while getting photo", error });
  }
};

// ------------------ DELETE PRODUCT ------------------
export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid);
    res.status(200).send({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error deleting product",
      error,
    });
  }
};

// ------------------ UPDATE PRODUCT ------------------
export const updateProductController = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      categories,
      subcategories,
      quantity,
      shipping,
      brand,
      color,
      size,
      discountPrice,
      replaceIndex // 👉 ফ্রন্টএন্ড থেকে পাঠানো index (যেমন 4)
    } = req.body; // ✅ multer => req.body

    // Validation
    if (!name || !description || !price || !categories || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Name, Description, Price, Categories, and Quantity are required",
      });
    }

    // আগের প্রোডাক্ট বের করো
    const existingProduct = await productModel.findById(req.params.pid);
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Update data তৈরি করো
    const updateData = {
      name,
      slug: slugify(name),
      description,
      price,
      category: Array.isArray(categories) ? categories[0] : JSON.parse(categories)[0],
      categories: Array.isArray(categories) ? categories : JSON.parse(categories),
      subcategories: subcategories
        ? (Array.isArray(subcategories) ? subcategories : JSON.parse(subcategories))
        : [],
      quantity,
      shipping: shipping === "true" || shipping === true,
      brand: brand ? (Array.isArray(brand) ? brand : JSON.parse(brand)) : [],
      color: color ? (Array.isArray(color) ? color : JSON.parse(color)) : [],
      size: size ? (Array.isArray(size) ? size : JSON.parse(size)) : [],
      discountPrice: discountPrice !== undefined 
        ? Number(discountPrice) 
        : existingProduct.discountPrice,
      photos: existingProduct.photos, // পুরানো সব ছবি রেখে দাও
    };

    // ✅ নতুন ছবি এলে শুধু নির্দিষ্ট index replace করো অথবা push করো
    if (req.files && req.files.length > 0) {
      const uploadedPhotos = await Promise.all(
        req.files.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "products",
          });
          fs.unlinkSync(file.path); // temp file delete
          return {
            url: result.secure_url,
            public_id: result.public_id,
          };
        })
      );

      if (replaceIndex !== undefined && updateData.photos[replaceIndex]) {
        // 👉 নির্দিষ্ট index replace
        updateData.photos[replaceIndex] = uploadedPhotos[0];
      } else {
        // 👉 নতুন ছবি add হবে
        updateData.photos.push(...uploadedPhotos);
      }
    }

    // DB Update
    const product = await productModel.findByIdAndUpdate(
      req.params.pid,
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "✅ Product updated successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message,
    });
  }
};







// ------------------ FILTER PRODUCTS ------------------
export const productFiltersController = async (req, res) => {
  try {
    const { checked, subChecked, radio } = req.body;
    let args = {};

    // ✅ Category filter
    if (checked?.length) {
      args.category = { $in: checked }; // <-- ObjectId array
    }

    // ✅ Subcategory filter
    if (subChecked?.length) {
      args.subcategories = { $in: subChecked.map(s => new RegExp(`^${s}$`, 'i')) };
      // subcategories string array, case-insensitive match
    }

    // ✅ Price filter
    if (radio?.length) {
      args.price = { $gte: radio[0], $lte: radio[1] };
    }

    const products = await productModel.find(args).select("-photos.data").populate("category", "name slug");

    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({
      success: false,
      message: "Error filtering products",
      error,
    });
  }
};


// ------------------ PRODUCT COUNT ------------------
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({
      success: false,
      message: "Error counting products",
      error,
    });
  }
};

// ------------------ PAGINATION ------------------
export const productListController = async (req, res) => {
  try {
    const perPage = 10;
    const page = req.params.page || 1;

    const total = await productModel.countDocuments();

    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      products,
      total, // <-- total count
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({
      success: false,
      message: "Error fetching products per page",
      error,
    });
  }
};

// ------------------ SEARCH PRODUCT ------------------
// export const searchProductController = async (req, res) => {
//   try {
//     const { keyword } = req.params;
//     const results = await productModel
//       .find({
//         $or: [
//           { name: { $regex: keyword, $options: "i" } },
//           { description: { $regex: keyword, $options: "i" } },
//         ],
//       })
//       .select("-photo");

//     res.status(200).send({
//       success: true,
//       results,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(400).send({
//       success: false,
//       message: "Error searching products",
//       error,
//     });
//   }
// };

// ------------------ RELATED PRODUCTS ------------------
export const relatedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;

    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(3)
      .populate("category");

    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({
      success: false,
      message: "Error fetching related products",
      error,
    });
  }
};

// ------------------ PRODUCTS BY CATEGORY ------------------
export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel
      .find({ category })
      .select("-photo")
      .populate("category");

    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({
      success: false,
      message: "Error fetching products by category",
      error,
    });
  }
};
export const productSubcategoryController = async (req, res) => {
  try {
    const { subSlug } = req.params; // URL থেকে subcategory slug / name
    console.log("Subcategory received:", subSlug);

    // Case-insensitive match
    const products = await productModel
      .find({ subcategories: { $regex: `^${subSlug}$`, $options: "i" } })
      .select("-photos.data") // buffer বাদ দিলাম
      .populate("category", "name slug"); // category info

    console.log("Products found:", products.length);

    res.status(200).send({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error fetching products by subcategory",
      error: error.message,
    });
  }
};
// controllers/productController.js
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { brand: { $regex: keyword, $options: "i" } },
        { color: { $regex: keyword, $options: "i" } },
        { size: { $regex: keyword, $options: "i" } },
      ],
    };

    const total = await productModel.countDocuments(query);

    const products = await productModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .select("-reviews -__v"); // Optional: heavy fields remove

    res.status(200).json({
      success: true,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Error while searching products",
      error: error.message,
    });
  }
};
