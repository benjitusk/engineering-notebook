// @ts-check
// Share cards for project posts: the post's hero — its `heroImage`, or the
// generated figure from src/lib/hero — framed on notebook paper with the title
// above it. Pages without a hero use the text cards in src/pages/og/[...route].ts.
//
// Rendering: resvg rasterises the hero SVG (it needs TTF fonts, hence the .ttf
// copies of Plex Mono), then CanvasKit composes the card and sets the type.
// Plain JavaScript so scripts can render cards without Astro.

import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import resvgModule from '@resvg/resvg-js';
import initCanvasKit from 'canvaskit-wasm/full';
import { LIGHT } from '../hero/palette.js';

const { Resvg } = resvgModule;
const require = createRequire(import.meta.url);

const W = 1200;
const H = 630;
const PAD = 64;
const FONTS = './src/assets/og';

// Branding from src/consts.ts and the site URL in astro.config.mjs.
const BRAND = { name: 'BENJI TUSK', subtitle: 'ENGINEERING NOTEBOOK', domain: 'notebook.benjitusk.com' };

/** @type {Promise<any> | undefined} */
let canvasKitPromise;
/** @type {any} */
let fontMgr;

async function setup() {
    canvasKitPromise ??= initCanvasKit({ locateFile: (file) => require.resolve(`canvaskit-wasm/bin/full/${file}`) });
    const CK = await canvasKitPromise;
    // One FontMgr for the whole build: CanvasKit leaks memory if it's recreated.
    fontMgr ??= CK.FontMgr.FromData(
        ...(await Promise.all(
            ['IBMPlexSans-Bold.woff', 'IBMPlexMono-Regular.woff', 'IBMPlexMono-SemiBold.woff'].map((file) =>
                fs.readFile(`${FONTS}/${file}`)
            )
        ))
    );
    return { CK, fontMgr };
}

/**
 * Rasterise the hero: a raster file as is, or the SVG figure via resvg.
 * @param {any} CK
 * @param {{ heroSvg?: string, heroImagePath?: string }} hero
 * @param {number} width Target width in card pixels (rendered at 2× for sharpness).
 */
async function loadHero(CK, { heroSvg, heroImagePath }, width) {
    if (heroImagePath) return CK.MakeImageFromEncoded(await fs.readFile(heroImagePath));
    if (!heroSvg) return null;
    const png = new Resvg(heroSvg, {
        fitTo: { mode: 'width', value: Math.round(width * 2) },
        font: {
            fontFiles: [`${FONTS}/IBMPlexMono-Regular.ttf`, `${FONTS}/IBMPlexMono-SemiBold.ttf`],
            loadSystemFonts: false,
            defaultFontFamily: 'IBM Plex Mono',
        },
    })
        .render()
        .asPng();
    return CK.MakeImageFromEncoded(png);
}

/**
 * Render a post's share card.
 * @param {object} input
 * @param {string} input.title
 * @param {string} [input.heroSvg] Hero figure SVG, rendered with a literal palette (not CSS tokens).
 * @param {string} [input.heroImagePath] A raster hero image on disk; takes precedence over `heroSvg`.
 * @returns {Promise<Uint8Array>} PNG bytes.
 */
