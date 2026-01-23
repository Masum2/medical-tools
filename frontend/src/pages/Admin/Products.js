import React, { useState, useEffect } from "react";
import AdminMenu from "../../components/Layout/AdminMenu";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, NavLink } from "react-router-dom";
import { TiEyeOutline } from "react-icons/ti";
import { RiDeleteBinLine } from "react-icons/ri";
import { useAuth } from "../../context/auth";
import { AiFillDelete } from "react-icons/ai";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [auth] = useAuth();
  
  const API = process.env.REACT_APP_API;
  const ITEMS_PER_PAGE = 8;

  // ✅ Helper function to get product image
  const getProductImage = (product) => {
    // Case 1: New schema - defaultPhotos
    if (product.defaultPhotos && product.defaultPhotos.length > 0) {
      return product.defaultPhotos[0].url;
    }
    
    // Case 2: Old schema - photos
    if (product.photos && product.photos.length > 0) {
      return product.photos[0].url || product.photos[0].secure_url;
    }
    
    // Case 3: Fallback to empty string
    return '';
  };

  // ✅ Helper function to get colors
  const getProductColors = (product) => {
    // New schema
    if (product.availableColors && product.availableColors.length > 0) {
      return product.availableColors;
    }
    
    // Old schema
    if (product.color && product.color.length > 0) {
      return product.color;
    }
    
    return [];
  };

  // ✅ Helper function to get sizes
  const getProductSizes = (product) => {
    // New schema
    if (product.availableSizes && product.availableSizes.length > 0) {
      return product.availableSizes;
    }
    
    // Old schema
    if (product.size && product.size.length > 0) {
      return product.size;
    }
    
    return [];
  };

  // Fetch total product count
  const getTotal = async () => {
    try {
      const { data } = await axios.get(`${API}/api/v1/product/product-count`);
      setTotal(data.total || 0);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch products per page
  const getProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${API}/api/v1/product/product-list/${page}`
      );
      setProducts(data?.products || []);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = "";
        if (searchTerm.trim() === "") {
          url = `${API}/api/v1/product/product-list/${page}`;
        } else {
          url = `${API}/api/v1/product/search/${searchTerm}?page=${page}&limit=8`;
        }

        const { data } = await axios.get(url);
        setProducts(data.products || []);
        setTotal(data.total || 0);
        setLoading(false);
      } catch (error) {
        console.error(error);
        toast.error("Error fetching products");
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, searchTerm, API]);

  // Initial load
  useEffect(() => {
    getTotal();
    getProducts();
  }, []);

  // Delete product
  const handleDelete = async () => {
    try {
      await axios.delete(
        `${API}/api/v1/product/delete-product/${selectedProductId}`,
        {
          headers: { Authorization: auth?.token },
        }
      );
      toast.success("Product deleted successfully");
      setShowDeleteModal(false);
      setSelectedProductId(null);
      getProducts();
      getTotal();
    } catch (error) {
      console.error(error);
      toast.error("Error deleting product");
      setShowDeleteModal(false);
      setSelectedProductId(null);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="row g-0">
        {/* Sidebar */}
        <div
          className="col-12 col-md-3 col-lg-2 p-0 border-end"
          style={{ minHeight: "100vh" }}
        >
          <AdminMenu />
        </div>

        {/* Main Content */}
        <div
          className="col-12 col-md-9 col-lg-10 d-flex flex-column"
          style={{ backgroundColor: "#f4f5f7", minHeight: "100vh" }}
        >
          {/* Top Header */}
          <div
            className="d-flex justify-content-between align-items-center px-3 py-2 text-white shadow-sm"
            style={{ background: "#001219", position: "sticky", top: 0 }}
          >
            <NavLink
              to="/"
              style={{
                fontSize: "18px",
                textDecoration: "none",
                color: "#FFF",
                backgroundColor: "#0d1b2a",
                padding: "6px 12px",
                borderRadius: "4px",
              }}
            >
              All Product
            </NavLink>
          </div>

          {/* Search Section */}
          <div
            style={{
              backgroundColor: "#0d1b2a",
              color: "white",
              textAlign: "center",
              padding: "10px 10px",
              borderBottom: "3px solid #1b263b",
            }}
          >
            <h3 style={{ fontWeight: "600", letterSpacing: "0.5px" }}>
              🔍 Search Products
            </h3>

            <div
              className="d-flex justify-content-center align-items-center mt-3 gap-2"
              style={{ width: "100%" }}
            >
              <input
                type="text"
                placeholder="Type product name here..."
                className="form-control"
                style={{
                  maxWidth: "400px",
                  borderRadius: "30px",
                  padding: "10px 20px",
                  textAlign: "center",
                  border: "1px solid #ccc",
                  flex: "1",
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* Reset Button */}
              {searchTerm && (
                <button
                  className="btn btn-outline-light"
                  style={{
                    borderRadius: "30px",
                    padding: "8px 16px",
                    fontWeight: "500",
                    transition: "0.3s",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => setSearchTerm("")}
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Product Table */}
          <div style={{ padding: "20px" }}>
            <div className="table-responsive">
              {loading ? (
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ height: "200px" }}
                >
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : !products || products.length === 0 ? (
                <div className="text-center text-muted py-4">
                  No products found
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
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-center">
                    {products.map((p, index) => {
                      const productImage = getProductImage(p);
                      const productColors = getProductColors(p);
                      const productSizes = getProductSizes(p);
                      
                      return (
                        <tr key={p._id}>
                          <td>{(page - 1) * ITEMS_PER_PAGE + index + 1}</td>
                          <td>{`HP-${
                            1000 + (page - 1) * ITEMS_PER_PAGE + index + 1
                          }`}</td>
                          <td>{p.name?.substring(0, 20)}</td>
                          <td>
                            {productImage ? (
                              <img
                                src={productImage}
                                alt={p.name}
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  objectFit: "cover",
                                }}
                                className="rounded"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = 
                                    '<div style="width:60px;height:60px;display:flex;align-items:center;justify-content:center;background:#f0f0f0;border-radius:4px;color:#666;font-size:12px;">No Image</div>';
                                }}
                              />
                            ) : (
                              <div 
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  background: "#f0f0f0",
                                  borderRadius: "4px",
                                  color: "#666",
                                  fontSize: "12px"
                                }}
                              >
                                No Image
                              </div>
                            )}
                          </td>
                          <td>{p.brand?.join(", ")}</td>
                          <td>{productColors.join(", ")}</td>
                          <td>{productSizes.join(", ")}</td>
                          <td>
                            <Link
                              to={`/dashboard/admin/product/${p.slug}`}
                              className="btn btn-sm btn-info me-2"
                            >
                              <TiEyeOutline />
                            </Link>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => {
                                setSelectedProductId(p._id);
                                setShowDeleteModal(true);
                              }}
                              type="button"
                            >
                              <RiDeleteBinLine />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
              <div
                className="modal fade show d-block"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              >
                <div className="modal-dialog modal-dialog-centered">
                  <div
                    className="modal-content"
                    style={{ textAlign: "center", padding: "30px" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        marginBottom: "20px",
                      }}
                    >
                      <AiFillDelete size={40} color="#ff4d4f" />
                      <h2 style={{ fontWeight: "bold", marginTop: "10px" }}>
                        Are you sure?
                      </h2>
                      <p style={{ fontSize: "14px", color: "#555" }}>
                        Are you sure you want to delete this product? <br />
                        This action cannot be undone.
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "20px",
                        marginTop: "20px",
                      }}
                    >
                      <button
                        type="button"
                        className="btn btn-danger"
                        style={{ width: "100px" }}
                        onClick={handleDelete}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ width: "100px" }}
                        onClick={() => setShowDeleteModal(false)}
                      >
                        No
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn-close position-absolute top-0 end-0 m-3"
                      onClick={() => setShowDeleteModal(false)}
                    ></button>
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
              <span className="align-self-center">
                Page {page} of {Math.ceil(total / ITEMS_PER_PAGE)}
              </span>
              <button
                className="btn btn-secondary ms-2"
                disabled={page >= Math.ceil(total / ITEMS_PER_PAGE)}
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