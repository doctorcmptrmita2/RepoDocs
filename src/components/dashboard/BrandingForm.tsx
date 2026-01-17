'use client';

/**
 * BrandingForm Component
 * 
 * Form for configuring documentation branding settings.
 * Includes fields for logo, favicon, colors, footer, and advanced options.
 */

import { useState } from 'react';
import { 
  Palette, 
  Image as ImageIcon, 
  Type, 
  Link as LinkIcon,
  Github,
  Twitter,
  MessageCircle,
  Code,
  BarChart3,
  Moon,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Lock,
  Plus,
  Trash2,
} from 'lucide-react';
import type { BrandingSettings, FooterLink } from '@/types/branding';
import { BRANDING_LIMITS, PLAN_RESTRICTED_FEATURES } from '@/types/branding';

interface BrandingFormProps {
  projectSlug: string;
  initialSettings: BrandingSettings;
  userPlan: 'HOBBY' | 'PRO' | 'TEAM';
  onUpdate?: (settings: BrandingSettings) => void;
}

export function BrandingForm({ 
  projectSlug, 
  initialSettings, 
  userPlan,
  onUpdate,
}: BrandingFormProps) {
  const [settings, setSettings] = useState<BrandingSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const canHidePoweredBy = (PLAN_RESTRICTED_FEATURES.hidePoweredBy as readonly string[]).includes(userPlan);
  const canUseCustomCss = (PLAN_RESTRICTED_FEATURES.customCss as readonly string[]).includes(userPlan);
  
  const handleChange = (field: keyof BrandingSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSuccess(false);
    onUpdate?.({ ...settings, [field]: value });
  };
  
  const handleSocialLinkChange = (platform: 'github' | 'twitter' | 'discord', value: string) => {
    setSettings(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value || undefined,
      },
    }));
    setSuccess(false);
  };
  
  const handleFooterLinkAdd = () => {
    const currentLinks = settings.footerLinks || [];
    if (currentLinks.length >= BRANDING_LIMITS.footerLinksMax) return;
    
    setSettings(prev => ({
      ...prev,
      footerLinks: [...(prev.footerLinks || []), { label: '', url: '' }],
    }));
  };
  
  const handleFooterLinkChange = (index: number, field: 'label' | 'url', value: string) => {
    setSettings(prev => {
      const links = [...(prev.footerLinks || [])];
      links[index] = { ...links[index], [field]: value };
      return { ...prev, footerLinks: links };
    });
    setSuccess(false);
  };
  
  const handleFooterLinkRemove = (index: number) => {
    setSettings(prev => ({
      ...prev,
      footerLinks: (prev.footerLinks || []).filter((_, i) => i !== index),
    }));
    setSuccess(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await fetch(`/api/projects/${projectSlug}/branding`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save branding settings');
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>Branding settings saved successfully!</span>
        </div>
      )}
      
      {/* Core Branding */}
      <Section title="Core Branding" icon={<Palette className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Logo URL" icon={<ImageIcon className="w-4 h-4" />}>
            <input
              type="url"
              value={settings.logoUrl || ''}
              onChange={(e) => handleChange('logoUrl', e.target.value || undefined)}
              placeholder="https://example.com/logo.png"
              className="input"
            />
            <p className="text-xs text-slate-500 mt-1">PNG, JPG, SVG, or WebP. Recommended: 200x50px</p>
          </Field>
          
          <Field label="Favicon URL" icon={<ImageIcon className="w-4 h-4" />}>
            <input
              type="url"
              value={settings.faviconUrl || ''}
              onChange={(e) => handleChange('faviconUrl', e.target.value || undefined)}
              placeholder="https://example.com/favicon.ico"
              className="input"
            />
            <p className="text-xs text-slate-500 mt-1">ICO, PNG, or SVG. 32x32px recommended</p>
          </Field>
          
          <Field label="Site Title" icon={<Type className="w-4 h-4" />}>
            <input
              type="text"
              value={settings.siteTitle || ''}
              onChange={(e) => handleChange('siteTitle', e.target.value || undefined)}
              placeholder="My Documentation"
              maxLength={BRANDING_LIMITS.siteTitle}
              className="input"
            />
          </Field>
          
          <Field label="Primary Color" icon={<Palette className="w-4 h-4" />}>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.primaryColor || '#3B82F6'}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="h-10 w-14 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"
              />
              <input
                type="text"
                value={settings.primaryColor || '#3B82F6'}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                placeholder="#3B82F6"
                pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                className="input flex-1"
              />
            </div>
          </Field>
        </div>
      </Section>
      
      {/* Footer */}
      <Section title="Footer" icon={<Type className="w-5 h-5" />}>
        <Field label="Footer Text">
          <textarea
            value={settings.footerText || ''}
            onChange={(e) => handleChange('footerText', e.target.value || undefined)}
            placeholder="© 2024 My Company. All rights reserved."
            maxLength={BRANDING_LIMITS.footerText}
            rows={2}
            className="input"
          />
        </Field>
        
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Footer Links
            </label>
            <button
              type="button"
              onClick={handleFooterLinkAdd}
              disabled={(settings.footerLinks?.length || 0) >= BRANDING_LIMITS.footerLinksMax}
              className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Link
            </button>
          </div>
          
          <div className="space-y-2">
            {(settings.footerLinks || []).map((link, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => handleFooterLinkChange(index, 'label', e.target.value)}
                  placeholder="Label"
                  maxLength={BRANDING_LIMITS.footerLinkLabel}
                  className="input flex-1"
                />
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => handleFooterLinkChange(index, 'url', e.target.value)}
                  placeholder="https://..."
                  className="input flex-[2]"
                />
                <button
                  type="button"
                  onClick={() => handleFooterLinkRemove(index)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          {(settings.footerLinks?.length || 0) === 0 && (
            <p className="text-sm text-slate-500 mt-2">No footer links added yet.</p>
          )}
        </div>
      </Section>
      
      {/* Social Links */}
      <Section title="Social Links" icon={<LinkIcon className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="GitHub" icon={<Github className="w-4 h-4" />}>
            <input
              type="url"
              value={settings.socialLinks?.github || ''}
              onChange={(e) => handleSocialLinkChange('github', e.target.value)}
              placeholder="https://github.com/..."
              className="input"
            />
          </Field>
          
          <Field label="Twitter / X" icon={<Twitter className="w-4 h-4" />}>
            <input
              type="url"
              value={settings.socialLinks?.twitter || ''}
              onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
              placeholder="https://twitter.com/..."
              className="input"
            />
          </Field>
          
          <Field label="Discord" icon={<MessageCircle className="w-4 h-4" />}>
            <input
              type="url"
              value={settings.socialLinks?.discord || ''}
              onChange={(e) => handleSocialLinkChange('discord', e.target.value)}
              placeholder="https://discord.gg/..."
              className="input"
            />
          </Field>
        </div>
      </Section>
      
      {/* Advanced */}
      <Section title="Advanced" icon={<Code className="w-5 h-5" />}>
        <div className="space-y-4">
          {/* Hide Powered By */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              {!canHidePoweredBy && <Lock className="w-4 h-4 text-slate-400" />}
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  Hide "Powered by RepoDocs"
                </p>
                <p className="text-sm text-slate-500">
                  Remove RepoDocs branding from your docs
                </p>
              </div>
            </div>
            {canHidePoweredBy ? (
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.hidePoweredBy || false}
                  onChange={(e) => handleChange('hidePoweredBy', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
              </label>
            ) : (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">PRO</span>
            )}
          </div>
          
          {/* Google Analytics */}
          <Field label="Google Analytics ID" icon={<BarChart3 className="w-4 h-4" />}>
            <input
              type="text"
              value={settings.googleAnalyticsId || ''}
              onChange={(e) => handleChange('googleAnalyticsId', e.target.value || undefined)}
              placeholder="G-XXXXXXXXXX or UA-XXXXXXXX-X"
              className="input"
            />
          </Field>
          
          {/* Default Theme */}
          <Field label="Default Theme" icon={<Moon className="w-4 h-4" />}>
            <select
              value={settings.defaultTheme || 'system'}
              onChange={(e) => handleChange('defaultTheme', e.target.value as 'light' | 'dark' | 'system')}
              className="input"
            >
              <option value="system">System (follow user preference)</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </Field>
          
          {/* Custom CSS */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Code className="w-4 h-4 text-slate-500" />
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Custom CSS
              </label>
              {!canUseCustomCss && (
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">PRO</span>
              )}
            </div>
            <textarea
              value={settings.customCss || ''}
              onChange={(e) => handleChange('customCss', e.target.value || undefined)}
              placeholder={canUseCustomCss ? "/* Add your custom CSS here */\n.prose h1 {\n  color: #1a1a1a;\n}" : "Upgrade to PRO to use custom CSS"}
              disabled={!canUseCustomCss}
              maxLength={BRANDING_LIMITS.customCss}
              rows={6}
              className="input font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">
              {settings.customCss?.length || 0} / {BRANDING_LIMITS.customCss} characters
            </p>
          </div>
        </div>
      </Section>
      
      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// Helper Components
function Section({ 
  title, 
  icon, 
  children 
}: { 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
}) {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ 
  label, 
  icon, 
  children 
}: { 
  label: string; 
  icon?: React.ReactNode; 
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}
