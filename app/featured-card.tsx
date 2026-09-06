import type { FeaturedWork } from '@/lib/featured';

export default function FeaturedCard({
  work,
  index,
  onSelect,
}: {
  work: FeaturedWork;
  index: number;
  onSelect: (work: FeaturedWork, source: HTMLButtonElement) => void;
}) {
  return (
    <article className="featured-card" data-featured-index={index}>
      <button
        type="button"
        aria-label={`${work.photographer} — ${work.displayTitle}`}
        onClick={(event) => onSelect(work, event.currentTarget)}
      >
        <span className="featured-card__head">
          <span>{work.photographer}</span>
          <span>{work.displayTitle}</span>
        </span>
        <span className="featured-card__image">
          <img
            src={work.image}
            alt=""
            onError={(event) => {
              event.currentTarget.hidden = true;
            }}
          />
        </span>
        <span className="featured-card__meta">
          <span>{work.categoryLabel}</span>
          <span>
            {work.year} · {work.positionLabel}
          </span>
        </span>
      </button>
    </article>
  );
}
