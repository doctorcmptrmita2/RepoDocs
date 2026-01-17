import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink, Github, ChevronRight } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Logo } from '@/components/ui/Logo';
import { UserMenu } from '@/components/dashboard/UserMenu';
import { RefreshButton } from '@/components/dashboard/RefreshButton';
import { SyncVersionsButton } from '@/components/dashboard/SyncVersionsButton';
import { DeleteProjectButton } from '@/components/dashboard/DeleteProjectButton';
import { CustomDomainForm } from '@/components/dashboard/CustomDomainForm';
import { WebhookManager } from '@/components/dashboard/WebhookManager';
import { AnalyticsCard } from '@/components/dashboard/AnalyticsCard';
import { LintCard } from '@/components/dashboard/LintCard';
import { BrandingForm } from '@/components/dashboard/BrandingForm';
import { BrandingPreview } from '@/components/dashboard/BrandingPreview';
import type { BrandingSettings } from '@/types/branding';
import { DEFAULT_BRANDING } from '@/types/branding';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectSettingsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const { slug } = await params;

  const project = await db.project.findFirst({
    where: { 
      slug,
      userId: session.user.id 
    },
    include: {
      user: {
        select: { plan: true },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const branding = (project.branding as BrandingSettings) || DEFAULT_BRANDING;
  const userPlan = project.user.plan;

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const docsUrl = project.customDomain 
    ? `https://${project.customDomain}` 
    : `${baseUrl}/docs/${project.slug}/${project.branch}`;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between h-14 px-6">
          <div className="flex items-center gap-3">
            <Logo size="sm" href="/dashboard" />
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-700" />
            <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition">
              Projects
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-700" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">{project.name}</span>
          </div>
          <UserMenu user={session.user} />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Project Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{project.name}</h1>
            <p className="text-slate-500 mt-1">{project.repoFullName}</p>
          </div>
          <a
            href={docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition"
          >
            View Docs
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Settings Sections */}
        <div className="space-y-10">
          {/* General */}
          <section>
            <h2 className="text-sm font-medium text-slate-900 dark:text-white mb-4">General</h2>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-200 dark:divide-slate-800">
              <div className="p-4">
                <label className="text-sm text-slate-500 mb-1.5 block">Project Name</label>
                <p className="text-slate-900 dark:text-white font-medium">{project.name}</p>
              </div>
              <div className="p-4">
                <label className="text-sm text-slate-500 mb-1.5 block">Documentation URL</label>
                <p className="text-slate-900 dark:text-white font-mono text-sm">{baseUrl}/docs/{project.slug}/{project.branch}</p>
              </div>
            </div>
          </section>

          {/* Custom Domain */}
          <section>
            <h2 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Custom Domain</h2>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <p className="text-sm text-slate-500 mb-4">
                Use your own domain for documentation. Default: <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">{project.slug}.repodocs.dev</code>
              </p>
              <CustomDomainForm 
                projectSlug={project.slug} 
                currentDomain={project.customDomain}
                isVerified={!!project.customDomain} // Geçici olarak domain varsa verified say
              />
            </div>
          </section>

          {/* Repository */}
          <section>
            <h2 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Repository</h2>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center">
                    <Github className="w-5 h-5 text-white dark:text-slate-900" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{project.repoFullName}</p>
                    <p className="text-sm text-slate-500">Branch: {project.branch} · Path: {project.docsPath}</p>
                  </div>
                </div>
                <a
                  href={`https://github.com/${project.repoFullName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </section>

          {/* Analytics & Linter */}
          <section>
            <h2 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnalyticsCard projectSlug={project.slug} />
              <LintCard projectSlug={project.slug} />
            </div>
          </section>

          {/* Branding */}
          <section>
            <h2 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Branding</h2>
            <p className="text-sm text-slate-500 mb-6">
              Customize the appearance of your documentation with your own logo, colors, and more.
            </p>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Form */}
              <div>
                <BrandingForm 
                  projectSlug={project.slug}
                  initialSettings={branding}
                  userPlan={userPlan}
                />
              </div>
              
              {/* Preview */}
              <div className="xl:sticky xl:top-20 xl:self-start">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Live Preview
                </h3>
                <BrandingPreview 
                  settings={branding}
                  projectName={project.name}
                />
              </div>
            </div>
          </section>

          {/* Sync */}
          <section>
            <h2 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Sync</h2>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-200 dark:divide-slate-800">
              {/* Auto-sync (Webhook) */}
              <div className="p-4">
                <WebhookManager 
                  projectSlug={project.slug} 
                  webhookId={project.webhookId}
                  lastSync={project.updatedAt}
                />
              </div>
              {/* Manual Refresh */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Manual Refresh</p>
                    <p className="text-sm text-slate-500 mt-0.5">Manually sync docs from GitHub</p>
                  </div>
                  <RefreshButton projectSlug={project.slug} />
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Versions</p>
                    <p className="text-sm text-slate-500 mt-0.5">Sync branches and tags for version switching</p>
                  </div>
                  <SyncVersionsButton projectSlug={project.slug} />
                </div>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section>
            <h2 className="text-sm font-medium text-red-600 mb-4">Danger Zone</h2>
            <div className="border border-red-200 dark:border-red-900/50 rounded-xl p-4 bg-red-50/50 dark:bg-red-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Delete Project</p>
                  <p className="text-sm text-slate-500 mt-0.5">Permanently delete this project and all data</p>
                </div>
                <DeleteProjectButton projectSlug={project.slug} projectName={project.name} />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
