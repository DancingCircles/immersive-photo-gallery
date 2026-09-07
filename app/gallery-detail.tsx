import type { RefObject } from 'react';
import type { GalleryDetailPhase } from '@/lib/gallery-detail';
import type { Project } from '@/lib/projects';

export default function GalleryDetail({
  project,
  phase,
  panelRef,
  mediaRef,
  imageRef,
  copyRef,
  closeButtonRef,
  onClose,
}: {
  project: Project;
  phase: GalleryDetailPhase;
  panelRef: RefObject<HTMLDialogElement | null>;
  mediaRef: RefObject<HTMLDivElement | null>;
  imageRef: RefObject<HTMLImageElement | null>;
  copyRef: RefObject<HTMLDivElement | null>;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  return (
    <dialog
      ref={panelRef}
      open
      className="gallery-detail"
      data-phase={phase}
      aria-modal="true"
      aria-label={`${project.photographer} — ${project.title}`}
    >
      <header className="gallery-detail__header">
        <span>SELECTED WORK</span>
        <span>{String(project.id + 1).padStart(2, '0')}</span>
      </header>
      <div className="gallery-detail__body">
        <div ref={mediaRef} className="gallery-detail__media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageRef}
            src={project.image}
            alt={`${project.title}，${project.photographer}`}
          />
        </div>
        <div ref={copyRef} className="gallery-detail__copy">
          <p>{project.category}</p>
          <h1>{project.photographer}</h1>
          <p>{project.title}</p>
          <p>{project.publishedAt}</p>
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
