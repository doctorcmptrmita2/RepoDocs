'use client';

/**
 * BrandingPreview Component
 * 
 * Live preview of branding settings showing how docs will look.
 */

import Image from 'next/image';
import type { BrandingSettings } from '@/types/branding';

interface BrandingPreviewProps {
  settings: BrandingSettings;
  projectName: string;
}

export function BrandingPreview({ settings, projectName }: BrandingPreviewProps) {
  const siteTitle = settings.siteTitle || projectName;
  const logoUrl = settings.logoUrl;
  const primaryColor = settings.primaryColor || '#3B82F6';
  const footerText = settings.footerText || `© ${new Date().getFullYear()} ${projectName}`;
  const footerLinks = settings.footerLinks || [];
  const socialLinks = settings.socialLinks;
  const hidePoweredBy = settings.hidePoweredBy;
  
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
      {/* Preview Header */}
      <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <span className="text-xs text-slate-500 ml-2">Preview</span>
        </div>
      </div>
      
      {/* Mock Docs Layout */}
      <div className="flex flex-col min-h-[400px]">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
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
            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              {siteTitle}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {socialLinks?.github && (
              <div className="w-4 h-4 rounded bg-slate-300 dark:bg-slate-600" />
            )}
            {socialLinks?.twitter && (
              <div className="w-4 h-4 rounded bg-slate-300 dark:bg-slate-600" />
            )}
            {socialLinks?.discord && (
              <div className="w-4 h-4 rounded bg-slate-300 dark:bg-slate-600" />
            )}
          </div>
        </header>
        
        {/* Content */}
        <div className="flex flex-1">
          {/* Sidebar */}
          <div className="w-40 border-r border-slate-200 dark:border-slate-700 p-3">
            <div className="space-y-1">
              <div 
                className="px-2 py-1.5 rounded text-xs font-medium"
                style={{ 
                  backgroundColor: `${primaryColor}15`,
                  color: primaryColor,
                }}
              >
                Getting Started
              </div>
              <div className="px-2 py-1.5 text-xs text-slate-500">
                Installation
              </div>
              <div className="px-2 py-1.5 text-xs text-slate-500">
                Configuration
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 p-4">
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Getting Started
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Welcome to the documentation.
            </p>
            <div className="space-y-2">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-4/6" />
            </div>
            <a 
              href="#" 
              className="inline-block mt-3 text-sm"
              style={{ color: primaryColor }}
            >
              Learn more →
            </a>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 bg-slate-50 dark:bg-slate-800/50">
          {footerLinks.length > 0 && (
            <div className="flex justify-center gap-4 mb-2">
              {footerLinks.slice(0, 3).map((link, i) => (
                <span key={i} className="text-xs text-slate-500">
                  {link.label || 'Link'}
                </span>
              ))}
            </div>
          )}
          
          <p className="text-center text-xs text-slate-500">
            {footerText}
          </p>
          
          {!hidePoweredBy && (
            <p className="text-center text-xs text-slate-400 mt-1">
              Powered by RepoDocs
            </p>
          )}
        </footer>
      </div>
    </div>
  );
}
