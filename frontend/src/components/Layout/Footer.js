import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaInstagram,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-dark text-light pt-5 pb-3">
      <div className="container">
        <div className="row text-center text-md-start align-items-start">
          
          {/* Logo + Social */}
          <div className="col-md-3 mb-4 d-flex flex-column align-items-center align-items-md-start">
            {/* Logo + Slogan in a row */}
            <div className="d-flex align-items-center mb-3">
              <img
                src="/images/newlg.png"
                alt="HealthProo Logo"
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "contain",
                  marginRight: "10px",
                }}
              />
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#ccc",
                }}
              >
                Healthproo.Com <br /> Your Health, Our Priority.
              </span>
            </div>

            {/* Social Media with Background Colors */}
            <div className="d-flex gap-3">
              <a
                href="https://www.facebook.com/nfshopbd"
                target="_blank"
                rel="noreferrer"
                style={{
                  backgroundColor: "#1877F2",
                  color: "#fff",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                }}
              >
                <FaFacebookF />
              </a>

              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noreferrer"
                style={{
                  backgroundColor: "#1DA1F2",
                  color: "#fff",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                }}
              >
                <FaTwitter />
              </a>

              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noreferrer"
                style={{
                  backgroundColor: "#FF0000",
                  color: "#fff",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                }}
              >
                <FaYoutube />
              </a>

              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                style={{
                  background: "linear-gradient(45deg,#F58529,#DD2A7B,#8134AF,#515BD4)",
                  color: "#fff",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                }}
              >
                <FaInstagram />
              </a>
            </div>
          </div>

          {/* About */}
          <div className="col-md-2 mb-4">
            <h6 className="fw-bold mb-3">ABOUT</h6>
            <ul className="list-unstyled">
              <li><Link to="/company" className="text-decoration-none text-light">Company</Link></li>
              <li><Link to="/team" className="text-decoration-none text-light">Team</Link></li>
              <li><Link to="/careers" className="text-decoration-none text-light">Careers</Link></li>
              <li><Link to="/github" className="text-decoration-none text-light">Github</Link></li>
            </ul>
          </div>

          {/* Service */}
          <div className="col-md-2 mb-4">
            <h6 className="fw-bold mb-3">SERVICE</h6>
            <ul className="list-unstyled">
              <li><Link to="/color-products" className="text-decoration-none text-light">Color Products</Link></li>
              <li><Link to="/web-design" className="text-decoration-none text-light">Web Design</Link></li>
              <li><Link to="/typography-kit" className="text-decoration-none text-light">Typography Kit</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-md-2 mb-4">
            <h6 className="fw-bold mb-3">SUPPORT</h6>
            <ul className="list-unstyled">
              <li><Link to="/faq" className="text-decoration-none text-light">FAQ</Link></li>
              <li><Link to="/downloads" className="text-decoration-none text-light">Downloads</Link></li>
              <li><Link to="/product-registration" className="text-decoration-none text-light">Product Registration</Link></li>
              <li><Link to="/sitemap" className="text-decoration-none text-light">Sitemap</Link></li>
              <li><Link to="/community" className="text-decoration-none text-light">Community</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-md-3 mb-4">
            <h6 className="fw-bold mb-3">NEWSLETTER</h6>
            <p>Follow us on social media for the latest updates.</p>
            <div className="input-group">
              <input
                type="email"
                className="form-control"
                placeholder="Your Email"
              />
              <button
                className="btn btn-light text-dark fw-bold"
                type="button"
              >
                SEND
              </button>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <hr className="border-secondary" />
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <p className="mb-0">© {new Date().getFullYear()} HealthProo. All rights reserved.</p>
          <div className="d-flex gap-3 mt-2 mt-md-0">
            <Link to="/terms" className="text-decoration-none text-light">Terms</Link>
            <Link to="/cookie-policy" className="text-decoration-none text-light">Cookie Policy</Link>
            <Link to="/privacy-policy" className="text-decoration-none text-light">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
