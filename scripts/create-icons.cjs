const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

/**
 * Create minimal valid PNG from a 1x1 pixel repeat pattern
 */
function createPNG(size, r, g, b, colorName) {
  // IHDR chunk
  const ihdr = Buffer.concat([
    Buffer.from([0, 0, 0, 13]),
    Buffer.from('IHDR', 'ascii'),
    Buffer.from([size >>> 24, (size >>> 16) & 0xff, (size >>> 8) & 0xff, size & 0xff]),
    Buffer.from([size >>> 24, (size >>> 16) & 0xff, (size >>> 8) & 0xff, size & 0xff]),
    Buffer.from([8, 2, 0, 0, 0]),
    Buffer.alloc(4)
  ]);
  writeCrc(ihdr, 4 + 13);

  // IDAT: raw image data
  const rowSize = 1 + size * 3;
  const raw = Buffer.alloc(rowSize * size);
  for (let y = 0; y < size; y++) {
    const rowOff = y * rowSize;
    raw[rowOff] = 0; // filter byte
    for (let x = 0; x < size; x++) {
      const off = rowOff + 1 + x * 3;
      raw[off] = r;
      raw[off + 1] = g;
      raw[off + 2] = b;
    }
  }

  const deflated = zlib.deflateSync(raw, { level: 9 });
  const idat = Buffer.concat([
    Buffer.from([deflated.length >>> 24, (deflated.length >>> 16) & 0xff, (deflated.length >>> 8) & 0xff, deflated.length & 0xff]),
    Buffer.from('IDAT', 'ascii'),
    deflated,
    Buffer.alloc(4)
  ]);
  writeCrc(idat, 4 + deflated.length);

  // IEND
  const iend = Buffer.concat([
    Buffer.from([0, 0, 0, 0]),
    Buffer.from('IEND', 'ascii'),
    Buffer.alloc(4)
  ]);
  writeCrc(iend, 4 + 0);

  // Final PNG
  const header = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // Calculate total size
  const totalLen = header.length + ihdr.length + idat.length + iend.length;
  const out = Buffer.concat([header, ihdr, idat, iend], totalLen);
  return out;
}

function writeCrc(chunk, len) {
  const typeData = chunk.slice(4, 4 + len);
  const crc = zlib.crc32(typeData);
  chunk.writeUInt32BE(crc >>> 0, 4 + len);
}

const dir = path.join(process.cwd(), 'public', 'icons');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// Create purple icons for all required sizes
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const destSizes = {
  'icon-72x72.png': 72,
  'icon-96x96.png': 96,
  'icon-128x128.png': 128,
  'icon-144x144.png': 144,
  'icon-152x152.png': 152,
  'icon-192.png': 192,
  'icon-192x192.png': 192,
  'icon-384x384.png': 384,
  'icon-512.png': 512,
  'icon-512x512.png': 512,
};

// Generate base PNGs
const pngs = {};
for (const s of sizes) {
  pngs[s] = createPNG(s, 145, 71, 255, 'xena-purple');
}

// Write all files
for (const [fname, size] of Object.entries(destSizes)) {
  const buf = pngs[size];
  fs.writeFileSync(path.join(dir, fname), buf);
  console.log(`  ${fname.padEnd(20)} -> ${buf.length.toString().padStart(6)} bytes`);
}

console.log('\nAll PWA icons generated successfully!');
