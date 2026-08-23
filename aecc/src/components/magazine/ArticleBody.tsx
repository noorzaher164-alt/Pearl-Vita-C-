import { FlaskConical, Quote } from 'lucide-react';
import type { ArticleBlock } from '@/lib/domain/types';
import type { Locale } from '@/lib/i18n';

/**
 * The magazine's editorial renderer.
 *
 * Articles are stored as structured blocks rather than HTML, so nothing an author
 * writes can inject markup and every element carries the AECC editorial treatment:
 * scientific callout boxes, pull quotes, and a hairline list marker in rose gold.
 */
export function ArticleBody({
  blocks,
  locale,
  calloutLabel,
}: {
  blocks: ArticleBlock[];
  locale: Locale;
  calloutLabel: string;
}) {
  const t = (en: string, ar: string) => (locale === 'ar' && ar ? ar : en);

  return (
    <div className="article-body">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading':
            return <h2 key={index}>{t(block.text_en, block.text_ar)}</h2>;

          case 'quote':
            return (
              <figure key={index} className="my-10 border-s-2 border-rose-gold ps-6">
                <Quote
                  className="mb-3 h-5 w-5 text-rose-gold rtl-flip"
                  aria-hidden="true"
                  strokeWidth={1.5}
                />
                <blockquote className="font-brand text-[1.375rem] italic leading-relaxed text-plum">
                  {t(block.text_en, block.text_ar)}
                </blockquote>
                {block.attribution_en || block.attribution_ar ? (
                  <figcaption className="mt-3 text-caption uppercase tracking-[0.14em] text-mauve">
                    {t(block.attribution_en ?? '', block.attribution_ar ?? '')}
                  </figcaption>
                ) : null}
              </figure>
            );

          case 'callout':
            return (
              <aside
                key={index}
                className="my-10 rounded-card border border-rose-gold/40 bg-[#FBF2EC] p-6"
                aria-label={calloutLabel}
              >
                <p className="mb-2 flex items-center gap-2 text-caption font-bold uppercase tracking-[0.14em] text-[#8A5540]">
                  <FlaskConical className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
                  {t(block.title_en, block.title_ar)}
                </p>
                <p className="text-[1rem] leading-relaxed text-ink">
                  {t(block.text_en, block.text_ar)}
                </p>
              </aside>
            );

          case 'list': {
            const items = locale === 'ar' && block.items_ar.length ? block.items_ar : block.items_en;
            return (
              <ul key={index}>
                {items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            );
          }

          case 'image':
            return (
              <figure key={index} className="my-10">
                <div className="overflow-hidden rounded-card border border-line bg-blush">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={block.url}
                    alt={t(block.caption_en, block.caption_ar)}
                    className="h-auto w-full"
                  />
                </div>
                {block.caption_en || block.caption_ar ? (
                  <figcaption className="mt-3 text-caption text-ink-muted">
                    {t(block.caption_en, block.caption_ar)}
                  </figcaption>
                ) : null}
              </figure>
            );

          default:
            return <p key={index}>{t(block.text_en, block.text_ar)}</p>;
        }
      })}
    </div>
  );
}
