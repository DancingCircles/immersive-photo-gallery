export type ContentErrorOptions = {
  status?: number;
  requestId?: string;
  cause?: unknown;
};

export class ContentError extends Error {
  readonly code: string;
  readonly status?: number;
  readonly requestId?: string;

  constructor(code: string, message: string, options: ContentErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = 'ContentError';
    this.code = code;
    this.status = options.status;
    this.requestId = options.requestId;
  }
}
