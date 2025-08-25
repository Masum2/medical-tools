import React from "react";
import Layout from "./../components/Layout/Layout";
import { FaHome, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

const Contact = () => {
  return (
    <Layout title={"Contact us"}>
      <div
        className="position-relative"
        style={{
         backgroundImage: `url('/images/background.jpg')`, // <-- replace with your image path
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
             At HealthProo we bring you quality health tools, gym & massage equipment, and cosmetics to help you look, feel, and live your best.
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
                   <h5 className="fw-bold" style={{color:'#FFF'}}>Address</h5>
                    <p className="mb-0">
                      4671 Sugar Camp Road, Owatonna, Minnesota, 55060
                    </p>
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
                    <h5 className="fw-bold" style={{color:'#FFF'}}>Phone</h5>
                    <p className="mb-0">571-457-2321</p>
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
                    <h5 className="fw-bold" style={{color:'#FFF'}}>Email</h5>
                    <p className="mb-0">ntamerrwael@mfano.ga</p>
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
                      style={{backgroundColor:'#F53711',border:'1px solid #F53711'}}
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
