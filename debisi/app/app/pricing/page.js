// "use client";

// import { useState } from "react";
// import Footer from "../../components/layoutComponents/Footer";
// import DynamicHeader from "@/components/layoutComponents/DynamicHeader";

// const pricingData = {
//   "General Advert": 
//   [
//     { name: "Web Banner", price: "$100", description: "Basic description", benefit: "Benefit 1, Benefit 2 etc" },
//     { name: "In-app Notification", price: "$200", description: "Basic description", benefit: "Benefit 1, Benefit 2 etc" },
//     { name: "Upcoming Event", price: "$300", description: "Basic description", benefit: "Benefit 1, Benefit 2 etc" },
//   ],
//   "TopList Advert": [
//     { name: "Business", price: "$150", description: "Basic description", benefit: "Benefit 1, Benefit 2 etc" },
//     { name: "Notice", price: "$250", description: "Basic description", benefit: "Benefit 1, Benefit 2 etc" },
//     { name: "Product", price: "$350", description: "Basic description", benefit: "Benefit 1, Benefit 2 etc" },
//   ],
//   "Other Advert": [
//     { name: "Sponsors", price: "$50", description: "Basic description", benefit: "Benefit 1, Benefit 2 etc" },
//     { name: "Video Uploads", price: "$100", description: "Basic description", benefit: "Benefit 1, Benefit 2 etc" },
//     { name: "Business Verification", price: "$150", description: "Basic description", benefit: "Benefit 1, Benefit 2 etc" },
//   ]
// };

// const PricingPage = () => {
//   const [selectedCategory, setSelectedCategory] = useState("Web Banner");

//   return (
//     <div className="min-h-screen flex flex-col">
//       <DynamicHeader />
//       <div className="pricing-container">
//         <h1 className="pageTitle">Pricing</h1>

//         <div className="text-center" style={{ marginBottom: "10px" }}>
//           <label htmlFor="category-select" className="block text-lg font-medium mb-2">
//             Choose a category:
//           </label>
//           <select
//             id="category-select"
//             value={selectedCategory}
//             onChange={(e) => setSelectedCategory(e.target.value)}
//             className="categorySelect"
//           >
//             {Object.keys(pricingData).map((category) => (
//               <option key={category} value={category}>
//                 {category}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Responsive Grid for Pricing Cards */}
//         <div className="pricingGrid">
//           {pricingData[selectedCategory].map((item, index) => (
//             <div key={index} className="pricing-card">
//               <h2 className="text-2xl font-semibold">{item.name}</h2>
//               <p className="price" style={{color:'purple'}}>{item.price}</p>
//               <p className="price">{item.description}</p>
//               <p className="price">{item.benefit}</p>
//               <button style={{ padding: '10px', background: "linear-gradient(to right, purple, #D22730)", marginTop: '5px', color: 'white'}} className="rounded">Get Started</button>
//             </div>
//           ))}
//         </div>
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default PricingPage;

"use client";

import { useState, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import Footer from "../../components/layoutComponents/Footer";
import DynamicHeader from "@/components/layoutComponents/DynamicHeader";

const GET_PRICINGS = gql`
  query GetPricings {
    pricings {
      id
      category
      title
      description
      amount
      currency
      purpose
      benefit
      url
    }
  }
`;

const PricingPage = () => {
  const { data, loading, error } = useQuery(GET_PRICINGS);
  const [selectedCategory, setSelectedCategory] = useState("AD_CATEGORY");

  if (loading) return <p className="text-center" style={{marginTop: '12px'}}>Loading pricing...</p>;
  if (error) return <p className="text-center text-red-500"  style={{marginTop: '12px'}}>Error loading pricing data</p>;

  // Group prices by category
  const grouped = {
    AD_CATEGORY: data?.pricings.filter((p) => p.category === "AD_CATEGORY"),
    TOP_LIST_CATEGORY: data?.pricings.filter((p) => p.category === "TOP_LIST_CATEGORY"),
    OTHER_ADS: data?.pricings.filter((p) => p.category === "OTHER_ADS"),
  };

  // Human-readable mapping
  const categoryLabels = {
    AD_CATEGORY: "General Advert",
    TOP_LIST_CATEGORY: "TopList Advert",
    OTHER_ADS: "Other Advert",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <DynamicHeader />

      <div className="pricing-container md:p-10">
        <h1 className="text-3xl font-bold text-center" style={{marginBottom: '32px'}}>Pricing</h1>

        {/* Category Selector */}
        <div className="text-center" style={{ marginBottom: '32px'}}>
          <label htmlFor="category-select" className="block text-lg font-medium" style={{ marginBottom: '8px'}}>
            Choose a category:
          </label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded-md bg-white text-gray-800 shadow-sm"
            style={{ padding: '12px 8px' }}
          >
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Pricing Cards Grid */}
        <div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {grouped[selectedCategory]?.length ? (
            grouped[selectedCategory].map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition duration-200 bg-white" style={{ padding: '24px'}}
              >
                <h2 className="text-xl font-semibold text-gray-800" style={{ marginBottom: '8px' }}>{item.title}</h2>
                <p className="text-purple-700 text-lg font-bold" style={{ marginBottom: '8px' }}>
                  {item.amount === 0 ? 'N/A' : `${item.currency} ${item.amount.toLocaleString()}`}
                </p>
                <p className="text-sm text-gray-600" style={{ marginBottom: '12px'}}>{item.description || "No description available."}</p>
                {/* Benefits (stored as comma-separated string in DB) */}
                {item.benefit ? (
                  <ul className="text-sm text-gray-600 mb-3 list-disc list-inside">
                    {item.benefit.split(',').map((b, idx) => (
                      <li key={idx}>{b.trim()}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500" style={{ marginBottom: '12px'}}>Benefit: Flexible listing, visibility boost, etc.</p>
                )}

                <button
                  onClick={() => {
                    const href = item.url || '#';
                    if (href && href !== '#') window.open(href, '_blank', 'noopener');
                  }}
                  style={{
                    padding: "10px",
                    background: "linear-gradient(to right, purple, #D22730)",
                    marginTop: "5px",
                    color: "white",
                  }}
                  className="rounded w-full font-medium"
                >
                  Get Started
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-full">
              No pricing data found for this category.
            </p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PricingPage;
