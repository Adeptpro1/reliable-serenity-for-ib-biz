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

      <p>Debisi &#8482; {thisYear}</p>
    </div>
  );
}

export default Footer;
