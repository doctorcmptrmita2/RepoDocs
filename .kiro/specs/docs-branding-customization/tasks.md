# Implementation Plan: Docs Branding & Customization

## Overview

This implementation plan breaks down the Docs Branding & Customization feature into discrete coding tasks. The implementation follows a bottom-up approach: data layer first, then validation, API, caching, and finally UI components.

## Tasks

- [x] 1. Set up data layer and types
  - [x] 1.1 Create branding types in src/types/branding.ts
    - Define FooterLink, SocialLinks, BrandingSettings, BrandingValidationError interfaces
    - Export BrandingUpdatePayload type
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 11.1_
  
  - [x] 1.2 Update Prisma schema with branding field
    - Add `branding Json? @default("{}")` to Project model
    - Run prisma migrate to create migration
    - _Requirements: 12.3_

- [x] 2. Implement validation service
  - [x] 2.1 Create validation functions in src/lib/branding/validation.ts
    - Implement validateUrl() for URL validation
    - Implement validateHexColor() for hex color validation
    - Implement validateGoogleAnalyticsId() for GA ID validation
    - Implement validateTextLength() for text field length validation
    - Implement validateFooterLinksCount() for array limit
    - Implement validateTheme() for theme enum validation
    - Implement sanitizeCustomCss() for XSS prevention
    - Implement validateBrandingSettings() combining all validators
    - _Requirements: 1.4, 2.4, 4.4, 6.3, 6.4, 7.4, 10.3, 10.4, 11.3, 15.1, 15.2, 15.3, 15.4_
  
  - [ ]* 2.2 Write property test for URL validation
    - **Property 1: URL Validation**
    - **Validates: Requirements 1.4, 2.4, 6.4, 7.4, 15.1**
  
  - [ ]* 2.3 Write property test for hex color validation
    - **Property 2: Hex Color Validation**
    - **Validates: Requirements 4.4, 15.2**
  
  - [ ]* 2.4 Write property test for Google Analytics ID validation
    - **Property 3: Google Analytics ID Validation**
    - **Validates: Requirements 10.3, 10.4**
  
  - [ ]* 2.5 Write property test for text length validation
    - **Property 4: Text Length Validation**
    - **Validates: Requirements 3.4, 5.4, 9.3, 15.3**
  
  - [ ]* 2.6 Write property test for footer links array limit
    - **Property 11: Footer Links Array Limit**
    - **Validates: Requirements 6.3**
  
  - [ ]* 2.7 Write property test for theme enum validation
    - **Property 12: Theme Enum Validation**
    - **Validates: Requirements 11.3**
  
  - [ ]* 2.8 Write property test for CSS sanitization
    - **Property 10: CSS Sanitization**
    - **Validates: Requirements 15.4**

- [x] 3. Checkpoint - Validation layer complete
  - Ensure all validation tests pass, ask the user if questions arise.

- [x] 4. Implement cache layer for branding
  - [x] 4.1 Add branding cache functions to src/lib/cache/index.ts
    - Add getBrandingCacheKey() utility function
    - Implement getCachedBranding() to retrieve cached branding
    - Implement cacheBranding() to store branding in cache
    - Implement invalidateBrandingCache() to clear cache on update
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  
  - [ ]* 4.2 Write property test for cache invalidation
    - **Property 8: Cache Invalidation on Update**
    - **Validates: Requirements 12.2, 13.2**
  
  - [ ]* 4.3 Write property test for cache miss fallback
    - **Property 9: Cache Miss Database Fallback**
    - **Validates: Requirements 13.1, 13.4**

- [x] 5. Implement branding API endpoint
  - [x] 5.1 Create branding API route at src/app/api/projects/[slug]/branding/route.ts
    - Implement GET handler to retrieve branding settings
    - Implement PUT handler to update branding settings (full replace)
    - Implement PATCH handler for partial updates
    - Add authentication check (user must own project)
    - Add plan-based feature access control for PRO/TEAM features
    - Integrate validation service
    - Integrate cache invalidation on updates
    - _Requirements: 8.4, 9.4, 12.1, 12.2_
  
  - [ ]* 5.2 Write property test for branding round-trip
    - **Property 5: Branding Settings Round-Trip**
    - **Validates: Requirements 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 11.1, 12.1**
  
  - [ ]* 5.3 Write property test for plan-based feature access
    - **Property 6: Plan-Based Feature Access**
    - **Validates: Requirements 8.1, 8.4, 9.1, 9.4**

