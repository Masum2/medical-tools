import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import fs from "fs";
import slugify from "slugify";

// ------------------ CREATE PRODUCT ------------------
import { v2 as cloudinary } from "cloudinary";







// productController.js
export const createProductController = async (req, res) => {
  try {
    const {
      name,
      description,
      useVariations,
      brand,
      shipping,
      categories,
      subcategories,
      colorVariations,
      colorImageData,
      availableColors,
      availableSizes,
      videoUrl,
    } = req.body;

    console.log("Received data:", {
      videoUrl,
      name,
      useVariations,
      colorVariations: colorVariations ? JSON.parse(colorVariations) : null,
      files: req.files ? Object.keys(req.files) : 'No files'
    });

    // ✅ Validation
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    let parsedCategories = [];
    if (categories) {
      parsedCategories = Array.isArray(categories) ? categories : JSON.parse(categories);
    }

    if (parsedCategories.length === 0) {
      return res.status(400).json({ success: false, message: "Category is required" });
    }

    const useVariationSystem = useVariations === "true" || useVariations === true;

    let parsedColorVariations = [];
    if (colorVariations && useVariationSystem) {
      parsedColorVariations = Array.isArray(colorVariations) ? colorVariations : JSON.parse(colorVariations);
      if (parsedColorVariations.length === 0) {
        return res.status(400).json({ success: false, message: "At least one color variation is required" });
      }
    }

    let parsedColorImageData = [];
    if (colorImageData) {
      parsedColorImageData = Array.isArray(colorImageData) ? colorImageData : JSON.parse(colorImageData);
    }

    // ✅ Upload default photos
    let uploadedDefaultPhotos = [];
    if (req.files?.photos && req.files.photos.length > 0) {
      uploadedDefaultPhotos = await Promise.all(
        req.files.photos.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, { folder: "products" });
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
          return { url: result.secure_url, public_id: result.public_id };
        })
      );
    }

    // ✅ Create base product data
    const productData = {
      name,
      slug: slugify(name),
      description,
      brand: brand ? (Array.isArray(brand) ? brand : JSON.parse(brand || "[]")) : [],
      shipping: shipping === "true" || shipping === true,
      categories: parsedCategories,
      subcategories: subcategories
        ? (Array.isArray(subcategories) ? subcategories : JSON.parse(subcategories || "[]"))
        : [],
      defaultPhotos: uploadedDefaultPhotos,
      useSimpleProduct: !useVariationSystem,
      videoUrl: videoUrl?.trim() || "",
    };

    // ✅ Check for duplicate product by slug
    const existingProduct = await productModel.findOne({ slug: productData.slug });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "This product is already uploaded",
      });
    }

    // ✅ Handle color-based variation system
    if (useVariationSystem && parsedColorVariations.length > 0) {
      productData.colorVariations = {}; // ✅ Use plain object instead of Map
      productData.colorImages = [];

      const colorPhotoFiles = req.files?.colorImages || [];
      console.log(`Found ${colorPhotoFiles.length} color image files`);

      for (const colorVar of parsedColorVariations) {
        const color = colorVar.color;

        // Find images for this specific color
        const photosForThisColor = [];
        if (colorPhotoFiles.length > 0 && parsedColorImageData.length > 0) {
          for (let i = 0; i < parsedColorImageData.length; i++) {
            if (parsedColorImageData[i].color === color && colorPhotoFiles[i]) {
              photosForThisColor.push(colorPhotoFiles[i]);
            }
          }
        }

        // Upload color-specific photos
        let uploadedColorImages = [];
        if (photosForThisColor.length > 0) {
          uploadedColorImages = await Promise.all(
            photosForThisColor.map(async (file) => {
              const result = await cloudinary.uploader.upload(file.path, { folder: "products/colors" });
              if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
              return { url: result.secure_url, public_id: result.public_id };
            })
          );
        }

        if (uploadedColorImages.length > 0) {
          productData.colorImages.push({ color, images: uploadedColorImages });
        }

        const colorVariationsArray = colorVar.sizes.map(size => ({
          size: size.size,
          price: parseFloat(size.price),
          discountPrice: size.discountPrice ? parseFloat(size.discountPrice) : 0,
          quantity: parseInt(size.quantity),
          sku: `${slugify(name)}-${color}-${size.size}`.toUpperCase().replace(/\s+/g, '-')
        }));

        // ✅ Add to object instead of Map
        productData.colorVariations[color] = colorVariationsArray;
      }

      productData.availableColors = parsedColorVariations.map(cv => cv.color);
      productData.availableSizes = [...new Set(parsedColorVariations.flatMap(cv => cv.sizes.map(s => s.size)))];

      const product = new productModel(productData);
      await product.save();

      return res.status(201).json({
        success: true,
        message: "Product with color variations created successfully",
        product,
      });
    } else {
      // ✅ Simple product system
      const { basePrice, baseDiscountPrice, baseQuantity, color, size } = req.body;

      if (!basePrice) return res.status(400).json({ success: false, message: "Base price is required" });
      if (!baseQuantity) return res.status(400).json({ success: false, message: "Base quantity is required" });

      productData.basePrice = parseFloat(basePrice);
      productData.baseDiscountPrice = baseDiscountPrice ? parseFloat(baseDiscountPrice) : 0;
      productData.baseQuantity = parseInt(baseQuantity);
      productData.useSimpleProduct = true;

      const simpleColors = color ? (Array.isArray(color) ? color : JSON.parse(color || "[]")) : [];
      const simpleSizes = size ? (Array.isArray(size) ? size : JSON.parse(size || "[]")) : [];

      productData.availableColors = simpleColors;
      productData.availableSizes = simpleSizes;

      const product = new productModel(productData);
      await product.save();

      return res.status(201).json({
        success: true,
        message: "Product created successfully",
        product,
      });
    }

  } catch (error) {
    console.error("Create Product Error:", error);

    // ✅ Clean up uploaded files in case of error
    if (req.files) {
      Object.values(req.files).flat().forEach(file => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message,
    });
  }
};





