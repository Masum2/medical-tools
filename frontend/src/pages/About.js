import React from "react";
import Layout from "./../components/Layout/Layout";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

const About = () => {
  return (
    <Layout title={"About us - Ecommerce App"}>
      <div className="container about-section" style={{ padding: "50px 0" }}>
        
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={{ color: "#333", fontWeight: "bold" }}>
            ABOUT US
          </h2>
          <div
            style={{
              height: "3px",
              width: "60px",
              backgroundColor: "#F53711",
              margin: "8px auto",
            }}
          ></div>
        </div>

        {/* Content */}
        <div className="row align-items-center">
          
          {/* Left Text */}
          <div className="col-md-6">
            <p style={{ color: "#333", fontSize: "16px" }}>
              At <span style={{fontSize:'22px',color:'#F53711',fontWeight:'bold'}}>HealthProo</span> we believe that health, beauty, and well-being go hand in hand. Our mission is to bring you carefully selected products that help you look, feel, and live your best every day.
            </p>
            <p style={{ color: "#333", fontSize: "16px" }}>
              From innovative health tools that support your daily wellness, to premium gym and massage equipment designed to keep your body strong and energized, to cosmetics that enhance your natural beauty — every item we offer is chosen with quality, safety, and your satisfaction in mind.
            </p>
            <button
              style={{
                backgroundColor: "#F53711",
                color: "#fff",
                padding: "8px 20px",
                border: "none",
                borderRadius: "20px",
                fontWeight: "500",
                marginTop: "10px",
              }}
            >
              Read More
            </button>
          </div>

          {/* Right Image with Owner Name */}
          <div className="col-md-6">
            <div style={{ textAlign: "center", marginBottom: "10px" }}>
              <h5 style={{ margin: 0, fontWeight: "bold", color: "#333" }}>
                Md Shamim Ahmed
              </h5>
              <p style={{ margin: 0, color: "#888", fontSize: "14px" }}>
                Owner of HealthProo
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <img
                src="/images/about.png"
                alt="About Us"
                style={{ width: "60%", borderRadius: "8px", height: "350px" }}
              />
            </div>
          </div>
        </div>

        {/* Social Icons */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            marginTop: "30px",
          }}
        >
          <a href="https://www.facebook.com/nfshopbd">  <FaFacebookF style={{ color: "#F53711", fontSize: "24px" }} /></a>
        
          <FaTwitter style={{ color: "#F53711", fontSize: "24px" }} />
          <FaInstagram style={{ color: "#F53711", fontSize: "24px" }} />
        </div>
      </div>
    </Layout>
  );
};

export default About;
