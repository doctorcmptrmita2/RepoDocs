/**
 * Branding Validation Service
 * 
 * Validates all branding settings inputs to ensure data integrity and security.
 * Includes URL validation, color validation, text length checks, and CSS sanitization.
 */

import type {
  BrandingSettings,
  BrandingUpdatePayload,
  BrandingValidationResult,
  BrandingValidationError,
  FooterLink,
} from '@/types/branding';
import { BRANDING_LIMITS } from '@/types/branding';

// ==================== URL Validation ====================

/**
 * Validates a URL string
 * Accepts http:// and https:// URLs with valid format
 */
export function validateUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// ==================== Hex Color Validation ====================

/**
 * Validates a hex color string
 * Accepts #RGB or #RRGGBB format (case-insensitive)
 */
export function validateHexColor(color: string): boolean {
  if (!color || typeof color !== 'string') return false;
  
  // Pattern: # followed by 3 or 6 hex characters
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexPattern.test(color);
}

// ==================== Google Analytics ID Validation ====================

/**
 * Validates a Google Analytics tracking ID
 * Accepts GA4 format (G-XXXXXXXXXX) or Universal Analytics (UA-XXXXXXXX-X)
 */
export function validateGoogleAnalyticsId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  
  // GA4 format: G- followed by alphanumeric characters
  const ga4Pattern = /^G-[A-Z0-9]+$/i;
  // Universal Analytics format: UA-XXXXXXXX-X
  const uaPattern = /^UA-\d+-\d+$/;
  
  return ga4Pattern.test(id) || uaPattern.test(id);
}

// ==================== Text Length Validation ====================

/**
 * Validates text length against a maximum
 */
export function validateTextLength(text: string, maxLength: number): boolean {
  if (text === undefined || text === null) return true;
  if (typeof text !== 'string') return false;
  return text.length <= maxLength;
}

// ==================== Footer Links Validation ====================

/**
 * Validates footer links array count
 */
export function validateFooterLinksCount(links: FooterLink[] | undefined): boolean {
  if (!links) return true;
  if (!Array.isArray(links)) return false;
  return links.length <= BRANDING_LIMITS.footerLinksMax;
}

/**
 * Validates a single footer link
 */
export function validateFooterLink(link: FooterLink): BrandingValidationError[] {
  const errors: BrandingValidationError[] = [];
  
  if (!link.label || typeof link.label !== 'string') {
    errors.push({ field: 'footerLinks', message: 'Footer link label is required' });
  } else if (link.label.length > BRANDING_LIMITS.footerLinkLabel) {
    errors.push({ 
      field: 'footerLinks', 
      message: `Footer link label exceeds maximum length of ${BRANDING_LIMITS.footerLinkLabel} characters` 
    });
  }
  
  if (!link.url || !validateUrl(link.url)) {
    errors.push({ field: 'footerLinks', message: 'Footer link URL is invalid' });
  }
  
  return errors;
}

// ==================== Theme Validation ====================

/**
 * Validates theme enum value
 */
export function validateTheme(theme: string | undefined): boolean {
  if (theme === undefined) return true;
  return theme === 'light' || theme === 'dark' || theme === 'system';
}

// ==================== CSS Sanitization ====================

/**
 * Dangerous CSS patterns that could be used for XSS attacks
 */