// ------------------ GET ALL PRODUCTS ------------------
// ------------------ GET ALL PRODUCTS ------------------
export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("categories", "name slug") // ✅ categories populate করুন
      .limit(12)
      .sort({ createdAt: -1 });

    // Convert Maps to Objects for all products
    const processedProducts = products.map(product => {
      const productObj = product.toObject();
      
      if (product.colorVariations && product.colorVariations.size > 0) {
        const colorVariationsObj = {};
        for (const [color, variations] of product.colorVariations) {
          colorVariationsObj[color] = variations;
        }
        productObj.colorVariations = colorVariationsObj;
      }
      
      return productObj;
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products: processedProducts,
    });
  } catch (error) {
    console.error("Get Products Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};
// ✅ GET PRODUCT WITH VARIATIONS
export const getProductWithVariationsController = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const product = await productModel
      .findOne({ slug })
      .populate("category")
      .populate("categories");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ✅ Group variations by color and size for easy frontend handling
    const variationsByColor = {};
    const variationsBySize = {};

    product.variations.forEach(variation => {
      // Group by color
      if (!variationsByColor[variation.color]) {
        variationsByColor[variation.color] = [];
      }
      variationsByColor[variation.color].push(variation);

      // Group by size
      if (!variationsBySize[variation.size]) {
        variationsBySize[variation.size] = [];
      }
      variationsBySize[variation.size].push(variation);
    });

    res.status(200).json({
      success: true,
      product: {
        ...product.toObject(),
        variationsByColor,
        variationsBySize,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching product with variations",
      error: error.message,
    });
  }
};
// controllers/productController.js - নতুন ফাংশন যোগ করুন
export const getSimilarProductsController = async (req, res) => {
  try {
    const { slug } = req.params;
    const limit = parseInt(req.query.limit) || 8;

    // 1. প্রথমে বর্তমান প্রোডাক্ট খুঁজুন
    const currentProduct = await productModel.findOne({ slug });
    
    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 2. বর্তমান প্রোডাক্টের categories পান
    const categoryIds = currentProduct.categories || [];
    
    if (categoryIds.length === 0) {
      return res.status(200).json({
        success: true,
        products: [],
        message: "No categories found for this product",
      });
    }

    // 3. একই categories যুক্ত প্রোডাক্ট খুঁজুন (বর্তমান প্রোডাক্ট বাদে)
    const similarProducts = await productModel
      .find({
        _id: { $ne: currentProduct._id },
        categories: { $in: categoryIds },
        status: true, // শুধুমাত্র active প্রোডাক্ট
      })
      .select("name slug price discountPrice defaultPhotos brand availableColors availableSizes")
      .limit(limit)
      .populate("categories", "name slug")
      .sort({ createdAt: -1 });

    // 4. Convert Maps to Objects
    const processedProducts = similarProducts.map(product => {
      const productObj = product.toObject();
      
      // Convert colorVariations Map to Object if exists
      if (product.colorVariations && product.colorVariations.size > 0) {
        const colorVariationsObj = {};
        for (const [color, variations] of product.colorVariations) {
          colorVariationsObj[color] = variations;
        }
        productObj.colorVariations = colorVariationsObj;
      }
      
      return productObj;
    });

    res.status(200).json({
      success: true,
      count: similarProducts.length,
      products: processedProducts,
    });
  } catch (error) {
    console.error("Get similar products error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching similar products",
      error: error.message,
    });
  }
};

