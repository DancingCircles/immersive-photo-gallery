import type { RefObject } from 'react';
import type { FeaturedWork } from '@/lib/featured';
import type { FeaturedPhase } from '@/lib/featured-state';
import type { ImageSide } from '@/lib/repeating-transition';

export default function FeaturedDetail({
  work,
  imageSide,
  phase,
  panelRef,
  imageRef,
  onClose,
}: {
  work: FeaturedWork;
  imageSide: ImageSide;
  phase: FeaturedPhase;
  panelRef: RefObject<HTMLElement | null>;
  imageRef: RefObject<HTMLImageElement | null>;
  onClose: () => void;
}) {
  return (
    <section
      ref={panelRef}
      className={`featured-detail image-${imageSide}`}
      data-phase={phase}
      data-featured-detail
      aria-label={`${work.photographer} — ${work.displayTitle}`}
    >
      <div className="featured-detail__media">
        <img
          ref={imageRef}
          src={work.image}
          alt=""
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
      </div>
      <div className="featured-detail__copy">
        <p>{work.positionLabel}</p>
        <h1>{work.photographer}</h1>
        <p>{work.displayTitle}</p>
        <p>
          {work.categoryLabel} · {work.year}
        </p>
        <button type="button" onClick={onClose}>
          返回
        </button>
      </div>
    </section>
  );
}
