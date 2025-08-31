import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/CategoryProductStyles.css";
import axios from "axios";
import { useCart } from "../context/cart";
import toast from "react-hot-toast";
import { IoCartOutline } from "react-icons/io5";
const CategoryProduct = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [cart, setCart] = useCart();
  const [loading, setLoading] = useState(false);
  const API = process.env.REACT_APP_API;
  useEffect(() => {
    if (params?.slug) getPrductsByCat();
  }, [params?.slug]);
  const getPrductsByCat = async () => {
    try {
      const { data } = await axios.get(
        `${API}/api/v1/product/product-category/${params.slug}`
      );
      setProducts(data?.products);
      setCategory(data?.category);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Layout>
      <div className="container pt-3 category">
        <h4 className="text-center">Category - {category?.name}</h4>
        <h6 className="text-center">{products?.length} result found </h6>
        <div className="col-md-9">
          {/* <h2 className="mb-4 text-center">All Products</h2> */}
          <div className="row">
            {products?.map((p) => (
              <div key={p._id} className="col-sm-6 col-md-3 mb-3">
                <div className="product-card shadow-sm rounded-lg border bg-white h-100 d-flex flex-column">
                  {/* Favorite (Heart) */}
                  {/* <div className="d-flex justify-content-end p-2">
                      <button className="btn btn-light btn-sm rounded-circle border-0">
                        <FaRegHeart />
                      </button>
                    </div> */}

                  {/* Product Image */}
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ cursor: "pointer", }}
                    onClick={() => navigate(`/product/${p.slug}`)}
                  >
                    <img
                      src={`${API}/api/v1/product/product-photo/${p._id}`}
                      alt={p.name}
                      className="img-fluid"
                      style={{ maxHeight: "150px", objectFit: "contain" }}
                    />
                  </div>

                  {/* Product Details */}
                  <div className="px-3 text-left flex-grow-1 d-flex flex-column">
                    <p className="fw-bold mb-1" style={{ fontSize: "14px" }}>
                      {p.name.length > 20 ? p.name.substring(0, 20) + "..." : p.name}
                    </p>


                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "8px",
                        paddingBottom: '10px'
                      }}
                    >
                      <h6 style={{ color: "red", fontWeight: "bold", margin: 0 }}>
                        ৳ {p.price}
                      </h6>
                      <div
                        style={{ cursor: "pointer", color: "#FFF", fontWeight: "bold", backgroundColor: '#00a297', padding: '4px', borderRadius: '2px' }}
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

                    {/* Add to Cart */}
                    {/* <button
                        className="btn  w-100 mt-auto"
                        style={{ backgroundColor: '#00a297', color: '#FFF' }}
                     
                      >
                        
                      </button> */}

                  </div>
                </div>
              </div>


            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-3 mb-5">
            {products && products.length < total && (
              <button
                className="btn  px-4 py-2"
                onClick={(e) => {
                  e.preventDefault();
                  setPage(page + 1);
                }}
                style={{ backgroundColor: '#00a297', color: '#FFF' }}
              >
                {loading ? "Loading ..." : "Load More"}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CategoryProduct;