// ✅ GET SPECIFIC VARIATION
// productController.js - getProductVariationController
export const getProductVariationController = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // শুধুমাত্র categories populate করুন (category নয়)
    const product = await productModel
      .findOne({ slug })
      .populate("categories"); // শুধু এটা রাখুন

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ✅ Convert Map to Object for frontend compatibility
    const productForResponse = product.toObject();
    
    if (product.colorVariations && product.colorVariations.size > 0) {
      // Convert Map to regular object for JSON response
      const colorVariationsObj = {};
      for (const [color, variations] of product.colorVariations) {
        colorVariationsObj[color] = variations;
      }
      productForResponse.colorVariations = colorVariationsObj;
    }

    // ✅ Calculate available sizes and colors for frontend
    if (!product.useSimpleProduct && product.colorVariations && product.colorVariations.size > 0) {
      // Get all unique colors
      const colors = Array.from(product.colorVariations.keys());
      
      // Get all unique sizes from all color variations
      const allSizesSet = new Set();
      for (const variations of product.colorVariations.values()) {
        variations.forEach(v => allSizesSet.add(v.size));
      }
      
      productForResponse.availableColors = colors;
      productForResponse.availableSizes = Array.from(allSizesSet);
    } else {
      // For simple products
      productForResponse.availableColors = product.availableColors || [];
      productForResponse.availableSizes = product.availableSizes || [];
    }

    res.status(200).json({
      success: true,
      product: productForResponse,
    });
  } catch (error) {
    console.error("Get Product Variation Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product with variations",
      error: error.message,
    });
  }
};
// ------------------ GET SINGLE PRODUCT ------------------
// ------------------ GET SINGLE PRODUCT ------------------
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .populate("categories", "_id name slug") // ✅ শুধু categories populate করুন
      .exec();
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ✅ Convert Map to Object for frontend
    const productForResponse = product.toObject();
    
    // Convert colorVariations Map to regular object
    if (product.colorVariations && product.colorVariations.size > 0) {
      const colorVariationsObj = {};
      for (const [color, variations] of product.colorVariations) {
        colorVariationsObj[color] = variations;
      }
      productForResponse.colorVariations = colorVariationsObj;
    }

    // ✅ Calculate available sizes and colors for frontend (যদি pre-save middleware না করে থাকেন)
    if (!product.useSimpleProduct && product.colorVariations && product.colorVariations.size > 0) {
      // Get all unique colors
      const colors = Array.from(product.colorVariations.keys());
      
      // Get all unique sizes from all color variations
      const allSizesSet = new Set();
      for (const variations of product.colorVariations.values()) {
        variations.forEach(v => allSizesSet.add(v.size));
      }
      
      productForResponse.availableColors = colors;
      productForResponse.availableSizes = Array.from(allSizesSet);
    } else if (product.useSimpleProduct) {
      // For simple products
      productForResponse.availableColors = product.availableColors || [];
      productForResponse.availableSizes = product.availableSizes || [];
    }

    res.status(200).json({
      success: true,
      product: productForResponse,
    });
  } catch (error) {
    console.error("Get Single Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
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
// export const updateProductController = async (req, res) => {
//   try {
//     const {
//       name,
//       description,
//       price,
//       categories,
//       subcategories,
//       quantity,
//       shipping,
//       brand,
//       color,
//       size,
//       discountPrice,
//       replaceIndex // 👉 ফ্রন্টএন্ড থেকে পাঠানো index (যেমন 4)
//     } = req.body; // ✅ multer => req.body

//     // Validation
//     if (!name || !description || !price || !categories || !quantity) {
//       return res.status(400).json({
//         success: false,
//         message: "Name, Description, Price, Categories, and Quantity are required",
//       });
//     }

//     // আগের প্রোডাক্ট বের করো
//     const existingProduct = await productModel.findById(req.params.pid);
//     if (!existingProduct) {
//       return res.status(404).json({ error: "Product not found" });
//     }

//     // Update data তৈরি করো
//     const updateData = {
//       name,
//       slug: slugify(name),
//       description,
//       price,
//       category: Array.isArray(categories) ? categories[0] : JSON.parse(categories)[0],
//       categories: Array.isArray(categories) ? categories : JSON.parse(categories),
//       subcategories: subcategories
//         ? (Array.isArray(subcategories) ? subcategories : JSON.parse(subcategories))
//         : [],
//       quantity,
//       shipping: shipping === "true" || shipping === true,
//       brand: brand ? (Array.isArray(brand) ? brand : JSON.parse(brand)) : [],
//       color: color ? (Array.isArray(color) ? color : JSON.parse(color)) : [],
//       size: size ? (Array.isArray(size) ? size : JSON.parse(size)) : [],
//       discountPrice: discountPrice !== undefined 
//         ? Number(discountPrice) 
//         : existingProduct.discountPrice,
//       photos: existingProduct.photos, // পুরানো সব ছবি রেখে দাও
//     };

//     // ✅ নতুন ছবি এলে শুধু নির্দিষ্ট index replace করো অথবা push করো
//     if (req.files && req.files.length > 0) {
//       const uploadedPhotos = await Promise.all(
//         req.files.map(async (file) => {
//           const result = await cloudinary.uploader.upload(file.path, {
//             folder: "products",
//           });
//           fs.unlinkSync(file.path); // temp file delete
//           return {
//             url: result.secure_url,
//             public_id: result.public_id,
//           };
//         })
//       );

//       if (replaceIndex !== undefined && updateData.photos[replaceIndex]) {
//         // 👉 নির্দিষ্ট index replace
//         updateData.photos[replaceIndex] = uploadedPhotos[0];
//       } else {
//         // 👉 নতুন ছবি add হবে
//         updateData.photos.push(...uploadedPhotos);
//       }
//     }

//     // DB Update
//     const product = await productModel.findByIdAndUpdate(
//       req.params.pid,
//       updateData,
//       { new: true }
//     );

//     res.status(200).json({
//       success: true,
//       message: "✅ Product updated successfully",
//       product,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Error updating product",
//       error: error.message,
//     });
//   }
// };

// ------------------ UPDATE PRODUCT ------------------
// ------------------ UPDATE PRODUCT ------------------
// productController.js - updateProductController function এ পরিবর্তন করুন
// productController.js - updateProductController function
// productController.js - updateProductController (Fixed Version)

export const updateProductController = async (req, res) => {
  try {
    const { slug } = req.params;
    const {
      name,
      description,
      useVariations,
      brand,
      shipping,
      categories,
      subcategories,
      colorVariations,
      colorImageData,
      basePrice,
      baseDiscountPrice,
      baseQuantity,
      color,
      size,
      videoUrl // ✅ এই লাইন যোগ করুন
    } = req.body;

    console.log("=== UPDATE PRODUCT START ===");
    console.log("Slug:", slug);
    console.log("Use Variations:", useVariations);
    console.log("Color Variations from frontend:", colorVariations ? JSON.parse(colorVariations) : null);
    console.log("Files received:", req.files ? Object.keys(req.files) : 'No files');
    console.log("Color Images files:", req.files?.colorImages?.length || 0);

    // ✅ Find existing product
    const existingProduct = await productModel.findOne({ slug: slug });
    if (!existingProduct) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    console.log("Existing product found:", existingProduct.name);
    console.log("Existing colorImages:", existingProduct.colorImages);
    console.log("Existing colorVariations:", existingProduct.colorVariations);

    // ✅ Parse data from frontend
    let parsedColorVariations = [];
    if (colorVariations) {
      parsedColorVariations = Array.isArray(colorVariations) ? colorVariations : JSON.parse(colorVariations);
      console.log("Parsed color variations:", parsedColorVariations);
    }

    let parsedColorImageData = [];
    if (colorImageData) {
      parsedColorImageData = Array.isArray(colorImageData) ? colorImageData : JSON.parse(colorImageData);
      console.log("Parsed color image data:", parsedColorImageData);
    }

    // ✅ Prepare update data
    const updateData = {
      name,
      slug: slugify(name),
      description,
       videoUrl: videoUrl?.trim() || "", // ✅ এখানে যোগ করুন
      brand: brand ? JSON.parse(brand) : existingProduct.brand,
      shipping: shipping === "true" || shipping === true,
      categories: categories ? JSON.parse(categories) : existingProduct.categories,
      subcategories: subcategories ? JSON.parse(subcategories) : existingProduct.subcategories,
      useSimpleProduct: useVariations === "false",
    };

    // ✅ Handle default photos (optional)
    if (req.files?.photos && req.files.photos.length > 0) {
      const uploadedDefaultPhotos = await Promise.all(
        req.files.photos.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "products",
          });
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          return { url: result.secure_url, public_id: result.public_id };
        })
      );

      // Keep existing photos or merge
      if (existingProduct.defaultPhotos && existingProduct.defaultPhotos.length > 0) {
        updateData.defaultPhotos = [...existingProduct.defaultPhotos, ...uploadedDefaultPhotos].slice(0, 5);
      } else {
        updateData.defaultPhotos = uploadedDefaultPhotos;
      }
    } else {
      // Keep existing photos
      updateData.defaultPhotos = existingProduct.defaultPhotos;
    }

    // ✅ Handle color-based variation system
    if (useVariations === "true" && parsedColorVariations.length > 0) {
      console.log("Processing color variations update...");
      
      // 1. Process color variations (sizes and prices)
      const colorVariationsMap = new Map();
      
      // Start with existing variations
      if (existingProduct.colorVariations && existingProduct.colorVariations.size > 0) {
        for (const [color, variations] of existingProduct.colorVariations) {
          colorVariationsMap.set(color, variations);
        }
      }
      
      // Update with new sizes data from frontend
      for (const colorVar of parsedColorVariations) {
        const color = colorVar.color;
        
        if (colorVar.sizes && Array.isArray(colorVar.sizes)) {
          const colorVariationsArray = colorVar.sizes.map(size => ({
            size: size.size,
            price: parseFloat(size.price),
            discountPrice: size.discountPrice ? parseFloat(size.discountPrice) : 0,
            quantity: parseInt(size.quantity),
            sku: `${slugify(name)}-${color}-${size.size}`.toUpperCase().replace(/\s+/g, '-')
          }));
          
          colorVariationsMap.set(color, colorVariationsArray);
        }
      }
      
      // 2. Process color images - MOST IMPORTANT PART
      let finalColorImages = [];
      
      // Step 1: Start with ALL existing color images
      if (existingProduct.colorImages && Array.isArray(existingProduct.colorImages)) {
        console.log("Keeping existing color images:", existingProduct.colorImages.length);
        finalColorImages = [...existingProduct.colorImages];
      }
      
      // Step 2: Process new color images from frontend
      const colorPhotoFiles = req.files?.colorImages || [];
      console.log(`Received ${colorPhotoFiles.length} new color image files`);
      
      if (colorPhotoFiles.length > 0 && parsedColorImageData.length > 0) {
        // Group new images by color
        const newImagesByColor = {};
        
        parsedColorImageData.forEach((imgData, index) => {
          if (index < colorPhotoFiles.length) {
            const color = imgData.color;
            if (!newImagesByColor[color]) {
              newImagesByColor[color] = [];
            }
            newImagesByColor[color].push(colorPhotoFiles[index]);
          }
        });
        
        console.log("New images grouped by color:", Object.keys(newImagesByColor));
        
        // Upload and add new images for each color
        for (const [color, files] of Object.entries(newImagesByColor)) {
          console.log(`Uploading ${files.length} new images for color: ${color}`);
          
          const uploadedImages = await Promise.all(
            files.map(async (file) => {
              const result = await cloudinary.uploader.upload(file.path, {
                folder: `products/colors/${slugify(name)}`,
              });
              if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
              }
              return {
                url: result.secure_url,
                public_id: result.public_id,
                uploadedAt: new Date()
              };
            })
          );
          
          // Find if this color already has images in the array
          const existingColorIndex = finalColorImages.findIndex(img => img.color === color);
          
          if (existingColorIndex !== -1) {
            // Merge with existing images
            const existingImages = finalColorImages[existingColorIndex].images || [];
            finalColorImages[existingColorIndex] = {
              color: color,
              images: [...existingImages, ...uploadedImages]
            };
            console.log(`Merged ${uploadedImages.length} new images with existing ones for color ${color}`);
          } else {
            // Add new entry
            finalColorImages.push({
              color: color,
              images: uploadedImages
            });
            console.log(`Added new color entry for ${color} with ${uploadedImages.length} images`);
          }
        }
      }
      
      // Step 3: Remove colors that no longer exist in variations
      if (colorVariationsMap.size > 0) {
        finalColorImages = finalColorImages.filter(colorImg => 
          colorVariationsMap.has(colorImg.color)
        );
      }
      
      // Step 4: Add empty image arrays for colors that don't have any images yet
      Array.from(colorVariationsMap.keys()).forEach(color => {
        const hasImages = finalColorImages.some(img => img.color === color);
        if (!hasImages) {
          finalColorImages.push({
            color: color,
            images: []
          });
        }
      });
      
      // 3. Update the data
      updateData.colorVariations = colorVariationsMap;
      updateData.colorImages = finalColorImages;
      updateData.availableColors = Array.from(colorVariationsMap.keys());
      updateData.availableSizes = [...new Set(
        Array.from(colorVariationsMap.values()).flatMap(variations => 
          variations.map(v => v.size)
        )
      )];
      
      console.log("Final colorImages after update:", finalColorImages);
      console.log("Final colorVariations:", Array.from(colorVariationsMap.entries()));
      
    } else if (useVariations === "false") {
      // Handle simple product
      console.log("Updating as simple product");
      
      if (!basePrice) {
        return res.status(400).json({ success: false, message: "Base price is required" });
      }
      if (!baseQuantity) {
        return res.status(400).json({ success: false, message: "Base quantity is required" });
      }

      updateData.basePrice = parseFloat(basePrice);
      updateData.baseDiscountPrice = baseDiscountPrice ? parseFloat(baseDiscountPrice) : 0;
      updateData.baseQuantity = parseInt(baseQuantity);
      updateData.useSimpleProduct = true;
      
      const simpleColors = color ? JSON.parse(color) : [];
      const simpleSizes = size ? JSON.parse(size) : [];
      
      updateData.availableColors = simpleColors;
      updateData.availableSizes = simpleSizes;
      
      // Clear variation data
      updateData.colorVariations = undefined;
      updateData.colorImages = [];
    }

    console.log("Update data to save:", {
      name: updateData.name,
      colorVariationsSize: updateData.colorVariations?.size || 0,
      colorImagesLength: updateData.colorImages?.length || 0
    });

    // ✅ Update product in database
    const product = await productModel.findOneAndUpdate(
      { slug: slug },
      updateData,
      { new: true, runValidators: true }
    );

    console.log("Product updated successfully");
    console.log("=== UPDATE PRODUCT END ===");

    // ✅ Convert Map to Object for response
    const productResponse = product.toObject();
    if (product.colorVariations && product.colorVariations.size > 0) {
      const colorVariationsObj = {};
      for (const [color, variations] of product.colorVariations) {
        colorVariationsObj[color] = variations;
      }
      productResponse.colorVariations = colorVariationsObj;
    }

    res.status(200).json({
      success: true,
      message: "✅ Product updated successfully",
      product: productResponse,
    });

  } catch (error) {
    console.error("❌ Update Product Error:", error);
    
    // Clean up uploaded files
    if (req.files) {
      Object.values(req.files).flat().forEach(file => {
        if (fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
          } catch (cleanupErr) {
            console.error("Cleanup error:", cleanupErr);
          }
        }
      });
    }

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
// controllers/productController.js - relatedProductController ফাংশনটি পরিবর্তন করুন
// controllers/productController.js - relatedProductController
// controllers/productController.js - relatedProductController ফাংশন
export const relatedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;

    console.log("📌 Related products request:", { pid, cid });
    console.log("📌 cid type:", typeof cid);

    // ✅ Import mongoose (যদি না import করা থাকে)
    const mongoose = require('mongoose');

    // ✅ Check if cid is a valid ObjectId
    let categoryId;
    if (mongoose.Types.ObjectId.isValid(cid)) {
      categoryId = cid;
      console.log("📌 cid is a valid ObjectId");
    } else {
      // If cid is a slug, find category by slug first
      console.log("📌 cid is not an ObjectId, trying as slug...");
      const category = await categoryModel.findOne({ slug: cid });
      if (category) {
        categoryId = category._id;
        console.log("📌 Found category by slug:", category.name);
      } else {
        // Try as category name
        const categoryByName = await categoryModel.findOne({ 
          name: { $regex: new RegExp(`^${cid}$`, 'i') } 
        });
        if (categoryByName) {
          categoryId = categoryByName._id;
          console.log("📌 Found category by name:", categoryByName.name);
        }
      }
    }

    if (!categoryId) {
      console.log("❌ No valid category ID found");
      return res.status(200).json({
        success: true,
        message: "No category found for related products",
        products: [],
      });
    }

    console.log("📌 Final categoryId to search:", categoryId);

    // ✅ Query products with this category
    const products = await productModel
      .find({
        $and: [
          { _id: { $ne: pid } },
          { 
            $or: [
              { categories: { $in: [categoryId] } },
              { category: categoryId } // পুরানো সিস্টেমের জন্য
            ]
          }
        ]
      })
      .select(
        "name slug description price discountPrice " +
        "basePrice baseDiscountPrice baseQuantity " +
        "defaultPhotos photos brand " +
        "availableColors availableSizes " +
        "colorVariations colorImages " +
        "useSimpleProduct minPrice maxPrice " +
        "videoUrl"
      )
      .limit(8)
      .populate("categories", "name slug")
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${products.length} related products`);

    // ✅ Product List Controller এর মতো একই logic ব্যবহার করুন
    const processedProducts = products.map(product => {
      const productObj = product.toObject();
      
      // Convert colorVariations Map to Object
      if (product.colorVariations && product.colorVariations.size > 0) {
        const colorVariationsObj = {};
        for (const [color, variations] of product.colorVariations) {
          colorVariationsObj[color] = variations;
        }
        productObj.colorVariations = colorVariationsObj;
      }
      
      // ✅ EXACTLY SAME LOGIC AS SHOP PAGE
      // Check which system the product uses
      let displayPrice = 0;
      let displayDiscountPrice = 0;
      let hasDiscount = false;
      let system = 'simple';
      
      if (product.useSimpleProduct === false && product.colorVariations) {
        // ✅ Color Variations System
        const colorKeys = Array.from(product.colorVariations.keys());
        if (colorKeys.length > 0) {
          const firstColor = colorKeys[0];
          const variations = product.colorVariations.get(firstColor);
          if (variations && variations.length > 0) {
            const firstVariation = variations[0];
            displayPrice = firstVariation.price;
            displayDiscountPrice = firstVariation.discountPrice;
            hasDiscount = firstVariation.discountPrice > 0;
            system = 'colorVariations';
          }
        }
        
        // Fallback
        if (displayPrice === 0) {
          displayPrice = product.minPrice || 0;
          displayDiscountPrice = 0;
          hasDiscount = false;
        }
      }
      // ✅ OLD System: variations array
      else if (product.variations && product.variations.length > 0) {
        const firstVariation = product.variations[0];
        displayPrice = firstVariation.price;
        displayDiscountPrice = firstVariation.discountPrice;
        hasDiscount = firstVariation.discountPrice > 0;
        system = 'variations';
      }
      // ✅ Simple Product System
      else {
        displayPrice = product.basePrice || product.price || 0;
        displayDiscountPrice = product.baseDiscountPrice || product.discountPrice || 0;
        hasDiscount = (product.baseDiscountPrice || product.discountPrice) > 0;
        system = 'simple';
      }
      
      // Add to product object
      productObj.displayPrice = displayPrice;
      productObj.displayDiscountPrice = displayDiscountPrice;
      productObj.hasDiscount = hasDiscount;
      productObj.system = system;
      
      // ✅ Get display image (SAME AS SHOP PAGE)
      let displayImage = "/default-image.jpg";
      
      // First try color-specific images
      if (product.colorImages && product.colorImages.length > 0) {
        displayImage = product.colorImages[0].images?.[0]?.url || displayImage;
      }
      // Then try default photos
      else if (product.defaultPhotos && product.defaultPhotos.length > 0) {
        displayImage = product.defaultPhotos[0]?.url || displayImage;
      }
      // Then old photos array
      else if (product.photos && product.photos.length > 0) {
        displayImage = product.photos[0]?.url || displayImage;
      }
      
      productObj.displayImage = displayImage;
      
      return productObj;
    });

    // Debug logs
    processedProducts.forEach((p, idx) => {
      console.log(`📌 Related Product ${idx + 1}:`, {
        name: p.name,
        displayPrice: p.displayPrice,
        system: p.system,
        hasDiscount: p.hasDiscount,
        categories: p.categories?.map(c => c.name || c)
      });
    });

    res.status(200).send({
      success: true,
      count: processedProducts.length,
      products: processedProducts,
    });
  } catch (error) {
    console.error("❌ Related product error:", error);
    res.status(400).send({
      success: false,
      message: "Error fetching related products",
      error: error.message,
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
    const { subSlug } = req.params;
    console.log("📌 Subcategory request:", subSlug);

    // Decode URL
    const decodedSubSlug = decodeURIComponent(subSlug);
    console.log("📌 Decoded subcategory:", decodedSubSlug);

    // Special handling for "&" character
    const searchString = decodedSubSlug.replace(/&/g, '&');
    console.log("📌 Search string:", searchString);

    // ✅ Build multiple search patterns
    const searchPatterns = [
      // Exact match with case insensitive
      new RegExp(`^${searchString}$`, 'i'),
      // Contains match
      new RegExp(searchString, 'i'),
      // Space variations
      new RegExp(searchString.replace(/\s+/g, '\\s+'), 'i')
    ];

    console.log("📌 Search patterns:", searchPatterns.map(p => p.toString()));

    // ✅ Try each pattern
    let products = [];
    for (const pattern of searchPatterns) {
      const foundProducts = await productModel
        .find({ 
          subcategories: pattern 
        })
        .select("-__v")
        .populate("categories", "name slug") // ✅ শুধু categories populate করুন
        .sort({ createdAt: -1 })
        .lean();

      if (foundProducts.length > 0) {
        console.log(`✅ Found ${foundProducts.length} products with pattern: ${pattern}`);
        products = foundProducts;
        break;
      }
    }

    // ✅ If still no products, try direct search in array
    if (products.length === 0) {
      console.log("🔄 Trying direct array search...");
      
      // Get all products and filter manually
      const allProducts = await productModel
        .find({})
        .select("-__v")
        .populate("categories", "name slug")
        .sort({ createdAt: -1 })
        .lean();

      products = allProducts.filter(product => {
        if (!product.subcategories || !Array.isArray(product.subcategories)) {
          return false;
        }
        
        return product.subcategories.some(sub => 
          sub && sub.toLowerCase().includes(searchString.toLowerCase())
        );
      });

      console.log(`✅ Found ${products.length} products with manual filter`);
    }

    // ✅ Process products
    const processedProducts = products.map(product => {
      const productObj = { ...product };
      
      // Convert Map to Object
      if (product.colorVariations && product.colorVariations.size > 0) {
        const colorVariationsObj = {};
        for (const [color, variations] of product.colorVariations) {
          colorVariationsObj[color] = variations;
        }
        productObj.colorVariations = colorVariationsObj;
      }
      
      // Add display price
      if (product.useSimpleProduct === false && product.colorVariations) {
        const colors = Object.keys(productObj.colorVariations || {});
        if (colors.length > 0) {
          const firstColor = colors[0];
          const variations = productObj.colorVariations[firstColor];
          if (variations && variations.length > 0) {
            productObj.displayPrice = variations[0].price;
            productObj.displayDiscountPrice = variations[0].discountPrice;
            productObj.hasDiscount = variations[0].discountPrice > 0;
          }
        }
      } else {
        productObj.displayPrice = product.basePrice || 0;
        productObj.displayDiscountPrice = product.baseDiscountPrice || 0;
        productObj.hasDiscount = product.baseDiscountPrice > 0;
      }
      
      // Add display image
      if (product.defaultPhotos && product.defaultPhotos.length > 0) {
        productObj.displayImage = product.defaultPhotos[0]?.url;
      } else if (product.photos && product.photos.length > 0) {
        productObj.displayImage = product.photos[0]?.url;
      } else if (product.colorImages && product.colorImages.length > 0) {
        productObj.displayImage = product.colorImages[0]?.images?.[0]?.url;
      } else {
        productObj.displayImage = "/default-image.jpg";
      }
      
      return productObj;
    });

    // Debug info
    console.log("📦 Processed products:", processedProducts.length);
    if (processedProducts.length > 0) {
      console.log("📦 First product sample:", {
        name: processedProducts[0].name,
        subcategories: processedProducts[0].subcategories,
        displayPrice: processedProducts[0].displayPrice,
        displayImage: processedProducts[0].displayImage,
        categories: processedProducts[0].categories
      });
    }

    res.status(200).send({
      success: true,
      count: processedProducts.length,
      subcategory: decodedSubSlug,
      products: processedProducts,
    });
  } catch (error) {
    console.error("❌ Error in productSubcategoryController:", error);
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
