import { ContentError } from '../../application/errors/content-error.ts';
import type { DailyEdit } from '../../domain/daily-edit/daily-edit.ts';
import type {
  ImageAsset,
  WorkDetail,
  WorkSummary,
} from '../../domain/work/work.ts';
import type { CursorPage } from '../../application/ports/content-repository.ts';

type ErrorEnvelope = { code: string; message: string; requestId?: string };

function invalid(path: string): never {
  throw new ContentError(
    'INVALID_CONTENT_RESPONSE',
    `Invalid content response at ${path}`,
    {
      status: 502,
    },
  );
}

function objectAt(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    invalid(path);
  return value as Record<string, unknown>;
}

function stringAt(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.length === 0) invalid(path);
  return value;
}

function optionalStringAt(value: unknown, path: string): string | undefined {
  if (value === undefined) return undefined;
  return stringAt(value, path);
}

function optionalNonEmptyStringAt(value: unknown, path: string): string | undefined {
  if (value === undefined || value === '') return undefined;
  return stringAt(value, path);
}

function numberAt(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) invalid(path);
  return value;
}

function booleanAt(value: unknown, path: string): boolean {
  if (typeof value !== 'boolean') invalid(path);
  return value;
}

function isoDateAt(value: unknown, path: string): string {
  const date = stringAt(value, path);
  if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z)?$/.test(date))
    invalid(path);
  return date;
}

function dataAt(input: unknown) {
  return objectAt(input, 'response').data;
}

function decodeImageAsset(input: unknown, path: string): ImageAsset {
  const value = objectAt(input, path);
  return {
    src: stringAt(value.src, `${path}.src`),
    width: numberAt(value.width, `${path}.width`),
    height: numberAt(value.height, `${path}.height`),
    alt: stringAt(value.alt, `${path}.alt`),
  };
}

function decodeGoImageAsset(
  input: unknown,
  path: string,
  alt: string,
): ImageAsset {
  const value = objectAt(input, path);
  return {
    src: stringAt(value.url, `${path}.url`),
    width: numberAt(value.width, `${path}.width`),
    height: numberAt(value.height, `${path}.height`),
    alt,
  };
}

function decodeWorkSummaryAt(input: unknown, path: string): WorkSummary {
  const value = objectAt(input, path);
  return {
    id: stringAt(value.id, `${path}.id`),
    title: stringAt(value.title, `${path}.title`),
    photographerName: stringAt(
      value.photographerName,
      `${path}.photographerName`,
    ),
    publishedAt: isoDateAt(value.publishedAt, `${path}.publishedAt`),
    category: stringAt(value.category, `${path}.category`),
    thumbnail: decodeImageAsset(value.thumbnail, `${path}.thumbnail`),
  };
}

function decodeGoWorkSummaryAt(input: unknown, path: string): WorkSummary {
  const value = objectAt(input, path);
  const title = stringAt(value.title, `${path}.title`);
  const photographerName = stringAt(value.photographer, `${path}.photographer`);
  const analysis = objectAt(value.analysis, `${path}.analysis`);
  const tags = Array.isArray(analysis.tags) ? analysis.tags : [];
  const category =
    tags.find(
      (tag): tag is string => typeof tag === 'string' && tag.length > 0,
    ) ?? 'uncategorized';
  return {
    id: stringAt(value.id, `${path}.id`),
    title,
    photographerName,
    publishedAt: isoDateAt(value.publishedAt, `${path}.publishedAt`),
    category,
    thumbnail: decodeGoImageAsset(
      value.image,
      `${path}.image`,
      `${title} by ${photographerName}`,
    ),
  };
}

function isGoWork(value: Record<string, unknown>) {
  return value.thumbnail === undefined && value.image !== undefined;
}

