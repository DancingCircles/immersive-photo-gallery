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
  copyRef,
  closeButtonRef,
  onClose,
}: {
  work: FeaturedWork;
  imageSide: ImageSide;
  phase: FeaturedPhase;
  panelRef: RefObject<HTMLDialogElement | null>;
  imageRef: RefObject<HTMLImageElement | null>;
  copyRef: RefObject<HTMLDivElement | null>;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  return (
    <dialog
      ref={panelRef}
      open
      aria-modal="true"
      className={`featured-detail image-${imageSide}`}
      data-phase={phase}
      data-featured-detail
      aria-label={`${work.photographer} — ${work.displayTitle}`}
    >
      <div className="featured-detail__media">
        {/* Native image geometry and local URL are shared with the GSAP mover layers. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imageRef}
          src={work.image}
          alt=""
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
      </div>
      <div ref={copyRef} className="featured-detail__copy">
        <p>{work.positionLabel}</p>
        <h1>{work.photographer}</h1>
        <p>{work.displayTitle}</p>
        <p>
          {work.categoryLabel} · {work.year}
        </p>
        <button ref={closeButtonRef} type="button" onClick={onClose}>
          返回
        </button>
      </div>
    </dialog>
  );
}
