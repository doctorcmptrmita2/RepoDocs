'use client';

/**
 * DynamicFavicon Component
 * 
 * Dynamically updates the favicon based on branding settings.
 * Falls back to default favicon if no custom favicon is set.
 */

import { useEffect } from 'react';

interface DynamicFaviconProps {
  faviconUrl?: string;
}

export function DynamicFavicon({ faviconUrl }: DynamicFaviconProps) {
  useEffect(() => {
    if (!faviconUrl) return;
    
    // Find existing favicon link or create new one
    let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
    
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    
    // Store original favicon to restore on unmount
    const originalHref = link.href;
    
    // Set custom favicon
    link.href = faviconUrl;
    
    return () => {
      // Restore original favicon on unmount
      if (link && originalHref) {
        link.href = originalHref;
      }
    };
  }, [faviconUrl]);
  
  // Also render a link tag for SSR
  if (faviconUrl) {
    return (
      <link rel="icon" href={faviconUrl} />
    );
  }
  
  return null;
}
