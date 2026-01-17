/**
 * Custom Domain Handler
 * 
 * Handles requests from custom domains (e.g., docs.agentwall.io)
 * Looks up the domain in DB and renders the appropriate docs
 */

import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getCachedNav, getCachedDoc, getCachedBranding, cacheBranding } from '@/lib/cache';
import { findDefaultDoc } from '@/lib/github/nav-builder';
import { Sidebar } from '@/components/docs/Sidebar';
import { TableOfContents } from '@/components/docs/TableOfContents';
import { ProseContent } from '@/components/docs/ProseContent';
import { Breadcrumb } from '@/components/docs/Breadcrumb';
import { PrevNextNav } from '@/components/docs/PrevNextNav';
import { BrandingProvider } from '@/components/docs/BrandingProvider';
import { BrandedFooter } from '@/components/docs/BrandedFooter';
import { DynamicFavicon } from '@/components/docs/DynamicFavicon';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SearchDialog } from '@/components/docs/SearchDialog';
import type { BrandingSettings } from '@/types/branding';

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function CustomDomainPage({ params }: PageProps) {
  const headersList = await headers();
  const customDomain = headersList.get('x-custom-domain');
  
  if (!customDomain) {
    notFound();
  }

  // Lookup project by custom domain with branding
  const project = await db.project.findFirst({
    where: { customDomain },
    select: { slug: true, branch: true, name: true, branding: true },
  });

  if (!project) {
    notFound();
  }

  const { slug: slugArray } = await params;
  const docSlug = slugArray?.join('/') || 'index';
  const version = project.branch;

  // Get nav, doc, and branding from cache
  const [nav, doc, cachedBranding] = await Promise.all([
    getCachedNav(project.slug, version),
    getCachedDoc(project.slug, version, docSlug),
    getCachedBranding(project.slug),
  ]);
  
  // Use cached branding or fall back to database
  const branding = (cachedBranding || project.branding || {}) as BrandingSettings;
  
  // Cache branding if not already cached
  if (!cachedBranding && project.branding) {
    await cacheBranding(project.slug, branding);
  }
  
  const siteTitle = branding.siteTitle || project.name;
  const logoUrl = branding.logoUrl;
  const primaryColor = branding.primaryColor || '#3B82F6';
  const socialLinks = branding.socialLinks;

  // If no nav, docs not synced yet
  if (!nav) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Documentation Not Ready</h1>
          <p className="text-slate-500">Please sync your docs from the dashboard.</p>
        </div>
      </div>
    );
  }

  // If requesting root and no index, redirect to first doc
  if (docSlug === 'index' && !doc) {
    const defaultDoc = findDefaultDoc(nav);
    if (defaultDoc) {
      redirect(`/${defaultDoc}`);
    }
    // If no default doc found, try README
    const readmeDoc = await getCachedDoc(project.slug, version, 'README');
    if (readmeDoc) {
      redirect('/README');
    }
  }

  if (!doc) {
    notFound();
  }

  return (
    <BrandingProvider branding={branding}>
      <DynamicFavicon faviconUrl={branding.faviconUrl} />
      
      <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between px-4 py-3">
            <Link 
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
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
              <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                {siteTitle}
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <SearchDialog projectSlug={project.slug} version={version} />
              <ThemeToggle />
              
              {/* Social Links */}
              {socialLinks?.github && (
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition hidden sm:block"
                  aria-label="GitHub"
                >
                  <GitHubIcon className="w-4 h-4" />
                </a>
              )}
              {socialLinks?.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition hidden sm:block"
                  aria-label="Twitter"
                >
                  <TwitterIcon className="w-4 h-4" />
                </a>
              )}
              {socialLinks?.discord && (
                <a
                  href={socialLinks.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition hidden sm:block"
                  aria-label="Discord"
                >
                  <DiscordIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex flex-1">
          {/* Sidebar */}
          <div className="hidden lg:block">
            <Sidebar 
              nav={nav} 
              projectSlug={project.slug} 
              version={version}
              customDomain={customDomain}
              branding={branding}
              projectName={project.name}
            />
          </div>

          {/* Main Content */}
          <main className="flex-1 min-w-0 py-8 px-4 sm:px-8 lg:px-12">
            <article className="max-w-3xl">
              {docSlug !== 'index' && (
                <Breadcrumb 
                  projectSlug={project.slug} 
                  version={version} 
                  docSlug={docSlug}
                  docTitle={doc.title}
                  customDomain={customDomain}
                />
              )}
              
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                {doc.title}
              </h1>
              
              {doc.description && (
                <p className="text-lg text-slate-500 dark:text-slate-400 mb-6">
                  {doc.description}
                </p>
              )}

              <ProseContent html={doc.content} />
              
              <PrevNextNav 
                nav={nav} 
                currentSlug={docSlug}
                projectSlug={project.slug}
                version={version}
                customDomain={customDomain}
              />
            </article>
          </main>

          {/* Table of Contents */}
          <div className="hidden xl:block">
            <TableOfContents headings={doc.headings} />
          </div>
        </div>
        
        {/* Footer */}
        <BrandedFooter branding={branding} projectName={project.name} />
      </div>
    </BrandingProvider>
  );
}

// Icon Components
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}
