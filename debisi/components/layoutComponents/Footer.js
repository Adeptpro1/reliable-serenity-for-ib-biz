"use client";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

function Footer() {
  const { user, isAuthenticated } = useAuth();
  const thisYear = new Date().getFullYear();

  const profileLink = isAuthenticated && user ? `/dashboard/${user.id || user.uid}` : "/login";

  return (
    <div className="footerBox">
      <div className="footerBoxDetails" style={{ marginBottom: "15px" }}>
        <div style={{ paddingRight: "40px", paddingLeft: "40px" }}>
          <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-left">
              <h3 className="font-bold text-lg mb-4">Debisi &#8482;</h3>
              <div>
                <p className="mb-2 justify">
                  Debisi is a platform that connects Oyo state businesses and
                  customers around the world together. We are here to help you
                  grow, get listed and get seen!...
                  <Link href="/about" title="About Us">
                    See more
                  </Link>
                </p>
                {/* App badges — side by side under the about text */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <a
                    href="https://play.google.com/store/apps/details?id=com.adepttechnologies.debising"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-black hover:bg-gray-900 text-white rounded-lg px-3 py-2 shadow transition-all hover:scale-105 active:scale-95"
                    style={{ border: "1px solid #333" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{ width: "14px", height: "14px", flexShrink: 0 }} fill="currentColor">
                      <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l232.6-232.6L47 0zm414 218.7l-55.1-31.7-60.1 60.1 60.1 60.1 55.8-32.1c15.9-9.1 15.9-33.1-.7-56.4zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                    </svg>
                    <span style={{ fontSize: "11px", fontWeight: 600 }}>Google Play</span>
                  </a>
                  <div
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 cursor-not-allowed select-none"
                    style={{ border: "1px solid #4B5563", background: "rgba(255,255,255,0.04)", color: "#6B7280" }}
                    title="iOS app coming soon"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" style={{ width: "14px", height: "14px", flexShrink: 0 }} fill="currentColor">
                      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-16.9 75.8-16.9 31.8 0 48.3 16.9 75.8 16.9 48.4-.7 93.1-83.7 105.5-120.5-67.5-32-101-93.3-64-91.7zm-89-221.2c27.2-32.2 24.1-61.7 23.2-72.1-23.1 1.4-50 15.7-65.2 33.2-16.7 18.9-26.1 42.4-24.1 68.5 25 1.9 47.7-11.9 66.1-29.6z" />
                    </svg>
                    <span style={{ fontSize: "11px", fontWeight: 600 }}>iOS Soon</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-lg mb-4">Contacts</h3>
              <div>
                <p className="mb-2 justify">
                  43, Sango - Mokola Road, Beside LYF Foods Building, Coca Cola,
                  Mokola - Ibadan, Oyo State, Nigeria.
                </p>
              </div>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-lg mb-4">Links</h3>
              <div>
                <ul>
                  {/* <Link href="/pricing">
                    <li className="mb-2">Pricing</li>
                  </Link> */}
                  <Link href="/about">
                    <li className="mb-2">About Us</li>
                  </Link>
                  <Link href={profileLink}>
                    <li className="mb-2">My Profile</li>
                  </Link>
                  {/* <Link href="/sponsors">
                    <li className="mb-2">Our Sponsors</li>
                  </Link> */}
                  <Link href="/ad">
                    <li className="mb-2">Advertise with us</li>
                  </Link>
                    <Link href="/privacy">
                      <li className="mb-2">Privacy Policy</li>
                    </Link>
                </ul>
              </div>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-lg mb-4">Socials</h3>
              <div>
                <ul>
                  <Link href="https://www.instagram.com/debisi.ng">
                    <li className="mb-2">Instagram</li>
                  </Link>
                  <Link href="https://www.facebook.com/debisi_ibadan">
                    <li className="mb-2">Facebook</li>
                  </Link>
                  <Link href="https://www.tiktok.com/debisi_ibadan">
                    <li className="mb-2">Tik Tok</li>
                  </Link>
                  {/* <Link href="https://www.x.com/debisi_ibadan">
                    <li className="mb-2">X (Twitter)</li>
                  </Link> */}
                  <Link href="/blog">
                    <li className="mb-2">Our Blog</li>
                  </Link>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center sm:space-y-2 mt-2 sm:mt-4 pb-2 sm:pb-4">
        <p className="text-sm text-white">Debisi &#8482; {thisYear}</p>
        <p className="text-xs font-medium text-white hidden sm:block">
          Powered by <a href="mailto:isalesng@gmail.com" className="text-white hover:text-blue-300 transition-colors">iSalesNG Emporium</a>
        </p>
      </div>
    </div>
  );
}

export default Footer;
