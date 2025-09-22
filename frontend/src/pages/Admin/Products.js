import React, { useState, useEffect } from "react";
import AdminMenu from "../../components/Layout/AdminMenu";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, NavLink } from "react-router-dom";
import { TiEyeOutline } from "react-icons/ti";
import { RiDeleteBinLine } from "react-icons/ri";
import { useAuth } from "../../context/auth";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
    const {auth} = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
const [selectedProductId, setSelectedProductId] = useState(null);
  const API = process.env.REACT_APP_API;

  // get total count (for pagination)
  const getTotal = async () => {
    try {
      const { data } = await axios.get(`${API}/api/v1/product/product-count`);
      setTotal(data.total);
    } catch (error) {
      console.log(error);
    }
  };

  // get products by page
  const getProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/api/v1/product/product-list/${page}`);
      setProducts(data.products);
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  useEffect(() => {
    getTotal();
  }, []);

  useEffect(() => {
    getProducts();
  }, [page]);

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
          <div className="d-flex justify-content-between align-items-center px-3 py-2 text-white shadow-sm"
            style={{ background: "#001219", position: "sticky", top: 0 }}>
            <NavLink to="/" style={{ fontSize: "18px", textDecoration: 'none', color: '#FFF', backgroundColor: '#0d1b2a', padding: "6px 12px", borderRadius: "4px" }}>
              All Product
            </NavLink>
          </div>

          {/* Product Table */}
          <div style={{ padding: '20px' }}>
            <div className="table-responsive">
              {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
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
                        <td>{(page - 1) * 8 + index + 1}</td>
                        <td>{`HP-${1000 + ((page - 1) * 8 + index + 1)}`}</td>
                        <td>{p.name?.substring(0, 20)}</td>
                        <td>
                          <img
                            // src={`${API}/api/v1/product/product-photo/${p._id}?index=0`}
                            src={p.photos?.[0]?.url}
                            alt={p.name}
                            style={{ width: "60px", height: "60px", objectFit: "cover" }}
                            className="rounded"
                          />
                        </td>
                        <td>{p.brand?.join(", ")}</td>
                        <td>{p.color?.join(", ")}</td>
                        <td>{p.size?.join(", ")}</td>
                        <td>{p.quantity}</td>
                        <td>{p.price}</td>
                        <td>
                          <Link to={`/dashboard/admin/product/${p.slug}`} className="btn btn-sm btn-info me-2">
                            <TiEyeOutline />
                          </Link>
                          <button className="btn btn-sm btn-danger" onClick={() => {
    setSelectedProductId(p._id); // store the product to delete
    setShowDeleteModal(true);    // show modal
  }}
  type="button"  >
                            <RiDeleteBinLine />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
{showDeleteModal && (
  <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Confirm Delete</h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowDeleteModal(false)}
          ></button>
        </div>
        <div className="modal-body">
          Are you sure you want to delete this product?
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </button>
          <button
           type="button" // ✅ Add this
            className="btn btn-danger"
            onClick={async () => {
              try {
                await axios.delete(`${API}/api/v1/product/delete-product/${selectedProductId}`, {
                  headers: { Authorization: auth?.token }
                });
                toast.success("Product deleted successfully");
                getProducts(); // refresh list
                getTotal();    // refresh total
              } catch (error) {
                console.error(error);
                toast.error("Error deleting product");
              } finally {
                setShowDeleteModal(false); // close modal
                setSelectedProductId(null);
              }
            }}
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  </div>
)}
            {/* Pagination Controls */}
            <div className="d-flex justify-content-center mt-3">
              <button
                className="btn btn-secondary me-2"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Prev
              </button>
              <span className="align-self-center">Page {page} of {Math.ceil(total / 8)}</span>
              <button
                className="btn btn-secondary ms-2"
                disabled={page >= Math.ceil(total / 8)}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
