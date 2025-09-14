import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import AdminMenu from "../../components/Layout/AdminMenu";
import { PlusOutlined } from "@ant-design/icons";
import { Checkbox, Select } from "antd";
import toast from "react-hot-toast";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { Editor } from "@tinymce/tinymce-react";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { useProduct } from "../../context/product";
import ProductDescriptionEditor from "../../components/ProductDescriptionEditor";
const { Option } = Select;

const CreateProduct = () => {
  const navigate = useNavigate();
  const [auth] = useAuth();
  const API = process.env.REACT_APP_API;

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [shipping, setShipping] = useState("");
  const [draggedIndex, setDraggedIndex] = useState(null);
  
  // Predefined values
  
  const brandOptions = ["Made In Bangladesh", "Made In India", "Made In China", "Made In American", "Made In Japan","No Brand"];
const colorOptions = [
  "Red", "Blue", "Green", "Black", "White", "Yellow", "Orange", "Pink", 
  "Purple", "Brown", "Gray", "Silver", "Gold", "Navy Blue", "Sky Blue", 
  "Maroon", "Olive", "Teal", "Beige", "Cream", "Peach", "Violet", 
  "Turquoise", "Lavender", "Charcoal", "Magenta", "Cyan", "Lime", 
  "Indigo", "Coral", "Salmon", "Chocolate", "Tan", "Mint", "Mustard", 
  "Plum", "Ruby", "Sapphire", "Emerald", "Bronze", "Copper", "Ivory", 
  "Khaki", "Rose", "Periwinkle", "Aquamarine", "Crimson", "Fuchsia", 
  "Mauve", "Burgundy","Ash","Not Specified",
"Multi-Color",
"Any Colour",
"Ramdom Colour"
];

const sizeOptions = [
  "S", "M", "L", "XL", "XXL",
   "Free Size", "One Size","Not Specified",
  "36 X 29 X 9 Cm",
  "38 X 30 X 10 Cm",
  "40 X 32 X 11 Cm",
  "42 X 34 X 12 Cm",
  "44 X 36 X 13 Cm",
  "46 X 38 X 14 Cm",
 
];


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
  }, []);

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

  // Handle drag start
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Add a small delay to make the drag image appear correctly
    setTimeout(() => {
      e.target.classList.add("dragging");
    }, 0);
  };

  // Handle drag over
  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Handle drop
  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    
    // Reorder photos array
    const updatedPhotos = [...photos];
    const [movedPhoto] = updatedPhotos.splice(draggedIndex, 1);
    updatedPhotos.splice(targetIndex, 0, movedPhoto);
    
    setPhotos(updatedPhotos);
    setDraggedIndex(null);
    
    // Remove dragging class from all elements
    document.querySelectorAll('.drag-item').forEach(el => {
      el.classList.remove('dragging');
    });
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedIndex(null);
    // Remove dragging class from all elements
    document.querySelectorAll('.drag-item').forEach(el => {
      el.classList.remove('dragging');
    });
  };

  // Handle multiple photos selection sequentially
  const handlePhotoChange = (e, index) => {
    const selectedFiles = Array.from(e.target.files);
    const updatedPhotos = [...photos];

    selectedFiles.forEach((file, idx) => {
      if (index + idx < 5) {
        updatedPhotos[index + idx] = file;
      }
    });

    setPhotos(updatedPhotos);
  };

  const { refreshProducts } = useProduct();
  
  // Create product
  const handleCreate = async () => {
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

      // Append photos sequentially
      photos.forEach((photo) => {
        if (photo) formData.append("photos", photo);
      });

      const { data } = await axios.post(
        `${API}/api/v1/product/create-product`,
        formData,
        {
          headers: {
            Authorization: auth?.token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success("✅ Product created");
        navigate("/dashboard/admin/products");
        refreshProducts(); // HomePage context auto update
      }
    } catch (error) {
      console.log(error);
      toast.error("Error creating product");
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
              Create Product
            </NavLink>
          </div>
          <div className="row" style={{ padding: "20px", marginLeft: '20px' }}>
            <div className="col-md-9">
              {/* Product Images Upload with Drag & Drop */}
              <div className="mb-3">
                <h5 className="mb-2">
                  Product Images <span className="text-danger">*</span>
                </h5>
                <small className="text-muted d-block mb-3">
                  Upload between 1 to 5 images. Drag and drop to reorder.
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
                          <img
                            src={URL.createObjectURL(photos[i])}
                            alt="preview"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
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
                          onClick={() => {
                            const updatedPhotos = [...photos];
                            updatedPhotos[i] = null;
                            setPhotos(updatedPhotos);
                          }}
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

              <button onClick={handleCreate} className="btn btn-primary">
                Create Product
              </button>
            </div>

            {/* Categories + Subcategories */}
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

export default CreateProduct;