- [x] 6. Checkpoint - Backend complete
  - Ensure all backend tests pass, ask the user if questions arise.

- [x] 7. Implement docs viewer branding components
  - [x] 7.1 Create BrandedHeader component at src/components/docs/BrandedHeader.tsx
    - Display custom logo or default RepoDocs logo
    - Display custom site title or project name
    - Apply primary color to accent elements
    - Display social links with appropriate icons
    - _Requirements: 1.2, 1.3, 3.2, 3.3, 7.2, 7.5_
  
  - [x] 7.2 Create BrandedFooter component at src/components/docs/BrandedFooter.tsx
    - Display custom footer text or default
    - Render footer links array
    - Show/hide "Powered by RepoDocs" based on hidePoweredBy flag
    - Display social links if configured
    - _Requirements: 5.2, 5.3, 6.2, 8.2, 8.3_
  
  - [x] 7.3 Update Sidebar component to use branding
    - Accept branding prop
    - Display custom logo in sidebar header
    - Apply primary color to active states
    - _Requirements: 1.2, 4.2_
  
  - [x] 7.4 Create BrandingProvider component for theme and CSS injection
    - Inject custom CSS into page head
    - Set CSS custom properties for primary color
    - Apply default theme preference
    - Include Google Analytics script if configured
    - _Requirements: 4.2, 9.2, 10.2, 11.2_
  
  - [x] 7.5 Update favicon handling in docs layout
    - Render custom favicon link tag when configured
    - Fall back to default favicon
    - _Requirements: 2.2, 2.3_
  
  - [ ]* 7.6 Write property test for branding rendering completeness
    - **Property 7: Branding Rendering Completeness**
    - **Validates: Requirements 1.2, 2.2, 3.2, 4.2, 5.2, 6.2, 7.2, 8.2, 8.3, 9.2, 10.2, 11.2**

- [x] 8. Integrate branding into docs pages
  - [x] 8.1 Update docs layout at src/app/(docs)/docs/[project]/[version]/layout.tsx
    - Fetch branding settings from cache/database
    - Pass branding to header, sidebar, footer components
    - Wrap with BrandingProvider
    - _Requirements: 1.2, 2.2, 3.2, 4.2, 5.2, 6.2, 7.2, 8.2, 9.2, 10.2, 11.2_
  
  - [x] 8.2 Update custom domain handler at src/app/custom-domain/[[...slug]]/page.tsx
    - Fetch branding settings with project data
    - Pass branding to all docs components
    - _Requirements: 1.2, 2.2, 3.2, 4.2, 5.2, 6.2, 7.2, 8.2, 9.2, 10.2, 11.2_

- [x] 9. Checkpoint - Docs viewer complete
  - Ensure branding displays correctly in docs viewer, ask the user if questions arise.

- [x] 10. Implement settings UI
  - [x] 10.1 Create BrandingForm component at src/components/dashboard/BrandingForm.tsx
    - Create form fields for all branding settings
    - Add color picker for primary color
    - Add code editor for custom CSS (PRO/TEAM only)
    - Show upgrade prompts for plan-restricted features
    - Implement client-side validation
    - Handle form submission with API call
    - _Requirements: 4.5, 8.5, 9.5, 14.4, 15.5_
  
  - [x] 10.2 Create BrandingPreview component at src/components/dashboard/BrandingPreview.tsx
    - Display live preview of branding changes
    - Update preview in real-time as form values change
    - Show representative docs layout
    - _Requirements: 14.1, 14.2, 14.3_
  
  - [x] 10.3 Add Branding section to settings page
    - Update src/app/(dashboard)/dashboard/[slug]/settings/page.tsx
    - Add Branding section with BrandingForm and BrandingPreview
    - Fetch current branding settings
    - Pass user plan for feature gating
    - _Requirements: All UI requirements_

- [x] 11. Final checkpoint - Feature complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify end-to-end flow: settings save → cache update → docs display

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
