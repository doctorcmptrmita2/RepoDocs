'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronRight, FileText, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VersionSelector } from './VersionSelector';
import type { NavItem } from '@/types';
import type { BrandingSettings } from '@/types/branding';

interface MobileSidebarProps {
  nav: NavItem[];
  projectSlug: string;
  version: string;
  branding?: BrandingSettings;
  projectName?: string;
}

export function MobileSidebar({ nav, projectSlug, version, branding, projectName }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);
  
  const logoUrl = branding?.logoUrl;
  const siteTitle = branding?.siteTitle || projectName || projectSlug;
  const primaryColor = branding?.primaryColor || '#3B82F6';

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={cn(
        "fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 z-50 transform transition-transform duration-300 ease-in-out lg:hidden",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <Link 
            href={`/docs/${projectSlug}/${version}`}
            className="flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={siteTitle}
                width={24}
                height={24}
                className="h-6 w-auto object-contain"
                unoptimized
              />
            ) : (
              <div 
                className="h-6 w-6 rounded flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: primaryColor }}
              >
                {siteTitle.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-semibold text-slate-900 dark:text-white text-sm">{siteTitle}</span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="p-4 overflow-y-auto h-[calc(100%-57px)]">
          {/* Version Selector */}
          <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            <VersionSelector projectSlug={projectSlug} currentVersion={version} />
          </div>
          
          <NavList 
            items={nav} 
            projectSlug={projectSlug} 
            version={version} 
            depth={0}
            onNavigate={() => setOpen(false)}
            primaryColor={primaryColor}
          />
        </nav>
      </div>
    </>
  );
}

function NavList({
  items,
  projectSlug,
  version,
  depth,
  onNavigate,
  primaryColor,
}: {
  items: NavItem[];
  projectSlug: string;
  version: string;
  depth: number;
  onNavigate: () => void;
  primaryColor: string;
}) {
  return (
    <ul className={cn('space-y-1', depth > 0 && 'ml-4 mt-1')}>
      {items.map((item) => (
        <NavItemComponent
          key={item.path}
          item={item}
          projectSlug={projectSlug}
          version={version}
          depth={depth}
          onNavigate={onNavigate}
          primaryColor={primaryColor}
        />
      ))}
    </ul>
  );
}

function NavItemComponent({
  item,
  projectSlug,
  version,
  depth,
  onNavigate,
  primaryColor,
}: {
  item: NavItem;
  projectSlug: string;
  version: string;
  depth: number;
  onNavigate: () => void;
  primaryColor: string;
}) {
  const pathname = usePathname();
  const href = `/docs/${projectSlug}/${version}/${item.path}`;
  const isActive = pathname === href || pathname.startsWith(href + '/');
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <li>
        <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <Folder className="w-4 h-4 text-slate-400" />
          {item.title}
        </div>
        <NavList
          items={item.children!}
          projectSlug={projectSlug}
          version={version}
          depth={depth + 1}
          onNavigate={onNavigate}
          primaryColor={primaryColor}
        />
      </li>
    );
  }

  return (
    <li>
      <Link
        href={href}
        onClick={onNavigate}
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition',
          isActive
            ? 'font-medium'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        )}
        style={isActive ? {
          backgroundColor: `${primaryColor}15`,
          color: primaryColor,
        } : undefined}
      >
        <FileText className="w-4 h-4" />
        {item.title}
        {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
      </Link>
    </li>
  );
}
