import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimal compliant PNG writer with zlib
function createPNG(width, height, drawPixel) {
  const bytesPerPixel = 4;
  const scanlineLength = width * bytesPerPixel + 1;
  const rawBuffer = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const scanlineOffset = y * scanlineLength;
    rawBuffer[scanlineOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixel(x, y, width, height);
      const pixelOffset = scanlineOffset + 1 + x * bytesPerPixel;
      rawBuffer[pixelOffset] = r;
      rawBuffer[pixelOffset + 1] = g;
      rawBuffer[pixelOffset + 2] = b;
      rawBuffer[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawBuffer);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type (RGBA)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuf, data]);
  const crc = crc32(crcData);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([length, typeBuf, data, crcBuf]);
}

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

// Draw VentureFlow Icon: Dark navy canvas (#0F172A), deep emerald & cyan geometric vault monogram
function drawAppIcon(x, y, w, h) {
  const nx = x / w;
  const ny = y / h;

  // Background: Deep Slate Navy (#090D16 to #0F172A)
  const bgR = 11 + Math.floor(nx * 5);
  const bgG = 17 + Math.floor(ny * 8);
  const bgB = 29 + Math.floor((nx + ny) * 8);

  // Center coordinate
  const cx = 0.5;
  const cy = 0.5;
  const dx = nx - cx;
  const dy = ny - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Outer subtle shield boundary
  const inShield = Math.abs(dx) <= 0.36 && Math.abs(dy) <= 0.36;

  // Modern stylized "V" for VentureFlow with a lock / flow geometric chevron
  // Left arm of V
  const leftArm = (Math.abs(dy - (nx - 0.25) * 1.4) < 0.05) && (nx >= 0.22 && nx <= 0.5) && (ny >= 0.25 && ny <= 0.7);
  // Right arm of V
  const rightArm = (Math.abs(dy - (0.75 - nx) * 1.4) < 0.05) && (nx >= 0.5 && nx <= 0.78) && (ny >= 0.25 && ny <= 0.7);

  // Vault keyhole / center crest circle at top
  const keyholeCircle = (Math.sqrt(dx * dx + (dy + 0.12) * (dy + 0.12)) < 0.06);

  if (keyholeCircle) {
    return [16, 185, 129, 255]; // Emerald #10B981
  }

  if (leftArm || rightArm) {
    // Gradient between Emerald and Cyan
    const t = (nx - 0.2) / 0.6;
    const r = Math.round(16 * (1 - t) + 14 * t);
    const g = Math.round(185 * (1 - t) + 165 * t);
    const b = Math.round(129 * (1 - t) + 233 * t);
    return [r, g, b, 255];
  }

  // Rounded squircle container
  if (inShield && dist < 0.44) {
    // Inner plate
    const plateR = 19;
    const plateG = 27;
    const plateB = 44;
    return [plateR, plateG, plateB, 255];
  }

  return [bgR, bgG, bgB, 255];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write PNG files
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, drawAppIcon));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, drawAppIcon));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, drawAppIcon));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, drawAppIcon));

// Write SVG icon
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090D16" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#06B6D4" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="100" fill="url(#bgGrad)" />
  <rect x="56" y="56" width="400" height="400" rx="64" fill="#131C2E" stroke="#1E293B" stroke-width="4" />
  <!-- VentureFlow Chevron and Lock Motif -->
  <circle cx="256" cy="180" r="32" fill="url(#brandGrad)" />
  <path d="M140 210 L256 370 L372 210" fill="none" stroke="url(#brandGrad)" stroke-width="36" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M190 210 L256 300 L322 210" fill="none" stroke="#0E7490" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" opacity="0.6" />
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg);
console.log('Icons generated successfully.');
