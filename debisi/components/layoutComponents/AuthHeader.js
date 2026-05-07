import Link from "next/link";
import ProfileButtons from "./ProfileButtons";

function AuthHeader({ hideProfile = false }) {
  return (
    <>
      <div className="headerBox">
        <div className="headerContainer">
          <div className="brand">
            <h4 className="brandName">
              <Link href="/">Debisi</Link>
            </h4>
          </div>
          <nav className="navContainer">
            <Link href="/">
              <div className="navItem">Home</div>
            </Link>
            <Link href="/directory">
              <div className="navItem">Directory</div>
            </Link>
            <Link href="/about">
              <div className="navItem">About Us</div>
            </Link>
            <Link href="/ad">
              <div className="navItem">Advertise</div>
            </Link>
            <Link href="/blog">
              <div className="navItem">Blog</div>
            </Link>
          </nav>
          {!hideProfile && (
            <div className="navButtons">
              <ProfileButtons />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AuthHeader;
