'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ChevronRight, FileText, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VersionSelector } from './VersionSelector';
import type { NavItem } from '@/types';
import type { BrandingSettings } from '@/types/branding';

interface SidebarProps {
  nav: NavItem[];
  projectSlug: string;
  version: string;
  customDomain?: string;
  branding?: BrandingSettings;
  projectName?: string;
}

export function Sidebar({ nav, projectSlug, version, customDomain, branding, projectName }: SidebarProps) {
  const logoUrl = branding?.logoUrl;
  const siteTitle = branding?.siteTitle || projectName || projectSlug;
  const primaryColor = branding?.primaryColor || '#3B82F6';
  
  // Determine base URL for logo link
  const baseUrl = customDomain ? '/' : `/docs/${projectSlug}/${version}`;
  
  return (
    <aside className="w-56 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
      <nav className="sticky top-0 h-screen overflow-y-auto">
        {/* Logo/Title Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <Link 
            href={baseUrl}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={siteTitle}
                width={28}
                height={28}
                className="h-7 w-auto object-contain"
                unoptimized
              />
            ) : (
              <div 
                className="h-7 w-7 rounded-md flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: primaryColor }}
              >
                {siteTitle.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
              {siteTitle}
            </span>
          </Link>
        </div>
        
        <div className="p-4">
          {/* Version Selector - hide on custom domain */}
          {!customDomain && (
            <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <VersionSelector projectSlug={projectSlug} currentVersion={version} />
            </div>
          )}
          
          <NavList 
            items={nav} 
            projectSlug={projectSlug} 
            version={version} 
            customDomain={customDomain} 
            depth={0}
            primaryColor={primaryColor}
          />
        </div>
      </nav>
    </aside>
  );
}

function NavList({
  items,
  projectSlug,
  version,
  customDomain,
  depth,
  primaryColor,
}: {
  items: NavItem[];
  projectSlug: string;
  version: string;
  customDomain?: string;
  depth: number;
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
          customDomain={customDomain}
          depth={depth}
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
  customDomain,
  depth,
  primaryColor,
}: {
  item: NavItem;
  projectSlug: string;
  version: string;
  customDomain?: string;
  depth: number;
  primaryColor: string;
}) {
  const pathname = usePathname();
  const href = customDomain ? `/${item.path}` : `/docs/${projectSlug}/${version}/${item.path}`;
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
          customDomain={customDomain}
          depth={depth + 1}
          primaryColor={primaryColor}
        />
      </li>
    );
  }

  return (
    <li>
      <Link
        href={href}
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition',
          isActive
            ? 'font-medium'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
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
