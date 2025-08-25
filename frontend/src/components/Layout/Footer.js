import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaYoutube, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-dark text-light pt-5 pb-3">
      <div className="container">
        <div className="row text-center text-md-start">
          
          {/* Logo + Social */}
          <div className="col-md-2 mb-4">
            <h3 className="fw-bold mb-3">LOGO</h3>
            <div className="d-flex justify-content-center justify-content-md-start gap-3">
              <FaFacebookF className="fs-5" />
              <FaTwitter className="fs-5" />
              <FaYoutube className="fs-5" />
              <FaInstagram className="fs-5" />
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
              <li><Link to="/typography-kit" className="text-decoration-none text-light">Typography kit</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-md-3 mb-4">
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
            <p>Follow us on social media for the latest update.</p>
            <div className="input-group">
              <input
                type="email"
                className="form-control"
                placeholder="Your Email"
              />
              <button className="btn btn-light text-dark" type="button">
                SEND
              </button>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <hr className="border-secondary" />
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <p className="mb-0">
            © 2021 Potential WebCode. All rights reserved.
          </p>
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
