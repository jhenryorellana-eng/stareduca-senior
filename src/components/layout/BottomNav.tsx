'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Users, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/stores/user-store';

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
  matchPaths?: string[];
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Inicio',
    icon: Home,
    matchPaths: ['/'],
  },
  {
    href: '/aprender',
    label: 'Aprender',
    icon: BookOpen,
    matchPaths: ['/aprender'],
  },
  {
    href: '/comunidad',
    label: 'Comunidad',
    icon: Users,
    matchPaths: ['/comunidad'],
  },
  {
    href: '/avisos',
    label: 'Avisos',
    icon: Bell,
    matchPaths: ['/avisos'],
  },
  {
    href: '/perfil',
    label: 'Perfil',
    icon: User,
    matchPaths: ['/perfil'],
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const { unreadNotifications } = useUserStore();

  const isActive = (item: NavItem) => {
    if (item.matchPaths) {
      return item.matchPaths.some((path) => pathname === path);
    }
    return pathname === item.href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 blur-nav border-t border-gray-200/50">
      <div className="flex items-center justify-around h-20 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          const showBadge = item.href === '/avisos' && unreadNotifications > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl transition-all duration-200',
                active
                  ? 'text-primary'
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <div className="relative">
                <Icon
                  size={24}
                  strokeWidth={active ? 2.5 : 2}
                  className={cn(
                    active && 'fill-primary/20'
                  )}
                />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-[10px] font-medium',
                active && 'font-bold'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
