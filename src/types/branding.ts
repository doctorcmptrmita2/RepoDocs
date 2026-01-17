/**
 * Branding Types
 * 
 * Type definitions for documentation branding and customization settings.
 * Used across the application for type-safe branding configuration.
 */

/**
 * A link displayed in the documentation footer
 */
export interface FooterLink {
  /** Display text for the link */
  label: string;
  /** URL the link points to */
  url: string;
}

/**
 * Social media links configuration
 */
export interface SocialLinks {
  /** GitHub profile or repository URL */
  github?: string;
  /** Twitter/X profile URL */
  twitter?: string;
  /** Discord server invite URL */
  discord?: string;
}

/**
 * Complete branding settings for a project's documentation
 */
export interface BrandingSettings {
  // ==================== Phase 1: Core Branding ====================
  
  /** Custom logo URL (displayed in sidebar header) */
  logoUrl?: string;
  
  /** Custom favicon URL (displayed in browser tab) */
  faviconUrl?: string;
  
  /** Custom site title (displayed in header and browser title) */
  siteTitle?: string;
  
  /** Primary accent color in hex format (#RRGGBB or #RGB) */
  primaryColor?: string;
  
  // ==================== Phase 2: Extended Customization ====================
  
  /** Custom footer text (copyright, message, etc.) */
  footerText?: string;
  
  /** Custom footer links (max 5) */
  footerLinks?: FooterLink[];
  
  /** Social media links */
  socialLinks?: SocialLinks;
  
  /** Hide "Powered by RepoDocs" branding (PRO/TEAM only) */
  hidePoweredBy?: boolean;
  
  // ==================== Phase 3: Advanced ====================
  
  /** Custom CSS injection (PRO/TEAM only, max 10000 chars) */
  customCss?: string;
  
  /** Google Analytics tracking ID (G-XXXXXXXXXX or UA-XXXXXXXX-X) */
  googleAnalyticsId?: string;
  
  /** Default theme preference */
  defaultTheme?: 'light' | 'dark' | 'system';
}

/**
 * Validation error for a specific branding field
 */
export interface BrandingValidationError {
  /** The field that failed validation */
  field: keyof BrandingSettings | string;
  /** Human-readable error message */
  message: string;
}

/**
 * Result of branding validation
 */
export interface BrandingValidationResult {
  /** Whether all validations passed */
  valid: boolean;
  /** List of validation errors (empty if valid) */
  errors: BrandingValidationError[];
}

/**
 * Payload for updating branding settings (all fields optional)
 */
export type BrandingUpdatePayload = Partial<BrandingSettings>;

/**
 * Default branding settings (used when no custom branding is configured)
 */
export const DEFAULT_BRANDING: BrandingSettings = {
  logoUrl: undefined,
  faviconUrl: undefined,
  siteTitle: undefined,
  primaryColor: '#3B82F6', // Default blue
  footerText: undefined,
  footerLinks: [],
  socialLinks: {},
  hidePoweredBy: false,
  customCss: undefined,
  googleAnalyticsId: undefined,
  defaultTheme: 'system',
};

/**
 * Maximum lengths for text fields
 */
export const BRANDING_LIMITS = {
  siteTitle: 100,
  footerText: 500,
  customCss: 10000,
  footerLinksMax: 5,
  footerLinkLabel: 50,
  urlMaxLength: 500,
} as const;

/**
 * Features restricted by plan
 */
export const PLAN_RESTRICTED_FEATURES = {
  hidePoweredBy: ['PRO', 'TEAM'],
  customCss: ['PRO', 'TEAM'],
} as const;
