"use client";

import Link from "next/link";
import HeroSpotlight from "./HeroSpotlight";
import { FaSearchLocation, FaMagic, FaSearch } from "react-icons/fa";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLazyQuery } from "@apollo/client";
import { ANALYZE_SEARCH_QUERY } from "@/api/queries/business/business";
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
          The Sales & Marketing Hub for SMEs in Ibadan City!
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
          style={{ padding: "12px 32px", marginRight: "10px", marginTop: "0px"}}
        >
          {analyzing ? "Thinking..." : <><FaMagic /> AI Search</>}
        </button>
      </form>
      </div>
    </HeroSpotlight>
  );
};

export default HeroSearch;
