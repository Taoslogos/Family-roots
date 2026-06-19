/**
 * Generates Android launcher icons from the Family Roots logo.
 * Run: node scripts/generate-android-icons.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const source = path.join(root, 'src', 'family_tree.png');
const resDir = path.join(root, 'android', 'app', 'src', 'main', 'res');

/** Warm beige matching the logo background */
const BG = { r: 245, g: 240, b: 232, alpha: 1 };

const DENSITIES = [
  { folder: 'mipmap-mdpi', launcher: 48, foreground: 108 },
  { folder: 'mipmap-hdpi', launcher: 72, foreground: 162 },
  { folder: 'mipmap-xhdpi', launcher: 96, foreground: 216 },
  { folder: 'mipmap-xxhdpi', launcher: 144, foreground: 324 },
  { folder: 'mipmap-xxxhdpi', launcher: 192, foreground: 432 },
];

async function writeIcon(outPath, size) {
  await sharp(source)
    .resize(size, size, {
      fit: 'contain',
      background: BG,
      kernel: sharp.kernel.lanczos3,
    })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
}

async function main() {
  if (!fs.existsSync(source)) {
    console.error('Source logo not found:', source);
    process.exit(1);
  }

  for (const { folder, launcher, foreground } of DENSITIES) {
    const dir = path.join(resDir, folder);
    fs.mkdirSync(dir, { recursive: true });

    const launcherPath = path.join(dir, 'ic_launcher.png');
    const roundPath = path.join(dir, 'ic_launcher_round.png');
    const fgPath = path.join(dir, 'ic_launcher_foreground.png');

    await writeIcon(launcherPath, launcher);
    await writeIcon(roundPath, launcher);
    await writeIcon(fgPath, foreground);

    console.log(`✓ ${folder} (${launcher}px / ${foreground}px foreground)`);
  }

  console.log('\nAndroid launcher icons updated.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
