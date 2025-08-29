import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import fs from "fs";
import slugify from "slugify";

// ------------------ CREATE PRODUCT ------------------
// Create Product
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, quantity, brand, color, size, shipping, categories, subcategories } = req.fields;

    if (!name || !price || !quantity || !categories) {
      return res.status(400).send({ error: "Name, Price, Quantity, and Category are required" });
    }

  

const product = new productModel({
  name,
  slug: slugify(name),
  description,
  price,
  quantity,
  brand: Array.isArray(brand) ? brand : JSON.parse(brand || "[]"),
  color: Array.isArray(color) ? color : JSON.parse(color || "[]"),
  size: Array.isArray(size) ? size : JSON.parse(size || "[]"),
  shipping,
  category: Array.isArray(categories) ? categories[0] : JSON.parse(categories)[0],
  categories: Array.isArray(categories) ? categories : JSON.parse(categories),
  subcategories: subcategories ? (Array.isArray(subcategories) ? subcategories : JSON.parse(subcategories)) : [],
});

    // photos handle
    if (req.files.photos) {
      const files = Array.isArray(req.files.photos) ? req.files.photos : [req.files.photos];
      product.photos = files.map(file => ({
        data: fs.readFileSync(file.path),
        contentType: file.type,
      }));
      console.log("Image here", req.files.photos)
    }

    await product.save();
    res.status(201).send({ success: true, message: "Product created successfully", product });

  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error, message: "Error creating product" });
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
      replaceIndex // 👉 ফ্রন্টএন্ড থেকে index পাঠাবে (যেমন 4)
    } = req.fields;

    const { photos } = req.files || {};

    // Validation
    switch (true) {
      case !name:
        return res.status(400).send({ error: "Name is Required" });
      case !description:
        return res.status(400).send({ error: "Description is Required" });
      case !price:
        return res.status(400).send({ error: "Price is Required" });
      case !categories:
        return res.status(400).send({ error: "At least one Category is Required" });
      case !quantity:
        return res.status(400).send({ error: "Quantity is Required" });
    }

    // আগের প্রোডাক্ট বের করো
    const existingProduct = await productModel.findById(req.params.pid);
    if (!existingProduct) {
      return res.status(404).send({ error: "Product not found" });
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
      shipping: shipping || false,
    brand: brand ? (Array.isArray(brand) ? brand : JSON.parse(brand)) : [],
color: color ? (Array.isArray(color) ? color : JSON.parse(color)) : [],
size: size ? (Array.isArray(size) ? size : JSON.parse(size)) : [],

      discountPrice: discountPrice || 0,
      photos: existingProduct.photos, // আগের সব ছবি রেখে দাও
    };

    // ✅ নতুন ছবি এলে শুধু নির্দিষ্ট index replace করো
    if (photos) {
      const files = Array.isArray(photos) ? photos : [photos];
      for (let file of files) {
        if (file.size > 5 * 1024 * 1024) {
          return res.status(400).send({ error: "Each photo should be less than 5MB" });
        }
      }

      // index undefined হলে push করে দাও, নাহলে replace করো
      const fileData = {
        data: fs.readFileSync(files[0].path),
        contentType: files[0].type,
      };

      if (replaceIndex !== undefined && updateData.photos[replaceIndex]) {
        updateData.photos[replaceIndex] = fileData; // replace নির্দিষ্ট index
      } else {
        updateData.photos.push(fileData); // নতুন ছবি add হবে
      }
    }

    // DB Update
    const product = await productModel.findByIdAndUpdate(
      req.params.pid,
      updateData,
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "✅ Product updated successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error updating product",
      error,
    });
  }
};






// ------------------ FILTER PRODUCTS ------------------
export const productFiltersController = async (req, res) => {
  try {
    const { checked, radio, brand, color, size } = req.body;
    let args = {};

    if (checked?.length) args.category = checked;
    if (radio?.length) args.price = { $gte: radio[0], $lte: radio[1] };
    if (brand?.length) args.brand = { $in: brand };
    if (color?.length) args.color = { $in: color };
    if (size?.length) args.size = { $in: size };

    const products = await productModel.find(args).select("-photo");

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
    const perPage = 8;
    const page = req.params.page || 1;

    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      products,
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
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");

    res.status(200).send({
      success: true,
      results,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({
      success: false,
      message: "Error searching products",
      error,
    });
  }
};

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
