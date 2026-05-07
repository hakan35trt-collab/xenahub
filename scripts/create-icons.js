const fs = require('fs');
const path = require('path');

// 1x1 purple pixel PNG (base64)
const purplePixel = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk4df7DwACgwGA69r2gQAAAABJRU5ErkJggg==';
const whitePixel = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6pwAAAABJRU5ErkJggg==';

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons');

if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

for (const size of SIZES) {
  const out = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
  if (!fs.existsSync(out)) {
    fs.writeFileSync(out, Buffer.from(purplePixel, 'base64'));
    console.log(`  created ${out}`);
  } else {
    console.log(`  exists  ${out}`);
  }
}

console.log('All PWA icons ready.');
