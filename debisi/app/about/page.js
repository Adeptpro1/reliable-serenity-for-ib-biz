"use client";

import DynamicHeader from "@/components/layoutComponents/DynamicHeader";
import Footer from "../../components/layoutComponents/Footer";
import ScrollFooterWrapper from "@/components/layoutComponents/ScrollFooterWrapper";
import {
  FaEnvelope,
  FaShareAlt,
  FaHeadset,
  FaSearch,
  FaUsers,
  FaBullhorn,
  FaMapMarkerAlt,
  FaLightbulb,
  FaCalendarAlt,
} from "react-icons/fa";

const AboutPage = () => {

  // Share Function
  const handleShare = async () => {
    const shareUrl = "https://debisi.ng/";
    const shareData = {
      title: "Debisi NG",
      text: "Discover and connect with local businesses near you in Ibadan and beyond — find services, read reviews, and get in touch. Check out Debisi NG!",
      url: shareUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <>
      <DynamicHeader />
      <div
        className="flex flex-col items-center justify-center text-center bg-gray-100"
        style={{ margin: "10px", padding: "20px" }}
      >
        <div
          className="flex flex-col items-center justify-center text-center bg-gray-100"
          style={{ marginTop: "2px", padding: "20px" }}
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-6 gradient-headline">
            About Debisi NG
          </h1>
          <p
            className="text-lg text-gray-600 max-w-2xl"
            style={{ marginTop: "2px" }}
          >
            Debisi NG is a dynamic platform that connects businesses with their
            local community and beyond, making it easy to discover and engage with
            enterprises around you.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl">
          <div
            className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-lg"
            style={{ padding: "20px" }}
          >
            <span style={{ fontSize: '40px'}}>📍</span>
            <h2 className="text-xl font-semibold text-gray-800">
              Location-Based Discovery
            </h2>
            <p className="text-gray-600">
              Find businesses in your locality with ease.
            </p>
          </div>

          <div
            className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-lg"
            style={{ padding: "20px" }}
          >
            <span style={{ fontSize: '40px'}}>🔍</span>
            <h2 className="text-xl font-semibold text-gray-800">
              Advanced AI Search
            </h2>
            <p className="text-gray-600">
              Filter businesses by category and location.
            </p>
          </div>

          <div
            className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-lg"
            style={{ padding: "20px" }}
          >
            <span style={{ fontSize: '40px'}}>📢</span>
            <h2 className="text-xl font-semibold text-gray-800">
              Business Promotions
            </h2>
            <p className="text-gray-600">
              Boost visibility with premium listings.
            </p>
          </div>

          <div
            className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-lg"
            style={{ padding: "20px" }}
          >
            <span style={{ fontSize: '40px'}}>👨‍👩‍👧‍👦</span>
            <h2 className="text-xl font-semibold text-gray-800">
              Community Engagement
            </h2>
            <p className="text-gray-600">
              Interact with businesses through reviews and ratings.
            </p>
          </div>

          <div
            className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-lg"
            style={{ padding: "20px" }}
          >
            <span style={{ fontSize: '40px'}}>💡</span>
            <h2 className="text-xl font-semibold text-gray-800">
              Smart Recommendations
            </h2>
            <p className="text-gray-600">
              Discover new businesses tailored to your needs.
            </p>
          </div>

          {/* <div
            className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-lg"
            style={{ padding: "20px" }}
          >
            <span style={{ fontSize: '40px'}}>📅</span>
            <h2 className="text-xl font-semibold text-gray-800">BTL Events</h2>
            <p className="text-gray-600">
              Time to time events such as trade fairs and year-end events to
              boost customer sales.
            </p>
          </div> */}
        

        {/* Contact Section */}
          <div
            className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-lg"
            style={{ padding: "20px" }}
              // onClick={() => window.open("https://wa.me/2348163190595", "_blank")}
            >
              <span style={{ fontSize: '40px'}}>🎧</span>
              <h2 className="text-xl font-semibold text-gray-800 text-center">
                Chat with Support
              </h2>
              <p className="text-gray-600 text-center">
                Get instant help via WhatsApp
              </p>
            </div>

            <div
            className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-lg"
            style={{ padding: "20px" }}
            onClick={() =>
                window.open(
                  "mailto:theadeptprofessionals@gmail.com?subject=Send us Mail&body=",
                  "_blank"
                )
              }
            >
              <span style={{ fontSize: '40px'}}>📧</span>
              <h2 className="text-xl font-semibold text-gray-800 text-center">
                Send an Email
              </h2>
              <p className="text-gray-600 text-center">Write to us anytime</p>
            </div>

            <div
            className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-lg"
            style={{ padding: "20px" }}
            onClick={handleShare}
            >
              <span style={{ fontSize: '40px'}}>🔗</span>
              <h2 className="text-xl font-semibold text-gray-800 text-center">
                Share App
              </h2>
              <p className="text-gray-600 text-center">
                Spread the word about Debisi
              </p>
            </div>
          </div>
        </div>
      <ScrollFooterWrapper />
      <Footer />
    </>
  );
};

export default AboutPage;
