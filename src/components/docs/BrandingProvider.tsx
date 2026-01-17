'use client';

/**
 * BrandingProvider Component
 * 
 * Provides branding context and injects custom styles into the page.
 * Handles CSS custom properties, custom CSS injection, and Google Analytics.
 */

import { useEffect } from 'react';
import Script from 'next/script';
import type { BrandingSettings } from '@/types/branding';

interface BrandingProviderProps {
  branding?: BrandingSettings;
  children: React.ReactNode;
}

export function BrandingProvider({ branding, children }: BrandingProviderProps) {
  const primaryColor = branding?.primaryColor || '#3B82F6';
  const customCss = branding?.customCss;
  const googleAnalyticsId = branding?.googleAnalyticsId;
  const defaultTheme = branding?.defaultTheme || 'system';
  
  // Apply CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    
    // Set primary color as CSS variable
    root.style.setProperty('--brand-color', primaryColor);
    root.style.setProperty('--brand-color-light', `${primaryColor}20`);
    root.style.setProperty('--brand-color-dark', `${primaryColor}dd`);
    
    // Convert hex to RGB for rgba usage
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (result) {
        return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
      }
      // Handle 3-digit hex
      const shortResult = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
      if (shortResult) {
        return `${parseInt(shortResult[1] + shortResult[1], 16)}, ${parseInt(shortResult[2] + shortResult[2], 16)}, ${parseInt(shortResult[3] + shortResult[3], 16)}`;
      }
      return '59, 130, 246'; // Default blue
    };
    
    root.style.setProperty('--brand-color-rgb', hexToRgb(primaryColor));
    
    return () => {
      // Cleanup on unmount
      root.style.removeProperty('--brand-color');
      root.style.removeProperty('--brand-color-light');
      root.style.removeProperty('--brand-color-dark');
      root.style.removeProperty('--brand-color-rgb');
    };
  }, [primaryColor]);
  
  // Apply default theme preference
  useEffect(() => {
    if (defaultTheme === 'system') return;
    
    const root = document.documentElement;
    const currentTheme = root.classList.contains('dark') ? 'dark' : 'light';
    
    // Only apply if user hasn't manually changed theme
    const userPreference = localStorage.getItem('theme');
    if (!userPreference) {
      if (defaultTheme === 'dark' && currentTheme !== 'dark') {
        root.classList.add('dark');
      } else if (defaultTheme === 'light' && currentTheme === 'dark') {
        root.classList.remove('dark');
      }
    }
  }, [defaultTheme]);
  
  return (
    <>
      {/* Custom CSS Injection */}
      {customCss && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Custom Branding CSS */
              ${customCss}
            `,
          }}
        />
      )}
      
      {/* Global Brand Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* Brand Color Utilities */
            .text-brand { color: var(--brand-color); }
            .bg-brand { background-color: var(--brand-color); }
            .border-brand { border-color: var(--brand-color); }
            .bg-brand-light { background-color: var(--brand-color-light); }
            
            /* Link styling with brand color */
            .prose a:not(.no-brand) {
              color: var(--brand-color);
            }
            .prose a:not(.no-brand):hover {
              color: var(--brand-color-dark);
            }
            
            /* Button styling with brand color */
            .btn-brand {
              background-color: var(--brand-color);
              color: white;
            }
            .btn-brand:hover {
              background-color: var(--brand-color-dark);
            }
          `,
        }}
      />
      
      {/* Google Analytics */}
      {googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalyticsId}');
            `}
          </Script>
        </>
      )}
      
      {children}
    </>
  );
}
