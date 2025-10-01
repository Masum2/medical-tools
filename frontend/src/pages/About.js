import React from "react";
import Layout from "./../components/Layout/Layout";


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
              At <span style={{fontSize:'22px',color:'#F53711',fontWeight:'bold'}}>HealthProo</span> we believe that health, beauty, and well-being go hand in hand. 
              Our mission is to bring you carefully selected products that help you look, feel, and live your best every day.
            </p>
            <p style={{ color: "#333", fontSize: "16px" }}>
              From innovative health tools that support your daily wellness, to premium gym and massage equipment designed 
              to keep your body strong and energized, to cosmetics that enhance your natural beauty — every item we offer 
              is chosen with quality, safety, and your satisfaction in mind.
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

        {/* Extra Info Section */}
        <div style={{ marginTop: "50px" }}>
          <h3 style={{ textAlign: "center", fontWeight: "bold", color: "#F53711" }}>
            🌿 About Us – Healthproo 🌿
          </h3>
          <p style={{ color: "#333", fontSize: "16px", marginTop: "15px" }}>
            Healthproo is not just a name, it’s a commitment to your healthy lifestyle. 
            We believe— “Health is the key to a happy life”. Therefore, the main goal of 
            each of our initiatives is to make reliable and quality healthcare products 
            easily accessible to everyone, so that everyone can live a healthy, beautiful 
            and fulfilling life.
          </p>
          <p style={{ color: "#333", fontSize: "16px" }}>
            We understand that health is an asset, and it is our responsibility to protect it. 
            Therefore, Healthproo always strives to provide reliable and necessary healthcare 
            products at affordable prices. We have a wide range of medical equipment, fitness 
            accessories, wellness products and daily healthcare essentials in our collection, 
            which will help you live a healthy lifestyle…
          </p>

          <h4 style={{ color: "#F53711", marginTop: "20px" }}>Our Mission</h4>
          <p>Delivering authentic, affordable and innovative healthcare solutions for a healthier tomorrow.</p>

          <h4 style={{ color: "#F53711", marginTop: "20px" }}>Our Vision</h4>
          <p>To become the most trusted healthcare & wellness brand in Bangladesh, where people can buy the best healthcare products without fear.</p>

          <h4 style={{ color: "#F53711", marginTop: "20px" }}>What We Offer</h4>
          <ul style={{ lineHeight: "1.8", color: "#333" }}>
            <li>✅ Friendly Customer Support</li>
            <li>✅ Easy Online Shopping Experience</li>
            <li>✅ 100% Genuine & Trusted Products</li>
            <li>✅ Affordable Price with Quality Guarantee</li>
            <li>✅ Wide Range: Healthcare, Medical & Fitness</li>
          </ul>

          <h4 style={{ color: "#F53711", marginTop: "20px" }}>Our Commitment</h4>
          <p>
            We believe that health is not just about being free from illness—but rather living a happy, 
            healthy and active life. That is why Healthproo is always committed to providing you and your 
            family with the best healthcare solutions.
          </p>
         
        </div>

      </div>
    </Layout>
  );
};

export default About;
