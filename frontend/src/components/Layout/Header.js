import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import toast from "react-hot-toast";
import { FaUser, FaBars, FaGift, FaBook, FaLaptop, FaGamepad, FaCar } from "react-icons/fa";
import { TiShoppingCart } from "react-icons/ti";
import { Badge, Drawer, Input } from "antd";
import { SearchOutlined, RightOutlined } from "@ant-design/icons";
import useCategory from "../../hooks/useCategory";
import { useCart } from "../../context/cart";
import SearchInput from "../Form/SearchInput";

const Header = () => {
  const [auth, setAuth] = useAuth();
  const [cart] = useCart();
  const [showTopHeader, setShowTopHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const categories = useCategory();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
console.log("categories",categories)
  // Example category icons
  const categoryIcons = {
    books: <FaBook style={{ color: "#4cc9f0" }} />,
    gifts: <FaGift style={{ color: "#ff477e" }} />,
    electronics: <FaLaptop style={{ color: "#f72585" }} />,
    games: <FaGamepad style={{ color: "#7209b7" }} />,
    automobiles: <FaCar style={{ color: "#06d6a0" }} />,
  };

  const filteredCategories = categories?.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  // Drawer states
  const [openCategoryDrawer, setOpenCategoryDrawer] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

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
      {/* ✅ Top header */}
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
          backgroundColor: "#EBEBEB",
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

          {/* Search */}
          <SearchInput />

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
                        to={`/dashboard/${auth?.user?.role === 1 ? "admin" : "user"
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

      {/* ✅ Bottom nav */}
      <div
        className="sticky-top"
        style={{
          top: "0",
          zIndex: "1020",
          backgroundColor: "#00a297",
        }}
      >
        <div className="container d-flex align-items-center py-2 flex-wrap gap-3">
          {/* 🔥 Drawer Trigger */}
          <button
            className="btn text-white d-flex align-items-center"
            style={{
              backgroundColor: "#007580",
              border: "1px solid #007580",
            }}
            onClick={() => setOpenCategoryDrawer(true)}
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
            <li className="nav-item">
              <NavLink to="/about" className="nav-link text-white">
                About Us
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/contact"
                className="nav-link text-white text-decoration-none fw-bold"
              >
                Contact Us
              </NavLink>
            </li>
          </ul>
        </div>
      </div>

      {/* ✅ Main Drawer */}
      <Drawer
        title={<span style={{ color: "#fff" }}>📂 All Category</span>}
        placement="left"
        closable
        onClose={() => setOpenCategoryDrawer(false)}
        open={openCategoryDrawer}
        width={300}
        bodyStyle={{ backgroundColor: "#0d1b2a", padding: "10px" }}
        headerStyle={{ backgroundColor: "#0d1b2a", borderBottom: "1px solid #222" }}
         zIndex={2000} // <- Add thi
      >
        {/* Search Bar */}
        <Input
          placeholder="Search Category"
          prefix={<SearchOutlined style={{ color: "#888" }} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            marginBottom: "15px",
            borderRadius: "20px",
            backgroundColor: "#1b263b",
            color: "#fff",
          }}
        />

        {/* Category List */}
        <ul className="list-unstyled">
          {filteredCategories?.map((cat) => (
            <li
              key={cat._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 10px",
                marginBottom: "5px",
                borderRadius: "6px",
                backgroundColor: "#1b263b",
                cursor: "pointer",
                color: "#fff",
                fontSize: "14px",
              }}
              onClick={() => {
                if (cat.subcategories?.length) {
                  setSelectedCategory(cat);
                } else {
                  navigate(`/category/${cat.slug}`);
                  setOpenCategoryDrawer(false);
                }
              }}
            >
              <div className="d-flex align-items-center gap-2">
                <span style={{ fontSize: "18px" }}>
                  {categoryIcons[cat.slug] || "📦"}
                </span>
                {cat.name}
              </div>
              <RightOutlined style={{ color: "#bbb" }} />
            </li>
          ))}
        </ul>

        {/* ✅ Subcategory Drawer */}
        <Drawer
          title={<span style={{ color: "#fff" }}>{selectedCategory?.name}</span>}
          placement="left"
          width={280}
          closable
          onClose={() => setSelectedCategory(null)}
          open={!!selectedCategory}
          bodyStyle={{ backgroundColor: "#0d1b2a", padding: "10px" }}
          headerStyle={{ backgroundColor: "#0d1b2a", borderBottom: "1px solid #222" }}
        >
          <ul className="list-unstyled">
            {selectedCategory?.subcategories?.map((sub,index) => (
              <li
                key={index}
                style={{
                  padding: "12px 10px",
                  borderBottom: "1px solid #1b263b",
                  color: "#fff",
                  cursor: "pointer",
                }}
                onClick={() => {
                  navigate(`/subcategory/${sub.toLowerCase()}`); // use string directly
                  setSelectedCategory(null);
                  setOpenCategoryDrawer(false);
                }}
              >
                {sub}
              </li>
            ))}
          </ul>
        </Drawer>
      </Drawer>
    </>
  );
};

export default Header;
