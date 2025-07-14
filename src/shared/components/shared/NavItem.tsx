import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils'; // якщо ти використовуєш tailwind merge helper
import { ComponentProps } from 'react';

type NavItemProps =
  | {
      icon?: React.ElementType;
      label: string;
      onClick?: () => void;
      href: string;
      variant?: ComponentProps<typeof Button>['variant'];
      className?: string;
    }
  | {
      icon?: React.ElementType;
      label: string;
      onClick?: () => void;
      href?: undefined;
      variant?: ComponentProps<typeof Button>['variant'];
      className?: string;
    };

function NavItem({ icon: Icon, label, onClick, href, variant = 'ghost', className }: NavItemProps) {
  const content = (
    <>
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </>
  );

  const combined = cn('flex items-center gap-3 justify-start', className);

  return href ? (
    <Button variant={variant} className={combined} asChild>
      <Link href={href} onClick={onClick}>
        {content}
      </Link>
    </Button>
  ) : (
    <Button variant={variant} className={combined} onClick={onClick}>
      {content}
    </Button>
  );
}
export default NavItem;
