import React, { useState, useEffect } from "react";
import AdminMenu from "../../components/Layout/AdminMenu";
import Layout from "./../../components/Layout/Layout";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, NavLink } from "react-router-dom";
import { TiEyeOutline } from "react-icons/ti"; import { RiDeleteBinLine } from "react-icons/ri";
const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const API = process.env.REACT_APP_API;

  // get all products
  const getAllProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/api/v1/product/get-product`);
      setProducts(data.products);
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Something Went Wrong");
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllProducts();
  }, []);

  // open modal
  const openDeleteModal = (pid) => {
    setDeleteId(pid);
    setShowModal(true);
  };

  // close modal
  const closeModal = () => {
    setShowModal(false);
    setDeleteId(null);
  };

  // confirm delete
  const confirmDelete = async () => {
    try {
      await axios.delete(`${API}/api/v1/product/delete-product/${deleteId}`);
      toast.success("Product deleted successfully");
      closeModal();
      getAllProducts();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while deleting");
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
        {/* Main Content */}
        <div className="col-12 col-md-9 col-lg-10 d-flex flex-column" style={{ backgroundColor: "#f4f5f7", minHeight: "100vh" }}>
          {/* Top Header */}
          <div
            className="d-flex flex-wrap justify-content-center align-items-center px-3 py-2 text-white shadow-sm"
            style={{
              background: "#001219", position: "sticky",
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

                color: '#FFF', backgroundColor: '#0d1b2a'

              }}
            >
              All Product
            </NavLink>

          </div>
          {/* Header end */}
          <div style={{ padding: '20px' }}>
            <div className="table-responsive" >
              {loading ? (
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ height: "200px" }}
                >
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <table className="table table-bordered table-hover align-middle">
                  <thead className="table-info text-center">
                    <tr>
                      <th>SN</th>
                      <th>Product Code</th>
                      <th>Name</th>
                      <th>Image</th>
                      <th>Brand</th>
                      <th>Color</th>
                      <th>Size</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-center">
                    {products?.map((p, index) => (
                      <tr key={p._id}>
                        <td>{index + 1}</td>
                        <td>{`HP-${1000 + index + 1}`}</td>
                        <td>{p.name?.substring(0, 20)}</td>
                        <td>
                          <img
                            src={`${API}/api/v1/product/product-photo/${p._id}?index=0`}
                            alt={p.name}
                            style={{
                              width: "60px",
                              height: "60px",
                              objectFit: "cover",
                            }}
                            className="rounded"
                          />
                        </td>
                        <td>{p.brand?.join(", ")}</td>
                        <td>{p.color?.join(", ")}</td>
                        <td>{p.size?.join(", ")}</td>
                        <td>{p.quantity}</td>
                        <td>{p.price}</td>
                        <td>
                          <Link
                            to={`/dashboard/admin/product/${p.slug}`}
                            className="btn btn-sm btn-info me-2"
                          >
                            <TiEyeOutline />
                          </Link>
                          <button
                            onClick={() => openDeleteModal(p._id)}
                            className="btn btn-sm btn-danger"
                          >
                            <RiDeleteBinLine />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this product?
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={confirmDelete}>
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
