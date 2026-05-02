import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const svgPath = join(process.cwd(), 'static', 'icon.svg');
const svg = readFileSync(svgPath);

async function generate(size: number, suffix: string, padding = 0) {
	const out = join(process.cwd(), 'static', `icon-${suffix}.png`);
	if (padding > 0) {
		const inner = size - padding * 2;
		const innerBuf = await sharp(svg).resize(inner, inner).png().toBuffer();
		await sharp({
			create: {
				width: size,
				height: size,
				channels: 4,
				background: { r: 26, g: 27, b: 35, alpha: 1 }
			}
		})
			.composite([{ input: innerBuf, top: padding, left: padding }])
			.png()
			.toFile(out);
	} else {
		await sharp(svg).resize(size, size).png().toFile(out);
	}
	console.log(`✓ ${out}`);
}

await generate(192, '192');
await generate(512, '512');
await generate(512, 'maskable', 60);
console.log('Done.');
