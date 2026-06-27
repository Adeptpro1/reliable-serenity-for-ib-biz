"use client";
import { TbHome } from "react-icons/tb";
import { BsSignpost2, BsSearch, BsCart, BsThreeDots, BsFacebook, BsTwitter, BsInstagram, BsLinkedin, BsInfoCircle, BsCurrencyDollar, BsPerson, BsJournalText, BsPencilSquare, BsMegaphone } from "react-icons/bs";
import { FaTiktok } from "react-icons/fa";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

function ScrollFooter() {
  const { user, isAuthenticated } = useAuth();
  const dashboardLink = isAuthenticated && user ? `/dashboard/${user.id || user.uid}` : "/login";
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const navigationItems = [
    { href: "/about", icon: <BsInfoCircle />, label: "About Us" },
    // { href: "/ad", icon: <BsMegaphone />, label: "Advertise" },
    { href: dashboardLink, icon: <BsPerson />, label: "My Profile" },
    { href: "/blog", icon: <BsJournalText />, label: "Our Blog" },
  ];

  const socialItems = [
    { href: "https://www.instagram.com/debisi.ng", icon: <BsInstagram />, label: "Instagram" },
    { href: "https://www.facebook.com/debisi_ibadan", icon: <BsFacebook />, label: "Facebook" },
    { href: "https://www.tiktok.com/debisi_ibadan", icon: <FaTiktok />, label: "Tik Tok" },
  ];

  return (
    <>
      <div className="scrollFooter lg:hidden">
        {/* Conditionally Render Dropdown */}
        {isDropdownOpen && (
          <div className="dropdown-menu">
            <div className="max-w-md mx-auto">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-white opacity-90">Navigation</h3>
                  <div className="space-y-2">
                    {navigationItems.map((item, index) => (
                      <Link key={index} href={item.href} onClick={() => setIsDropdownOpen(false)}>
                        <div className="menu-item">
                          <span className="text-white text-lg">{item.icon}</span>
                          <span className="text-sm text-white font-medium">{item.label}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3 text-white opacity-90">Social</h3>
                  <div className="space-y-2">
                    {socialItems.map((item, index) => (
                      <a key={index} href={item.href} target="_blank" rel="noopener noreferrer" onClick={() => setIsDropdownOpen(false)}>
                        <div className="menu-item">
                          <span className="text-white text-lg">{item.icon}</span>
                          <span className="text-sm text-white font-medium">{item.label}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Bar */}
        <div className="scrollFooterBox">
          <Link href="/">
            <div style={{ marginLeft: 'auto', marginRight: 'auto' }}>
              <TbHome style={{ marginLeft: 'auto', marginRight: 'auto' }}/>
              <p>Home</p>
            </div>
          </Link>
          <Link href="/directory">
            <div style={{ marginLeft: 'auto', marginRight: 'auto' }}>
              <BsSearch style={{ marginLeft: 'auto', marginRight: 'auto' }}/>
              <p>Search</p>
            </div>
          </Link>
          <Link href="/marketplace">
            <div style={{ marginLeft: 'auto', marginRight: 'auto' }}>
              <BsCart style={{ marginLeft: 'auto', marginRight: 'auto' }}/>
              <p>Shop</p>
            </div>
          </Link>        
          <div onClick={toggleDropdown} className="cursor-pointer">
            <div style={{ marginLeft: 'auto', marginRight: 'auto' }}>
              <BsThreeDots style={{ marginLeft: 'auto', marginRight: 'auto' }}/>
              <p>More</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dropdown-menu {
          position: fixed;
          bottom: 60px;
          left: 0;
          right: 0;
          background: linear-gradient(45deg, var(--secondaryColor), var(--primaryColor));
          color: white;
          z-index: 999;
          padding: 20px;
          animation: slideUpFade 0.3s ease-in-out;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          transition: all 0.2s ease-in-out;
        }

        .menu-item:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }

        @keyframes slideUpFade {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

export default ScrollFooter;
