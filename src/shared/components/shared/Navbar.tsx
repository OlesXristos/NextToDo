import Link from 'next/link';
import React from 'react';

import Image from 'next/image';
import { currentUser } from '@clerk/nextjs/server';
import { syncUser } from '@/action/user.action';
import { SearchUserInput } from './SearchUserInput';
import DesktopNavbar from './DesktopNavbar';
import MobileNavbar from './MobileNavbar';

const Navbar = async () => {
  const user = await currentUser();
  if (user) await syncUser();
  return (
    <nav className="sticky top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/toDo.png" alt="Logo" width={40} height={40} />
              <div>
                <h2 className="text-3xl font-black">Mira</h2>
                <p className="text-base text-gray-400 leading-3">Do your things</p>
              </div>
            </Link>
          </div>
          {user && <SearchUserInput />}

          <DesktopNavbar />
          <MobileNavbar />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
