import React, { useEffect, useState } from "react";
import AdminMenu from "../../components/Layout/AdminMenu";
import Layout from "./../../components/Layout/Layout";
import { useAuth } from "../../context/auth";
import { NavLink, useNavigate } from "react-router-dom";
import { useProduct } from "../../context/product";
import { useCart } from "../../context/cart";
import toast from "react-hot-toast";
import axios from "axios";

const AdminDashboard = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const { products, setProducts, categories, total, setTotal, loadProducts, loadCategories } = useProduct();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useCart();
  const API = process.env.REACT_APP_API;
    // ---------------- INITIAL LOAD ----------------
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        loadCategories(), // cached categories
        products.length === 0 ? loadProducts(page) : Promise.resolve(), // only load if empty
      ]);
      setLoading(false);
    };
    init();
  }, []);

  // ---------------- LOAD MORE ----------------
  useEffect(() => {
    const fetchMore = async () => {
      if (page === 1) return;
      setLoading(true);
      try {
        const { data } = await axios.get(`${API}/api/v1/product/product-list/${page}`);
        if (data?.products?.length > 0) {
          setProducts(prev => [...prev, ...data.products]);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMore();
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

                fontSize: "14px",
                margin: "6px 0 6px 20px",
                textDecoration: 'none',
                color: '#FFF'

              }}
            >
              Admin Dashboard
            </NavLink>

          </div>

   {/* All Products */}
<div className="container my-5">
  <h2 className="text-center mb-4 fw-bold">All Products</h2>
  <div
    className="product-grid"
    style={{
      display: "grid",
      gap: "20px",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    }}
  >
    {products?.map((p) => (
      <div
        key={p._id}
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: "8px",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      >
        {/* Product Image */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            height: "150px",
          }}
          onClick={() => navigate(`/product/${p.slug}`)}
        >
          <img
            // src={`${API}/api/v1/product/product-photo/${p._id}`}
           src={p.photos?.[0]?.url}
            alt={p.name}
            style={{
              maxHeight: "100%",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        </div>

        {/* Product Info */}
        <div style={{ marginTop: "10px", flexGrow: 1 }}>
          <p style={{ fontWeight: "bold", fontSize: "14px", margin: 0 }}>
            {p.name.length > 25 ? p.name.substring(0, 25) + "..." : p.name}
          </p>
          <h6 style={{ color: "red", fontWeight: "bold", margin: "8px 0" }}>
            ৳{p.price}
          </h6>
        </div>

        {/* Add to Cart Button */}
        <button
          style={{
            width: "100%",
            backgroundColor: "#00a297",
            color: "#fff",
            fontWeight: 600,
            padding: "8px 0",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            marginTop: "auto",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#008f82")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#00a297")}
          onClick={() => {
            const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
            const found = existingCart.find((item) => item._id === p._id);
            if (found) {
              toast.error("Item already added to cart");
            } else {
              const cartItem = {
                _id: p._id,
                name: p.name,
                price: p.price,
                quantity: 1,
                image: `${API}/api/v1/product/product-photo/${p._id}`,
              };
              const updatedCart = [...existingCart, cartItem];
              setCart(updatedCart);
              localStorage.setItem("cart", JSON.stringify(updatedCart));
              toast.success("Item added to cart");
            }
          }}
        >
          Add to Cart
        </button>
      </div>
    ))}
  </div>

  {/* Load More */}
  {products.length < total && (
    <div className="text-center mt-3 mb-5">
      <button
        className="btn btn-warning px-4 py-2"
        onClick={() => setPage(page + 1)}
      >
        {loading ? "Loading ..." : "Load More"}
      </button>
    </div>
  )}
</div>


          {/* Footer */}
          <div className="mt-auto text-center py-3 small text-muted">
            © {new Date().getFullYear()} HealthProo | Admin Dashboard
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;