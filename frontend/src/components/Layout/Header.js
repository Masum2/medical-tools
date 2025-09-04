import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import toast from "react-hot-toast";
import { FaUser, FaBars, FaGift, FaBook, FaLaptop, FaGamepad, FaCar, FaTimes, FaHome, FaStore, FaInfoCircle, FaAddressCard } from "react-icons/fa";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

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

  // Check screen size for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      
      // Close mobile menu when switching to desktop
      if (!mobile && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* ✅ Top header - Hidden on mobile */}
      {!isMobile && (
        <div
          className={`py-2 transition-all d-none d-lg-block`}
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
      )}

      {/* ✅ Middle header - Sticky on mobile */}
      <div
        className={`py-0 border-bottom ${isMobile ? 'sticky-top' : ''}`}
        style={{
          position: isMobile ? "sticky" : "relative",
          top: isMobile ? "0" : "auto",
          zIndex: 1055,
          backgroundColor: "#EBEBEB",
        }}
      >
        <div className="container d-flex flex-wrap align-items-center justify-content-between gap-3 py-2">
          {/* Logo and Mobile Menu Button */}
          <div className="d-flex align-items-center justify-content-between w-100">
            <div className="d-flex align-items-center">
              <Link to="/" className="d-flex align-items-center">
                <img
                  src="/images/newlogo.png"
                  alt="Logo"
                  style={{ width: isMobile ? "50px" : "80px", height: isMobile ? "50px" : "80px" }}
                />
              </Link>
              <p className="font ms-2 mb-0 d-none d-md-block">HealthProo</p>
            </div>
            
            {/* Desktop Search - Hidden on mobile */}
            {!isMobile && (
              <div className="flex-grow-1 mx-4">
                <SearchInput />
              </div>
            )}
            
            {/* Desktop Cart & User - Hidden on mobile */}
            {!isMobile && (
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
            )}
            
            {/* Mobile Menu Toggle - Only show on mobile */}
            {isMobile && (
              <div className="d-flex align-items-center gap-3">
                <NavLink to="/cart" className="nav-link p-0">
                  <Badge count={cart?.length} showZero offset={[10, -5]}>
                    <TiShoppingCart
                      className="fs-3"
                      style={{ color: "#00a297" }}
                    />
                  </Badge>
                </NavLink>
                
                <button 
                  className="btn p-0"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  style={{ color: "#00a297", fontSize: "1.5rem" }}
                >
                  {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                </button>
              </div>
            )}
          </div>
          
          {/* Mobile Search - Only show on mobile when menu is closed */}
          {isMobile && !isMobileMenuOpen && (
            <div className="w-100 mt-2">
              <SearchInput />
            </div>
          )}
        </div>
      </div>

      {/* ✅ Bottom nav - Hidden on mobile */}
      {!isMobile && (
        <div
          className="sticky-top d-none d-lg-block"
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
      )}

      {/* ✅ Mobile Menu Drawer */}
      {isMobile && (
        <div
          className={`mobile-menu-drawer ${isMobileMenuOpen ? 'open' : ''}`}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            background: 'linear-gradient(135deg, #00a297 0%, #007580 100%)',
            zIndex: 1060,
            transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease-in-out',
            padding: '20px',
            overflowY: 'auto',
            color: 'white'
          }}
        >
          {/* Header with Close Button */}
          <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-light">
            <div className="d-flex align-items-center">
              <img
                src="/images/newlogo.png"
                alt="Logo"
                style={{ width: "40px", height: "40px" }}
              />
              <p className="font ms-2 mb-0 text-white">HealthProo</p>
            </div>
            <button 
              className="btn p-0"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ color: "white", fontSize: "1.5rem" }}
            >
              <FaTimes />
            </button>
          </div>
          
          {/* User Section */}
          <div className="mb-4 p-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
            {!auth?.user ? (
              <Link 
                to="/login" 
                className="btn text-white d-flex align-items-center p-0 fs-5"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaUser className="me-3" /> Login / Register
              </Link>
            ) : (
              <>
                <p className="fw-bold mb-2 text-white">Hello, {auth?.user?.name}</p>
                <div className="d-flex flex-column">
                  <NavLink
                    to={`/dashboard/${auth?.user?.role === 1 ? "admin" : "user"}`}
                    className="text-white mb-2 d-flex align-items-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaUser className="me-3" /> Dashboard
                  </NavLink>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="btn p-0 text-white d-flex align-items-center"
                  >
                    <FaTimes className="me-3" /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
          
          {/* Navigation Links */}
          <ul className="nav flex-column mb-4">
            <li className="nav-item mb-3">
              <NavLink 
                to="/" 
                className="nav-link text-white d-flex align-items-center fs-5"
                onClick={() => setIsMobileMenuOpen(false)}
                style={({ isActive }) => ({ 
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  borderRadius: '8px',
                  padding: '12px 15px'
                })}
              >
                <FaHome className="me-3" /> Home
              </NavLink>
            </li>
            <li className="nav-item mb-3">
              <NavLink 
                to="/shop" 
                className="nav-link text-white d-flex align-items-center fs-5"
                onClick={() => setIsMobileMenuOpen(false)}
                style={({ isActive }) => ({ 
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  borderRadius: '8px',
                  padding: '12px 15px'
                })}
              >
                <FaStore className="me-3" /> Shop
              </NavLink>
            </li>
            <li className="nav-item mb-3">
              <button
                className="btn p-0 text-white fs-5 d-flex align-items-center w-100"
                style={{ 
                  background: 'none', 
                  border: 'none',
                  padding: '12px 15px'
                }}
                onClick={() => {
                  setOpenCategoryDrawer(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <FaBars className="me-3" /> Categories
              </button>
            </li>
            <li className="nav-item mb-3">
              <NavLink 
                to="/about" 
                className="nav-link text-white d-flex align-items-center fs-5"
                onClick={() => setIsMobileMenuOpen(false)}
                style={({ isActive }) => ({ 
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  borderRadius: '8px',
                  padding: '12px 15px'
                })}
              >
                <FaInfoCircle className="me-3" /> About Us
              </NavLink>
            </li>
            <li className="nav-item mb-3">
              <NavLink 
                to="/contact" 
                className="nav-link text-white d-flex align-items-center fs-5"
                onClick={() => setIsMobileMenuOpen(false)}
                style={({ isActive }) => ({ 
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  borderRadius: '8px',
                  padding: '12px 15px'
                })}
              >
                <FaAddressCard className="me-3" /> Contact Us
              </NavLink>
            </li>
          </ul>
          
          {/* Cart */}
          <div className="border-top border-light pt-3">
            <NavLink 
              to="/cart" 
              className="nav-link text-white d-flex align-items-center fs-5"
              onClick={() => setIsMobileMenuOpen(false)}
              style={({ isActive }) => ({ 
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                borderRadius: '8px',
                padding: '12px 15px'
              })}
            >
              <TiShoppingCart className="me-3 fs-4" />
              Cart
              {cart?.length > 0 && (
                <Badge 
                  count={cart?.length} 
                  showZero 
                  className="ms-2" 
                  style={{ backgroundColor: '#ff477e' }} 
                />
              )}
            </NavLink>
          </div>
        </div>
      )}

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
        zIndex={2000}
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
                  setIsMobileMenuOpen(false);
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
                  navigate(`/subcategory/${sub.toLowerCase()}`);
                  setSelectedCategory(null);
                  setOpenCategoryDrawer(false);
                  setIsMobileMenuOpen(false);
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