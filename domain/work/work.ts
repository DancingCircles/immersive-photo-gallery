export type WorkId = string;

export type ImageAsset = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type WorkSummary = {
  id: WorkId;
  title: string;
  photographerName: string;
  publishedAt: string;
  category: string;
  thumbnail: ImageAsset;
};

export type Attribution = {
  sourceUrl: string;
  licenseName: string;
  licenseUrl?: string;
  creditLine: string;
};

export type AIAnalysis = {
  content: string;
  generatedAt: string;
  model: string;
  version: string;
};

export type WorkDetail = WorkSummary & {
  image: ImageAsset;
  artistStatement?: string;
  editorialNote?: string;
  aiAnalysis?: AIAnalysis;
  attribution: Attribution;
};
