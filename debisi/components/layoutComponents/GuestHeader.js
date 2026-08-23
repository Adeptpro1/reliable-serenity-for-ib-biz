import Link from "next/link";
// import ApplicationLogo from "@/Components/ApplicationLogo";
// import NavLink from "@/Components/NavLink";

function GuestHeader() {
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
              <div className="navItem">SMEs</div>
            </Link>
            <Link href="/marketplace">
              <div className="navItem">Marketplace</div>
            </Link>
            <Link href="/about">
              <div className="navItem">About Us</div>
            </Link>
            {/* <Link href="/ad">
              <div className="navItem">Advertise</div>
            </Link> */}
            <Link href="/blog">
              <div className="navItem">Blog</div>
            </Link>
          </nav>
          <div className="navButtons">
            <div className="loginButton">
              <Link href="/login">Login</Link>
            </div>
            <Link href="/register">
              <div className="sellButton">Get Started</div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default GuestHeader;
