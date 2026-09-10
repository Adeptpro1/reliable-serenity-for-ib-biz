"use client";

import Link from "next/link";
import HeroSpotlight from "./HeroSpotlight";
import { FaSearchLocation, FaMagic, FaSearch } from "react-icons/fa";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLazyQuery } from "@apollo/client";
import { ANALYZE_SEARCH_QUERY } from "@/graphql/queries/business/business";
import toast from "react-hot-toast";

const HeroSearch = () => {
  const [query, setQuery] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const [analyzeQuery] = useLazyQuery(ANALYZE_SEARCH_QUERY, {
    fetchPolicy: 'network-only',
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (!user) {
      toast.error("Please login to use AI Search");
      router.push("/login?redirect=/");
      return;
    }

    setAnalyzing(true);
    const loadingToast = toast.loading("✨ AI is analyzing your story...");

    try {
      const { data, error } = await analyzeQuery({
        variables: { prompt: query },
      });

      // If Apollo returned a GraphQL error, fall through to standard search
      const intent = error ? null : data?.analyzeSearchQuery;

      if (!intent || (!intent.keywords && !intent.category && !intent.town && !intent.city && !intent.lg)) {
        toast.error("AI analysis skipped. Proceeding with standard search...", { id: loadingToast });
        router.push(`/directory?search=${encodeURIComponent(query)}`);
        return;
      }

      toast.success("AI successfully matched your request!", { id: loadingToast });

      // Construct dynamic URL from AI extraction
      const params = new URLSearchParams();
      if (intent.keywords) params.append("search", intent.keywords);
      if (intent.category) params.append("category", intent.category);
      if (intent.town) params.append("town", intent.town);
      if (intent.city) params.append("city", intent.city);
      if (intent.lg) params.append("lg", intent.lg);

      params.append("aiSearch", "true");

      router.push(`/directory?${params.toString()}`);

    } catch (err) {
      console.error("AI Search Error:", err);
      toast.error("AI Search is temporarily unavailable. Searching normally...", { id: loadingToast });
      router.push(`/directory?search=${encodeURIComponent(query)}`);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <HeroSpotlight imageSrc="https://cdn.debisi.ng/images/ibadan_clean_brown_roof.png">
      <div
        className="w-full h-auto flex flex-col items-center text-center relative z-10"
        style={{ marginTop: "2px", padding: "40px 20px" }}
      >
        <h1 className="max-w-[50rem] sm:max-w-[49rem] px-3 md:px-0 sm:text-4xl md:text-6xl text-3xl font-bold font-display md:leading-[1.3em] text-center gradient-headline">
          The Sales & Marketing Hub for Businesses in Ibadan City!
        </h1>
        <h3
          className="font-semibold text-center px-4 text-gray-400"
          style={{ marginTop: "20px" }}
        >
          Helping businesses become discoverable, trusted, and growth-ready.
        </h3>

        {/* Hero Search Bar */}
        <form
          onSubmit={handleSearch}
          className="w-full max-w-[600px] relative flex flex-col sm:block"
          style={{ marginTop: "40px", padding: "0 10px", gap: "12px" }}
        >
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Get me a mechanic in Mokola..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={analyzing}
              maxLength={350}
              className="w-full rounded-2xl border-2 border-purple-200 focus:border-purple-600 focus:outline-none shadow-xl transition-all text-base sm:text-lg bg-gray-50 pl-4 sm:pl-12"
              style={{ paddingTop: "16px", paddingRight: "48px", paddingBottom: "16px" }}
            />
            {analyzing ? (
              <FaMagic className="hidden sm:block absolute left-4 top-1/2 -translate-y-1/2 text-purple-600 animate-pulse text-xl" />
            ) : (
              <FaSearch className="hidden sm:block absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 text-xl" />
            )}
          </div>
          <button
            type="submit"
            disabled={analyzing}
            className={`w-full sm:w-auto sm:absolute sm:right-2 sm:top-1/2 sm:-translate-y-1/2 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-md text-lg sm:text-base ${analyzing ? 'bg-purple-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'}`}
            style={{ padding: "12px 32px", marginRight: "10px", marginTop: "0px" }}
          >
            {analyzing ? "Thinking..." : <><FaMagic /> AI Search</>}
          </button>
        </form>

        {/* App Download Buttons */}
        <div
          className="flex flex-wrap items-center justify-center gap-3"
          style={{ marginTop: "28px" }}
        >
          {/* Google Play */}
          <a
            href="https://play.google.com/store/apps/details?id=com.adepttechnologies.debising"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-black hover:bg-gray-900 text-white rounded-xl px-5 py-3 shadow-lg transition-all hover:scale-105 active:scale-95"
            style={{ border: "1px solid #333" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              className="w-6 h-6 flex-shrink-0"
              fill="currentColor"
            >
              <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l232.6-232.6L47 0zm414 218.7l-55.1-31.7-60.1 60.1 60.1 60.1 55.8-32.1c15.9-9.1 15.9-33.1-.7-56.4zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
            </svg>
            <div className="flex flex-col leading-tight text-left">
              <span className="text-xs text-gray-400">Get it on</span>
              <span className="text-sm font-semibold">Google Play</span>
            </div>
          </a>

          {/* iOS — Coming Soon */}
          <div
            className="flex items-center gap-2 rounded-xl px-5 py-3 cursor-not-allowed select-none"
            style={{
              border: "1px solid #4B5563",
              background: "rgba(255,255,255,0.04)",
              color: "#9CA3AF",
            }}
            title="iOS app coming soon"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 384 512"
              className="w-6 h-6 flex-shrink-0"
              fill="currentColor"
            >
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-16.9 75.8-16.9 31.8 0 48.3 16.9 75.8 16.9 48.4-.7 93.1-83.7 105.5-120.5-67.5-32-101-93.3-64-91.7zm-89-221.2c27.2-32.2 24.1-61.7 23.2-72.1-23.1 1.4-50 15.7-65.2 33.2-16.7 18.9-26.1 42.4-24.1 68.5 25 1.9 47.7-11.9 66.1-29.6z" />
            </svg>
            <div className="flex flex-col leading-tight text-left">
              <span className="text-xs" style={{ color: "#6B7280" }}>
                Coming soon on
              </span>
              <span className="text-sm font-semibold">App Store</span>
            </div>
          </div>
        </div>
      </div>
    </HeroSpotlight>

  );
};

export default HeroSearch;
