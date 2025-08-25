import React, { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/auth";
import toast from "react-hot-toast";
import { FaUser, FaBars } from "react-icons/fa";
import useCategory from "../../hooks/useCategory";
import { Badge } from "antd";
import { useCart } from "../../context/cart";
import { TiShoppingCart } from "react-icons/ti";
import SearchInput from "../Form/SearchInput";

const Header = () => {
  const [auth, setAuth] = useAuth();
  const [cart] = useCart();
  const [showTopHeader, setShowTopHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const categories = useCategory();

  const handleLogout = () => {
    setAuth({
      ...auth,
      user: null,
      token: "",
    });
    localStorage.removeItem("auth");
    toast.success("Logout Successfully");
  };

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 50) {
        setShowTopHeader(false);
      } else {
        setShowTopHeader(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      {/* ✅ Top header (hide on scroll) */}
      <div
        className={`py-2 transition-all`}
        style={{
          position: "relative",
          zIndex: 1055,
          transform: showTopHeader ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 0.3s ease-in-out",
          backgroundColor: "#00a297",
        }}
      >
        <div className="container d-flex justify-content-between align-items-center text-white flex-wrap gap-2">
          <p className="mb-0 small">
            Get upto <strong>25% cashback</strong> on first order:{" "}
            <strong>GET25OFF</strong> - SHOP NOW
          </p>
          <div className="text-end small">
            <p className="mb-0">Need Help? +8801718777229</p>
          </div>
        </div>
      </div>

      {/* ✅ Middle header */}
      <div
        className="py-0 border-bottom "
        style={{
          position: "relative",
          zIndex: 1055,
           backgroundColor: "#EBEBEB" ,
        }}
      >
        <div className="container d-flex flex-wrap align-items-center justify-content-between gap-3">
          {/* Logo */}
          <div className="d-flex align-items-center">
          <Link to="/" className="d-flex align-items-center">
            <img
              src="/images/newlogo.png"
              alt="Logo"
              style={{ width: "80px", height: "80px" }}
            />
          </Link>
          <p className="font">HealthProo</p>
</div>
          {/* Search Bar */}
          {/* <form
            className="d-flex flex-grow-1 mx-3"
            style={{ maxWidth: "600px" }}
          >
            <input
              type="search"
              placeholder="Search..."
              className="form-control rounded-start"
              style={{ border: "1px solid #42BAC9" }}
            />
            <button
              className="btn text-white rounded-end"
              type="submit"
              style={{
                
                backgroundColor: "#00a297",
                //  backgroundColor: "#007580",
                border: "1px solid #00a297",
              }}
            >
              Search
            </button>
          </form> */}
<SearchInput/>
          {/* Cart & User */}
          <div className="d-flex align-items-center gap-4">
            <NavLink to="/cart" className="nav-link p-0">
              <Badge count={cart?.length} showZero offset={[10, -5]}>
                <TiShoppingCart
                  className="fs-3"
                  style={{ color: "#00a297" }}
                />
              </Badge>
            </NavLink>

            <div className="dropdown">
              {!auth?.user ? (
                <Link to="/login" className="text-dark text-decoration-none">
                  <FaUser className="fs-4" style={{ color: "#00a297" }} />
                </Link>
              ) : (
                <>
                  <button
                    className="btn btn-link text-dark text-decoration-none dropdown-toggle"
                    id="userMenu"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {auth?.user?.name}
                  </button>
                  <ul
                    className="dropdown-menu"
                    aria-labelledby="userMenu"
                    style={{ zIndex: 1050 }}
                  >
                    <li>
                      <NavLink
                        to={`/dashboard/${
                          auth?.user?.role === 1 ? "admin" : "user"
                        }`}
                        className="dropdown-item"
                      >
                        Dashboard
                      </NavLink>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="dropdown-item"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Bottom navigation (sticky) */}
      <div
        className="sticky-top"
        style={{ top: "0", zIndex: "1020", 
          backgroundColor: "#00a297" ,
          //  backgroundColor: "#FFF" 
        }}
      >
        <div className="container d-flex align-items-center py-2 flex-wrap gap-3">
          <button
            className="btn text-white d-flex align-items-center"
            style={{
              backgroundColor: "#007580",
              border: "1px solid #007580",
            }}
          >
            <FaBars className="me-2" /> All Categories
          </button>

          <ul className="nav ms-3 flex-wrap">
            <li className="nav-item">
              <NavLink to="/" className="nav-link text-white">
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/shop" className="nav-link text-white">
                Shop
              </NavLink>
            </li>
            <li className="nav-item dropdown">
              <Link
                className="nav-link dropdown-toggle text-white"
                to={"/categories"}
                data-bs-toggle="dropdown"
              >
                Categories
              </Link>
              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" to={"/categories"}>
                    All Categories
                  </Link>
                </li>
                {categories?.map((c) => (
                  <li key={c._id}>
                    <Link
                      className="dropdown-item"
                      to={`/category/${c.slug}`}
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li className="nav-item">
              <NavLink to="/about" className="nav-link text-white">
                About Us
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/contact" className="nav-link text-white text-decoration-none fw-bold">
                Contact Us
              </NavLink>
            </li>
          </ul>

          <div className="ms-auto">
            {!auth?.user && (
              <NavLink
                to="/login"
                className="text-white text-decoration-none fw-semibold"
              >
                Login / Register
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
