import type { RefObject } from 'react';
import type { GalleryDetailPhase } from '@/features/gallery/detail/detail-state';
import type { GalleryCard } from '../catalog/card-view-model';
import type { WorkDetailState } from '@/features/work-detail/use-work-detail';
import {
  WorkAttribution,
  WorkDetailCopy,
} from '@/features/work-detail/work-detail-view';

export default function GalleryDetail({
  work,
  detail,
  phase,
  panelRef,
  mediaRef,
  imageRef,
  copyRef,
  closeButtonRef,
  onClose,
}: {
  work: GalleryCard;
  detail: WorkDetailState;
  phase: GalleryDetailPhase;
  panelRef: RefObject<HTMLDialogElement | null>;
  mediaRef: RefObject<HTMLDivElement | null>;
  imageRef: RefObject<HTMLImageElement | null>;
  copyRef: RefObject<HTMLDivElement | null>;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  const displayTitle =
    detail.status === 'ready' && detail.work.localizedTitle
      ? detail.work.localizedTitle
      : work.title;
  const image = detail.status === 'ready' ? detail.work.image : work.thumbnail;
  return (
    <dialog
      ref={panelRef}
      open
      className="gallery-detail"
      data-phase={phase}
      aria-modal="true"
      aria-label={`${work.photographerName} — ${work.title}`}
    >
      <header className="gallery-detail__header">
        <span>SELECTED WORK</span>
        <span>{String(work.directoryPosition).padStart(2, '0')}</span>
      </header>
      <div className="gallery-detail__body">
        <div className="gallery-detail__media">
          <div
            ref={mediaRef}
            className="gallery-detail__media-frame"
            style={{
              // Preserve the card geometry while the higher-resolution image
              // replaces its thumbnail once the detail request completes.
              aspectRatio: `${work.thumbnail.width} / ${work.thumbnail.height}`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={image.src}
              alt={`${work.title}，${work.photographerName}`}
            />
          </div>
          {detail.status === 'ready' && <WorkAttribution work={detail.work} />}
        </div>
        <div ref={copyRef} className="gallery-detail__copy">
          <p>{work.category}</p>
          <h1>{work.photographerName}</h1>
          <p>{displayTitle}</p>
          <p>{work.publishedAt}</p>
          <WorkDetailCopy detail={detail} />
        </div>
      </div>
      <button
        ref={closeButtonRef}
        className="gallery-detail__close"
        type="button"
        aria-label="关闭作品详情"
        onClick={onClose}
      >
        <span aria-hidden="true">×</span>
      </button>
    </dialog>
  );
}