export function decodeWorkDetail(input: unknown): WorkDetail {
  const data = objectAt(dataAt(input), 'data');
  if (isGoWork(data)) {
    const attribution = objectAt(data.attribution, 'data.attribution');
    const summary = decodeGoWorkSummaryAt(data, 'data');
    const analysis = objectAt(data.analysis, 'data.analysis');
    const licenseUrl = optionalStringAt(
      attribution.licenseUrl,
      'data.attribution.licenseUrl',
    );
    return {
      ...summary,
      image: decodeGoImageAsset(
        data.image,
        'data.image',
        summary.thumbnail.alt,
      ),
      artistStatement: optionalStringAt(data.description, 'data.description'),
      imageAnalysis: optionalNonEmptyStringAt(analysis.summary, 'data.analysis.summary'),
      attribution: {
        sourceUrl: stringAt(
          attribution.sourceUrl,
          'data.attribution.sourceUrl',
        ),
        licenseName: stringAt(
          attribution.licenseName,
          'data.attribution.licenseName',
        ),
        ...(licenseUrl ? { licenseUrl } : {}),
        creditLine: stringAt(
          attribution.creatorName,
          'data.attribution.creatorName',
        ),
      },
    };
  }
  const aiAnalysis =
    data.aiAnalysis === undefined
      ? undefined
      : objectAt(data.aiAnalysis, 'data.aiAnalysis');
  const attribution = objectAt(data.attribution, 'data.attribution');
  return {
    ...decodeWorkSummaryAt(data, 'data'),
    image: decodeImageAsset(data.image, 'data.image'),
    artistStatement: optionalStringAt(
      data.artistStatement,
      'data.artistStatement',
    ),
    editorialNote: optionalStringAt(data.editorialNote, 'data.editorialNote'),
    aiAnalysis: aiAnalysis
      ? {
          content: stringAt(aiAnalysis.content, 'data.aiAnalysis.content'),
          generatedAt: isoDateAt(
            aiAnalysis.generatedAt,
            'data.aiAnalysis.generatedAt',
          ),
          model: stringAt(aiAnalysis.model, 'data.aiAnalysis.model'),
          version: stringAt(aiAnalysis.version, 'data.aiAnalysis.version'),
        }
      : undefined,
    attribution: {
      sourceUrl: stringAt(attribution.sourceUrl, 'data.attribution.sourceUrl'),
      licenseName: stringAt(
        attribution.licenseName,
        'data.attribution.licenseName',
      ),
      licenseUrl: optionalStringAt(
        attribution.licenseUrl,
        'data.attribution.licenseUrl',
      ),
      creditLine: stringAt(
        attribution.creditLine,
        'data.attribution.creditLine',
      ),
    },
  };
}

export function decodeCursorPage(input: unknown): CursorPage<WorkSummary> {
  const data = objectAt(dataAt(input), 'data');
  const items = Array.isArray(data.items) ? data.items : invalid('data.items');
  const nextCursor =
    data.nextCursor === null
      ? null
      : (optionalStringAt(data.nextCursor, 'data.nextCursor') ?? null);
  const isGoPage = data.hasMore === undefined;
  return {
    items: items.map((item, index) => {
      const value = objectAt(item, `data.items.${index}`);
      return isGoWork(value)
        ? decodeGoWorkSummaryAt(value, `data.items.${index}`)
        : decodeWorkSummaryAt(value, `data.items.${index}`);
    }),
    nextCursor,
    hasMore: isGoPage
      ? nextCursor !== null
      : booleanAt(data.hasMore, 'data.hasMore'),
  };
}

export function decodeDailyEdit(input: unknown): DailyEdit {
  const data = objectAt(dataAt(input), 'data');
  if (data.works === undefined) {
    const items = Array.isArray(data.items)
      ? data.items
      : invalid('data.items');
    return {
      date: isoDateAt(data.date, 'data.date'),
      generatedAt: isoDateAt(data.createdAt, 'data.createdAt'),
      selectionVersion: 'backend-recommendations-v1',
      works: items.map((item, index) => {
        const value = objectAt(item, `data.items.${index}`);
        return decodeGoWorkSummaryAt(value.work, `data.items.${index}.work`);
      }),
    };
  }
  const works = Array.isArray(data.works) ? data.works : invalid('data.works');
  return {
    date: isoDateAt(data.date, 'data.date'),
    generatedAt: isoDateAt(data.generatedAt, 'data.generatedAt'),
    selectionVersion: stringAt(data.selectionVersion, 'data.selectionVersion'),
    works: works.map((work, index) =>
      decodeWorkSummaryAt(work, `data.works.${index}`),
    ),
  };
}

export function decodeErrorEnvelope(input: unknown): ErrorEnvelope | null {
  const envelope = objectAt(input, 'response');
  if (envelope.error === undefined) return null;
  const error = objectAt(envelope.error, 'error');
  return {
    code: stringAt(error.code, 'error.code'),
    message: stringAt(error.message, 'error.message'),
    requestId: optionalStringAt(error.requestId, 'error.requestId'),
  };
}
