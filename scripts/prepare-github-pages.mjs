import { readdir, mkdir, rename } from 'node:fs/promises';
import path from 'node:path';

const outputDirectory = path.resolve('dist/client');

async function moveHtmlRoutes(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await moveHtmlRoutes(entryPath);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    if (entry.name === 'index.html' || entry.name === '404.html') continue;

    const routeName = entry.name.slice(0, -'.html'.length);
    const routeDirectory = path.join(directory, routeName);
    await mkdir(routeDirectory, { recursive: true });
    await rename(entryPath, path.join(routeDirectory, 'index.html'));
  }
}

await moveHtmlRoutes(outputDirectory);
