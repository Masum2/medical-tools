import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import AdminMenu from "../../components/Layout/AdminMenu";
import { PlusOutlined } from "@ant-design/icons";
import { Checkbox, Select } from "antd";
import toast from "react-hot-toast";
import axios from "axios";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { AiOutlineCloseCircle } from "react-icons/ai";
import ProductDescriptionEditor from "../../components/ProductDescriptionEditor";

const { Option } = Select;

const UpdateProduct = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [auth] = useAuth();
  const API = process.env.REACT_APP_API;

  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [photos, setPhotos] = useState(Array(5).fill(null));
  console.log("photos",photos)
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [brand, setBrand] = useState([]);
  const [color, setColor] = useState([]);
  const [size, setSize] = useState([]);
  const [shipping, setShipping] = useState("");
  const [id, setId] = useState("");
  const [removedPhotoIndexes, setRemovedPhotoIndexes] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [existingPhotoCount, setExistingPhotoCount] = useState(0);
  
  const brandOptions = ["Nike", "Adidas", "Puma", "Gucci", "Zara"];
  const colorOptions = ["Red", "Blue", "Green", "Black", "White"];
  const sizeOptions = ["S", "M", "L", "XL", "XXL"];
  
  // ✅ Load categories
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
  }, []);

  // ✅ Load product details
  useEffect(() => {
    const getProduct = async () => {
      try {
        const { data } = await axios.get(
          `${API}/api/v1/product/get-product/${params.slug}`
        );
        if (data?.product) {
          setId(data.product._id);
          setName(data.product.name);
          setDescription(data.product.description);
          setPrice(data.product.price);
          setDiscountPrice(data.product.discountPrice);
          setQuantity(data.product.quantity);
          setBrand(data.product.brand || []);
          setColor(data.product.color || []);
          setSize(data.product.size || []);
          setShipping(data.product.shipping ? "1" : "0");
          setSelectedCategories(data.product.categories || []);
          setSelectedSubcategories(data.product.subcategories || []);

          // Initialize photos array with placeholders for existing images
         // Initialize photos array with placeholders for existing images
const photoArray = Array(5).fill(null);
if (data.product.photos && data.product.photos.length > 0) {
  data.product.photos.forEach((p, index) => {
    photoArray[index] = { 
      type: "existing", 
      index, 
      url: p.url   // ✅ এখানে url সেট করো
    };
  });
  setExistingPhotoCount(data.product.photos.length);
}
setPhotos(photoArray);
        }
      } catch (error) {
        console.log(error);
        toast.error("Error fetching product");
      }
    };
    getProduct();
  }, [params.slug]);

  // ✅ Handle Category select
  const handleCategoryChange = (catId) => {
    let updated = [...selectedCategories];
    if (updated.includes(catId)) {
      updated = updated.filter((c) => c !== catId);
    } else {
      updated.push(catId);
    }
    setSelectedCategories(updated);

    // dynamically subcategory update
    const selectedCats = categories.filter((c) => updated.includes(c._id));
    const allSubs = selectedCats.flatMap((c) => c.subcategories || []);
    setSubcategories(allSubs);
    setSelectedSubcategories([]); // reset
  };

  // ✅ Handle Subcategory select
  const handleSubcategoryChange = (sub) => {
    let updated = [...selectedSubcategories];
    if (updated.includes(sub)) {
      updated = updated.filter((s) => s !== sub);
    } else {
      updated.push(sub);
    }
    setSelectedSubcategories(updated);
  };

  // ✅ Handle photos upload
  const handlePhotoChange = (e, index) => {
    const files = [...photos];
    files[index] = { type: "new", file: e.target.files[0] };
    setPhotos(files);
  };

  // ✅ Handle photo removal
  const handleRemovePhoto = (index) => {
    const updatedPhotos = [...photos];
    
    // If it's an existing photo, mark it for removal
    if (updatedPhotos[index] && updatedPhotos[index].type === "existing") {
      setRemovedPhotoIndexes([...removedPhotoIndexes, index]);
      setExistingPhotoCount(prev => prev - 1);
    }
    
    // Clear the photo slot
    updatedPhotos[index] = null;
    setPhotos(updatedPhotos);
  };

  // ✅ Handle drag start
  const handleDragStart = (e, index) => {
    if (!photos[index]) return; // Only allow dragging if there's a photo
    
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
    
    // Add a small delay to make the drag image appear correctly
    setTimeout(() => {
      e.target.classList.add("dragging");
    }, 0);
  };

  // ✅ Handle drag over
  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // ✅ Handle drop
  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"));
    if (sourceIndex === targetIndex) return;
    
    // Reorder photos array
    const updatedPhotos = [...photos];
    const [movedPhoto] = updatedPhotos.splice(sourceIndex, 1);
    updatedPhotos.splice(targetIndex, 0, movedPhoto);
    
    setPhotos(updatedPhotos);
    setDraggedIndex(null);
    
    // Remove dragging class from all elements
    document.querySelectorAll('.drag-item').forEach(el => {
      el.classList.remove('dragging');
    });
  };

  // ✅ Handle drag end
  const handleDragEnd = () => {
    setDraggedIndex(null);
    // Remove dragging class from all elements
    document.querySelectorAll('.drag-item').forEach(el => {
      el.classList.remove('dragging');
    });
  };

  // ✅ Update product
  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("discountPrice", discountPrice);
      formData.append("quantity", quantity);
      formData.append("brand", JSON.stringify(brand));
      formData.append("color", JSON.stringify(color));
      formData.append("size", JSON.stringify(size));
      formData.append("shipping", shipping);

      if (selectedCategories.length > 0)
        formData.append("categories", JSON.stringify(selectedCategories));
      if (selectedSubcategories.length > 0)
        formData.append("subcategories", JSON.stringify(selectedSubcategories));

      // Add removed photo indexes to form data
      if (removedPhotoIndexes.length > 0) {
        formData.append("removedPhotos", JSON.stringify(removedPhotoIndexes));
      }

      // Add new photos to form data
      photos.forEach((photo, index) => {
        if (photo && photo.type === "new" && photo.file) {
          formData.append("photos", photo.file);
          formData.append("replaceIndex", index);
        }
      });

      // Send the current order of photos
      const photoOrder = photos.map((photo, index) => {
        if (!photo) return null;
        return photo.type === "existing" ? { type: "existing", index: photo.index } : { type: "new", index };
      }).filter(item => item !== null);
      
      formData.append("photoOrder", JSON.stringify(photoOrder));

      const { data } = await axios.put(
        `${API}/api/v1/product/update-product/${id}`,
        formData,
        {
          headers: {
            Authorization: auth?.token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success("✅ Product updated");
        navigate("/dashboard/admin/products");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error updating product");
    }
  };

  // ✅ Delete product
  const handleDelete = async () => {
    try {
      const { data } = await axios.delete(
        `${API}/api/v1/product/delete-product/${id}`,
        {
          headers: { Authorization: auth?.token },
        }
      );
      if (data.success) {
        toast.success("🗑️ Product deleted");
        navigate("/dashboard/admin/products");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error deleting product");
    }
  };

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
              Update Your Product
            </NavLink>
          </div>
          
          <div className="row" style={{ padding: '20px', marginLeft: "10px" }}>
            <div className="col-md-9">
              {/* ✅ Image Upload with Drag & Drop */}
              <div className="mb-3">
                <h5 className="mb-2">Product Images</h5>
                <small className="text-muted d-block mb-3">
                  Upload between 1 to 5 images. Drag and drop to reorder.
                </small>

                <div className="d-flex flex-wrap gap-3">
                  {photos.map((photo, i) => (
                    <div
                      key={i}
                      className="drag-item"
                      draggable={!!photo}
                      onDragStart={(e) => handleDragStart(e, i)}
                      onDragOver={(e) => handleDragOver(e, i)}
                      onDrop={(e) => handleDrop(e, i)}
                      onDragEnd={handleDragEnd}
                      style={{
                        position: "relative",
                        width: "100px",
                        height: "120px",
                        cursor: photo ? "grab" : "pointer",
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
                          position: "relative",
                          border: "2px solid #00a297",
                          borderStyle: "dashed",
                        }}
                      >
                        {photo ? (
                          photo.type === "new" ? (
                            <img
                              src={URL.createObjectURL(photo.file)}
                              alt="preview"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "6px",
                              }}
                            />
                          ) : (
                            <img
                              // src={`${API}/api/v1/product/product-photo/${id}?index=${photo.index}`}
                                                      src={photo.url}

                              alt="preview"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "6px",
                              }}
                            />
                          )
                        ) : (
                          <PlusOutlined style={{ fontSize: "28px", color: "#555" }} />
                        )}

                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => handlePhotoChange(e, i)}
                        />
                      </label>
                      
                      {/* Close icon for removing photos */}
                      {photo && (
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

              <input
                type="text"
                placeholder="Product Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-control mb-3"
              />

              <ProductDescriptionEditor
                description={description}
                setDescription={setDescription}
              />
              
              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="form-control mb-3"
              />
              
              <input
                type="number"
                placeholder="Discount Price"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                className="form-control mb-3"
              />
              
              <input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="form-control mb-3"
              />
              
              {/* ✅ Brand Select */}
              <Select
                mode="tags"
                style={{ width: "100%" }}
                placeholder="Select or add brands"
                value={brand}
                onChange={(val) => setBrand(val)}
                className="mb-3"
              >
                {brandOptions.map((b) => (
                  <Option key={b} value={b}>
                    {b}
                  </Option>
                ))}
              </Select>

              {/* ✅ Color Select */}
              <Select
                mode="tags"
                style={{ width: "100%" }}
                placeholder="Select or add colors"
                value={color}
                onChange={(val) => setColor(val)}
                className="mb-3"
              >
                {colorOptions.map((c) => (
                  <Option key={c} value={c}>
                    {c}
                  </Option>
                ))}
              </Select>

              {/* ✅ Size Select */}
              <Select
                mode="tags"
                style={{ width: "100%" }}
                placeholder="Select or add sizes"
                value={size}
                onChange={(val) => setSize(val)}
                className="mb-3"
              >
                {sizeOptions.map((s) => (
                  <Option key={s} value={s}>
                    {s}
                  </Option>
                ))}
              </Select>

              <Select
                value={shipping}
                onChange={(value) => setShipping(value)}
                placeholder="Shipping"
                className="w-100 mb-3"
              >
                <Option value="0">No</Option>
                <Option value="1">Yes</Option>
              </Select>

              <div className="d-flex gap-3">
                <button onClick={handleUpdate} className="btn btn-primary">
                  Update Product
                </button>
                <button onClick={handleDelete} className="btn btn-danger">
                  Delete Product
                </button>
              </div>
            </div>

            {/* ✅ Categories + Subcategories same like Create Page */}
            <div className="col-md-3">
              <h5>Main Categories</h5>
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
      
      {/* Add some CSS for the drag and drop effect */}
      <style>
        {`
          .drag-item.dragging {
            opacity: 0.5;
            transform: scale(0.95);
            z-index: 10;
          }
          .drag-item:active {
            cursor: grabbing;
          }
        `}
      </style>
    </div>
  );
};

export default UpdateProduct;