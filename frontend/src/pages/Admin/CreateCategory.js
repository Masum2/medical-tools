import React, { useEffect, useState } from "react";
import Layout from "./../../components/Layout/Layout";
import AdminMenu from "./../../components/Layout/AdminMenu";
import toast from "react-hot-toast";
import axios from "axios";
import { Modal } from "antd";
import { useAuth } from "../../context/auth.js";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const CreateCategory = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedSubcategories, setUpdatedSubcategories] = useState([]);
  const [updatedPhoto, setUpdatedPhoto] = useState(null);
  const [auth] = useAuth();

  const API = process.env.REACT_APP_API;

  // Fetch all categories
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get(`${API}/api/v1/category/get-category`);
      if (data.success) setCategories(data.category);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong in getting category");
    }
  };

  useEffect(() => {
    getAllCategory();
  }, []);

  // Handle Add Category
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("subcategories", JSON.stringify(subcategories));
      if (photo) formData.append("photo", photo);

      const { data } = await axios.post(
        `${API}/api/v1/category/create-category`,
        formData,
        { headers: { Authorization: auth?.token, "Content-Type": "multipart/form-data" } }
      );

      if (data.success) {
        toast.success(`${name} is created`);
        setName("");
        setSubcategories([]);
        setPhoto(null);
        getAllCategory();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while creating category");
    }
  };

  // Handle Update Category
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", updatedName);
      formData.append("subcategories", JSON.stringify(updatedSubcategories));
      if (updatedPhoto) formData.append("photo", updatedPhoto);

      const { data } = await axios.put(
        `${API}/api/v1/category/update-category/${selected._id}`,
        formData,
        { headers: { Authorization: auth?.token, "Content-Type": "multipart/form-data" } }
      );

      if (data.success) {
        toast.success(`${updatedName} is updated`);
        setSelected(null);
        setUpdatedName("");
        setUpdatedSubcategories([]);
        setUpdatedPhoto(null);
        setVisible(false);
        getAllCategory();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while updating category");
    }
  };

  // Handle Delete Category
  const handleDelete = async (pId) => {
    try {
      const { data } = await axios.delete(
        `${API}/api/v1/category/delete-category/${pId}`,
        { headers: { Authorization: auth?.token } }
      );
      if (data.success) {
        toast.success(`Category deleted`);
        getAllCategory();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
   
      <div className="container-fluid" title="Admin - Manage Categories">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-2 p-0">
            <AdminMenu />
          </div>

          {/* Main Content */}
          <div className="col-md-10">
                         <div className="container d-flex justify-content-between align-items-center text-white flex-wrap " style={{     background: "#007580",padding:'10px'}}>
          <p className="mb-0 small">
            Get upto <strong>25% cashback</strong> on first order:{" "}
            <strong>GET25OFF</strong> - SHOP NOW
          </p>
          <div className="text-end small">
            <p className="mb-0">Need Help? +8801718777229</p>
          </div>
        </div>
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h4 className="card-title mb-4">Add New Category</h4>
                <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                  <input
                    type="text"
                    placeholder="Category Name"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Subcategories (comma separated)"
                    className="form-control"
                    value={subcategories.join(",")}
                    onChange={(e) =>
                      setSubcategories(e.target.value.split(",").map((s) => s.trim()))
                    }
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={(e) => setPhoto(e.target.files[0])}
                  />
                  <button className="btn btn-primary w-25 mt-2">Add Category</button>
                </form>
              </div>
            </div>

            {/* Categories Table */}
            <div className="card shadow-sm">
              <div className="card-body">
                <h4 className="card-title mb-4">All Categories</h4>
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-dark">
                      <tr>
                        <th>#</th>
                        <th>Category</th>
                        <th>Subcategories</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories?.map((c, index) => (
                        <tr key={c._id}>
                          <td>{index + 1}</td>
                          <td className="d-flex align-items-center gap-2">
                            {c.photo && (
                              <img
                                src={`${API}/api/v1/category/category-photo/${c._id}`}
                                alt={c.name}
                                className="rounded"
                                style={{ width: "50px", height: "50px", objectFit: "cover" }}
                              />
                            )}
                            <span>{c.name}</span>
                          </td>
                          <td>{c.subcategories?.join(", ")}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => {
                                setVisible(true);
                                setSelected(c);
                                setUpdatedName(c.name);
                                setUpdatedSubcategories(c.subcategories || []);
                              }}
                            >
                              <FiEdit />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(c._id)}
                            >
                              <FiTrash2 />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Update Modal */}
            <Modal
              title="Update Category"
              onCancel={() => setVisible(false)}
              footer={null}
              open={visible}
            >
              <form className="d-flex flex-column gap-3" onSubmit={handleUpdate}>
                <input
                  type="text"
                  placeholder="Category Name"
                  className="form-control"
                  value={updatedName}
                  onChange={(e) => setUpdatedName(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Subcategories (comma separated)"
                  className="form-control"
                  value={updatedSubcategories.join(",")}
                  onChange={(e) =>
                    setUpdatedSubcategories(e.target.value.split(",").map((s) => s.trim()))
                  }
                />
                {selected?.photo && (
                  <img
                    src={`${API}/api/v1/category/category-photo/${selected._id}`}
                    alt={selected.name}
                    className="rounded mb-2"
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={(e) => setUpdatedPhoto(e.target.files[0])}
                />
                <button className="btn btn-primary">Update Category</button>
              </form>
            </Modal>
          </div>
        </div>
      </div>
   
  );
};

export default CreateCategory;
