# Requirements Document

## Introduction

This document defines the requirements for the Docs Branding & Customization feature in RepoDocs. This feature allows customers to customize their documentation site appearance with their own branding, including logo, favicon, colors, footer, and other visual elements. The feature is implemented in three phases: Core Branding, Extended Customization, and Advanced features.

## Glossary

- **Branding_Settings**: The configuration object containing all customization options for a project's documentation appearance
- **Project**: A RepoDocs documentation project linked to a GitHub repository
- **Custom_Domain**: A customer-owned domain (e.g., docs.agentwall.io) pointing to their RepoDocs documentation
- **Primary_Color**: The main accent color used for links, buttons, and highlights throughout the documentation
- **Footer_Link**: A configurable link displayed in the documentation footer (e.g., Privacy Policy, Terms of Service)
- **Social_Link**: A link to a social platform (GitHub, Twitter, Discord) displayed in the header or footer
- **Settings_UI**: The dashboard interface where customers configure their branding options
- **Docs_Viewer**: The public-facing documentation rendering components
- **Cache_Layer**: The Redis/memory caching system that stores project and branding data

## Requirements

### Requirement 1: Logo Upload

**User Story:** As a customer, I want to add my company logo to my documentation site, so that visitors see my brand identity.

#### Acceptance Criteria

1. WHEN a customer provides a valid logo URL in the Settings_UI, THE Branding_Settings SHALL store the URL
2. WHEN a logo URL is configured, THE Docs_Viewer SHALL display the logo in the sidebar header
3. WHEN no logo URL is configured, THE Docs_Viewer SHALL display the default RepoDocs logo
4. IF an invalid URL format is provided, THEN THE Settings_UI SHALL display a validation error and prevent saving
5. THE Branding_Settings SHALL support common image formats (PNG, JPG, SVG, WebP) via URL

### Requirement 2: Favicon Configuration

**User Story:** As a customer, I want to set a custom favicon for my documentation site, so that my brand appears in browser tabs.

#### Acceptance Criteria

1. WHEN a customer provides a valid favicon URL in the Settings_UI, THE Branding_Settings SHALL store the URL
2. WHEN a favicon URL is configured, THE Docs_Viewer SHALL render the favicon in the browser tab
3. WHEN no favicon URL is configured, THE Docs_Viewer SHALL use the default RepoDocs favicon
4. IF an invalid URL format is provided, THEN THE Settings_UI SHALL display a validation error and prevent saving

### Requirement 3: Site Title Configuration

**User Story:** As a customer, I want to set a custom site title for my documentation, so that I can display my product name instead of the project name.

#### Acceptance Criteria

1. WHEN a customer provides a site title in the Settings_UI, THE Branding_Settings SHALL store the title
2. WHEN a site title is configured, THE Docs_Viewer SHALL display it in the header and browser title
3. WHEN no site title is configured, THE Docs_Viewer SHALL use the project name as the default title
4. THE Branding_Settings SHALL accept site titles up to 100 characters

### Requirement 4: Primary Color Configuration

**User Story:** As a customer, I want to set my brand's primary color, so that links and buttons match my company's visual identity.

#### Acceptance Criteria

1. WHEN a customer provides a hex color code in the Settings_UI, THE Branding_Settings SHALL store the color value
2. WHEN a primary color is configured, THE Docs_Viewer SHALL apply it to links, buttons, and highlights
3. WHEN no primary color is configured, THE Docs_Viewer SHALL use the default RepoDocs brand color
4. IF an invalid hex color format is provided, THEN THE Settings_UI SHALL display a validation error and prevent saving
5. THE Settings_UI SHALL provide a color picker for selecting the primary color

### Requirement 5: Footer Text Configuration

**User Story:** As a customer, I want to add custom footer text to my documentation, so that I can display copyright notices or custom messages.

#### Acceptance Criteria

1. WHEN a customer provides footer text in the Settings_UI, THE Branding_Settings SHALL store the text
2. WHEN footer text is configured, THE Docs_Viewer SHALL display it in the documentation footer
3. WHEN no footer text is configured, THE Docs_Viewer SHALL display a default footer
4. THE Branding_Settings SHALL accept footer text up to 500 characters

### Requirement 6: Footer Links Configuration

**User Story:** As a customer, I want to add custom links to my documentation footer, so that visitors can access my legal pages and other resources.

#### Acceptance Criteria

1. WHEN a customer adds footer links in the Settings_UI, THE Branding_Settings SHALL store the link label and URL pairs
2. WHEN footer links are configured, THE Docs_Viewer SHALL display them in the documentation footer
3. THE Branding_Settings SHALL support up to 5 footer links
4. IF an invalid URL format is provided for a footer link, THEN THE Settings_UI SHALL display a validation error
5. THE Settings_UI SHALL allow customers to add, edit, and remove footer links

### Requirement 7: Social Links Configuration

**User Story:** As a customer, I want to add social media links to my documentation, so that visitors can connect with my company on various platforms.

#### Acceptance Criteria

1. WHEN a customer provides social link URLs in the Settings_UI, THE Branding_Settings SHALL store the URLs
2. WHEN social links are configured, THE Docs_Viewer SHALL display appropriate icons in the header or footer
3. THE Branding_Settings SHALL support GitHub, Twitter/X, and Discord social links
4. IF an invalid URL format is provided for a social link, THEN THE Settings_UI SHALL display a validation error
5. WHEN no social links are configured, THE Docs_Viewer SHALL not display social link icons

