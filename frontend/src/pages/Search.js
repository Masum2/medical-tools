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
  console.log("values", values);

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
          <div className="search-grid">
            {results.map((p) => (
              <div
                key={p._id}
                className="search-card"
              >
                {/* ❤️ Wishlist Button */}
                {/* <div className="wishlist-btn">
                  <button className="wishlist-icon">
                    <FaRegHeart />
                  </button>
                </div> */}

                {/* 🖼️ Product Image */}
                <div
                  className="product-image"
                  onClick={() => navigate(`/product/${p.slug}`)}
                >
                  <img
                    src={`${API}/api/v1/product/product-photo/${p._id}`}
                    alt={p.name}
                  />
                </div>

                {/* 📄 Product Details */}
                <div className="product-info">
                  <p className="product-name">
                    {p.name.length > 25
                      ? p.name.substring(0, 25) + "..."
                      : p.name}
                  </p>

                  <div className="price-cart">
                    <h6 className="product-price">৳ {p.price}</h6>
                    <div
                      className="cart-btn"
                      onClick={() => {
                        const existingCart =
                          JSON.parse(localStorage.getItem("cart")) || [];

                        // Check if product already exists
                        const found = existingCart.find(
                          (item) => item._id === p._id
                        );

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
                          localStorage.setItem(
                            "cart",
                            JSON.stringify(updatedCart)
                          );
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

      {/* ✅ Responsive CSS */}
      <style jsx>{`
        .search-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 15px;
          margin-top: 20px;
        }

        .search-card {
          background: #fff;
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .wishlist-btn {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 5px;
        }

        .wishlist-icon {
          background: #fff;
          color: #00a297;
          border-radius: 50%;
          padding: 5px;
          cursor: pointer;
          border: 1px solid #00a297;
        }

        .product-image {
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          height: 150px;
        }

        .product-image img {
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
        }

        .product-info {
          margin-top: 10px;
        }

        .product-name {
          font-weight: bold;
          font-size: 14px;
          margin: 0;
        }

        .price-cart {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
        }

        .product-price {
          color: red;
          font-weight: bold;
          margin: 0;
        }

        .cart-btn {
          cursor: pointer;
          color: #fff;
          font-weight: bold;
          background-color: #00a297;
          padding: 4px;
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Tablet */
        @media (max-width: 1024px) {
          .search-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .search-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* Small Mobile */
        @media (max-width: 480px) {
          .search-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          .product-image {
            height: 120px;
          }
          .product-name {
            font-size: 12px;
          }
        }
      `}</style>
    </Layout>
  );
};

export default Search;
