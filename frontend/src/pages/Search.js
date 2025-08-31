import React from "react";
import Layout from "./../components/Layout/Layout";
import { useSearch } from "../context/search";
import { useNavigate } from "react-router-dom";
import { FaRegHeart } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import { toast } from "react-hot-toast";
import { useCart } from "../context/cart";

const Search = () => {
  const [values] = useSearch();
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API;
 const [cart, setCart] = useCart();
  // ✅ make sure it's always an array
  const results = Array.isArray(values?.results) ? values.results : [];
console.log("values",values)

  return (
    <Layout title={"Search results"}>
      <div className="container">
        <div className="text-center">
          <h1>Search Results</h1>
          <h6>
            {results.length < 1
              ? "No Products Found"
              : `Found ${results.length}`}
          </h6>

          {/* ✅ GRID DESIGN START */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "15px",
              marginTop: "20px",
            }}
          >
            {results.map((p) => (
              <div
                key={p._id}
                style={{
                  background: "#fff",
                  border: "1px solid #eee",
                  borderRadius: "8px",
                  padding: "10px",
                }}
              >
                {/* ❤️ Wishlist Button */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginBottom: "5px",
                  }}
                >
                  <button
                    style={{
                      background: "#fff",
                      color: "#00a297",
                      borderRadius: "50%",
                      padding: "5px",
                      cursor: "pointer",
                      border: "1px solid #00a297",
                    }}
                  >
                    <FaRegHeart />
                  </button>
                </div>

                {/* 🖼️ Product Image */}
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
                    src={`${API}/api/v1/product/product-photo/${p._id}`}
                    alt={p.name}
                    style={{
                      maxHeight: "100%",
                      maxWidth: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>

                {/* 📄 Product Details */}
                <div style={{ marginTop: "10px" }}>
                  <p
                    style={{
                      fontWeight: "bold",
                      fontSize: "14px",
                      margin: 0,
                    }}
                  >
                    {p.name.length > 25
                      ? p.name.substring(0, 25) + "..."
                      : p.name}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "8px",
                    }}
                  >
                    <h6
                      style={{
                        color: "red",
                        fontWeight: "bold",
                        margin: 0,
                      }}
                    >
                      ৳ {p.price}
                    </h6>

                    <div
                      style={{
                        cursor: "pointer",
                        color: "#FFF",
                        fontWeight: "bold",
                        backgroundColor: "#00a297",
                        padding: "4px",
                        borderRadius: "2px",
                      }}
                       onClick={() => {
                                               const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
                   
                                               // Check if product already exists
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
                      <IoCartOutline />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* ✅ GRID DESIGN END */}
        </div>
      </div>
    </Layout>
  );
};

export default Search;
