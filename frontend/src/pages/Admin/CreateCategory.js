import React, { useEffect, useState } from "react";
import Layout from "./../../components/Layout/Layout";
import AdminMenu from "./../../components/Layout/AdminMenu";
import toast from "react-hot-toast";
import axios from "axios";
import { Modal } from "antd";
import CategoryForm from "../../components/Form/CategoryForm.js";
import { useAuth } from "../../context/auth.js";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const CreateCategory = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [auth] = useAuth();
const API = process.env.REACT_APP_API;
  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${API}/api/v1/category/create-category`,
        { name },
        { headers: { Authorization: auth?.token } }
      );
      if (data?.success) {
        toast.success(`${name} is created`);
        setName("");
        getAllCategory();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong in input form");
    }
  };

  // Get All Categories
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

  // Update Category
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        `${API}/api/v1/category/update-category/${selected._id}`,
        { name: updatedName },
        { headers: { Authorization: auth?.token } }
      );
      if (data.success) {
        toast.success(`${updatedName} is updated`);
        setSelected(null);
        setUpdatedName("");
        setVisible(false);
        getAllCategory();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  // Delete Category
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
    <Layout title={"Dashboard - Create Category"}>
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-2 p-0">
            <AdminMenu />
          </div>

          {/* Main Content */}
          <div
            className="col-md-10"
            style={{
              background: "#f4f5f7",
              minHeight: "100vh",
              padding: "20px",
            }}
          >
            <div
              className="bg-white p-4 shadow-sm rounded"
              style={{ borderRadius: "10px" }}
            >
              <h4 className="mb-4 fw-bold">Manage Category</h4>

              {/* Add Category Form */}
              <div className="mb-4">
                <CategoryForm
                  handleSubmit={handleSubmit}
                  value={name}
                  setValue={setName}
                />
              </div>

              {/* Categories Table */}
              <div className="table-responsive">
                <table className="table align-middle table-hover">
                  <thead className="table-light">
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Name</th>
                      <th scope="col" style={{ width: "150px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories?.map((c, index) => (
                      <tr key={c._id}>
                        <td>{index + 1}</td>
                        <td>{c.name}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => {
                              setVisible(true);
                              setUpdatedName(c.name);
                              setSelected(c);
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

            {/* Update Modal */}
            <Modal
              onCancel={() => setVisible(false)}
              footer={null}
              open={visible}
            >
              <CategoryForm
                value={updatedName}
                setValue={setUpdatedName}
                handleSubmit={handleUpdate}
              />
            </Modal>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateCategory;
