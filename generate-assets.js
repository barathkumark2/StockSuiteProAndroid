/**
 * generate-assets.js
 * Creates valid PNG asset files for Expo using raw PNG binary.
 * No external dependencies needed — uses only Node.js built-ins.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

/**
 * Build a minimal valid PNG buffer.
 * @param {number} width
 * @param {number} height
 * @param {number[]} bgRgb  e.g. [13, 17, 23] for #0d1117
 * @param {string}  text    optional 1-char label (ignored for now — pure colour fill)
 */
function buildPng(width, height, bgRgb) {
  const [r, g, b] = bgRgb;

  // ── Raw image data: each row = filter byte (0) + RGBA pixels ─
  const rowSize = 1 + width * 4;
  const raw = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    raw[rowOffset] = 0; // filter type: None
    for (let x = 0; x < width; x++) {
      const px = rowOffset + 1 + x * 4;
      raw[px] = r;
      raw[px + 1] = g;
      raw[px + 2] = b;
      raw[px + 3] = 255; // fully opaque
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });

  // ── Helper: build a PNG chunk ─────────────────────────────────
  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeBuffer = Buffer.from(type);
    const crcData = Buffer.concat([typeBuffer, data]);
    const crc = crc32(crcData);
    const crcBuffer = Buffer.alloc(4);
    crcBuffer.writeInt32BE(crc);
    return Buffer.concat([len, typeBuffer, data, crcBuffer]);
  }

  // ── IHDR ──────────────────────────────────────────────────────
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // colour type: RGB — use 6 for RGBA
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrChunk = chunk('IHDR', ihdr);
  const idatChunk = chunk('IDAT', compressed);
  const iendChunk = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// ── CRC-32 implementation ────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) | 0;
}

// ── Asset definitions ─────────────────────────────────────────────
const DARK_BG   = [13,  17,  23];   // #0d1117
const BLUE_BG   = [13,  17,  23];   // same dark for adaptive icon bg

const assets = [
  { file: 'assets/icon.png',          w: 1024, h: 1024, bg: DARK_BG  },
  { file: 'assets/adaptive-icon.png', w: 1024, h: 1024, bg: BLUE_BG  },
  { file: 'assets/splash.png',        w: 1284, h: 2778, bg: DARK_BG  },
  { file: 'assets/favicon.png',       w:  196, h:  196, bg: DARK_BG  },
];

for (const { file, w, h, bg } of assets) {
  const outPath = path.join(__dirname, file);
  const buf = buildPng(w, h, bg);
  fs.writeFileSync(outPath, buf);
  const kb = (buf.length / 1024).toFixed(1);
  console.log(`✅  ${file}  (${w}×${h}, ${kb} KB)`);
}

console.log('\nAll assets generated successfully.');
