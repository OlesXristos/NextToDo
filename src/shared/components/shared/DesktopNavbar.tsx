import { BellIcon, HomeIcon, UserIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';
import { SignInButton, UserButton } from '@clerk/nextjs';
import ModeToggle from './ModeToggle';
import { currentUser } from '@clerk/nextjs/server';

async function DesktopNavbar() {
  const user = await currentUser();

  return (
    <div className="hidden md:flex items-center space-x-4">
      <ModeToggle />

      {user ? (
        <>
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link href="/home">
              <HomeIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Home</span>
            </Link>
          </Button>
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link href="/notifications">
              <BellIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Notifications</span>
            </Link>
          </Button>
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link
              href={`/profile/${
                user.username ?? user.emailAddresses[0].emailAddress.split('@')[0]
              }`}>
              <UserIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Profile</span>
            </Link>
          </Button>
          <UserButton />
        </>
      ) : (
        <SignInButton mode="modal" forceRedirectUrl="/home">
          <Button variant="default" className="px-5 py-5">
            Sign In
          </Button>
        </SignInButton>
      )}
    </div>
  );
}
export default DesktopNavbar;
