import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, ExternalLink, Settings, GitBranch, Lock, ScrollText } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Logo } from '@/components/ui/Logo';
import { UserMenu } from '@/components/dashboard/UserMenu';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const projects = await db.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  });

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between h-14 px-6">
          <div className="flex items-center gap-8">
            <Logo size="sm" href="/dashboard" />
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-slate-900 dark:text-white">
                Projects
              </Link>
              <Link href="/dashboard/logs" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white">
                Logs
              </Link>
            </nav>
          </div>
          <UserMenu user={session.user} />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Projects</h1>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-12 text-center">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Plus className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="font-medium text-slate-900 dark:text-white mb-2">No projects yet</h3>
            <p className="text-slate-500 text-sm mb-6">
              Create your first documentation site
            </p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition"
            >
              <Plus className="w-4 h-4" />
              New Project
            </Link>
          </div>
        ) : (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            {projects.map((project, index) => (
              <ProjectRow 
                key={project.id} 
                project={project} 
                baseUrl={baseUrl}
                isLast={index === projects.length - 1}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ProjectRow({ project, baseUrl, isLast }: { 
  project: {
    id: string;
    name: string;
    slug: string;
    repoFullName: string;
    branch: string;
    isPrivate: boolean;
    customDomain: string | null;
    updatedAt: Date;
  };
  baseUrl: string;
  isLast: boolean;
}) {
  const docsUrl = project.customDomain 
    ? `https://${project.customDomain}` 
    : `${baseUrl}/docs/${project.slug}/${project.branch}`;

  return (
    <div className={`flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition ${!isLast ? 'border-b border-slate-200 dark:border-slate-800' : ''}`}>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
          {project.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-slate-900 dark:text-white">{project.name}</h3>
            {project.isPrivate && <Lock className="w-3.5 h-3.5 text-slate-400" />}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-sm text-slate-500">{project.repoFullName}</span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <GitBranch className="w-3 h-3" />
              {project.branch}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <a
          href={docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View
        </a>
        <Link
          href={`/dashboard/${project.slug}/settings`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
        >
          <Settings className="w-3.5 h-3.5" />
          Settings
        </Link>
      </div>
    </div>
  );
}
