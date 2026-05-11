import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";

import { isAuthenticated } from "@/lib/actions/auth.action";
import SignOutButton from "@/components/SignOutButton";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();

  return (
    <div className="root-layout">
      <nav className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="PrepWise Logo" width={38} height={32} style={{ width: 'auto', height: 'auto' }} />
          <h2 className="text-primary-100">PrepWise</h2>
        </Link>
        <div className="flex items-center gap-4">
          {isUserAuthenticated && (
            <>
              <Link href="/dashboard" className="text-sm hover:text-primary-100 transition-colors">
                Dashboard
              </Link>
              <SignOutButton />
            </>
          )}
          {!isUserAuthenticated && (
            <>
              <Link href="/sign-in" className="text-sm hover:text-primary-100 transition-colors">
                Sign In
              </Link>
              <Link href="/sign-up" className="text-sm hover:text-primary-100 transition-colors">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {children}
    </div>
  );
};

export default Layout;