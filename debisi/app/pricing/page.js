"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_PRICINGS } from "@/graphql/queries/admin/pricing";
import Link from "next/link";
import Footer from "../../components/layoutComponents/Footer";
import DynamicHeader from "@/components/layoutComponents/DynamicHeader";
import {
  FaBriefcase,
  FaShoppingBag,
  FaBullhorn,
  FaVideo,
  FaAd,
  FaCheckCircle,
  FaShieldAlt,
  FaStar,
  FaTag,
  FaRocket,
  FaTrophy,
  FaEnvelope,
} from "react-icons/fa";

const CATEGORY_TABS = [
  { key: "BUSINESS", label: "Business", icon: <FaBriefcase /> },
  { key: "PRODUCT", label: "Product", icon: <FaShoppingBag /> },
  { key: "NOTICE", label: "Notice", icon: <FaBullhorn /> },
  { key: "SHOWROOM", label: "Showroom", icon: <FaVideo /> },
  { key: "BANNER_ADS", label: "Banners & Ads", icon: <FaAd /> },
];

const PRICING_DATA = {
  BUSINESS: [
    {
      title: "Business Registration",
      price: "Free",
      period: "up to 2 businesses",
      icon: <FaBriefcase className="text-red-600" />,
      description: "Register and manage up to 2 distinct business workspaces on a single account.",
      highlights: [
        "Complete business profile & custom web slug URL",
        "Add physical address, opening hours, phone & social links",
        "Maximum of 2 registered businesses per user",
      ],
      actionLabel: "Register Business",
      actionHref: "/add-business",
    },
    {
      title: "Business Verification",
      price: "₦1,000 – ₦3,000",
      period: "per year",
      icon: <FaShieldAlt className="text-blue-600" />,
      description: "Official blue verified checkmark badge validating your enterprise with CAC credentials.",
      highlights: [
        "Business Name (CAC BN / Enterprise): ₦1,000 / yr",
        "Limited Company (CAC Ltd / Plc): ₦3,000 / yr",
        "Official verified badge on profile & listings for 365 days",
        "Access to product catalog, noticeboard & showroom listings",
      ],
      actionLabel: "Get Verified",
      actionHref: "/login",
    },
    {
      title: "Directory Top Listing",
      price: "From ₦500",
      period: "per day",
      icon: <FaStar className="text-amber-500" />,
      description: "Pin your business profile to the very top of directory category and location searches.",
      highlights: [
        "Daily rate: ₦500 / day",
        "7 Days (10% off): ₦3,150",
        "14 Days (15% off): ₦5,950",
        "30 Days (20% off): ₦12,000",
      ],
      actionLabel: "Boost Listing",
      actionHref: "/login",
    },
  ],
  PRODUCT: [
    {
      title: "Standard Product Upload",
      price: "Free",
      period: "unlimited items",
      icon: <FaShoppingBag className="text-emerald-600" />,
      description: "List your products and inventory on the marketplace at zero charge.",
      highlights: [
        "Upload product photos, descriptions, and price tags",
        "Direct customer chat via WhatsApp and phone calls",
        "Discoverable in category and location search filters",
      ],
      actionLabel: "Add Products",
      actionHref: "/login",
    },
    {
      title: "Marketplace Product Boost",
      price: "₦100 – ₦300",
      period: "per day",
      icon: <FaTag className="text-purple-600" />,
      description: "Elevate your product catalog items to the top of marketplace search and category feeds.",
      highlights: [
        "Town level boost: ₦100 / day",
        "City level boost: ₦200 / day",
        "State-wide boost: ₦300 / day",
        "Featured badge on product cards with prioritized feed rank",
      ],
      actionLabel: "Boost Product",
      actionHref: "/login",
    },
  ],
  NOTICE: [
    {
      title: "Standard Notice Posting",
      price: "Free",
      period: "standard post",
      icon: <FaBullhorn className="text-slate-600" />,
      description: "Publish announcements, updates, and community alerts on the noticeboard.",
      highlights: [
        "Standard organic visibility on local community notice feeds",
        "No contact lead collection form included",
      ],
      actionLabel: "Post Notice",
      actionHref: "/login",
    },
    {
      title: "Notice Boost + Lead Capture",
      price: "₦100 – ₦300",
      period: "per day",
      icon: <FaRocket className="text-red-600" />,
      description: "Pin announcements to the top of feeds and collect customer contact leads automatically.",
      highlights: [
        "Town level reach: ₦100 / day",
        "City level reach: ₦200 / day",
        "State-wide reach: ₦300 / day",
        "Attach announcement text, images, and call-to-action link",
        "Custom contact lead capture form enabled to collect customer details",
        "Select custom run duration from 1 to 30 days",
      ],
      actionLabel: "Boost Notice",
      actionHref: "/login",
    },
  ],
  SHOWROOM: [
    {
      title: "Standard Video Listing",
      price: "₦300",
      period: "3 days",
      icon: <FaVideo className="text-indigo-600" />,
      description: "Publish short-form video showcases of your products, craft, and workshop.",
      highlights: [
        "High-speed CDN streaming",
        "Featured in mobile Showroom video feed",
        "Relist anytime upon expiration",
      ],
      actionLabel: "Post Video",
      actionHref: "/login",
    },
    {
      title: "Showroom Video Boost",
      price: "From ₦1,000",
      period: "package",
      icon: <FaRocket className="text-purple-600" />,
      description: "Prioritize and amplify your short video showcase to reach wider local audiences.",
      highlights: [
        "3 Days (Town tier): ₦1,000",
        "7 Days (City tier): ₦2,000",
        "14 Days (State tier): ₦3,500",
        "Sponsored badge & prioritized feed placement",
      ],
      actionLabel: "Boost Video",
      actionHref: "/login",
    },
  ],
  BANNER_ADS: [
    {
      title: "Mobile Feed Banner",
      price: "₦30,000",
      period: "per week",
      icon: <FaAd className="text-red-600" />,
      description: "High-visibility sponsor banner carousel placed prominently on the mobile homepage feed.",
      highlights: [
        "Multi-image swipeable banner support",
        "Direct custom link CTA (website, social, or chat)",
        "7-day guaranteed mobile placement",
        "Detailed email analytics report upon completion",
      ],
      actionLabel: "Apply for Banner",
      actionHref: "/ad",
    },
    {
      title: "Business of the Week (BOTW)",
      price: "₦25,000",
      period: "per cycle",
      icon: <FaTrophy className="text-amber-500" />,
      description: "Prestigious weekly spotlight featuring 8 selected businesses on the app homepage.",
      highlights: [
        "₦25,000 application fee (limited to 8 spots per weekly cycle)",
        "Featured in app homepage hero banner for 7 days",
        "Exclusive BOTW badge on business profile",
      ],
      actionLabel: "View Details",
      actionHref: "/ad",
    },
    {
      title: "Reach-Out Broadcast",
      price: "From ₦3,000",
      period: "per campaign",
      icon: <FaEnvelope className="text-teal-600" />,
      description: "Send direct email & notification announcements to followers.",
      highlights: [
        "Up to 1,000 followers: ₦3,000",
        "1,001 to 5,000 followers: ₦5,000",
        "5,000+ followers: ₦10,000",
        "Direct customer inbox delivery with business branding",
      ],
      actionLabel: "Create Broadcast",
      actionHref: "/login",
    },
  ],
};

