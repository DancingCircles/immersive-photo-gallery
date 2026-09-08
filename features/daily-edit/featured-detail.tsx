import type { RefObject } from 'react';
import type { FeaturedWork } from './daily-edit-view-model';
import type { FeaturedPhase } from '@/features/daily-edit/state/featured-state';
import type { ImageSide } from '@/shared/animation/repeating-transition';
import type { WorkDetailState } from '@/features/work-detail/use-work-detail';
import { WorkDetailCopy } from '@/features/work-detail/work-detail-view';

export default function FeaturedDetail({
  work,
  detail,
  imageSide,
  phase,
  panelRef,
  imageRef,
  copyRef,
  closeButtonRef,
  onClose,
}: {
  work: FeaturedWork;
  detail: WorkDetailState;
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
      data-lenis-prevent
      aria-label={`${work.photographerName} — ${work.displayTitle}`}
    >
      <div className="featured-detail__media">
        {/* Native image geometry and local URL are shared with the GSAP mover layers. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imageRef}
          src={work.thumbnail.src}
          alt=""
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
      </div>
      <div ref={copyRef} className="featured-detail__copy">
        <p>{work.positionLabel}</p>
        <h1>{work.photographerName}</h1>
        <p>{work.displayTitle}</p>
        <p>
          {work.categoryLabel} · {work.year}
        </p>
        <button ref={closeButtonRef} type="button" onClick={onClose}>
          返回
        </button>
        <WorkDetailCopy detail={detail} />
      </div>
    </dialog>
  );
}
