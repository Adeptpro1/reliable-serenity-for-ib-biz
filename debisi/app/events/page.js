"use client";

import React from "react";
import { useQuery } from "@apollo/client";
import { GET_EVENTS } from "@/api/queries/events";
import DynamicHeader from "@/components/layoutComponents/DynamicHeader";
import Footer from "@/components/layoutComponents/Footer";
import { FiCalendar, FiClock, FiExternalLink } from "react-icons/fi";

export default function EventsPage() {
  const { data, loading, error } = useQuery(GET_EVENTS, {
    fetchPolicy: "cache-first"
  });

  const events = data?.events || [];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <DynamicHeader />
      
      <main className="flex-1" style={{ padding: "40px 20px" }}>
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center" style={{ marginBottom: "40px" }}>
            <h1 className="text-4xl font-bold text-gray-900" style={{ marginBottom: "16px" }}>Platform Events & Activations</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover and join upcoming events hosted on Debisi NG. Connect, learn, and grow your network.
            </p>
          </div>

          {loading && !events.length && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 bg-red-50 p-6 rounded-xl border border-red-100">
              Failed to load events. Please try again later.
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="text-center text-gray-500 bg-white p-12 rounded-2xl shadow-sm border border-gray-100">
              <FiCalendar size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold">No upcoming events</h3>
              <p style={{ marginTop: "8px" }}>Check back later for new and exciting events on the platform.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => {
              const eventDate = new Date(Number(event.date) || event.date);
              const formattedDate = !isNaN(eventDate) ? eventDate.toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
              }) : "TBA";
              const formattedTime = !isNaN(eventDate) ? eventDate.toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit'
              }) : "";

              return (
                <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
                  {event.imageUrl ? (
                    <img 
                      src={event.imageUrl} 
                      alt={event.title} 
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center">
                      <FiCalendar size={48} className="text-blue-300" />
                    </div>
                  )}
                  
                  <div className="flex flex-col flex-1" style={{ padding: "24px" }}>
                    <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold mb-2">
                      <FiCalendar /> <span>{formattedDate}</span>
                      {formattedTime && <span className="text-gray-400">•</span>}
                      {formattedTime && <span className="flex items-center gap-1 text-gray-600"><FiClock /> {formattedTime}</span>}
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-900" style={{ marginBottom: "12px" }}>{event.title}</h2>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                      {event.description}
                    </p>
                    
                    <div style={{ marginTop: "auto" }}>
                      {event.link ? (
                        <a 
                          href={event.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
                          style={{ padding: "12px 16px" }}
                        >
                          Register / View Info <FiExternalLink />
                        </a>
                      ) : (
                        <button 
                          disabled
                          className="w-full bg-gray-100 text-gray-400 font-bold rounded-lg border border-gray-200 cursor-not-allowed"
                          style={{ padding: "12px 16px" }}
                        >
                          No Registration Link
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
