import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, FlaskConical, Leaf, Microscope, PenLine } from 'lucide-react';
import { ArticleCard } from '@/components/magazine/ArticleCard';
import { Logo } from '@/components/brand/Logo';
import { ChemistryField, SparkRule } from '@/components/brand/Motifs';
import { Card, Pill } from '@/components/ui';
import { getClubStats, listAlbums, listArticles, listProjects } from '@/lib/db/queries';
import { projectStatus } from '@/lib/domain/labels';
import { formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Al Eman Chemistry Club',
  description:
    'AECC — the chemistry club of Al Eman Secondary School. Experiments, student research, an electronic science magazine and sustainability work. Explore. React. Discover.',
};

export default async function PublicHomePage() {
  const { locale, d } = await getT();

  const [stats, projects, articles, albums] = await Promise.all([
    getClubStats(),
    listProjects(true),
    listArticles({ status: 'published' }),
    listAlbums(true),
  ]);

  const activities = [
    { icon: <FlaskConical />, title: d.publicSite.activityExperiments, body: d.publicSite.activityExperimentsBody },
    { icon: <Microscope />, title: d.publicSite.activityResearch, body: d.publicSite.activityResearchBody },
    { icon: <PenLine />, title: d.publicSite.activityMagazine, body: d.publicSite.activityMagazineBody },
    { icon: <Leaf />, title: d.publicSite.activityCommunity, body: d.publicSite.activityCommunityBody },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <ChemistryField className="opacity-70" />
        <div className="shell relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="eyebrow mb-4">{d.publicSite.heroKicker}</p>
            <h1 className="font-brand text-[2.5rem] leading-[1.1] text-plum md:text-hero">
              {d.publicSite.heroTitle}
            </h1>
            <p className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-ink-muted">
              {d.publicSite.heroBody}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/magazine" className="btn btn-primary btn-lg">
                <BookOpen className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />
                {d.publicSite.exploreMagazine}
              </Link>
              <Link href="/about" className="btn btn-outline btn-lg">
                {d.publicSite.about}
              </Link>
            </div>
            <p className="tagline mt-10 text-[1.0625rem]">{d.brand.tagline}</p>
          </div>

          <div className="mx-auto hidden w-fit lg:block">
            <Logo locale={locale} size={340} variant="lg" alt={d.a11y.logoAlt} priority />
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="border-b border-line bg-blush" aria-label={d.publicSite.aboutTitle}>
        <div className="shell grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
          {[
            { value: stats.totalMembers, label: d.publicSite.statMembers },
            { value: stats.currentProjects, label: d.publicSite.statProjects },
            { value: stats.publishedArticles, label: d.publicSite.statArticles },
            { value: stats.totalEventsThisYear, label: d.publicSite.statEvents },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-brand text-[2.25rem] text-plum tabular-nums">
                {formatNumber(stat.value, locale)}
              </p>
              <p className="mt-1 text-caption uppercase tracking-[0.14em] text-mauve">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About / vision / mission */}
      <section className="shell py-16 md:py-20" aria-labelledby="home-about">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="eyebrow mb-3">{d.publicSite.about}</p>
            <h2 id="home-about" className="font-brand text-h1 text-plum">
              {d.publicSite.aboutTitle}
            </h2>
            <SparkRule className="mt-6 max-w-[12rem]" />
          </div>
          <div className="grid gap-8">
            <p className="text-[1.0625rem] leading-relaxed text-ink">{d.publicSite.aboutBody}</p>
            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="p-6">
                <p className="eyebrow mb-3">{d.publicSite.vision}</p>
                <p className="text-small leading-relaxed text-ink-muted">{d.publicSite.visionBody}</p>
              </Card>
              <Card className="p-6">
                <p className="eyebrow mb-3">{d.publicSite.mission}</p>
                <p className="text-small leading-relaxed text-ink-muted">{d.publicSite.missionBody}</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Activities */}
      <section className="border-y border-line bg-blush py-16 md:py-20" aria-labelledby="home-activities">
        <div className="shell">
          <div className="mb-10 text-center">
            <p className="eyebrow mb-3">{d.publicSite.activities}</p>
            <h2 id="home-activities" className="font-brand text-h1 text-plum">
              {d.publicSite.activitiesTitle}
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {activities.map((activity) => (
              <Card key={activity.title} className="p-6">
                <span className="mb-4 grid h-11 w-11 place-items-center rounded-control bg-plum-50 text-plum [&>svg]:h-5 [&>svg]:w-5">
                  {activity.icon}
                </span>
                <h3 className="font-brand text-h3 text-plum">{activity.title}</h3>
                <p className="mt-2 text-small leading-relaxed text-ink-muted">{activity.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Selected projects */}
      {projects.length > 0 ? (
        <section className="shell py-16 md:py-20" aria-labelledby="home-projects">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-3">{d.publicSite.projects}</p>
              <h2 id="home-projects" className="font-brand text-h1 text-plum">
                {d.publicSite.projectsTitle}
              </h2>
            </div>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-small font-semibold text-plum underline decoration-rose-gold/60 underline-offset-4"
            >
              {d.common.viewAll}
              <ArrowRight className="h-4 w-4 rtl-flip" aria-hidden="true" strokeWidth={1.75} />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {projects.slice(0, 3).map((project) => {
              const status = projectStatus(project.status, d);
              return (
                <Card as="article" key={project.id} className="overflow-hidden">
                  {project.cover_image ? (
                    <div className="aspect-[16/9] bg-blush">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.cover_image}
                        alt=""
                        className="h-full w-full object-cover"
                        aria-hidden="true"
                      />
                    </div>
                  ) : null}
                  <div className="p-6">
                    <Pill tone={status.tone}>{status.label}</Pill>
                    <h3 className="mt-3 font-brand text-h3 text-plum">
                      {pick(locale, project as unknown as Record<string, unknown>, 'title')}
                    </h3>
                    <p className="mt-2 text-small leading-relaxed text-ink-muted">
                      {pick(locale, project as unknown as Record<string, unknown>, 'objective')}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Magazine teaser */}
      {articles.length > 0 ? (
        <section className="border-y border-line bg-blush py-16 md:py-20" aria-labelledby="home-magazine">
          <div className="shell">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow mb-3">{d.magazine.title}</p>
                <h2 id="home-magazine" className="font-brand text-h1 text-plum">
                  {d.magazine.latest}
                </h2>
              </div>
              <Link
                href="/magazine"
                className="inline-flex items-center gap-2 text-small font-semibold text-plum underline decoration-rose-gold/60 underline-offset-4"
              >
                {d.publicSite.exploreMagazine}
                <ArrowRight className="h-4 w-4 rtl-flip" aria-hidden="true" strokeWidth={1.75} />
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {articles.slice(0, 3).map((article) => (
                <ArticleCard key={article.id} article={article} locale={locale} d={d} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Gallery teaser */}
      {albums.length > 0 ? (
        <section className="shell py-16 md:py-20" aria-labelledby="home-gallery">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-3">{d.publicSite.gallery}</p>
              <h2 id="home-gallery" className="font-brand text-h1 text-plum">
                {d.publicSite.galleryTitle}
              </h2>
            </div>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 text-small font-semibold text-plum underline decoration-rose-gold/60 underline-offset-4"
            >
              {d.common.viewAll}
              <ArrowRight className="h-4 w-4 rtl-flip" aria-hidden="true" strokeWidth={1.75} />
            </Link>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {albums.slice(0, 4).map((album) => (
              <li key={album.id}>
                <Link href={`/gallery/${album.slug}`} className="group block">
                  <div className="overflow-hidden rounded-card border border-line bg-blush">
                    <div className="aspect-[4/3]">
                      {album.cover_image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={album.cover_image}
                          alt=""
                          className="h-full w-full object-cover transition duration-slow group-hover:scale-[1.02]"
                          aria-hidden="true"
                        />
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-3 font-brand text-[1.0625rem] text-plum">
                    {pick(locale, album as unknown as Record<string, unknown>, 'title')}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Join */}
      <section className="shell pb-20" aria-labelledby="home-join">
        <Card className="relative overflow-hidden bg-plum-veil p-10 text-center md:p-16">
          <ChemistryField className="opacity-40" />
          <div className="relative">
            <h2 id="home-join" className="font-brand text-h1 text-ivory">
              {d.publicSite.joinTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-small leading-relaxed text-rose-soft">
              {d.publicSite.joinBody}
            </p>
            <SparkRule className="mx-auto mt-8 max-w-[10rem] opacity-70" />
            <p className="tagline mt-8 text-rose-soft">{d.brand.tagline}</p>
          </div>
        </Card>
      </section>
    </>
  );
}
