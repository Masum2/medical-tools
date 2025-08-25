import React from "react";
import { Link } from "react-router-dom";
import useCategory from "../hooks/useCategory";
import Layout from "../components/Layout/Layout";

const Categories = () => {
  const categories = useCategory();

  return (
    <Layout title={"All Categories"}>
      <div className="container py-5">
        {/* Page Heading */}
        <h2 className="text-center fw-bold mb-5">Shop by Categories</h2>

        {/* Category Grid */}
        <div
          className="grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          {categories.map((c) => (
            <Link
              to={`/category/${c.slug}`}
              key={c._id}
              style={{ textDecoration: "none" }}
            >
              <div
                className="category-card"
                style={{
                  position: "relative",
                  background: "#fff",
                  borderRadius: "15px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                  padding: "40px 20px",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  overflow: "hidden",
                }}
              >
                {/* Category Icon / Initial (fallback if no image) */}
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    margin: "0 auto 15px",
                    borderRadius: "50%",
                    background: "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "30px",
                    fontWeight: "bold",
                    color: "#2563eb",
                  }}
                >
                  {c.name.charAt(0)}
                </div>

                {/* Category Name */}
                <h5
                  style={{
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: "5px",
                  }}
                >
                  {c.name}
                </h5>

                <p style={{ fontSize: "14px", color: "#666" }}>
                  Explore our {c.name} products
                </p>

                {/* Hover Overlay */}
                <div
                  className="overlay"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "linear-gradient(135deg,#3b82f6,#06b6d4)",
                    opacity: 0,
                    transition: "opacity 0.3s ease",
                    borderRadius: "15px",
                    zIndex: 1,
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    bottom: "20px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    color: "#fff",
                    fontWeight: "bold",
                    opacity: 0,
                    zIndex: 2,
                    transition: "opacity 0.3s ease",
                  }}
                  className="shop-now"
                >
                  Shop Now →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CSS for hover effect */}
      <style>{`
        .category-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        .category-card:hover .overlay {
          opacity: 0.7;
        }
        .category-card:hover .shop-now {
          opacity: 1;
        }
      `}</style>
    </Layout>
  );
};

export default Categories;
