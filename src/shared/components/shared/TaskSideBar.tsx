'use client';

import Link from 'next/link';
import { Button } from '../ui/button';
import clsx from 'clsx';
import { CheckIcon, ListIcon, XIcon } from 'lucide-react';

import { currentUser } from '@clerk/nextjs/server';
import { ModalAddTask } from './ModalAddTask';
import UnAuthenticatedSidebar from './UnAuthenticatedSidebar';
import { usePathname } from 'next/navigation';

const TaskSidebar = ({ username }: { username: string }) => {
  const pathname = usePathname();

  const basePath = `/profile/${username}`;
  const links = [
    { href: `${basePath}/tasks`, label: 'Усі задачі', icon: <ListIcon /> },
    { href: `${basePath}/completed`, label: 'Виконані', icon: <CheckIcon /> },
    { href: `${basePath}/failed`, label: 'Невдалі', icon: <XIcon /> },
  ];
  return (
    <div className="w-full">
      <nav
        className="flex justify-around p-5 flex-row xs:p-0 xs:flex-col items-start gap-2 flex-wrap mt-2 xs:sticky xs:top-[120px]
        bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50
        xs:bg-transparent xs:backdrop-blur-0 xs:supports-[backdrop-filter]:bg-transparent">
        <ModalAddTask />
        {links.map(({ href, label, icon }) => (
          <Link key={href} href={href}>
            <Button
              variant={pathname === href ? 'default' : 'outline'}
              className={clsx('space-x-2')}>
              {icon}
              <span className="hidden md:inline">{label}</span>
            </Button>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default TaskSidebar;
