import React from "react";
import Link from "next/link";

function NavBar() {
  return (
    <div className="flex justify-between items-center fixed w-full p-6 z-50">
      <img src="/logo.png" className="w-16 h-16 rounded-full" />
      <div className="flex gap-10">
        <Link href="/yourtwitterlink">
          <a>
            <img src="twitterLogo.png" className="w-10 h-10 rounded-full" />
          </a>
        </Link>

        <Link href="/yourtwitterlink">
          <a>
            <img src="openSeaLogo.png" className="w-10 h-10" />
          </a>
        </Link>
      </div>
    </div>
  );
}

export default NavBar;
