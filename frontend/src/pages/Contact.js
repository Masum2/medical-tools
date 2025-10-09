import React from "react";
import Layout from "./../components/Layout/Layout";
import { FaHome, FaPhoneAlt, FaEnvelope, FaClock } from "react-icons/fa";

const Contact = () => {
  return (
    <Layout title={"Contact us"}>
      <div
        className="position-relative"
        style={{
          backgroundImage: `url('/images/background.jpg')`, // replace with your background image
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay backdrop */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        ></div>

        {/* Content */}
        <div className="position-relative text-white py-5 px-3">
          <div className="container">
            {/* Heading */}
            <h1 className="text-center fw-bold">Contact Us</h1>
            <p
              className="text-center text-white mx-auto"
              style={{ maxWidth: "700px" }}
            >
              {/* At <span style={{ color: "#F59F27", fontWeight: "bold" }}>HealthProo </span>  */}
             
              <br />
              <strong>We want to stay in touch with you.</strong> If you have any questions, suggestions, 
              or product inquiries, please contact us. Healthproo.Com always strives to 
              serve you quickly and sincerely.
            </p>

            <div className="row mt-5 g-5">
              {/* Left Side - Contact Info */}
              <div className="col-12 col-md-6">
                <div className="d-flex align-items-start mb-4">
                  <div
                    className="bg-white text-dark rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: "50px", height: "50px" }}
                  >
                    <FaHome size={24} />
                  </div>
                  <div>
                    <h5 className="fw-bold" style={{ color: "#FFF" }}>Our Address</h5>
                    <p className="mb-0">Topkhana Road, Segunbagicha, Dhaka-1000</p>
                  </div>
                </div>

                <div className="d-flex align-items-start mb-4">
                  <div
                    className="bg-white text-dark rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: "50px", height: "50px" }}
                  >
                    <FaPhoneAlt size={24} />
                  </div>
                  <div>
                    <h5 className="fw-bold" style={{ color: "#FFF" }}>Phone</h5>
                    <p className="mb-0">+8801718-777229</p>
                  </div>
                </div>

                <div className="d-flex align-items-start mb-4">
                  <div
                    className="bg-white text-dark rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: "50px", height: "50px" }}
                  >
                    <FaEnvelope size={24} />
                  </div>
                  <div>
                    <h5 className="fw-bold" style={{ color: "#FFF" }}>Email</h5>
                    <p className="mb-0">support@healthproo.com</p>
                  </div>
                </div>

                <div className="d-flex align-items-start mb-4">
                  <div
                    className="bg-white text-dark rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: "50px", height: "50px" }}
                  >
                    <FaClock size={24} />
                  </div>
                  <div>
                    <h5 className="fw-bold" style={{ color: "#FFF" }}>Office Hours</h5>
                    <p className="mb-0">Saturday – Thursday: 9:00 AM – 6:30 PM</p>
                    <p className="mb-0">Friday: Closed</p>
                  </div>
                </div>
              </div>

              {/* Right Side - Contact Form */}
              <div className="col-12 col-md-6">
                <div className="bg-white text-dark p-4 rounded shadow">
                  <h4 className="fw-bold mb-4">Send Message</h4>
                  <form>
                    <div className="mb-3">
                      <input
                        type="text"
                        className="form-control border-1 border-bottom rounded-0"
                        placeholder="Full Name"
                      />
                    </div>
                    <div className="mb-3">
                      <input
                        type="email"
                        className="form-control border-1 border-bottom rounded-0"
                        placeholder="Email"
                      />
                    </div>
                    <div className="mb-3">
                      <textarea
                        rows="4"
                        className="form-control border-1 border-bottom rounded-0"
                        placeholder="Type your Message..."
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-info w-100 fw-bold text-white"
                      style={{
                        backgroundColor: "#F53711",
                        border: "1px solid #F53711",
                      }}
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </Layout>
  );
};

export default Contact;
