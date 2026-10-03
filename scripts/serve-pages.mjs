// Preview the GitHub Pages build locally, the way GitHub serves it:
//   npm run build:pages && npm run preview:pages  ->  http://localhost:4173/Exporio_holiday_Travel/
import http from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { projectRoot } from './_env.mjs';

const root = path.join(projectRoot, '.pages-build', 'out');
const base = '/Exporio_holiday_Travel';
const port = Number(process.env.PORT || 4173);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.txt': 'text/plain', '.woff2': 'font/woff2',
};

if (!existsSync(root)) {
  console.error('No build found. Run `npm run build:pages` first.');
  process.exit(1);
}

http
  .createServer((req, res) => {
    const url = decodeURIComponent((req.url || '/').split('?')[0]);
    if (url === '/') return res.writeHead(302, { Location: `${base}/` }).end();
    if (!url.startsWith(base)) return res.writeHead(404).end('Not found');
    let file = path.join(root, path.normalize(url.slice(base.length) || '/'));
    if (!file.startsWith(root)) return res.writeHead(403).end();
    if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!existsSync(file)) {
      res.writeHead(404, { 'Content-Type': TYPES['.html'] });
      return res.end(readFileSync(path.join(root, '404.html')));
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(readFileSync(file));
  })
  .listen(port, () => console.log(`GitHub Pages preview: http://localhost:${port}${base}/`));