### Requirement 8: Hide Powered By RepoDocs

**User Story:** As a PRO customer, I want to hide the "Powered by RepoDocs" branding, so that I can have a white-label documentation experience.

#### Acceptance Criteria

1. WHEN a PRO or TEAM plan customer enables the hide branding option, THE Branding_Settings SHALL store the preference
2. WHEN hide branding is enabled, THE Docs_Viewer SHALL not display "Powered by RepoDocs" text
3. WHEN hide branding is disabled or not set, THE Docs_Viewer SHALL display "Powered by RepoDocs" text
4. IF a HOBBY plan customer attempts to enable hide branding, THEN THE Settings_UI SHALL display an upgrade prompt
5. THE Settings_UI SHALL clearly indicate that hiding branding is a PRO/TEAM feature

### Requirement 9: Custom CSS Injection

**User Story:** As a PRO/TEAM customer, I want to inject custom CSS into my documentation, so that I can make advanced styling customizations.

#### Acceptance Criteria

1. WHEN a PRO or TEAM plan customer provides custom CSS in the Settings_UI, THE Branding_Settings SHALL store the CSS
2. WHEN custom CSS is configured, THE Docs_Viewer SHALL inject it into the documentation pages
3. THE Branding_Settings SHALL accept custom CSS up to 10,000 characters
4. IF a HOBBY plan customer attempts to add custom CSS, THEN THE Settings_UI SHALL display an upgrade prompt
5. THE Settings_UI SHALL provide a code editor for entering custom CSS

### Requirement 10: Google Analytics Integration

**User Story:** As a customer, I want to add my Google Analytics tracking ID, so that I can track documentation usage with my own analytics.

#### Acceptance Criteria

1. WHEN a customer provides a Google Analytics tracking ID in the Settings_UI, THE Branding_Settings SHALL store the ID
2. WHEN a tracking ID is configured, THE Docs_Viewer SHALL include the Google Analytics script
3. THE Branding_Settings SHALL validate the tracking ID format (G-XXXXXXXXXX or UA-XXXXXXXX-X)
4. IF an invalid tracking ID format is provided, THEN THE Settings_UI SHALL display a validation error
5. WHEN no tracking ID is configured, THE Docs_Viewer SHALL not include Google Analytics scripts

### Requirement 11: Default Theme Configuration

**User Story:** As a customer, I want to set the default theme (dark/light) for my documentation, so that it matches my brand's preferred appearance.

#### Acceptance Criteria

1. WHEN a customer selects a default theme in the Settings_UI, THE Branding_Settings SHALL store the preference
2. WHEN a default theme is configured, THE Docs_Viewer SHALL use it as the initial theme for visitors
3. THE Branding_Settings SHALL support "light", "dark", and "system" theme options
4. WHEN no default theme is configured, THE Docs_Viewer SHALL default to "system" preference
5. THE Docs_Viewer SHALL still allow visitors to toggle the theme after initial load

### Requirement 12: Branding Data Persistence

**User Story:** As a system administrator, I want branding settings to be stored reliably, so that customer customizations persist across sessions.

#### Acceptance Criteria

1. WHEN branding settings are saved, THE System SHALL persist them to the PostgreSQL database
2. WHEN branding settings are updated, THE System SHALL invalidate the relevant cache entries
3. THE System SHALL store branding settings as a JSON field on the Project model
4. WHEN a project is deleted, THE System SHALL cascade delete the associated branding settings

### Requirement 13: Branding Data Caching

**User Story:** As a system administrator, I want branding data to be cached efficiently, so that documentation pages load quickly.

#### Acceptance Criteria

1. WHEN branding settings are requested, THE Cache_Layer SHALL return cached data if available
2. WHEN branding settings are updated, THE Cache_Layer SHALL invalidate and refresh the cache
3. THE Cache_Layer SHALL cache branding data with the same TTL as project data (7 days)
4. WHEN cache is empty, THE System SHALL fetch branding from the database and populate the cache

### Requirement 14: Settings UI Live Preview

**User Story:** As a customer, I want to see a live preview of my branding changes, so that I can visualize the result before saving.

#### Acceptance Criteria

1. WHEN a customer modifies branding settings, THE Settings_UI SHALL display a live preview
2. THE Settings_UI SHALL update the preview in real-time as values change
3. THE Settings_UI SHALL display the preview in a representative documentation layout
4. WHEN the customer saves settings, THE Settings_UI SHALL confirm the changes were applied

### Requirement 15: Branding Settings Validation

**User Story:** As a system administrator, I want all branding inputs to be validated, so that invalid data cannot corrupt the system.

#### Acceptance Criteria

1. WHEN a URL is provided, THE System SHALL validate it matches a valid URL pattern
2. WHEN a hex color is provided, THE System SHALL validate it matches the pattern #RRGGBB or #RGB
3. WHEN text fields exceed maximum length, THE System SHALL reject the input with an error message
4. THE System SHALL sanitize custom CSS to prevent XSS attacks
5. THE System SHALL validate all branding fields on both client and server side
