'use client';

import {
  BellIcon,
  HomeIcon,
  LogInIcon,
  LogOutIcon,
  MenuIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet';
import { useState } from 'react';
import { useAuth, SignInButton, SignOutButton, useUser } from '@clerk/nextjs';
import { useTheme } from 'next-themes';
import NavItem from './NavItem';

function MobileNavbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isSignedIn } = useAuth();
  const { theme, setTheme } = useTheme();
  const { user } = useUser();

  const username =
    user?.username ?? user?.emailAddresses[0]?.emailAddress.split('@')[0] ?? 'profile';
  return (
    <div className="flex md:hidden items-center space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="mr-2">
        <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <MenuIcon className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px]">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col space-y-4 mt-6">
            {isSignedIn || user ? (
              <>
                <NavItem
                  icon={HomeIcon}
                  label="Home"
                  onClick={() => setShowMobileMenu(false)}
                  href="/home"
                  variant="ghost"
                />
                <NavItem
                  icon={BellIcon}
                  label="Notifications"
                  onClick={() => setShowMobileMenu(false)}
                  href="/notifications"
                  variant="ghost"
                />
                <NavItem
                  icon={UserIcon}
                  label="Profile"
                  onClick={() => setShowMobileMenu(false)}
                  href={`/profile/${username}`}
                  variant="ghost"
                />
                <SignOutButton>
                  <NavItem
                    icon={LogOutIcon}
                    label="Sign out"
                    onClick={() => setShowMobileMenu(false)}
                    variant="default"
                  />
                </SignOutButton>
              </>
            ) : (
              <SignInButton mode="modal">
                <NavItem
                  icon={LogInIcon}
                  label="Sing in"
                  onClick={() => setShowMobileMenu(false)}
                  variant="default"
                  className="flex  justify-center"
                />
              </SignInButton>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default MobileNavbar;
