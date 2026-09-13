const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? '';
const basePath = configuredBasePath.replace(/\/+$/, '');

export function withPublicPath(path: string): string {
  if (!path.startsWith('/') || !basePath) return path;
  return `${basePath}${path}`;
}
