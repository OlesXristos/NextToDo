import { Button } from '@/shared/components/ui/button';
import { SignInButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react';

async function PublicPage() {
  const user = await currentUser();
  if (user) redirect('/home');
  return (
    <main className="text-center py-20">
      <h2 className="text-7xl  font-bold">Express your ambitions. Share your success</h2>
      <p className=" mt-4 text-lg"> Plan your every move. </p>
      <div className="mt-6 space-x-4">
        <SignInButton mode="modal">
          <Button variant="default" className=" px-5 py-5">
            Try it
          </Button>
        </SignInButton>
      </div>
    </main>
  );
}

export default PublicPage;
