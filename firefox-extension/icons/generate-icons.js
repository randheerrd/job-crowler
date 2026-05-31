/**
 * Zero-dependency PNG icon generator for the JobCrawler Firefox extension.
 * Generates icon16.png, icon48.png, icon128.png in the same directory.
 * Run with: node generate-icons.js
 */
const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

// ── Amber palette (matches the app's primary-500 #c8894a) ─────────────────────
const BG       = [200, 137,  74]; // #c8894a  amber fill
const BG_LIGHT = [212, 158, 100]; // lighter for top gradient
const BG_DARK  = [178, 120,  60]; // darker for bottom gradient
const TEXT     = [255, 255, 255]; // white "JC"

// ── Helpers ────────────────────────────────────────────────────────────────────
function lerp(a, b, t) { return Math.round(a + (b - a) * t); }
function lerpColor(ca, cb, t) {
  return [lerp(ca[0], cb[0], t), lerp(ca[1], cb[1], t), lerp(ca[2], cb[2], t)];
}

// ── Draw a size×size RGBA pixel grid ──────────────────────────────────────────
function drawIcon(size) {
  const pixels = new Uint8Array(size * size * 4);
  const radius = Math.round(size * 0.18);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;

      // Rounded-rectangle test
      const dx = Math.max(radius - x, 0, x - (size - 1 - radius));
      const dy = Math.max(radius - y, 0, y - (size - 1 - radius));
      const inside = dx * dx + dy * dy <= radius * radius;

      if (!inside) {
        pixels[i + 3] = 0; // transparent
        continue;
      }

      // Vertical gradient: BG_LIGHT → BG_DARK
      const t = y / (size - 1);
      const [r, g, b] = lerpColor(BG_LIGHT, BG_DARK, t);
      pixels[i]     = r;
      pixels[i + 1] = g;
      pixels[i + 2] = b;
      pixels[i + 3] = 255;
    }
  }

  // Rasterise "JC" using a tiny bitmap font scaled to the icon
  drawText(pixels, size, 'JC', TEXT);

  return pixels;
}

// ── Minimal bitmap font (5×7 glyphs, uppercase only) ─────────────────────────
// Each glyph: 5 columns × 7 rows, LSB = leftmost pixel
const GLYPHS = {
  J: [0b00100, 0b00100, 0b00100, 0b00100, 0b10100, 0b10100, 0b01000],
  C: [0b01110, 0b10001, 0b10000, 0b10000, 0b10000, 0b10001, 0b01110],
};
const GLYPH_W = 5, GLYPH_H = 7;

function drawText(pixels, size, text, color) {
  const chars = text.split('');
  const SPACING = 1; // pixels between chars
  const totalGlyphW = chars.length * GLYPH_W + (chars.length - 1) * SPACING;

  // Scale factor: glyph should span ~45% of icon width
  const scale = Math.max(1, Math.floor(size * 0.45 / GLYPH_W));
  const scaledW = GLYPH_W * scale;
  const scaledH = GLYPH_H * scale;
  const scaledSpacing = SPACING * scale;

  const totalW = chars.length * scaledW + (chars.length - 1) * scaledSpacing;
  const totalH = scaledH;

  const startX = Math.round((size - totalW) / 2);
  const startY = Math.round((size - totalH) / 2) + Math.round(scale * 0.3);

  chars.forEach((ch, ci) => {
    const glyph = GLYPHS[ch];
    if (!glyph) return;
    const cx = startX + ci * (scaledW + scaledSpacing);
    for (let gy = 0; gy < GLYPH_H; gy++) {
      for (let gx = 0; gx < GLYPH_W; gx++) {
        if (!((glyph[gy] >> (GLYPH_W - 1 - gx)) & 1)) continue;
        // Paint scale×scale block
        for (let sy = 0; sy < scale; sy++) {
          for (let sx = 0; sx < scale; sx++) {
            const px = cx + gx * scale + sx;
            const py = startY + gy * scale + sy;
            if (px < 0 || px >= size || py < 0 || py >= size) continue;
            const i = (py * size + px) * 4;
            if (pixels[i + 3] === 0) continue; // outside rounded rect
            pixels[i]     = color[0];
            pixels[i + 1] = color[1];
            pixels[i + 2] = color[2];
            pixels[i + 3] = 255;
          }
        }
      }
    }
  });
}

// ── PNG encoder ───────────────────────────────────────────────────────────────
function crc32(buf) {
  let c = 0xffffffff;
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let v = n;
      for (let k = 0; k < 8; k++) v = v & 1 ? 0xedb88320 ^ (v >>> 1) : v >>> 1;
      t[n] = v;
    }
    return t;
  })());
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crcInput = Buffer.concat([typeBytes, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput));
  return Buffer.concat([len, typeBytes, data, crcBuf]);
}

function encodePNG(pixels, size) {
  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8]  = 8;  // bit depth
  ihdr[9]  = 6;  // colour type: RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // IDAT — one filter byte (0 = None) per row
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter type None
    for (let x = 0; x < size; x++) {
      const src = (y * size + x) * 4;
      const dst = y * (size * 4 + 1) + 1 + x * 4;
      raw[dst]     = pixels[src];
      raw[dst + 1] = pixels[src + 1];
      raw[dst + 2] = pixels[src + 2];
      raw[dst + 3] = pixels[src + 3];
    }
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── Main ──────────────────────────────────────────────────────────────────────
const dir = __dirname;
[16, 48, 128].forEach(size => {
  const pixels = drawIcon(size);
  const png = encodePNG(pixels, size);
  const outPath = path.join(dir, `icon${size}.png`);
  fs.writeFileSync(outPath, png);
  console.log(`✓ icon${size}.png  (${png.length} bytes)`);
});
console.log('\nIcons ready in:', dir);
