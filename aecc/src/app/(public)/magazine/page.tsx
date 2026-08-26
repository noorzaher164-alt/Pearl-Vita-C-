import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Award, BookOpen, CalendarDays, Eye, Medal, Sparkles, Star, Trophy, Users } from 'lucide-react';
import { ArticleCard, FeaturedArticle } from '@/components/magazine/ArticleCard';
import { SparkRule } from '@/components/brand/Motifs';
import { Avatar, Card, EmptyState, Pill } from '@/components/ui';
import {
  getFeaturedArticle,
  listAchievements,
  listArticles,
  listCategories,
  listCompetitions,
  listIssues,
  listTopStudents,
  listValueOfMonth,
} from '@/lib/db/queries';
import { accentTone } from '@/lib/domain/labels';
import { fill, formatDate, formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Electronic Magazine',
  description:
    'The AECC Electronic Magazine — science writing by the students of Al Eman Chemistry Club.',
};

export default async function MagazineHomePage() {
  const { locale, d } = await getT();

  const [featured, published, categories, issues, competitions, topStudents, achievements, values] =
    await Promise.all([
      getFeaturedArticle(),
      listArticles({ status: 'published' }),
      listCategories(),
      listIssues(true),
      listCompetitions(),
      listTopStudents(),
      listAchievements(),
      listValueOfMonth(),
    ]);

  const latest = published.filter((article) => article.id !== featured?.id);
  const mostRead = [...published].sort((a, b) => b.views - a.views).slice(0, 5);
  const activeCategories = categories.filter((category) => category.count > 0);
  const interviewArticles = published.filter((a) => a.category?.slug === 'interviews');
  const upcomingCompetitions = competitions.filter((c) => c.status !== 'completed');
  const currentValue = values[0];

  const competitionStatusLabel = (status: string) => {
    if (status === 'upcoming') return d.magazine.competitionUpcoming;
    if (status === 'ongoing') return d.magazine.competitionOngoing;
    return d.magazine.competitionCompleted;
  };
  const competitionTone = (status: string) => {
    if (status === 'upcoming') return 'plum' as const;
    if (status === 'ongoing') return 'success' as const;
    return 'neutral' as const;
  };

  return (
    <>
      {/* Masthead */}
      <section className="border-b border-line bg-blush">
        <div className="shell py-14 text-center md:py-20">
          <p className="eyebrow">{d.brand.school}</p>
          <h1 className="mt-4 font-brand text-[2.5rem] leading-tight text-plum md:text-hero">
            {d.magazine.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-body text-ink-muted">{d.magazine.subtitle}</p>
          <SparkRule className="mx-auto mt-8 max-w-xs" />
        </div>
      </section>

      <div className="shell py-12 md:py-16">
        {featured ? (
          <section aria-labelledby="mag-featured" className="mb-16">
            <h2 id="mag-featured" className="sr-only">
              {d.magazine.featured}
            </h2>
            <FeaturedArticle article={featured} locale={locale} d={d} />
          </section>
        ) : null}

        {/* Value of the Month — prominent banner */}
        {currentValue ? (
          <section aria-labelledby="mag-value" className="mb-12">
            <Card className="overflow-hidden border-rose/30 bg-gradient-to-br from-blush to-surface">
              <div className="p-6 md:p-8">
                <div className="mb-3 flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-pill bg-rose/10">
                    <Sparkles className="h-[18px] w-[18px] text-rose" strokeWidth={1.75} />
                  </span>
                  <h2 id="mag-value" className="font-brand text-h3 text-plum">
                    {d.magazine.valueOfMonth}
                  </h2>
                </div>
                <p className="mt-2 font-brand text-[1.75rem] leading-tight text-plum md:text-[2rem]">
                  {pick(locale, currentValue as unknown as Record<string, unknown>, 'value')}
                </p>
                <p className="mt-3 max-w-2xl text-body leading-relaxed text-ink-muted">
                  {pick(locale, currentValue as unknown as Record<string, unknown>, 'description')}
                </p>
              </div>
            </Card>
          </section>
        ) : null}

        <div className="grid gap-12 lg:grid-cols-[1fr_20rem]">
          {/* Main column */}
          <div className="grid content-start gap-12">
            {/* Latest articles */}
            <section aria-labelledby="mag-latest">
              <div className="mb-6 flex items-baseline justify-between gap-4">
                <h2 id="mag-latest" className="font-brand text-h2 text-plum">
                  {d.magazine.latest}
                </h2>
                <span className="text-caption text-ink-muted">
                  {fill(d.magazine.articleCount, { count: formatNumber(published.length, locale) })}
                </span>
              </div>

              {latest.length === 0 ? (
                <EmptyState icon={<BookOpen />} title={d.magazine.noArticles} />
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {latest.slice(0, 4).map((article) => (
                    <ArticleCard key={article.id} article={article} locale={locale} d={d} />
                  ))}
                </div>
              )}
            </section>

            {/* Interviews */}
            {interviewArticles.length > 0 ? (
              <section aria-labelledby="mag-interviews">
                <div className="mb-6 flex items-baseline justify-between gap-4">
                  <h2 id="mag-interviews" className="font-brand text-h2 text-plum">
                    {d.magazine.interviews}
                  </h2>
                </div>
                <p className="mb-6 -mt-4 text-small text-ink-muted">{d.magazine.interviewsSubtitle}</p>
                <div className="grid gap-6 sm:grid-cols-2">
                  {interviewArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} locale={locale} d={d} />
                  ))}
                </div>
              </section>
            ) : null}

            {/* Achievements & Winners */}
            <section aria-labelledby="mag-achievements">
              <div className="mb-6 flex items-baseline justify-between gap-4">
                <h2 id="mag-achievements" className="font-brand text-h2 text-plum">
                  {d.magazine.achievementsAndWinners}
                </h2>
              </div>
              <p className="mb-6 -mt-4 text-small text-ink-muted">{d.magazine.achievementsSubtitle}</p>

              {achievements.length === 0 ? (
                <EmptyState icon={<Award />} title={d.magazine.noAchievements} />
              ) : (
                <div className="grid gap-4">
                  {achievements.map((ach) => (
                    <Card key={ach.id} className="p-5">
                      <div className="flex items-start gap-4">
                        <span
                          className={`grid h-10 w-10 shrink-0 place-items-center rounded-pill ${
                            ach.kind === 'winner' ? 'bg-gold/10' : 'bg-plum/10'
                          }`}
                        >
                          {ach.kind === 'winner' ? (
                            <Trophy className="h-5 w-5 text-gold" strokeWidth={1.75} />
                          ) : (
                            <Medal className="h-5 w-5 text-plum" strokeWidth={1.75} />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-brand text-body font-semibold text-plum">
                              {pick(locale, ach as unknown as Record<string, unknown>, 'title')}
                            </h3>
                            <Pill tone={ach.kind === 'winner' ? 'gold' : 'plum'}>
                              {ach.kind === 'winner' ? d.magazine.winner : d.magazine.achievement}
                            </Pill>
                          </div>
                          <p className="mt-1 text-small leading-relaxed text-ink-muted">
                            {pick(locale, ach as unknown as Record<string, unknown>, 'description')}
                          </p>
                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex -space-x-2 rtl:space-x-reverse">
                              {ach.students.map((s) =>
                                s ? (
                                  <Avatar
                                    key={s.id}
                                    name={locale === 'ar' ? s.full_name_ar : s.full_name_en}
                                    src={s.avatar_url}
                                    size={28}
                                    className="ring-2 ring-surface"
                                  />
                                ) : null,
                              )}
                            </div>
                            <span className="text-caption text-ink-faint">
                              {ach.students
                                .filter(Boolean)
                                .map((s) => (locale === 'ar' ? s!.full_name_ar : s!.full_name_en))
                                .join(' · ')}
                            </span>
                          </div>
                          <p className="mt-2 text-caption text-ink-faint">{formatDate(ach.date, locale)}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Upcoming Competitions */}
            <section aria-labelledby="mag-competitions">
              <div className="mb-6 flex items-baseline justify-between gap-4">
                <h2 id="mag-competitions" className="font-brand text-h2 text-plum">
                  {d.magazine.competitions}
                </h2>
              </div>
              <p className="mb-6 -mt-4 text-small text-ink-muted">{d.magazine.competitionsSubtitle}</p>

              {competitions.length === 0 ? (
                <EmptyState icon={<Trophy />} title={d.magazine.noCompetitions} />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {competitions.map((comp) => (
                    <Card key={comp.id} className="p-5">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <Pill tone={competitionTone(comp.status)}>{competitionStatusLabel(comp.status)}</Pill>
                        <span className="flex items-center gap-1.5 text-caption text-ink-faint">
                          <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.75} />
                          {formatDate(comp.date, locale)}
                        </span>
                      </div>
                      <h3 className="font-brand text-body font-semibold text-plum">
                        {pick(locale, comp as unknown as Record<string, unknown>, 'title')}
                      </h3>
                      <p className="mt-2 text-small leading-relaxed text-ink-muted">
                        {pick(locale, comp as unknown as Record<string, unknown>, 'description')}
                      </p>
                      <div className="mt-3 flex items-center gap-1.5 rounded-control bg-blush px-3 py-2">
                        <Star className="h-3.5 w-3.5 text-gold" strokeWidth={1.75} />
                        <span className="text-caption font-semibold text-plum">{d.magazine.prize}:</span>
                        <span className="text-caption text-ink-muted">
                          {pick(locale, comp as unknown as Record<string, unknown>, 'prize')}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Rail / Sidebar */}
          <aside className="grid content-start gap-10">
            {/* Top Students */}
            <section aria-labelledby="mag-top-students">
              <h2 id="mag-top-students" className="mb-4 font-brand text-h3 text-plum">
                {d.magazine.topStudents}
              </h2>
              <p className="mb-4 -mt-2 text-caption text-ink-muted">{d.magazine.topStudentsSubtitle}</p>

              {topStudents.length === 0 ? (
                <p className="text-caption text-ink-faint">{d.magazine.noTopStudents}</p>
              ) : (
                <Card className="p-2">
                  <ol className="grid">
                    {topStudents.map((student, index) => (
                      <li key={student.id}>
                        <div className="flex items-start gap-3 rounded-control p-3 transition hover:bg-blush">
                          <span className="font-brand text-h3 leading-none text-rose-soft tabular-nums">
                            {formatNumber(index + 1, locale)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              {student.member ? (
                                <Avatar
                                  name={locale === 'ar' ? student.member.full_name_ar : student.member.full_name_en}
                                  src={student.member.avatar_url}
                                  size={28}
                                />
                              ) : null}
                              <span className="text-small font-semibold text-plum">
                                {student.member
                                  ? locale === 'ar'
                                    ? student.member.full_name_ar
                                    : student.member.full_name_en
                                  : '—'}
                              </span>
                            </div>
                            <p className="mt-1 text-caption leading-relaxed text-ink-faint">
                              {pick(locale, student as unknown as Record<string, unknown>, 'reason')}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </Card>
              )}
            </section>

            {/* Categories */}
            <section aria-labelledby="mag-categories">
              <h2 id="mag-categories" className="mb-4 font-brand text-h3 text-plum">
                {d.magazine.categories}
              </h2>
              <ul className="flex flex-wrap gap-2">
                {activeCategories.map((category) => (
                  <li key={category.id}>
                    <Link href={`/magazine/category/${category.slug}`} className="inline-block">
                      <Pill tone={accentTone(category.accent)}>
                        {pick(locale, category as unknown as Record<string, unknown>, 'name')}
                        <span className="opacity-70">{formatNumber(category.count, locale)}</span>
                      </Pill>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* Issues */}
            <section aria-labelledby="mag-issues">
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h2 id="mag-issues" className="font-brand text-h3 text-plum">
                  {d.magazine.issues}
                </h2>
                <Link
                  href="/magazine/issues"
                  className="text-caption font-semibold text-plum underline decoration-rose-gold/60 underline-offset-4"
                >
                  {d.common.viewAll}
                </Link>
              </div>
              <ul className="grid gap-3">
                {issues.map((issue) => (
                  <li key={issue.id}>
                    <Link
                      href={`/magazine/issues/${issue.number}`}
                      className="group flex gap-3 rounded-card border border-line bg-surface p-3 transition hover:border-rose"
                    >
                      <span className="h-16 w-14 shrink-0 overflow-hidden rounded-control bg-blush">
                        {issue.cover_image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={issue.cover_image}
                            alt=""
                            className="h-full w-full object-cover"
                            aria-hidden="true"
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-caption uppercase tracking-widest text-mauve">
                          {fill(d.magazine.issueNumber, {
                            number: formatNumber(issue.number, locale),
                          })}
                        </span>
                        <span className="mt-0.5 block truncate font-brand text-[1rem] text-plum">
                          {pick(locale, issue as unknown as Record<string, unknown>, 'title')}
                        </span>
                        {issue.published_on ? (
                          <span className="block text-caption text-ink-faint">
                            {formatDate(issue.published_on, locale)}
                          </span>
                        ) : null}
                      </span>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 self-center text-mauve rtl-flip transition group-hover:text-rose"
                        aria-hidden="true"
                        strokeWidth={1.75}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* Most read */}
            {mostRead.length > 0 ? (
              <section aria-labelledby="mag-most-read">
                <h2 id="mag-most-read" className="mb-4 font-brand text-h3 text-plum">
                  {d.magazine.mostRead}
                </h2>
                <Card className="p-2">
                  <ol className="grid">
                    {mostRead.map((article, index) => (
                      <li key={article.id}>
                        <Link
                          href={`/magazine/article/${article.slug}`}
                          className="flex gap-3 rounded-control p-3 transition hover:bg-blush"
                        >
                          <span className="font-brand text-h3 leading-none text-rose-soft tabular-nums">
                            {formatNumber(index + 1, locale)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-small font-semibold leading-snug text-plum">
                              {pick(locale, article as unknown as Record<string, unknown>, 'title')}
                            </span>
                            <span className="mt-1 flex items-center gap-1.5 text-caption text-ink-faint">
                              <Eye className="h-3 w-3" aria-hidden="true" strokeWidth={1.75} />
                              {formatNumber(article.views, locale)} {d.magazine.views}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </Card>
              </section>
            ) : null}
          </aside>
        </div>
      </div>
    </>
  );
}
