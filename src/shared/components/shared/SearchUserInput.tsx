'use client';

import { cn } from '@/lib/utils';
import { Search, SearchIcon } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { useClickAway, useDebounce } from 'react-use';

import { User } from '@prisma/client';
import { Avatar, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useMediaQuery } from 'usehooks-ts'; // npm i usehooks-ts
import { Button } from '../ui/button';
import { SearchUserInputSkeleton } from './SearchUserInputSkeleton';
import { Api } from '../../../../services/api-client';

interface Props {
  className?: string;
}

export const SearchUserInput: React.FC<Props> = ({ className }) => {
  const isMobile = useMediaQuery('(max-width: 430px)');
  const [isMounted, setIsMounted] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const [users, setusers] = React.useState<User[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const ref = React.useRef(null);

  useClickAway(ref, () => setFocused(false));
  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  useDebounce(
    async () => {
      try {
        const response = await Api.users.search(searchQuery);
        setusers(response);
      } catch (error) {
        console.log(error);
      }
    },
    250,
    [searchQuery],
  );

  const onClickItem = () => {
    setFocused(false);
    setSearchQuery('');
    setusers([]);
    setDialogOpen(false); // close dialog on mobile
  };
  if (!isMounted) return <SearchUserInputSkeleton />;
  const renderSearchInput = () => (
    <>
      {focused && !isMobile && (
        <div className="fixed top-0 left-0 bottom-0 right-0 bg-black/50 z-30" />
      )}
      <div
        ref={ref}
        className={cn(
          '  rounded-2xl flex-1 justify-center relative h-11 z-30',
          isMobile ? 'flex' : 'hidden xs:flex',
          className,
        )}>
        <div className="relative w-full max-w-96">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Find user"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            className="w-full rounded-md border border-input pl-10 pr-3 py-2 outline-none focus-visible:ring-1 focus-visible:ring-ring "
          />
        </div>
        {/* <Search className="absolute top-1/2 translate-y-[-50%] left-3 h-5 text-gray-400" />
        <input
          className="outline-none w-full max-w-96 rounded-md border border-input focus-visible:ring-1 focus-visible:ring-ring pl-11"
          type="text"
          placeholder="Find user"
          onFocus={() => setFocused(true)}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        /> */}

        {users.length > 0 && (
          <div
            className={cn(
              'absolute w-full bg-background rounded-md border border-input py-2 top-14 shadow-md transition-all duration-200 invisible opacity-0 z-50',
              focused && 'visible opacity-100 top-12',
            )}>
            {users.map((user) => (
              <Link
                onClick={onClickItem}
                key={user.id}
                className="flex items-center border-b-2 last:border-b-0 gap-3 w-full px-3 py-2 hover:bg-primary/10"
                href={`/profile/${user.username}`}>
                <Avatar>
                  <AvatarImage src={user.image ?? '/avatar.png'} />
                </Avatar>
                <span>{user.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <SearchIcon></SearchIcon>
          </Button>
        </DialogTrigger>

        <DialogContent className="p-4 sm:max-w-[90%] rounded-xl">
          <DialogTitle>Enter user name</DialogTitle>
          {renderSearchInput()}
        </DialogContent>
      </Dialog>
    );
  }

  return renderSearchInput();
};
