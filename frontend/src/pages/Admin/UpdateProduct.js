import React, { useState, useEffect } from "react";
import AdminMenu from "../../components/Layout/AdminMenu";
import { PlusOutlined } from "@ant-design/icons";
import { Checkbox, Select } from "antd";
import toast from "react-hot-toast";
import axios from "axios";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { useProduct } from "../../context/product";
import ProductDescriptionEditor from "../../components/ProductDescriptionEditor";
import { MdError } from "react-icons/md";

const { Option } = Select;

const UpdateProduct = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [auth] = useAuth();
  const API = process.env.REACT_APP_API;

  const [categories, setCategories] = useState([]);
  const [,setSubcategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [photos, setPhotos] = useState(Array(5).fill(null));
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState([]);
  const [shipping, setShipping] = useState("");
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  
  // ✅ Variation system states
  const [useVariations, setUseVariations] = useState(false);
  const [selectedColor, setSelectedColor] = useState("");
  const [colorVariations, setColorVariations] = useState([]);
  
  // For adding new size to a color
  const [selectedColorForSize, setSelectedColorForSize] = useState("");
  const [newSize, setNewSize] = useState("");
  const [newSizePrice, setNewSizePrice] = useState("");
  const [newSizeDiscountPrice, setNewSizeDiscountPrice] = useState("");
  const [newSizeQuantity, setNewSizeQuantity] = useState("");
  const [productId, setProductId] = useState("");
  
  // ✅ Simple product states
  const [basePrice, setBasePrice] = useState("");
  const [baseDiscountPrice, setBaseDiscountPrice] = useState("");
  const [baseQuantity, setBaseQuantity] = useState("");
  const [color, setColor] = useState([]);
  const [size, setSize] = useState([]);

  const { refreshProducts } = useProduct();

  // Predefined values
  const brandOptions = ["Made In Bangladesh", "Made In India", "Made In China", "Made In American", "Made In Japan", "No Brand"];
  const colorOptions = [
    "Red", "Blue", "Green", "Black", "White", "Yellow", "Orange", "Pink",
    "Purple", "Brown", "Gray", "Silver", "Gold", "Navy Blue", "Sky Blue",
    "Maroon", "Olive", "Teal", "Beige", "Cream", "Peach", "Violet",
    "Turquoise", "Lavender", "Charcoal", "Magenta", "Cyan", "Lime",
    "Indigo", "Coral", "Salmon", "Chocolate", "Tan", "Mint", "Mustard",
    "Plum", "Ruby", "Sapphire", "Emerald", "Bronze", "Copper", "Ivory",
    "Khaki", "Rose", "Periwinkle", "Aquamarine", "Crimson", "Fuchsia",
    "Mauve", "Burgundy", "Ash", "Not Specified",
    "Multi-Color",
    "Any Colour",
    "Random Colour"
  ];

  const sizeOptions = [
    "S", "M", "L", "XL", "XXL",
    "Free Size", "One Size", "Not Specified",
    "36 X 29 X 9 Cm",
    "38 X 30 X 10 Cm",
    "40 X 32 X 11 Cm",
    "42 X 34 X 12 Cm",
    "44 X 36 X 13 Cm",
    "46 X 38 X 14 Cm",
  ];

  // ✅ Helper function to get image source safely - UPDATED VERSION
  const getImageSource = (image) => {
    if (!image) return '';
    
    // Case 1: Existing image from database (with type property)
    if (image.type === "existing" && image.url) {
      return image.url;
    }
    
    // Case 2: Image object from backend (old schema)
    if (image && typeof image === 'object' && image.secure_url) {
      return image.secure_url;
    }
    
    // Case 3: Image object from backend (new schema)
    if (image && typeof image === 'object' && image.url) {
      return image.url;
    }
    
    // Case 4: File object (newly uploaded)
    if (image && typeof image === 'object' && image.file && image.file instanceof File) {
      try {
        return URL.createObjectURL(image.file);
      } catch (err) {
        console.error("Error creating object URL for file:", err);
        return '';
      }
    }
    
    // Case 5: File object directly
    if (image && image instanceof File) {
      try {
        return URL.createObjectURL(image);
      } catch (err) {
        console.error("Error creating object URL:", err);
        return '';
      }
    }
    
    // Case 6: Plain string URL
    if (typeof image === 'string') {
      return image;
    }
    
    console.warn("Unknown image format:", image);
    return '';
  };

  // Load categories
  useEffect(() => {
    const getAllCategory = async () => {
      try {
        const { data } = await axios.get(`${API}/api/v1/category/get-category`);
        if (data.success) setCategories(data.category);
      } catch (error) {
        toast.error("Error loading categories");
      }
    };
    getAllCategory();
  }, [API]);

  // ✅ Load product details - UPDATED VERSION
  useEffect(() => {
    const getProduct = async () => {
      try {
        const { data } = await axios.get(
          `${API}/api/v1/product/get-product/${params.slug}`
        );
        
        console.log("Full API Response:", data);
        
        if (data?.success && data.product) {
          const product = data.product;
          setVideoUrl(product.videoUrl || "");
          
          // Basic info
          setName(product.name);
          setDescription(product.description || "");
          setBrand(product.brand || []);
          setShipping(product.shipping ? "1" : "0");
          setSelectedCategories(product.categories?.map(c => c._id) || []);
          setSelectedSubcategories(product.subcategories || []);
          setProductId(product._id);

          // ✅ Check if product has variations
          const hasVariations = product.colorVariations && Object.keys(product.colorVariations).length > 0;
          
          if (hasVariations) {
            setUseVariations(true);
            
            // Convert colorVariations object to array format WITH IMAGES
            let parsedColorVariations = [];
            
            if (product.colorVariations && typeof product.colorVariations === 'object') {
              Object.keys(product.colorVariations).forEach(color => {
                // Find images for this color from colorImages array
                let imagesForThisColor = [];
                
                if (product.colorImages && Array.isArray(product.colorImages)) {
                  const colorImageObj = product.colorImages.find(img => img.color === color);
                  if (colorImageObj && Array.isArray(colorImageObj.images)) {
                    imagesForThisColor = colorImageObj.images.map(img => ({
                      type: "existing",
                      url: img.url,
                      public_id: img.public_id,
                      isExisting: true
                    }));
                  }
                }
                
                console.log(`Color ${color} has ${imagesForThisColor.length} images`);
                
                parsedColorVariations.push({
                  color: color,
                  sizes: product.colorVariations[color] || [],
                  colorImages: imagesForThisColor
                });
              });
            }
            
            console.log("Loaded color variations:", parsedColorVariations);
            setColorVariations(parsedColorVariations);
            
          } else {
            // ✅ Simple product system
            setUseVariations(false);
            setBasePrice(product.basePrice || product.price || "");
            setBaseDiscountPrice(product.baseDiscountPrice || product.discountPrice || "");
            setBaseQuantity(product.baseQuantity || product.quantity || "");
            setColor(product.availableColors || product.color || []);
            setSize(product.availableSizes || product.size || []);
            
            console.log("Simple product loaded:", {
              basePrice: product.basePrice || product.price,
              baseQuantity: product.baseQuantity || product.quantity,
              colors: product.availableColors || product.color,
              sizes: product.availableSizes || product.size
            });
          }

          // ✅ FIXED: Handle existing photos for BOTH old and new schema
          if (product.photos && product.photos.length > 0) {
            // Old schema: product.photos
            const photoArray = Array(5).fill(null);
            product.photos.forEach((photo, index) => {
              if (index < 5 && (photo.url || photo.secure_url)) {
                photoArray[index] = {
                  type: "existing",
                  url: photo.url || photo.secure_url,
                  public_id: photo.public_id,
                  originalData: photo // Keep original data for reference
                };
              }
            });
            setPhotos(photoArray);
          } else if (product.defaultPhotos && product.defaultPhotos.length > 0) {
            // New schema: product.defaultPhotos
            const photoArray = Array(5).fill(null);
            product.defaultPhotos.forEach((photo, index) => {
              if (index < 5 && photo.url) {
                photoArray[index] = {
                  type: "existing",
                  url: photo.url,
                  public_id: photo.public_id,
                  originalData: photo
                };
              }
            });
            setPhotos(photoArray);
          }

          // Update subcategories based on selected categories
          if (product.categories && product.categories.length > 0 && categories.length > 0) {
            const selectedCats = categories.filter(c => 
              product.categories.some(pc => pc._id === c._id)
            );
            const allSubs = selectedCats.flatMap(c => c.subcategories || []);
            setSubcategories(allSubs);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Error fetching product");
      }
    };
    
    if (params.slug) {
      getProduct();
    }
  }, [params.slug, categories,API]);

  // Handle multiple category select
  const handleCategoryChange = (catId) => {
    let updated = [...selectedCategories];
    if (updated.includes(catId)) {
      updated = updated.filter((c) => c !== catId);
    } else {
      updated.push(catId);
    }
    setSelectedCategories(updated);

    // Update subcategories dynamically
    const selectedCats = categories.filter((c) => updated.includes(c._id));
    const allSubs = selectedCats.flatMap((c) => c.subcategories || []);
    setSubcategories(allSubs);
    setSelectedSubcategories([]);
  };

  // Handle subcategory select
  const handleSubcategoryChange = (sub) => {
    let updated = [...selectedSubcategories];
    if (updated.includes(sub)) {
      updated = updated.filter((s) => s !== sub);
    } else {
      updated.push(sub);
    }
    setSelectedSubcategories(updated);
  };

  // ✅ Add color to variations
  const addColor = () => {
    if (!selectedColor) {
      toast.error("Please select a color");
      return;
    }
    
    if (colorVariations.find(cv => cv.color === selectedColor)) {
      toast.error("This color already added");
      return;
    }
    
    setColorVariations([...colorVariations, {
      color: selectedColor,
      sizes: [],
      colorImages: []
    }]);
    setSelectedColor("");
  };

  // ✅ Remove color from variations
  const removeColor = (colorToRemove) => {
    setColorVariations(colorVariations.filter(cv => cv.color !== colorToRemove));
  };

  // ✅ Handle color-specific image upload
  const handleColorImageChange = (e, color) => {
    const files = Array.from(e.target.files);
    
    setColorVariations(prev => prev.map(cv => {
      if (cv.color === color) {
        const newImages = [...(cv.colorImages || []), ...files].slice(0, 5);
        return {
          ...cv,
          colorImages: newImages
        };
      }
      return cv;
    }));
  };

  // ✅ Remove color image - FIXED VERSION
  const removeColorImage = (color, imageIndex) => {
    setColorVariations(prev => prev.map(cv => {
      if (cv.color === color) {
        const updatedImages = [...cv.colorImages];
        
        // Check if it's an existing image
        const imageToRemove = updatedImages[imageIndex];
        
        if (imageToRemove && imageToRemove.isExisting) {
          // Mark as removed but keep reference
          updatedImages[imageIndex] = {
            ...imageToRemove,
            removed: true
          };
        } else {
          // Remove new file
          updatedImages.splice(imageIndex, 1);
          
          // Revoke object URL if it exists
          if (imageToRemove && imageToRemove instanceof File) {
            try {
              const url = getImageSource(imageToRemove);
              if (url && url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
              }
            } catch (err) {
              console.error("Error revoking URL:", err);
            }
          }
        }
        
        return {
          ...cv,
          colorImages: updatedImages
        };
      }
      return cv;
    }));
  };

  // ✅ Add size to a specific color
  const addSizeToColor = () => {
    if (!selectedColorForSize || !newSize || !newSizePrice || !newSizeQuantity) {
      toast.error("Please select color, size, price and quantity");
      return;
    }

    const updatedColorVariations = [...colorVariations];
    const colorIndex = updatedColorVariations.findIndex(cv => cv.color === selectedColorForSize);
    
    if (colorIndex === -1) {
      toast.error("Color not found");
      return;
    }

    // Check if size already exists for this color
    if (updatedColorVariations[colorIndex].sizes.find(s => s.size === newSize)) {
      toast.error("This size already exists for selected color");
      return;
    }

    updatedColorVariations[colorIndex].sizes.push({
      size: newSize,
      price: parseFloat(newSizePrice),
      discountPrice: newSizeDiscountPrice ? parseFloat(newSizeDiscountPrice) : 0,
      quantity: parseInt(newSizeQuantity)
    });

    setColorVariations(updatedColorVariations);
    
    // Reset form
    setNewSize("");
    setNewSizePrice("");
    setNewSizeDiscountPrice("");
    setNewSizeQuantity("");
  };

  // ✅ Remove size from a color
  const removeSizeFromColor = (color, sizeToRemove) => {
    const updatedColorVariations = [...colorVariations];
    const colorIndex = updatedColorVariations.findIndex(cv => cv.color === color);
    
    if (colorIndex !== -1) {
      updatedColorVariations[colorIndex].sizes = updatedColorVariations[colorIndex].sizes
        .filter(s => s.size !== sizeToRemove);
      
      // If no sizes left, remove the color entirely
      if (updatedColorVariations[colorIndex].sizes.length === 0) {
        updatedColorVariations.splice(colorIndex, 1);
      }
      
      setColorVariations(updatedColorVariations);
    }
  };

  // Handle photo upload and drag & drop
  const handleDragStart = (e, index) => {
    if (!photos[index]) return;
    
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
    
    setTimeout(() => {
      e.target.classList.add("dragging");
    }, 0);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"));
    if (sourceIndex === targetIndex) return;
    
    const updatedPhotos = [...photos];
    const [movedPhoto] = updatedPhotos.splice(sourceIndex, 1);
    updatedPhotos.splice(targetIndex, 0, movedPhoto);
    
    setPhotos(updatedPhotos);
    setDraggedIndex(null);
    
    document.querySelectorAll('.drag-item').forEach(el => {
      el.classList.remove('dragging');
    });
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    document.querySelectorAll('.drag-item').forEach(el => {
      el.classList.remove('dragging');
    });
  };

  const handlePhotoChange = (e, index) => {
    const selectedFiles = Array.from(e.target.files);
    const updatedPhotos = [...photos];
    
    selectedFiles.forEach((file, idx) => {
      if (index + idx < 5) {
        updatedPhotos[index + idx] = { 
          type: "new", 
          file,
          // Keep existing data if replacing
          ...(photos[index + idx]?.type === "existing" ? {
            existingUrl: photos[index + idx].url,
            public_id: photos[index + idx].public_id
          } : {})
        };
      }
    });
    
    setPhotos(updatedPhotos);
  };

  const handleRemovePhoto = (index) => {
    const updatedPhotos = [...photos];
    updatedPhotos[index] = null;
    setPhotos(updatedPhotos);
  };

  // ✅ Update product with new variation system
  const handleUpdate = async () => {
    try {
      setLoading(true);

      // ✅ Validation
      const frontendErrors = [];
      if (!name?.trim()) frontendErrors.push("Name is required");
      
      const hasPhotos = photos.some(p => p !== null);
      if (!hasPhotos) frontendErrors.push("At least one main photo is required");
      
      if (selectedCategories.length === 0) frontendErrors.push("Category is required");

      if (useVariations) {
        if (colorVariations.length === 0) {
          frontendErrors.push("At least one color variation is required");
        } else {
          colorVariations.forEach(cv => {
            if (cv.sizes.length === 0) {
              frontendErrors.push(`Color "${cv.color}" has no sizes added`);
            }
          });
        }
      } else {
        if (!basePrice) frontendErrors.push("Base price is required");
        if (!baseQuantity) frontendErrors.push("Base quantity is required");
      }

      if (frontendErrors.length > 0) {
        setErrorMessages(frontendErrors);
        setErrorModalOpen(true);
        setLoading(false);
        return;
      }

      // ✅ Prepare FormData for update
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("useVariations", useVariations);
      formData.append("brand", JSON.stringify(brand));
      formData.append("shipping", shipping);
      formData.append("videoUrl", videoUrl || "");
      formData.append("categories", JSON.stringify(selectedCategories));
      
      if (selectedSubcategories.length > 0) {
        formData.append("subcategories", JSON.stringify(selectedSubcategories));
      }

      if (useVariations) {
        // ✅ Prepare color variations data
        // Send all color variations including existing ones
        const variationsToSend = colorVariations.map(cv => ({
          color: cv.color,
          sizes: cv.sizes,
          // Only send image metadata, not the actual image objects
          colorImages: cv.colorImages ? cv.colorImages.filter(img => !img.removed) : []
        }));
        
        formData.append("colorVariations", JSON.stringify(variationsToSend));
        
        // ✅ Separate new images from existing ones
        const newColorImages = [];
        const colorImageData = [];
        
        colorVariations.forEach(cv => {
          if (cv.colorImages && cv.colorImages.length > 0) {
            cv.colorImages.forEach((image, index) => {
              // Only append NEW files (not existing ones from DB)
              if (image instanceof File && !image.removed) {
                newColorImages.push(image);
                colorImageData.push({
                  color: cv.color,
                  imageIndex: index
                });
              }
            });
          }
        });
        
        // ✅ Append new color images
        newColorImages.forEach((file, index) => {
          formData.append("colorImages", file);
        });
        
        if (colorImageData.length > 0) {
          formData.append("colorImageData", JSON.stringify(colorImageData));
        }
        
      } else {
        // ✅ Simple product system
        formData.append("basePrice", basePrice);
        formData.append("baseDiscountPrice", baseDiscountPrice || "");
        formData.append("baseQuantity", baseQuantity);
        formData.append("color", JSON.stringify(color));
        formData.append("size", JSON.stringify(size));
      }

      // ✅ Add new photos
      photos.forEach((photo, index) => {
        if (photo && photo.type === "new") {
          formData.append("photos", photo.file);
        }
      });

      // ✅ Send update request
      const { data } = await axios.put(
        `${API}/api/v1/product/update-product/${params.slug}`,
        formData,
        {
          headers: {
            Authorization: auth?.token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success("✅ Product updated successfully");
        navigate("/dashboard/admin/products");
        refreshProducts();
      }
    } catch (error) {
      console.error("Update product error:", error);
      const backendMessage = error.response?.data?.message || "Something went wrong";
      setErrorMessages([backendMessage]);
      setErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete product
  const handleDelete = async () => {
    if (!productId) {
      toast.error("Product ID not found");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const { data } = await axios.delete(
          `${API}/api/v1/product/delete-product/${productId}`,
          {
            headers: { Authorization: auth?.token },
          }
        );
        if (data.success) {
          toast.success("🗑️ Product deleted");
          navigate("/dashboard/admin/products");
          refreshProducts();
        }
      } catch (error) {
        console.error(error);
        toast.error("Error deleting product");
      }
    }
  };

  // ✅ Clean up object URLs on component unmount
  useEffect(() => {
    return () => {
      // Clean up all blob URLs
      colorVariations.forEach(cv => {
        cv.colorImages?.forEach(image => {
          if (image instanceof File) {
            try {
              const url = getImageSource(image);
              if (url && url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
              }
            } catch (err) {
              console.error("Error revoking URL:", err);
            }
          }
        });
      });
      
      // Clean up main photos
      photos.forEach(photo => {
        if (photo && photo.type === "new" && photo.file) {
          try {
            const url = getImageSource(photo.file);
            if (url && url.startsWith('blob:')) {
              URL.revokeObjectURL(url);
            }
          } catch (err) {
            console.error("Error revoking URL:", err);
          }
        }
      });
    };
  }, [colorVariations, photos]);

  return (
    <div className="container-fluid p-0">
      <div className="row g-0">
        {/* Sidebar */}
        <div className="col-12 col-md-3 col-lg-2 p-0 border-end" style={{ minHeight: "100vh" }}>
          <AdminMenu />
        </div>
        
        {/* Main Content */}
        <div className="col-12 col-md-9 col-lg-10 d-flex flex-column" style={{ backgroundColor: "#f4f5f7", minHeight: "100vh" }}>
          {/* Top Header */}
          <div
            className="d-flex flex-wrap justify-content-center align-items-center px-3 py-2 text-white shadow-sm"
            style={{
              background: "#001219",
              position: "sticky",
              top: 0,
              overflowY: "auto",
            }}
          >
            <NavLink
              to="/"
              style={{
                fontSize: "18px",
                margin: "6px 0 6px 20px",
                textDecoration: 'none',
                color: '#FFF',
                backgroundColor: '#0d1b2a'
              }}
            >
              Update Product
            </NavLink>
          </div>
          
          <div className="row" style={{ padding: "20px", marginLeft: '20px' }}>
            <div className="col-md-9">
              {/* Main Product Images Upload */}
              <div className="mb-3">
                <h5 className="mb-2">
                  Main Product Images <span className="text-danger">*</span>
                </h5>
                <small className="text-muted d-block mb-3">
                  Upload between 1 to 5 main images. Drag and drop to reorder.
                </small>

                <div className="d-flex flex-wrap gap-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="drag-item"
                      draggable={!!photos[i]}
                      onDragStart={(e) => handleDragStart(e, i)}
                      onDragOver={(e) => handleDragOver(e, i)}
                      onDrop={(e) => handleDrop(e, i)}
                      onDragEnd={handleDragEnd}
                      style={{
                        position: "relative",
                        width: "100px",
                        height: "120px",
                        cursor: photos[i] ? "grab" : "pointer",
                        opacity: draggedIndex === i ? 0.5 : 1,
                        transition: "transform 0.2s, opacity 0.2s",
                      }}
                    >
                      <label
                        className="rounded d-flex align-items-center justify-content-center"
                        style={{
                          width: "100%",
                          height: "100%",
                          cursor: "pointer",
                          border: "2px dashed #00a297",
                          borderRadius: "6px",
                          overflow: "hidden",
                        }}
                      >
                        {photos[i] ? (
                          photos[i].type === "new" ? (
                            <img
                              src={getImageSource(photos[i])}
                              alt="preview"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <img
                              src={getImageSource(photos[i])}
                              alt="preview"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              onError={(e) => {
                                console.error("Failed to load image:", photos[i]);
                                e.target.style.display = 'none';
                              }}
                            />
                          )
                        ) : (
                          <PlusOutlined
                            style={{ fontSize: "28px", color: "#555" }}
                          />
                        )}

                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          hidden
                          onChange={(e) => handlePhotoChange(e, i)}
                        />
                      </label>

                      {/* Close button */}
                      {photos[i] && (
                        <AiOutlineCloseCircle
                          style={{
                            position: "absolute",
                            top: "-8px",
                            right: "-8px",
                            fontSize: "22px",
                            color: "red",
                            cursor: "pointer",
                            background: "white",
                            borderRadius: "50%",
                          }}
                          onClick={() => handleRemovePhoto(i)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  placeholder="Product Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <ProductDescriptionEditor
                  description={description}
                  setDescription={setDescription}
                />
              </div>

              {/* ✅ Variation Toggle */}
              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={useVariations}
                    onChange={(e) => setUseVariations(e.target.checked)}
                    id="useVariations"
                  />
                  <label className="form-check-label" htmlFor="useVariations">
                    Use Color-Size Variations with different prices, quantities & images
                  </label>
                </div>
              </div>

              {useVariations ? (
                /* ✅ Color-Size Variation Management */
                <div className="mb-4 p-3 border rounded">
                  <h5>Color-Size Variations</h5>
                  <small className="text-muted d-block mb-3">
                    Add colors with specific images, then add multiple sizes with prices for each color
                  </small>

                  {/* ✅ Add Color */}
                  <div className="row g-2 mb-3">
                    <div className="col-md-8">
                      <select
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="form-select"
                      >
                        <option value="">Select Color to Add</option>
                        {colorOptions.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <button
                        onClick={addColor}
                        className="btn btn-primary w-100"
                        type="button"
                      >
                        Add Color
                      </button>
                    </div>
                  </div>

                  {/* ✅ Added Colors with Sizes and Images */}
                  {colorVariations.map((colorVar, colorIndex) => (
                    <div key={colorVar.color} className="mb-4 p-3 border rounded">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="mb-0">
                          Color: <strong>{colorVar.color}</strong>
                          <span className="badge bg-secondary ms-2">
                            {colorVar.sizes.length} sizes
                          </span>
                          <span className="badge bg-info ms-2">
                            {(colorVar.colorImages?.filter(img => !img.removed)?.length || 0)} color images
                          </span>
                        </h6>
                        <button
                          type="button"
                          onClick={() => removeColor(colorVar.color)}
                          className="btn btn-danger btn-sm"
                        >
                          <AiOutlineCloseCircle /> Remove Color
                        </button>
                      </div>

                      {/* ✅ Color-Specific Images */}
                      <div className="mb-3">
                        <label className="form-label">
                          Images for {colorVar.color} (Optional)
                        </label>
                        <small className="text-muted d-block mb-2">
                          Upload specific images showing this color variant
                        </small>
                        
                        <div className="d-flex flex-wrap gap-2 mb-3">
                          {colorVar.colorImages?.map((image, imgIndex) => {
                            if (image.removed) return null;
                            
                            const imageSrc = getImageSource(image);
                            if (!imageSrc) return null;
                            
                            return (
                              <div key={imgIndex} style={{ position: "relative", width: "80px", height: "80px" }}>
                                <img
                                  src={imageSrc}
                                  alt={`${colorVar.color} preview ${imgIndex + 1}`}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    borderRadius: "4px",
                                    border: "1px solid #ddd"
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    console.error(`Failed to load image for ${colorVar.color}:`, imageSrc);
                                  }}
                                />
                                <AiOutlineCloseCircle
                                  style={{
                                    position: "absolute",
                                    top: "-5px",
                                    right: "-5px",
                                    fontSize: "18px",
                                    color: "red",
                                    cursor: "pointer",
                                    background: "white",
                                    borderRadius: "50%",
                                  }}
                                  onClick={() => removeColorImage(colorVar.color, imgIndex)}
                                />
                              </div>
                            );
                          })}
                          
                          {(!colorVar.colorImages || colorVar.colorImages.filter(img => !img.removed).length < 5) && (
                            <label
                              className="rounded d-flex align-items-center justify-content-center"
                              style={{
                                width: "80px",
                                height: "80px",
                                cursor: "pointer",
                                border: "1px dashed #007bff",
                                borderRadius: "4px",
                              }}
                            >
                              <PlusOutlined style={{ fontSize: "20px", color: "#007bff" }} />
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                hidden
                                onChange={(e) => handleColorImageChange(e, colorVar.color)}
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      {/* ✅ Add Sizes to this Color */}
                      <div className="row g-2 mb-3">
                        <div className="col-md-3">
                          <select
                            value={selectedColorForSize === colorVar.color ? newSize : ""}
                            onChange={(e) => {
                              setSelectedColorForSize(colorVar.color);
                              setNewSize(e.target.value);
                            }}
                            className="form-select"
                          >
                            <option value="">Select Size</option>
                            {sizeOptions.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-2">
                          <input
                            type="number"
                            placeholder="Price"
                            value={selectedColorForSize === colorVar.color ? newSizePrice : ""}
                            onChange={(e) => setNewSizePrice(e.target.value)}
                            className="form-control"
                          />
                        </div>
                        <div className="col-md-2">
                          <input
                            type="number"
                            placeholder="Disc. Price"
                            value={selectedColorForSize === colorVar.color ? newSizeDiscountPrice : ""}
                            onChange={(e) => setNewSizeDiscountPrice(e.target.value)}
                            className="form-control"
                          />
                        </div>
                        <div className="col-md-2">
                          <input
                            type="number"
                            placeholder="Qty"
                            value={selectedColorForSize === colorVar.color ? newSizeQuantity : ""}
                            onChange={(e) => setNewSizeQuantity(e.target.value)}
                            className="form-control"
                          />
                        </div>
                        <div className="col-md-3">
                          <button
                            onClick={addSizeToColor}
                            className="btn btn-success w-100"
                            type="button"
                          >
                            <PlusOutlined /> Add Size
                          </button>
                        </div>
                      </div>

                      {/* ✅ List of Sizes for this Color */}
                      {colorVar.sizes.length > 0 && (
                        <div className="mt-3">
                          <h6>Sizes for {colorVar.color}:</h6>
                          <div className="table-responsive">
                            <table className="table table-sm table-bordered">
                              <thead>
                                <tr>
                                  <th>Size</th>
                                  <th>Price</th>
                                  <th>Disc. Price</th>
                                  <th>Quantity</th>
                                  <th>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {colorVar.sizes.map((size, sizeIndex) => (
                                  <tr key={size.size}>
                                    <td>{size.size}</td>
                                    <td>${size.price}</td>
                                    <td>${size.discountPrice}</td>
                                    <td>{size.quantity}</td>
                                    <td>
                                      <button
                                        type="button"
                                        onClick={() => removeSizeFromColor(colorVar.color, size.size)}
                                        className="btn btn-danger btn-sm"
                                      >
                                        <AiOutlineCloseCircle />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* ✅ Simple Product Form */
                <>
                  <div className="mb-3">
                    <h5>Simple Product Details</h5>
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Base Price *</label>
                        <input
                          type="number"
                          placeholder="Base Price"
                          value={basePrice}
                          onChange={(e) => setBasePrice(e.target.value)}
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Discount Price</label>
                        <input
                          type="number"
                          placeholder="Discount Price"
                          value={baseDiscountPrice}
                          onChange={(e) => setBaseDiscountPrice(e.target.value)}
                          className="form-control"
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Quantity *</label>
                          <input
                            type="number"
                            placeholder="Quantity"
                            value={baseQuantity}
                            onChange={(e) => setBaseQuantity(e.target.value)}
                            className="form-control"
                            required
                          />
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Colors</label>
                      <Select
                        mode="tags"
                        style={{ width: "100%" }}
                        placeholder="Select or add colors"
                        value={color}
                        onChange={(val) => setColor(val)}
                      >
                        {colorOptions.map((c) => (
                          <Option key={c} value={c}>
                            {c}
                          </Option>
                        ))}
                      </Select>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Sizes</label>
                      <Select
                        mode="tags"
                        style={{ width: "100%" }}
                        placeholder="Select or add sizes"
                        value={size}
                        onChange={(val) => setSize(val)}
                      >
                        {sizeOptions.map((s) => (
                          <Option key={s} value={s}>
                            {s}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </div>
                </>
              )}

              <div className="mb-3">
                <label className="form-label">Brand</label>
                <Select
                  mode="tags"
                  style={{ width: "100%" }}
                  placeholder="Select or add brands"
                  value={brand}
                  onChange={(val) => setBrand(val)}
                >
                  {brandOptions.map((b) => (
                    <Option key={b} value={b}>
                      {b}
                    </Option>
                  ))}
                </Select>
              </div>

              <div className="mb-3">
                <label className="form-label">Shipping</label>
                <Select
                  value={shipping}
                  onChange={(value) => setShipping(value)}
                  placeholder="Select shipping option"
                  className="w-100"
                >
                  <Option value="0">No</Option>
                  <Option value="1">Yes</Option>
                </Select>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Video Url</label>
                <input
                  type="text"
                  placeholder="Paste Video Url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="form-control"
                />
              </div>
              
              <div className="d-flex gap-3">
                <button
                  onClick={handleUpdate}
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <span>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Updating...
                    </span>
                  ) : (
                    "Update Product"
                  )}
                </button>
                
                <button
                  onClick={handleDelete}
                  className="btn btn-danger"
                >
                  Delete Product
                </button>
              </div>
            </div>

            {/* Categories + Subcategories */}
            <div className="col-md-3">
              <h5>Main Categories *</h5>
              <small className="text-muted d-block mb-3">Select at least one category</small>
              {categories.map((cat) => (
                <div key={cat._id}>
                  <Checkbox
                    checked={selectedCategories.includes(cat._id)}
                    onChange={() => handleCategoryChange(cat._id)}
                  >
                    {cat.name}
                  </Checkbox>

                  {selectedCategories.includes(cat._id) &&
                    cat.subcategories &&
                    cat.subcategories.length > 0 && (
                      <div className="ms-4">
                        <h6 className="mt-2 mb-2">Subcategories</h6>
                        {cat.subcategories.map((sub, idx) => (
                          <div key={idx}>
                            <Checkbox
                              checked={selectedSubcategories.includes(sub)}
                              onChange={() => handleSubcategoryChange(sub)}
                            >
                              {sub}
                            </Checkbox>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error Modal */}
      {errorModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "#fff",
            padding: "20px 30px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            maxWidth: "400px",
            width: "90%",
            textAlign: "center",
          }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <h3 style={{ marginBottom: "10px", color: 'red', textAlign: 'center' }}><MdError /></h3>
            </div>
            <ul style={{ textAlign: "center", paddingLeft: "20px" }}>
              {errorMessages.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
            <button style={{
              marginTop: "15px",
              padding: "8px 16px",
              backgroundColor: "#f44336",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }} onClick={() => setErrorModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateProduct;