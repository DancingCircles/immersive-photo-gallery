import type { FeaturedWork } from './daily-edit-view-model';

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
        aria-label={`${work.photographerName} — ${work.displayTitle}`}
        onClick={(event) => onSelect(work, event.currentTarget)}
      >
        <span className="featured-card__head">
          <span>{work.photographerName}</span>
          <span>{work.displayTitle}</span>
        </span>
        <span className="featured-card__image">
          {/* Native image geometry and local URL are shared with the GSAP mover layers. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={work.thumbnail.src}
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
