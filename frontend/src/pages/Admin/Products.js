import React, { useState, useEffect } from "react";
import AdminMenu from "../../components/Layout/AdminMenu";
import Layout from "./../../components/Layout/Layout";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const Products = () => {
  const [products, setProducts] = useState([]);
  const API = process.env.REACT_APP_API;
  // get all products
  const getAllProducts = async () => {
    try {
      const { data } = await axios.get(`${API}/api/v1/product/get-product`);
      setProducts(data.products);
    } catch (error) {
      console.log(error);
      toast.error("Something Went Wrong");
    }
  };

  // lifecycle method
  useEffect(() => {
    getAllProducts();
  }, []);

  return (
    <Layout>
      <div className="row">
        <div className="col-md-3">
          <AdminMenu />
        </div>
        <div className="col-md-9">
          <h1 className="text-center mb-4">All Products List</h1>
          <div className="row">
            {products?.map((p) => (
              <div
                key={p._id}
                className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
              >
                <Link
                  to={`/dashboard/admin/product/${p.slug}`}
                  className="text-decoration-none text-dark"
                >
                  <div className="card h-100 shadow-sm">
                    <img
                      src={`${API}/api/v1/product/product-photo/${p._id}`}
                      className="card-img-top img-fluid"
                      alt={p.name}
                      style={{ objectFit: "cover", height: "200px" }}
                    />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{p.name}</h5>
                      <p className="card-text flex-grow-1">
                        {p.description?.slice(0, 60)}...
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Products;
