import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import AdminMenu from "../../components/Layout/AdminMenu";
import { PlusOutlined } from "@ant-design/icons";
import { Checkbox, Select } from "antd";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { Editor } from "@tinymce/tinymce-react";

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
// Predefined values
const brandOptions = ["Nike", "Adidas", "Puma", "Gucci", "Zara"];
const colorOptions = ["Red", "Blue", "Green", "Black", "White"];
const sizeOptions = ["S", "M", "L", "XL", "XXL"];

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

  // ✅ Handle multiple photos selection sequentially
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
      }
    } catch (error) {
      console.log(error);
      toast.error("Error creating product");
    }
  };

  return (
 
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-2 p-0">
            <AdminMenu />
          </div>
          <div className="col-md-10 ">
                    <div className="container d-flex justify-content-between align-items-center text-white flex-wrap " style={{     background: "#007580",padding:'10px'}}>
          <p className="mb-0 small">
            Get upto <strong>25% cashback</strong> on first order:{" "}
            <strong>GET25OFF</strong> - SHOP NOW
          </p>
          <div className="text-end small">
            <p className="mb-0">Need Help? +8801718777229</p>
          </div>
        </div>
            <div className="row" style={{ marginLeft: "10px" }}>
              <div className="col-md-9">
                {/* Product Images Upload */}
                <div className="mb-3 ">
                  <h5 className="mb-2">
                    Product Images <span className="text-danger">*</span>
                  </h5>
                  <small className="text-muted d-block mb-3">
                    Upload between 1 to 5 images
                  </small>

                  <div className="d-flex flex-wrap gap-3">
                    {[...Array(5)].map((_, i) => (
                      <label
                        key={i}
                        className="rounded d-flex align-items-center justify-content-center"
                        style={{
                          width: "100px",
                          height: "120px",
                          cursor: "pointer",
                          border: "2px dashed #00a297",
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
                              borderRadius: "6px",
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

                {/* TinyMCE Editor */}
                <div style={{ marginBottom: "1rem" }}>
                  <Editor
                    apiKey="1oqyhk7scnb7xognnnvt8fv0r5y2zvdyt26lko7yi2cgmqx2"
                    init={{
                      height: 300,
                      menubar: false,
                      plugins: [
                        "advlist autolink lists link image charmap preview anchor",
                        "searchreplace visualblocks code fullscreen",
                        "insertdatetime media table paste code help wordcount",
                      ],
                      toolbar:
                        "undo redo | formatselect | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist | removeformat | help",
                      content_style: `
                        body { 
                          font-family: Helvetica, Arial, sans-serif; 
                          font-size: 14px; 
                          line-height: 1.6;
                        }
                        ul, ol { padding-left: 20px; }
                        ul { list-style-type: disc; }
                        ol { list-style-type: decimal; }
                      `,
                      advlist_bullet_styles: "default",
                      advlist_number_styles: "default",
                      forced_root_block: "p",
                      invalid_elements: "",
                      valid_children: "+body[style]",
                      verify_html: false,
                      allow_conditional_comments: true,
                      fix_list_elements: true,
                    }}
                    value={description}
                    onEditorChange={(newValue) => setDescription(newValue)}
                  />
                </div>

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
  mode="tags" // ✅ multiple + add new
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
      </div>
  
  );
};

export default CreateProduct;
