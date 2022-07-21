import React from "react";
import Link from "next/link";

function NavBar() {
  return (
    <div className="flex justify-between items-center fixed w-screen p-6 z-50">
      <img src="/logo.png" className="w-12 h-12" />
      <div className="flex gap-10">
        <Link href="/yourtwitterlink">
          <a>
            <img src="twitterLogo.png" className="w-12 h-12" />
          </a>
        </Link>

        <Link href="/yourtwitterlink">
          <a>
            <img src="openSeaLogo.png" className="w-12 h-12" />
          </a>
        </Link>
      </div>
    </div>
  );
}

export default NavBar;
