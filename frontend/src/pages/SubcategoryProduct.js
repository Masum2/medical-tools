import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/CategoryProductStyles.css"; // Same CSS as category page
import { useCart } from "../context/cart";
import toast from "react-hot-toast";
import { IoCartOutline } from "react-icons/io5";
import Layout from "../components/Layout/Layout";
import { FaAngleRight } from "react-icons/fa";

const SubcategoryProducts = () => {
  const { subSlug } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useCart();
  const API = process.env.REACT_APP_API;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${API}/api/v1/product/subcategory/${subSlug}`
      );
      setProducts(data.products);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [subSlug]);

  return (
     <Layout>
    <div className="container pt-3 category">
      {/* <h4 className="text-center">Subcategory - {subSlug}</h4> */}
   {/* Breadcrumb */}
<div
  style={{
    paddingBottom: "5px",
    fontSize: "16px",
    color: "#555",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    justifyContent: "center",
  }}
>
  {/* Home */}
  <p
    style={{ margin: 0, cursor: "pointer", color: "#00a297" }}
    onClick={() => navigate("/")}
  >
    Home
  </p>
  <FaAngleRight />

  {/* Main Category */}
  {products.length > 0 && products[0].category && (
    <>
      <p
        style={{ margin: 0, cursor: "pointer", color: "#00a297" }}
        onClick={() =>
          navigate(`/category/${products[0].category.slug}`)
        }
      >
        {products[0].category.name}
      </p>
      <FaAngleRight />
    </>
  )}

  {/* Subcategory */}
  <p style={{ margin: 0 }}>{subSlug}</p>
</div>

      {/* <h6 className="text-center">{products?.length} product found </h6> */}

      <div className="col-md-9 mx-auto">
        <div className="row">
          {products?.map((p) => (
            <div key={p._id} className="col-sm-6 col-md-3 mb-3">
              <div className="product-card shadow-sm rounded-lg border bg-white h-100 d-flex flex-column">
                
                {/* Product Image */}
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ cursor: "pointer" }}
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
                      style={{
                        cursor: "pointer",
                        color: "#FFF",
                        fontWeight: "bold",
                        backgroundColor: '#00a297',
                        padding: '4px',
                        borderRadius: '2px'
                      }}
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
                      <IoCartOutline />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More (Optional) */}
        {/* You can keep this if your backend supports pagination */}
      </div>
    </div>
    </Layout>
  );
};

export default SubcategoryProducts;
