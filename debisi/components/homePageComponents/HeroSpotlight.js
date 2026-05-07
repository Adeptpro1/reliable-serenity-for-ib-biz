"use client";

import { useRef, useCallback } from "react";

export default function HeroSpotlight({
  imageSrc,
  spotlightRadius = 120, // Smaller circle
  children,
}) {
  const bgRef = useRef(null);
  const animRef = useRef(0);
  const pos = useRef({ x: 50, y: 50 });
  const target = useRef({ x: 50, y: 50 });
  const isOver = useRef(false);

  const setMask = useCallback((x, y, r) => {
    if (!bgRef.current) return;
    const val = `radial-gradient(circle ${r}px at ${x}% ${y}%, black 50%, transparent 100%)`;
    bgRef.current.style.webkitMaskImage = val;
    bgRef.current.style.maskImage = val;
  }, []);

  const lerp = (a, b, t) => a + (b - a) * t;

  const startLoop = useCallback(() => {
    const loop = () => {
      // Lower lerp factor (0.06 instead of 0.12) creates a smooth "trailing behind" delay effect
      pos.current.x = lerp(pos.current.x, target.current.x, 0.06);
      pos.current.y = lerp(pos.current.y, target.current.y, 0.06);
      if (isOver.current)
        setMask(pos.current.x, pos.current.y, spotlightRadius);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
  }, [setMask, spotlightRadius]);

  const stopLoop = () => cancelAnimationFrame(animRef.current);

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    target.current.x = ((e.clientX - rect.left) / rect.width) * 100;
    target.current.y = ((e.clientY - rect.top) / rect.height) * 100;

    if (!isOver.current) {
      isOver.current = true;
      if (bgRef.current) bgRef.current.style.transition = "none";
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    isOver.current = false;
    if (bgRef.current) {
      bgRef.current.style.transition =
        "mask-image 0.8s ease-out, -webkit-mask-image 0.8s ease-out";
    }
    setMask(pos.current.x, pos.current.y, 0);
  }, [setMask]);

  return (
    <section
      className="relative w-full h-auto overflow-hidden group mt-1"
      onMouseMove={handleMouseMove}
      onMouseEnter={startLoop}
      onMouseLeave={() => {
        stopLoop();
        handleMouseLeave();
      }}
    >
      {/* Base white background */}
      <div className="absolute inset-0 bg-white pointer-events-none" />

      {/* Background image — revealed by mask */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-40 transition-opacity duration-500"
        style={{
          backgroundImage: imageSrc ? `url(${imageSrc})` : "none",
          WebkitMaskImage:
            "radial-gradient(circle 0px at 50% 50%, black 0%, transparent 0%)",
          maskImage:
            "radial-gradient(circle 0px at 50% 50%, black 0%, transparent 0%)",
        }}
      />

      {/* Hero content */}
      <div className="relative z-10 w-full h-full pointer-events-auto">
        {children}
      </div>
    </section>
  );
}