function parseHighlights(benefitStr, fallbackHighlights = []) {
  if (!benefitStr) return fallbackHighlights;
  if (benefitStr.includes("\n")) {
    return benefitStr
      .split(/\r?\n/)
      .map((s) => s.trim().replace(/^[•\-\*]\s*/, ""))
      .filter(Boolean);
  }
  if (benefitStr.includes("•")) {
    return benefitStr
      .split("•")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (benefitStr.includes("|")) {
    return benefitStr
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return fallbackHighlights.length > 0 ? fallbackHighlights : [benefitStr];
}

function groupCategoryPricings(category, dbPricings, fallbackItems) {
  const catPricings = dbPricings.filter((p) => p.category === category);
  if (catPricings.length === 0) return fallbackItems;

  const findByKeyword = (kw) =>
    catPricings.find((p) => p.title.toLowerCase().includes(kw.toLowerCase()));

  if (category === "BUSINESS") {
    const reg = findByKeyword("Registration");
    const verEnterprise = findByKeyword("Enterprise") || findByKeyword("Business Name");
    const verLimited = findByKeyword("Limited");
    const topDaily = findByKeyword("Daily");
    const top7 = findByKeyword("7 Days");
    const top14 = findByKeyword("14 Days");
    const top30 = findByKeyword("30 Days");

    const verMin = verEnterprise?.amount ?? 1000;
    const verMax = verLimited?.amount ?? 3000;
    const verPrice = verMin === verMax ? `₦${verMin.toLocaleString()}` : `₦${verMin.toLocaleString()} – ₦${verMax.toLocaleString()}`;

    return [
      {
        title: "Business Registration",
        price: reg?.amount === 0 ? "Free" : `₦${Number(reg?.amount || 0).toLocaleString()}`,
        period: "up to 2 businesses",
        icon: <FaBriefcase className="text-red-600" />,
        description: reg?.description || "Register and manage up to 2 distinct business workspaces on a single account.",
        highlights: parseHighlights(reg?.benefit, [
          "Complete business profile & custom web slug URL",
          "Add physical address, opening hours, phone & social links",
          "Maximum of 2 registered businesses per user",
        ]),
        actionLabel: "Register Business",
        actionHref: reg?.url || "/add-business",
      },
      {
        title: "Business Verification",
        price: verPrice,
        period: "per year",
        icon: <FaShieldAlt className="text-blue-600" />,
        description: "Official blue verified checkmark badge validating your enterprise with CAC credentials.",
        highlights: [
          `Business Name (CAC BN / Enterprise): ₦${Number(verEnterprise?.amount ?? 1000).toLocaleString()} / yr`,
          `Limited Company (CAC Ltd / Plc): ₦${Number(verLimited?.amount ?? 3000).toLocaleString()} / yr`,
          "Official verified badge on profile & listings for 365 days",
          "Access to product catalog, noticeboard & showroom listings",
        ],
        actionLabel: "Get Verified",
        actionHref: verEnterprise?.url || "/login",
      },
      {
        title: "Directory Top Listing",
        price: `From ₦${Number(topDaily?.amount ?? 500).toLocaleString()}`,
        period: "per day",
        icon: <FaStar className="text-amber-500" />,
        description: "Pin your business profile to the very top of directory category and location searches.",
        highlights: [
          `Daily rate: ₦${Number(topDaily?.amount ?? 500).toLocaleString()} / day`,
          `7 Days (10% off): ₦${Number(top7?.amount ?? 3150).toLocaleString()}`,
          `14 Days (15% off): ₦${Number(top14?.amount ?? 5950).toLocaleString()}`,
          `30 Days (20% off): ₦${Number(top30?.amount ?? 12000).toLocaleString()}`,
        ],
        actionLabel: "Boost Listing",
        actionHref: topDaily?.url || "/login",
      },
    ];
  }

  if (category === "PRODUCT") {
    const upload = findByKeyword("Upload");
    const town = findByKeyword("Town");
    const city = findByKeyword("City");
    const state = findByKeyword("State");

    const boostMin = town?.amount ?? 100;
    const boostMax = state?.amount ?? 300;
    const boostPrice = boostMin === boostMax ? `₦${boostMin.toLocaleString()}` : `₦${boostMin.toLocaleString()} – ₦${boostMax.toLocaleString()}`;

    return [
      {
        title: "Standard Product Upload",
        price: upload?.amount === 0 ? "Free" : `₦${Number(upload?.amount || 0).toLocaleString()}`,
        period: "unlimited items",
        icon: <FaShoppingBag className="text-emerald-600" />,
        description: upload?.description || "List your products and inventory on the marketplace at zero charge.",
        highlights: parseHighlights(upload?.benefit, [
          "Upload product photos, descriptions, and price tags",
          "Direct customer chat via WhatsApp and phone calls",
          "Discoverable in category and location search filters",
        ]),
        actionLabel: "Add Products",
        actionHref: upload?.url || "/login",
      },
      {
        title: "Marketplace Product Boost",
        price: boostPrice,
        period: "per day",
        icon: <FaTag className="text-purple-600" />,
        description: "Elevate your product catalog items to the top of marketplace search and category feeds.",
        highlights: [
          `Town level boost: ₦${Number(town?.amount ?? 100).toLocaleString()} / day`,
          `City level boost: ₦${Number(city?.amount ?? 200).toLocaleString()} / day`,
          `State-wide boost: ₦${Number(state?.amount ?? 300).toLocaleString()} / day`,
          "Featured badge on product cards with prioritized feed rank",
        ],
        actionLabel: "Boost Product",
        actionHref: town?.url || "/login",
      },
    ];
  }

  if (category === "NOTICE") {
    const standard = findByKeyword("Standard");
    const town = findByKeyword("Town");
    const city = findByKeyword("City");
    const state = findByKeyword("State");

    const boostMin = town?.amount ?? 100;
    const boostMax = state?.amount ?? 300;
    const boostPrice = boostMin === boostMax ? `₦${boostMin.toLocaleString()}` : `₦${boostMin.toLocaleString()} – ₦${boostMax.toLocaleString()}`;

    return [
      {
        title: "Standard Notice Posting",
        price: standard?.amount === 0 ? "Free" : `₦${Number(standard?.amount || 0).toLocaleString()}`,
        period: "standard post",
        icon: <FaBullhorn className="text-slate-600" />,
        description: standard?.description || "Publish announcements, updates, and community alerts on the noticeboard.",
        highlights: parseHighlights(standard?.benefit, [
          "Standard organic visibility on local community notice feeds",
          "No contact lead collection form included",
        ]),
        actionLabel: "Post Notice",
        actionHref: standard?.url || "/login",
      },
      {
        title: "Notice Boost + Lead Capture",
        price: boostPrice,
        period: "per day",
        icon: <FaBullhorn className="text-red-500" />,
        description: "Pin announcements to the top of feeds and collect customer contact leads automatically.",
        highlights: [
          `Town level reach: ₦${Number(town?.amount ?? 100).toLocaleString()} / day`,
          `City level reach: ₦${Number(city?.amount ?? 200).toLocaleString()} / day`,
          `State-wide reach: ₦${Number(state?.amount ?? 300).toLocaleString()} / day`,
          "Attach announcement text, images, and call-to-action link",
          "Custom contact lead capture form enabled to collect customer details",
        ],
        actionLabel: "Boost Notice",
        actionHref: town?.url || "/login",
      },
    ];
  }

  if (category === "SHOWROOM") {
    const listing = findByKeyword("Listing");
    const threeDays = findByKeyword("3 Days");
    const sevenDays = findByKeyword("7 Days");
    const fourteenDays = findByKeyword("14 Days");

    return [
      {
        title: "Standard Video Listing",
        price: `₦${Number(listing?.amount ?? 300).toLocaleString()}`,
        period: "3 days",
        icon: <FaVideo className="text-rose-500" />,
        description: listing?.description || "Publish short-form video showcases of your products, craft, and workshop.",
        highlights: parseHighlights(listing?.benefit, [
          "High-speed CDN streaming",
          "Featured in mobile Showroom video feed",
          "Relist anytime upon expiration",
        ]),
        actionLabel: "Upload Video",
        actionHref: listing?.url || "/login",
      },
      {
        title: "Showroom Video Boost",
        price: `From ₦${Number(threeDays?.amount ?? 1000).toLocaleString()}`,
        period: "package",
        icon: <FaRocket className="text-purple-600" />,
        description: "Prioritize and amplify your short video showcase to reach wider local audiences.",
        highlights: [
          `3 Days (Town tier): ₦${Number(threeDays?.amount ?? 1000).toLocaleString()}`,
          `7 Days (City tier): ₦${Number(sevenDays?.amount ?? 2000).toLocaleString()}`,
          `14 Days (State tier): ₦${Number(fourteenDays?.amount ?? 3500).toLocaleString()}`,
          "Sponsored badge & prioritized feed placement",
        ],
        actionLabel: "Boost Video",
        actionHref: threeDays?.url || "/login",
      },
    ];
  }

  if (category === "BANNER_ADS") {
    const banner = findByKeyword("Banner");
    const botw = findByKeyword("Week") || findByKeyword("BOTW");
    const tier1 = findByKeyword("Tier 1") || findByKeyword("1k");
    const tier2 = findByKeyword("Tier 2") || findByKeyword("5k");
    const tier3 = findByKeyword("Tier 3") || findByKeyword("5,000+");

    return [
      {
        title: "Mobile Feed Banner",
        price: `₦${Number(banner?.amount ?? 30000).toLocaleString()}`,
        period: "7 days",
        icon: <FaAd className="text-blue-600" />,
        description: banner?.description || "High-visibility sponsor banner carousel placed prominently on the mobile homepage feed.",
        highlights: parseHighlights(banner?.benefit, [
          "Multi-image swipeable banner support",
          "Direct custom link CTA (website, social, or chat)",
          "7-day guaranteed mobile placement",
          "Detailed email analytics report upon completion",
        ]),
        actionLabel: "Book Banner",
        actionHref: banner?.url || "/ad",
      },
      {
        title: "Business of the Week (BOTW)",
        price: `₦${Number(botw?.amount ?? 25000).toLocaleString()}`,
        period: "per cycle",
        icon: <FaTrophy className="text-amber-500" />,
        description: botw?.description || "Prestigious weekly spotlight featuring 8 selected businesses on the app homepage.",
        highlights: parseHighlights(botw?.benefit, [
          `₦${Number(botw?.amount ?? 25000).toLocaleString()} application fee (limited to 8 spots per weekly cycle)`,
          "Featured in app homepage hero banner for 7 days",
          "Exclusive BOTW badge on business profile",
        ]),
        actionLabel: "Apply for BOTW",
        actionHref: botw?.url || "/ad",
      },
      {
        title: "Reach-Out Broadcast",
        price: `From ₦${Number(tier1?.amount ?? 3000).toLocaleString()}`,
        period: "per campaign",
        icon: <FaEnvelope className="text-indigo-600" />,
        description: "Send direct email & notification announcements to followers.",
        highlights: [
          `Up to 1,000 followers: ₦${Number(tier1?.amount ?? 3000).toLocaleString()}`,
          `1,001 to 5,000 followers: ₦${Number(tier2?.amount ?? 5000).toLocaleString()}`,
          `5,000+ followers: ₦${Number(tier3?.amount ?? 10000).toLocaleString()}`,
          "Direct customer inbox delivery with business branding",
        ],
        actionLabel: "Create Broadcast",
        actionHref: tier1?.url || "/login",
      },
    ];
  }

  return fallbackItems;
}

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState("BUSINESS");
  const { data } = useQuery(GET_PRICINGS, { fetchPolicy: "cache-and-network" });
  const dbPricings = data?.pricings || [];

  const fallbackItems = PRICING_DATA[activeTab] || [];
  const items = groupCategoryPricings(activeTab, dbPricings, fallbackItems);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <DynamicHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 md:py-14 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-red-600 bg-red-50 border border-red-100 rounded-full px-3.5 py-1 inline-block mb-3">
            Transparent Pricing
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Platform Pricing & Promotion Rates
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Flexible and affordable marketing tiers tailored for MSMEs, Artisans, and Traders in Oyo State.
          </p>
        </div>

        {/* Category Selector */}
        <div className="flex justify-center mb-10 overflow-x-auto py-2 px-1">
          <div className="inline-flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm gap-1.5 flex-wrap justify-center">
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-150 ${
                    isActive
                      ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-200 p-6"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl flex-shrink-0">
                  {item.icon}
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-red-600 block leading-tight">
                    {item.price}
                  </span>
                  {item.period && (
                    <span className="text-xs font-medium text-slate-400 block mt-0.5">
                      {item.period}
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-5">{item.description}</p>

              <div className="flex-1 bg-slate-50/80 rounded-xl p-4 border border-slate-100 mb-6 space-y-2.5">
                {item.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <FaCheckCircle className="text-emerald-500 text-sm flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{h}</span>
                  </div>
                ))}
              </div>

              <Link
                href={item.actionHref}
                className="w-full text-center py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-slate-900 to-red-700 hover:from-black hover:to-red-800 text-white shadow-md hover:shadow-lg transition-all duration-150"
              >
                {item.actionLabel}
              </Link>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
