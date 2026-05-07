'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

const LoadingSpinner = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style jsx>{`
        @keyframes zoomInOut {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }
      `}</style>
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center z-50">
      <div className="text-center flex flex-col items-center">
        {/* Logo with custom zoom animation */}
        <div style={{ marginBottom: "10px" }}>
          <Image
            src="/debisi_logo.png"
            alt="Debisi Logo"
            width={60}
            height={60}
            className="rounded-lg shadow-lg animate-bounce"
            style={{
              animation: 'zoomInOut 2s ease-in-out infinite',
              width: "auto",
              height: "auto"
            }}
            priority
          />
        </div>
        
        {/* Loading text */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-800">
            Debisi Loading{dots}
          </h3>
        </div>
        
        {/* Progress bar */}
        <div className="w-48 mx-auto mt-2.5">
          <div className="bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default LoadingSpinner; 