const DANGEROUS_CSS_PATTERNS = [
  /javascript\s*:/gi,
  /expression\s*\(/gi,
  /url\s*\(\s*["']?\s*data:/gi,
  /@import\s+url\s*\(/gi,
  /behavior\s*:/gi,
  /-moz-binding\s*:/gi,
  /binding\s*:/gi,
];

/**
 * Sanitizes custom CSS to prevent XSS attacks
 * Removes dangerous patterns while preserving safe CSS
 */
export function sanitizeCustomCss(css: string): string {
  if (!css || typeof css !== 'string') return '';
  
  let sanitized = css;
  
  // Remove dangerous patterns
  for (const pattern of DANGEROUS_CSS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '/* removed */');
  }
  
  // Remove HTML comments that could break out of style tags
  sanitized = sanitized.replace(/<!--/g, '').replace(/-->/g, '');
  
  // Remove </style> tags that could break out
  sanitized = sanitized.replace(/<\s*\/?\s*style\s*>/gi, '');
  
  return sanitized.trim();
}

/**
 * Checks if CSS contains dangerous patterns (for validation)
 */
export function hasDangerousCss(css: string): boolean {
  if (!css || typeof css !== 'string') return false;
  
  for (const pattern of DANGEROUS_CSS_PATTERNS) {
    if (pattern.test(css)) return true;
  }
  
  return false;
}

// ==================== Complete Branding Validation ====================

/**
 * Validates all branding settings
 * Returns validation result with all errors
 */
export function validateBrandingSettings(
  settings: BrandingUpdatePayload
): BrandingValidationResult {
  const errors: BrandingValidationError[] = [];
  
  // Logo URL validation
  if (settings.logoUrl !== undefined && settings.logoUrl !== '') {
    if (!validateUrl(settings.logoUrl)) {
      errors.push({ field: 'logoUrl', message: 'Invalid logo URL format' });
    } else if (settings.logoUrl.length > BRANDING_LIMITS.urlMaxLength) {
      errors.push({ field: 'logoUrl', message: `Logo URL exceeds maximum length of ${BRANDING_LIMITS.urlMaxLength} characters` });
    }
  }
  
  // Favicon URL validation
  if (settings.faviconUrl !== undefined && settings.faviconUrl !== '') {
    if (!validateUrl(settings.faviconUrl)) {
      errors.push({ field: 'faviconUrl', message: 'Invalid favicon URL format' });
    } else if (settings.faviconUrl.length > BRANDING_LIMITS.urlMaxLength) {
      errors.push({ field: 'faviconUrl', message: `Favicon URL exceeds maximum length of ${BRANDING_LIMITS.urlMaxLength} characters` });
    }
  }
  
  // Site title validation
  if (settings.siteTitle !== undefined && settings.siteTitle !== '') {
    if (!validateTextLength(settings.siteTitle, BRANDING_LIMITS.siteTitle)) {
      errors.push({ 
        field: 'siteTitle', 
        message: `Site title exceeds maximum length of ${BRANDING_LIMITS.siteTitle} characters` 
      });
    }
  }
  
  // Primary color validation
  if (settings.primaryColor !== undefined && settings.primaryColor !== '') {
    if (!validateHexColor(settings.primaryColor)) {
      errors.push({ field: 'primaryColor', message: 'Invalid hex color format (use #RGB or #RRGGBB)' });
    }
  }
  
  // Footer text validation
  if (settings.footerText !== undefined && settings.footerText !== '') {
    if (!validateTextLength(settings.footerText, BRANDING_LIMITS.footerText)) {
      errors.push({ 
        field: 'footerText', 
        message: `Footer text exceeds maximum length of ${BRANDING_LIMITS.footerText} characters` 
      });
    }
  }
  
  // Footer links validation
  if (settings.footerLinks !== undefined) {
    if (!validateFooterLinksCount(settings.footerLinks)) {
      errors.push({ 
        field: 'footerLinks', 
        message: `Maximum ${BRANDING_LIMITS.footerLinksMax} footer links allowed` 
      });
    } else if (Array.isArray(settings.footerLinks)) {
      for (const link of settings.footerLinks) {
        errors.push(...validateFooterLink(link));
      }
    }
  }
  
  // Social links validation
  if (settings.socialLinks !== undefined) {
    const { github, twitter, discord } = settings.socialLinks;
    
    if (github && !validateUrl(github)) {
      errors.push({ field: 'socialLinks.github', message: 'Invalid GitHub URL format' });
    }
    if (twitter && !validateUrl(twitter)) {
      errors.push({ field: 'socialLinks.twitter', message: 'Invalid Twitter URL format' });
    }
    if (discord && !validateUrl(discord)) {
      errors.push({ field: 'socialLinks.discord', message: 'Invalid Discord URL format' });
    }
  }
  
  // Custom CSS validation
  if (settings.customCss !== undefined && settings.customCss !== '') {
    if (!validateTextLength(settings.customCss, BRANDING_LIMITS.customCss)) {
      errors.push({ 
        field: 'customCss', 
        message: `Custom CSS exceeds maximum length of ${BRANDING_LIMITS.customCss} characters` 
      });
    }
    // Note: CSS is sanitized on save, not rejected
  }
  
  // Google Analytics ID validation
  if (settings.googleAnalyticsId !== undefined && settings.googleAnalyticsId !== '') {
    if (!validateGoogleAnalyticsId(settings.googleAnalyticsId)) {
      errors.push({ 
        field: 'googleAnalyticsId', 
        message: 'Invalid Google Analytics ID format (use G-XXXXXXXXXX or UA-XXXXXXXX-X)' 
      });
    }
  }
  
  // Theme validation
  if (settings.defaultTheme !== undefined) {
    if (!validateTheme(settings.defaultTheme)) {
      errors.push({ 
        field: 'defaultTheme', 
        message: "Theme must be 'light', 'dark', or 'system'" 
      });
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