export async function renderPostCard({ title, heroSvg, heroImagePath }) {
    const { CK, fontMgr } = await setup();
    const surface = CK.MakeSurface(W, H);
    const canvas = surface.getCanvas();

    const color = (/** @type {string} */ hex, alpha = 1) =>
        CK.Color(parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), alpha);
    const paint = (/** @type {string} */ hex, alpha = 1) => {
        const p = new CK.Paint();
        p.setColor(color(hex, alpha));
        p.setAntiAlias(true);
        return p;
    };

    const full = CK.XYWHRect(0, 0, W, H);

    // Paper that darkens slightly towards the bottom.
    const shade = new CK.Paint();
    shade.setShader(
        CK.Shader.MakeLinearGradient(
            [0, 0],
            [0, H],
            [color(LIGHT.paper), color(LIGHT.paper), color(LIGHT.code), color(LIGHT.rule)],
            [0, 0.3, 0.8, 1],
            CK.TileMode.Clamp
        )
    );
    canvas.drawRect(full, shade);

    // Graph paper (8px minor under 32px major) that fades out towards the
    // bottom: draw it on a layer, then mask the layer with a vertical fade.
    canvas.saveLayer();
    const minor = paint(LIGHT.accent, 0.045);
    const major = paint(LIGHT.accent, 0.11);
    for (const p of [minor, major]) {
        p.setStrokeWidth(1);
        p.setAntiAlias(false);
    }
    for (let x = 0; x <= W; x += 8) canvas.drawLine(x + 0.5, 0, x + 0.5, H, x % 32 === 0 ? major : minor);
    for (let y = 0; y <= H; y += 8) canvas.drawLine(0, y + 0.5, W, y + 0.5, y % 32 === 0 ? major : minor);
    const fade = new CK.Paint();
    fade.setBlendMode(CK.BlendMode.DstIn);
    fade.setShader(
        CK.Shader.MakeLinearGradient(
            [0, 0],
            [0, H * 0.9],
            [CK.Color(0, 0, 0, 1), CK.Color(0, 0, 0, 0)],
            null,
            CK.TileMode.Clamp
        )
    );
    canvas.drawRect(full, fade);
    canvas.restore();

    /**
     * @param {[string, string][]} runs [text, hex colour] pairs
     * @param {{ families: string[], size: number, weight: string, letterSpacing?: number, lineHeight?: number, maxLines?: number }} style
     * @param {number} width
     */
    const paragraph = (runs, { families, size, weight, letterSpacing = 0, lineHeight = 1.2, maxLines }, width) => {
        const textStyle = (/** @type {string} */ hex) => ({
            color: color(hex),
            fontFamilies: families,
            fontSize: size,
            fontStyle: { weight: CK.FontWeight[weight] },
            letterSpacing,
            heightMultiplier: lineHeight,
        });
        const builder = CK.ParagraphBuilder.Make(
            new CK.ParagraphStyle({ textStyle: textStyle(runs[0][1]), maxLines, ellipsis: '…' }),
            fontMgr
        );
        for (const [text, hex] of runs) {
            builder.pushStyle(new CK.TextStyle(textStyle(hex)));
            builder.addText(text);
            builder.pop();
        }
        const para = builder.build();
        para.layout(width);
        return para;
    };

    // Brand row.
    const mono = ['IBM Plex Mono'];
    const brand = paragraph(
        [
            [BRAND.name, LIGHT.ink],
            [`  ·  ${BRAND.subtitle}`, LIGHT.subtle],
        ],
        { families: mono, size: 18, weight: 'SemiBold', letterSpacing: 18 * 0.15 },
        W
    );
    const domain = paragraph([[BRAND.domain, LIGHT.accent]], { families: mono, size: 19, weight: 'Normal' }, W);
    canvas.drawParagraph(brand, PAD, 44);
    canvas.drawParagraph(domain, W - PAD - domain.getMaxIntrinsicWidth(), 43);

    // Title, up to two lines.
    const titleTop = 90;
    const heading = paragraph(
        [[title, LIGHT.ink]],
        { families: ['IBM Plex Sans'], size: 46, weight: 'Bold', lineHeight: 1.12, maxLines: 2 },
        W - PAD * 2
    );
    canvas.drawParagraph(heading, PAD, titleTop);

    // Hero frame: as large as fits below the title at 2:1, whole (not cropped),
    // so the figure's title block stays visible.
    const top = titleTop + heading.getHeight() + 30;
    let frameH = H - 40 - top;
    let frameW = frameH * 2;
    if (frameW > W - PAD * 2) {
        frameW = W - PAD * 2;
        frameH = frameW / 2;
    }
    const frameX = (W - frameW) / 2;
    const radius = 14;
    const frame = CK.RRectXY(CK.XYWHRect(frameX, top, frameW, frameH), radius, radius);

    const shadow = paint(LIGHT.ink, 0.16);
    shadow.setMaskFilter(CK.MaskFilter.MakeBlur(CK.BlurStyle.Normal, 18, true));
    canvas.drawRRect(CK.RRectXY(CK.XYWHRect(frameX, top + 12, frameW, frameH), radius, radius), shadow);

    const image = await loadHero(CK, { heroSvg, heroImagePath }, frameW);
    canvas.save();
    canvas.clipRRect(frame, CK.ClipOp.Intersect, true);
    canvas.drawRect(CK.XYWHRect(frameX, top, frameW, frameH), paint(LIGHT.surface));
    if (image) {
        // Cover-fit: crop the source to the frame's aspect ratio, centred.
        const [iw, ih] = [image.width(), image.height()];
        const scale = Math.max(frameW / iw, frameH / ih);
        const [sw, sh] = [frameW / scale, frameH / scale];
        canvas.drawImageRectOptions(
            image,
            CK.XYWHRect((iw - sw) / 2, (ih - sh) / 2, sw, sh),
            CK.XYWHRect(frameX, top, frameW, frameH),
            CK.FilterMode.Linear,
            CK.MipmapMode.Linear,
            null
        );
    }
    canvas.restore();

    const border = paint(LIGHT.ruleStrong);
    border.setStyle(CK.PaintStyle.Stroke);
    border.setStrokeWidth(1.5);
    canvas.drawRRect(frame, border);

    const bytes = surface.makeImageSnapshot().encodeToBytes(CK.ImageFormat.PNG, 100);
    surface.dispose();
    return bytes;
}
