"use client";
import { useState, useEffect } from "react";
import ScrollFooter from "./ScrollFooter";

export default function ScrollFooterWrapper() {
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (window.innerWidth < 768) {
        if (currentScrollY < lastScrollY) {
          setIsScrollingUp(true);
        } else {
          setIsScrollingUp(false);
        }
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return isScrollingUp ? <ScrollFooter /> : null;
}
