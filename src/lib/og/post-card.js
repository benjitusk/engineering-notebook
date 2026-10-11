// @ts-check
// Share cards for project posts: title, name and domain on the left, the post's
// art full height on the right — its `heroImage`, its hand drawing (src/lib/art),
// or the generated figure (src/lib/hero). Matches the design system's
// LinkPreview card. Pages without a post use the text cards in
// src/pages/og/[...route].ts.
//
// Rendering: resvg rasterises the art SVG (it needs TTF fonts, hence the .ttf
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
const PAD = 72;
const PANEL_W = 496;
const FONTS = './src/assets/og';

// Branding from src/consts.ts and the site URL in astro.config.mjs.
const BRAND = { name: 'Benji Tusk', subtitle: 'ENGINEERING NOTEBOOK', domain: 'notebook.benjitusk.com' };

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
 * Rasterise the art: a raster file as is, or an SVG via resvg.
 * @param {any} CK
 * @param {{ artSvg?: string, heroImagePath?: string }} art
 * @param {number} width Target width in card pixels (rendered at 2× for sharpness).
 */
async function loadArt(CK, { artSvg, heroImagePath }, width) {
    if (heroImagePath) return CK.MakeImageFromEncoded(await fs.readFile(heroImagePath));
    if (!artSvg) return null;
    const png = new Resvg(artSvg, {
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
 * @param {string} [input.artSvg] The post's art as SVG, rendered with a literal palette (not CSS tokens).
 * @param {'cover' | 'contain'} [input.fit] `cover` crops the art to fill the panel (hand drawings, photos);
 *   `contain` shows it whole on paper (the 2:1 generated figures, so their title block stays visible).
 * @param {string} [input.heroImagePath] A raster hero image on disk; takes precedence over `artSvg`.
 * @returns {Promise<Uint8Array>} PNG bytes.
 */
export async function renderPostCard({ title, artSvg, fit = 'cover', heroImagePath }) {
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

    canvas.drawRect(CK.XYWHRect(0, 0, W, H), paint(LIGHT.paper));

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

    // Art panel, full height on the right.
    const panelX = W - PANEL_W;
    const image = await loadArt(CK, { artSvg, heroImagePath }, fit === 'cover' ? H : PANEL_W);
    if (image) {
        const [iw, ih] = [image.width(), image.height()];
        canvas.save();
        canvas.clipRect(CK.XYWHRect(panelX, 0, PANEL_W, H), CK.ClipOp.Intersect, true);
        if (fit === 'cover') {
            // Crop the source to the panel's aspect ratio, centred.
            const scale = Math.max(PANEL_W / iw, H / ih);
            const [sw, sh] = [PANEL_W / scale, H / scale];
            canvas.drawImageRectOptions(
                image,
                CK.XYWHRect((iw - sw) / 2, (ih - sh) / 2, sw, sh),
                CK.XYWHRect(panelX, 0, PANEL_W, H),
                CK.FilterMode.Linear,
                CK.MipmapMode.Linear,
                null
            );
        } else {
            // Whole, centred vertically on the paper.
            const dh = (PANEL_W / iw) * ih;
            canvas.drawImageRectOptions(
                image,
                CK.XYWHRect(0, 0, iw, ih),
                CK.XYWHRect(panelX, (H - dh) / 2, PANEL_W, dh),
                CK.FilterMode.Linear,
                CK.MipmapMode.Linear,
                null
            );
        }
        canvas.restore();
    }
    const divider = paint(LIGHT.rule);
    divider.setStrokeWidth(1);
    canvas.drawLine(panelX + 0.5, 0, panelX + 0.5, H, divider);

    // Text column on the left.
    const textW = panelX - PAD * 2;
    const eyebrow = paragraph([[BRAND.subtitle, LIGHT.accent]], {
        families: ['IBM Plex Mono'],
        size: 20,
        weight: 'SemiBold',
        letterSpacing: 20 * 0.15,
    }, textW);
    canvas.drawParagraph(eyebrow, PAD, PAD);

    const heading = paragraph(
        [[title, LIGHT.ink]],
        { families: ['IBM Plex Sans'], size: 58, weight: 'Bold', lineHeight: 1.06, letterSpacing: 58 * -0.02, maxLines: 5 },
        textW
    );
    canvas.drawParagraph(heading, PAD, PAD + eyebrow.getHeight() + 32);

    const name = paragraph([[BRAND.name, LIGHT.ink]], { families: ['IBM Plex Sans'], size: 26, weight: 'Bold' }, textW);
    const domain = paragraph([[BRAND.domain, LIGHT.muted]], { families: ['IBM Plex Mono'], size: 20, weight: 'Normal' }, textW);
    const bylineY = H - PAD - name.getHeight();
    canvas.drawParagraph(name, PAD, bylineY);
    canvas.drawParagraph(domain, PAD + name.getMaxIntrinsicWidth() + 16, bylineY + (name.getAlphabeticBaseline() - domain.getAlphabeticBaseline()));

    const bytes = surface.makeImageSnapshot().encodeToBytes(CK.ImageFormat.PNG, 100);
    surface.dispose();
    return bytes;
}
