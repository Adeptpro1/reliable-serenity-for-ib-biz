"use client";

import DynamicHeader from "@/components/layoutComponents/DynamicHeader";
import Footer from "@/components/layoutComponents/Footer";
import ScrollFooterWrapper from "@/components/layoutComponents/ScrollFooterWrapper";
import { BsShieldLock, BsEnvelope, BsTrash, BsInfoCircle, BsCheckCircle } from "react-icons/bs";

const PrivacyPolicyPage = () => {
  const lastUpdated = "August 2026";

  return (
    <>
      <DynamicHeader />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-3xl overflow-hidden border border-gray-100">
          
          {/* Header Banner */}
          <div className="px-6 py-12 text-center text-white sm:px-12" style={{ background: "linear-gradient(to right, var(--secondaryColor), var(--primaryColor))" }}>
            <div className="flex justify-center mb-4">
              <span className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                <BsShieldLock className="text-4xl text-white" />
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-3 text-lg text-purple-100 max-w-2xl mx-auto">
              Learn how Debisi collects, protects, and uses your personal and business data.
            </p>
            <p className="mt-2 text-sm text-purple-200">
              Last Updated: {lastUpdated}
            </p>
          </div>

          {/* Content Area */}
          <div className="px-6 py-10 sm:p-12 text-gray-700 space-y-8 leading-relaxed">
            
            {/* Quick Summary Alert Box */}
            <div className="p-6 rounded-r-2xl border-l-4" style={{ backgroundColor: "rgba(210, 39, 48, 0.05)", borderLeftColor: "var(--primaryColor)" }}>
              <h2 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ color: "var(--primaryColor)" }}>
                <BsInfoCircle className="text-xl" /> Quick Summary
              </h2>
              <p className="text-sm text-gray-700">
                Debisi is a community-first directory connecting Oyo State businesses and customers globally. 
                We prioritize your privacy: we never sell your data, only display public business details you explicitly publish, 
                and provide simple tools to delete your data at any time.
              </p>
            </div>

            {/* Section 1: Introduction */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="font-mono" style={{ color: "var(--primaryColor)" }}>1.</span> Introduction
              </h2>
              <p>
                Welcome to Debisi (referred to as {"\"Debisi\", \"Debisi NG\", \"we\", \"us\", or \"our\""}). 
                Debisi is operated by <strong>iSalesNG Emporium</strong>. We are committed to protecting your privacy 
                and ensuring a transparent user experience on our web platform (https://debisi.ng/) and our mobile 
                applications published on the Google Play Store and Apple App Store.
              </p>
              <p>
                This Privacy Policy explains how we collect, use, process, and disclose your information when you use our 
                services, including creating a profile, searching for local businesses, and listing business descriptions, 
                addresses, phone numbers, and media assets.
              </p>
            </section>

            {/* Section 2: Data We Collect */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="font-mono" style={{ color: "var(--primaryColor)" }}>2.</span> Information We Collect
              </h2>
              <p>
                To provide our directory and discovery services, we collect information directly from you when you register, 
                create a business listing, or interact with our platform.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl">
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <BsCheckCircle className="text-green-500" /> Account & Profile Info
                  </h3>
                  <p className="text-sm text-gray-600">
                    When you sign up, we collect personal credentials such as name, email address, phone number, and security credentials handled securely through Firebase Authentication.
                  </p>
                </div>
                <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl">
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <BsCheckCircle className="text-green-500" /> Business Listing Details
                  </h3>
                  <p className="text-sm text-gray-600">
                    When you register your business, we collect business name, categories, descriptions, contact details (phone, WhatsApp, social URLs), location details (address, town, city, Local Government Area), and business logos/images.
                  </p>
                </div>
                <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl">
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <BsCheckCircle className="text-green-500" /> Device Permissions & Media
                  </h3>
                  <p className="text-sm text-gray-600">
                    On mobile devices, we request permissions to access your camera and photo library. These permissions are used exclusively to let you select and upload business logos or product photos to our content delivery network.
                  </p>
                </div>
                <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl">
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <BsCheckCircle className="text-green-500" /> Automatically Collected Data
                  </h3>
                  <p className="text-sm text-gray-600">
                    We collect usage data, device type, operating system, and IP address to analyze platform performance, diagnose server issues, and maintain secure services.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: How We Use Data */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="font-mono" style={{ color: "var(--primaryColor)" }}>3.</span> How We Use Your Information
              </h2>
              <p>
                We use the information collected from you for the following business and operational purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li><strong>Public Listings:</strong> To publish and display your business information in our public directory so customers can find and contact you.</li>
                <li><strong>Platform Operations:</strong> To verify your account, administer your profile, process listings, and display advertisements.</li>
                <li><strong>Communication:</strong> To allow potential buyers to connect directly with you via WhatsApp, calls, or external website redirect links.</li>
                <li><strong>User Experience:</strong> To suggest nearby businesses based on your location and category interests.</li>
                <li><strong>Security & Maintenance:</strong> To protect our community from fraud, spam, abuse, and to troubleshoot network issues.</li>
              </ul>
            </section>

            {/* Section 4: Data Retention & Deletion */}
            <section className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-2xl space-y-3">
              <h2 className="text-xl font-bold text-red-950 flex items-center gap-2">
                <BsTrash className="text-2xl text-red-600" /> Account & Data Deletion
              </h2>
              <p className="text-red-900 text-sm">
                We respect your control over your data. Under our data retention policies and Google Play regulations, 
                you can request the deletion of your account and all associated business data at any time.
              </p>
              <div className="mt-3 text-sm text-red-900">
                <p className="font-semibold">To request complete account or business data deletion:</p>
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                  <li>Send an email to <a href="mailto:isalesng@gmail.com" className="font-bold underline text-red-700 hover:text-red-800">isalesng@gmail.com</a>.</li>
                  <li>Include the subject line: <strong>{"\"Account Deletion Request\""}</strong>.</li>
                  <li>Specify the email address associated with your Debisi account.</li>
                </ol>
                <p className="mt-2">
                  Once verified, we will permanently delete your account, business listings, profile details, and uploaded media from our active servers within 7 business days.
                </p>
              </div>
            </section>

            {/* Section 5: Data Storage & Service Providers */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="font-mono" style={{ color: "var(--primaryColor)" }}>5.</span> Data Storage and Sharing
              </h2>
              <p>
                We do not sell, rent, or trade your personal data to third parties. We share data only with third-party service providers who assist us in operating our platform, subject to strict confidentiality agreements:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li><strong>Firebase Authentication:</strong> Used to manage user registrations, logins, and passwords securely.</li>
                <li><strong>Bunny.net:</strong> We host business logos and photos on our CDN powered by Bunny.net. Media files are only sent to the CDN when you finalize uploads or submit forms.</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law to comply with Oyo State or Nigerian regulations, or to protect the safety and rights of our users.</li>
              </ul>
            </section>

            {/* Section 6: Security */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="font-mono" style={{ color: "var(--primaryColor)" }}>6.</span> Security of Your Data
              </h2>
              <p>
                We implement technical and organizational security measures to protect your information from unauthorized access, loss, or manipulation. 
                However, please remember that no transmission method over the internet or mobile networks is 100% secure, and we cannot guarantee absolute data security.
              </p>
            </section>

            {/* Section 7: Updates to Policy */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="font-mono" style={{ color: "var(--primaryColor)" }}>7.</span> Changes to This Privacy Policy
              </h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the {"\"Last Updated\""} date at the top. We encourage you to review this page periodically to stay informed about how we protect your information.
              </p>
            </section>

            {/* Section 8: Contact Info */}
            <section className="border-t border-gray-100 pt-8 space-y-3">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="font-mono" style={{ color: "var(--primaryColor)" }}>8.</span> Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy, your data rights, or data deletion, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-2xl space-y-2 text-sm">
                <p><strong>Operator:</strong> iSalesNG Emporium</p>
                <p><strong>Email:</strong> <a href="mailto:isalesng@gmail.com" className="hover:underline" style={{ color: "var(--primaryColor)" }}>isalesng@gmail.com</a></p>
                <p><strong>Address:</strong> 43, Sango - Mokola Road, Beside LYF Foods Building, Coca Cola, Mokola - Ibadan, Oyo State, Nigeria.</p>
              </div>
            </section>

          </div>
        </div>
      </div>
      <ScrollFooterWrapper />
      <Footer />
    </>
  );
};

export default PrivacyPolicyPage;
