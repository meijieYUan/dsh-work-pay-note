import {
  createReadStream,
  existsSync,
  fstatSync,
  mkdirSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Host half of the work-pay-note bundle.
 *
 * The sticky note lives in the browser; its background lives beside this file
 * as `assets/background.<ext>`. The route serves that file and accepts the
 * note's own uploads, which are written byte for byte so the original picture
 * is kept (no re-encoding, no quality loss).
 */

const ASSET_DIR = fileURLToPath(new URL('./assets/', import.meta.url));
const ROUTE_PATH = '/work-pay-note/background';
const MAX_BYTES = 40 * 1024 * 1024;
const BODY_LIMIT = Math.ceil(MAX_BYTES * 1.4) + 65536;

const CONTENT_TYPES = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  avif: 'image/avif',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  apng: 'image/apng',
  mp4: 'video/mp4',
  webm: 'video/webm',
};

const EXTENSION_ALIASES = {
  jpeg: 'jpg',
  'svg+xml': 'svg',
  'x-icon': 'ico',
  'vnd.microsoft.icon': 'ico',
};

const VIDEO_TYPES = ['mp4', 'webm'];

const PREFERENCE = [
  'background.jpg',
  'background.jpeg',
  'background.png',
  'background.webp',
  'background.gif',
  'background.svg',
  'background.mp4',
  'background.webm',
];

function backgroundFiles() {
  try {
    return readdirSync(ASSET_DIR).filter((name) => /^background\.[a-z0-9]+$/i.test(name));
  } catch (error) {
    return [];
  }
}

function typeFor(name) {
  const extension = name.slice(name.lastIndexOf('.') + 1).toLowerCase();
  if (CONTENT_TYPES[extension]) return CONTENT_TYPES[extension];
  if (extension === 'mp4') return 'video/mp4';
  if (extension === 'webm') return 'video/webm';
  return 'image/' + extension;
}

function findBackground() {
  const files = backgroundFiles();
  if (files.length === 0) return null;
  files.sort((left, right) => {
    const leftIndex = PREFERENCE.indexOf(left);
    const rightIndex = PREFERENCE.indexOf(right);
    const leftRank = leftIndex < 0 ? PREFERENCE.length : leftIndex;
    const rightRank = rightIndex < 0 ? PREFERENCE.length : rightIndex;
    return leftRank - rightRank || left.localeCompare(right);
  });
  const name = files[0];
  return { file: join(ASSET_DIR, name), type: typeFor(name) };
}

function sendJson(res, status, value) {
  const body = JSON.stringify(value);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  });
  res.end(body);
}

function sendText(res, status, text) {
  const body = Buffer.from(text, 'utf8');
  res.writeHead(status, {
    'content-type': 'text/plain; charset=utf-8',
    'content-length': body.length,
    'cache-control': 'no-store',
  });
  res.end(body);
}

function sendFile(req, res, file, type) {
  const stream = createReadStream(file);
  stream.once('open', (fd) => {
    if (res.destroyed || res.writableEnded) {
      stream.destroy();
      return;
    }
    let size;
    try {
      size = fstatSync(fd).size;
    } catch (error) {
      size = undefined;
    }
    const headers = { 'content-type': type, 'cache-control': 'no-store' };
    if (size !== undefined) headers['content-length'] = size;
    res.writeHead(200, headers);
    if (req.method === 'HEAD') {
      stream.destroy();
      res.end();
      return;
    }
    stream.pipe(res);
  });
  stream.on('error', () => {
    if (!res.writableEnded) res.destroy();
  });
  res.on('close', () => stream.destroy());
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error('body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function removeAll() {
  for (const name of backgroundFiles()) {
    rmSync(join(ASSET_DIR, name), { force: true });
  }
}

async function saveUpload(body) {
  const dataUrl = String((body && body.dataUrl) || '');
  const match = /^data:(image|video)\/([a-z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/i.exec(dataUrl);
  if (!match) throw new Error('unsupported media payload');
  const mediaType = match[1].toLowerCase();
  const rawType = match[2].toLowerCase();
  if (mediaType === 'video' && VIDEO_TYPES.indexOf(rawType) < 0) {
    throw new Error('unsupported media payload');
  }
  const extension = EXTENSION_ALIASES[rawType] || rawType.replace(/[^a-z0-9]/g, '');
  if (!extension) throw new Error('unsupported media payload');
  const buffer = Buffer.from(match[3], 'base64');
  if (buffer.length === 0 || buffer.length > MAX_BYTES) throw new Error('media size out of range');
  mkdirSync(ASSET_DIR, { recursive: true });
  const target = join(ASSET_DIR, 'background.' + extension);
  const temporary = target + '.tmp';
  writeFileSync(temporary, buffer);
  renameSync(temporary, target);
  for (const name of backgroundFiles()) {
    if (name !== 'background.' + extension) rmSync(join(ASSET_DIR, name), { force: true });
  }
  return 'background.' + extension;
}

async function handle(req, res) {
  try {
    if (req.method === 'GET' || req.method === 'HEAD') {
      const found = findBackground();
      if (!found) {
        if (req.method === 'HEAD') {
          res.writeHead(404, { 'cache-control': 'no-store' });
          res.end();
          return;
        }
        sendText(res, 404, 'no background image');
        return;
      }
      sendFile(req, res, found.file, found.type);
      return;
    }

    if (req.method === 'POST') {
      const raw = await readBody(req, BODY_LIMIT);
      let body;
      try {
        body = JSON.parse(raw || '{}');
      } catch (error) {
        sendJson(res, 400, { ok: false, error: 'invalid JSON' });
        return;
      }
      const file = await saveUpload(body);
      sendJson(res, 200, { ok: true, file, version: Date.now().toString(36) });
      return;
    }

    if (req.method === 'DELETE') {
      removeAll();
      sendJson(res, 200, { ok: true });
      return;
    }

    sendText(res, 405, 'method not allowed');
  } catch (error) {
    if (res.writableEnded || res.destroyed) return;
    const message = error instanceof Error ? error.message : String(error);
    const clientError =
      message === 'unsupported media payload' ||
      message === 'media size out of range' ||
      message === 'body too large';
    sendJson(res, clientError ? 400 : 500, { ok: false, error: message });
  }
}

export function apply(ctx) {
  const webServer = ctx.get ? ctx.get('webServer') : undefined;
  if (!webServer) return;
  ctx.effect(
    () =>
      webServer.register({
        kind: 'prefix',
        path: ROUTE_PATH,
        handler: handle,
      }),
    'work-pay-note: background route',
  );
}
