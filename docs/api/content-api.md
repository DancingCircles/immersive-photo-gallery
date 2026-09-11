# Content API Contract

The frontend can run with local fixtures or with a future Go content service. When `CONTENT_SOURCE=http`, server route handlers call the Go API through this contract and expose the same data to the browser through `/api/content/*`.

## Configuration

```dotenv
CONTENT_SOURCE=http
CONTENT_API_BASE_URL=http://localhost:8080
CONTENT_API_TIMEOUT_MS=8000
EDITORIAL_TIME_ZONE=Asia/Shanghai
```

`CONTENT_API_BASE_URL` is server-only. Browser code keeps using same-origin routes.

## Envelope

Successful responses:

```json
{ "data": {} }
```

Error responses:

```json
{
  "error": {
    "code": "WORK_NOT_FOUND",
    "message": "Work not found",
    "requestId": "request-123"
  }
}
```

The frontend preserves `requestId` when present. Unknown extra fields are ignored.

## Endpoints

The currently deployed Go API uses `image.url`, `photographer`, and analysis tags in its work payloads, and omits `hasMore` when no cursor remains. The frontend's server-side HTTP adapter converts those fields into the domain model below; browser clients remain unchanged.

### `GET /v1/works`

Query parameters:

- `limit`: integer, maximum `60`
- `cursor`: opaque string from the previous response
- `query`: optional search text covering title, photographer, category, and year/date

Response data:

```json
{
  "items": [],
  "nextCursor": "offset:48",
  "hasMore": true
}
```

### `GET /v1/works/{id}`

Returns one full `WorkDetail`. Use `404` for unknown IDs and `410` for works removed by the future淘汰策略.

### Image renditions

- List and recommendation payloads reference a 480px thumbnail through `image.url`.
- `GET /v1/works/{id}/image` returns the 1600px display image for the detail view.
- `GET /v1/works/{id}/thumbnail` returns the thumbnail rendition used by gallery cards.

### `GET /v1/recommendations/{date}`

`date` uses `YYYY-MM-DD`. The current Go API returns `createdAt` and ordered `items`, each containing a `work`; the HTTP adapter maps that response to the frontend's stable daily-edit model. Do not silently fall back to the gallery list when a recommendation is missing.

```json
{
  "date": "2026-09-08",
  "generatedAt": "2026-09-08T00:05:00.000Z",
  "selectionVersion": "daily-v1",
  "works": []
}
```

## Fields

`WorkSummary`:

```ts
{
  id: string;
  title: string;
  photographerName: string;
  publishedAt: string;
  category: string;
  thumbnail: { src: string; width: number; height: number; alt: string };
}
```

`WorkDetail` extends `WorkSummary` with:

```ts
{
  image: { src: string; width: number; height: number; alt: string };
  artistStatement?: string;
  editorialNote?: string;
  aiAnalysis?: {
    content: string;
    generatedAt: string;
    model: string;
    version: string;
  };
  attribution: {
    sourceUrl: string;
    licenseName: string;
    licenseUrl?: string;
    creditLine: string;
  };
}
```

Keep photographer writing, editorial copy, AI analysis, and attribution in separate fields so the frontend can present and audit them independently.
