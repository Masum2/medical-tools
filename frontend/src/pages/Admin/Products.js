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

  useEffect(() => {
    getAllProducts();
  }, []);

  return (

    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-2 p-0">
          <AdminMenu />
        </div>

        {/* Main Content */}
        <div className="col-md-10">
          {/* Header start */}
          <div className="container d-flex justify-content-center align-items-center text-white flex-wrap " style={{ background: "#007580", padding: '5px' }}>

            <p><strong>All Product</strong> </p>

          </div>
          {/* Header end */}
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-info text-center">
                <tr>
                  <th>SN</th>
                  <th>Product Id</th>
                  <th>Name</th>
                  {/* <th>Description</th> */}
                  <th>Image</th>

                  <th>Quantity</th>
                  {/* <th>Shipping</th> */}
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {products?.map((p, index) => (
                  <tr key={p._id}>
                    <td>{index + 1}</td>
                    <td>{p._id}</td>
                    <td>{p.name?.substring(0, 20)}</td>
                    {/* <td>{p.description?.replace(/<[^>]+>/g, '').substring(0, 50)}...</td> */}

                    <td>
                      <img
                        src={`${API}/api/v1/product/product-photo/${p._id}?index=0`}
                        alt={p.name}
                        style={{ width: "60px", height: "60px", objectFit: "cover" }}
                        className="rounded"
                      />
                    </td>

                    <td>{p.quantity}</td>
                    {/* <td>{p.shipping ? "Yes" : "No"}</td> */}
                    <td>{p.price}</td>
                    <td>
                      <Link
                        to={`/dashboard/admin/product/${p.slug}`}
                        className="btn btn-sm btn-info me-2"
                      >
                        👁 View
                      </Link>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

  );
};

export default Products;
