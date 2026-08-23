import type { Metadata } from 'next';
import { SparkRule } from '@/components/brand/Motifs';
import { Card, EmptyState, Pill, Progress } from '@/components/ui';
import { listProjects } from '@/lib/db/queries';
import { projectStatus } from '@/lib/domain/labels';
import { pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Projects' };

export default async function PublicProjectsPage() {
  const { locale, d } = await getT();
  // Only projects explicitly marked public are exposed here; no student names are shown.
  const projects = await listProjects(true);

  return (
    <>
      <section className="border-b border-line bg-blush py-16 text-center md:py-20">
        <div className="shell">
          <p className="eyebrow">{d.brand.fullName}</p>
          <h1 className="mt-3 font-brand text-h1 text-plum md:text-hero">
            {d.publicSite.projectsTitle}
          </h1>
          <SparkRule className="mx-auto mt-8 max-w-xs" />
        </div>
      </section>

      <section className="shell py-16 md:py-20">
        {projects.length === 0 ? (
          <EmptyState title={d.projects.noProjects} />
        ) : (
          <div className="grid gap-8">
            {projects.map((project) => {
              const status = projectStatus(project.status, d);
              const results = pick(locale, project as unknown as Record<string, unknown>, 'results');
              return (
                <Card as="article" key={project.id} className="overflow-hidden lg:flex">
                  {project.cover_image ? (
                    <div className="aspect-[16/9] bg-blush lg:aspect-auto lg:w-80 lg:shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.cover_image}
                        alt=""
                        className="h-full w-full object-cover"
                        aria-hidden="true"
                      />
                    </div>
                  ) : null}
                  <div className="flex-1 p-8">
                    <Pill tone={status.tone}>{status.label}</Pill>
                    <h2 className="mt-3 font-brand text-h2 text-plum">
                      {pick(locale, project as unknown as Record<string, unknown>, 'title')}
                    </h2>
                    <p className="mt-3 max-w-prose leading-relaxed text-ink-muted">
                      {pick(locale, project as unknown as Record<string, unknown>, 'objective')}
                    </p>
                    <p className="mt-3 max-w-prose text-small leading-relaxed text-ink-muted">
                      {pick(locale, project as unknown as Record<string, unknown>, 'description')}
                    </p>
                    <Progress value={project.progress} label={d.common.progress} className="mt-6 max-w-sm" />
                    {results ? (
                      <div className="mt-6 rounded-card border border-rose-gold/40 bg-[#FBF2EC] p-5">
                        <p className="eyebrow mb-2">{d.projects.results}</p>
                        <p className="text-small leading-relaxed text-ink">{results}</p>
                      </div>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
