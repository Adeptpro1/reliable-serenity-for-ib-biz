"use client";
import Image from "next/image";

import React from "react";
import { useQuery } from "@apollo/client";
import { GET_EVENTS } from "../../api/queries/events";
import { FiCalendar, FiMapPin, FiExternalLink, FiClock } from "react-icons/fi";

const EventsList = () => {
  const { data, loading, error } = useQuery(GET_EVENTS, {
    fetchPolicy: "network-only"
  });

  const events = data?.events || [];

  if (loading) return <div style={{ textAlign: "center", padding: "40px" }}>Loading events...</div>;
  if (error) return <div style={{ textAlign: "center", padding: "40px", color: "red" }}>Error: {error.message}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px', color: '#1f2937' }}>Platform Events</h2>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>Stay updated with the latest events on Debisi NG.</p>

      {events.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {events.map(event => (
            <div key={event.id} style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              overflow: 'hidden', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {event.imageUrl && (
                <div style={{ height: '180px', overflow: 'hidden' }}>
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  width={800} height={800} />
                </div>
              )}
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#111827' }}>{event.title}</h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', fontSize: '14px', marginBottom: '8px' }}>
                  <FiCalendar style={{ color: '#D22730' }} />
                  <span>{new Date(Number(event.date) || event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', fontSize: '14px', marginBottom: '16px' }}>
                  <FiClock style={{ color: '#D22730' }} />
                  <span>{new Date(Number(event.date) || event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <p style={{ 
                  color: '#4b5563', 
                  fontSize: '14px', 
                  lineHeight: '1.6', 
                  marginBottom: '20px',
                  display: '-webkit-box',
                  WebkitLineClamp: '3',
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {event.description}
                </p>

                <div style={{ marginTop: 'auto' }}>
                  <button
                    onClick={() => event.link && window.open(event.link, '_blank')}
                    disabled={!event.link}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: event.link ? '#D22730' : '#ccc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: event.link ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <FiExternalLink /> Register Interest
                  </button>
                  {!event.link && <p style={{ fontSize: '10px', color: '#9ca3af', textAlign: 'center', marginTop: '4px' }}>Registration link not available.</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "60px", color: "#6b7280" }}>
          <FiCalendar size={64} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
          <p style={{ fontSize: '18px', fontWeight: '600' }}>No upcoming events.</p>
          <p>Check back later for new events from the administrator.</p>
        </div>
      )}
    </div>
  );
};

export default EventsList;
