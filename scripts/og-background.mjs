// Generates src/assets/og/background.png, the backdrop for every Open Graph
// card (see src/pages/og/[...route].ts). Page titles and descriptions are
// drawn on top of it at build time; this image holds everything that's the
// same on every card: graph paper, the accent rule, and the footer.
//
// Drawn with CanvasKit, the same renderer astro-og-canvas uses, so the footer
// is set in real IBM Plex Mono (sharp's text input falls back to system fonts).
//
// Run after changing the branding or palette:  node scripts/og-background.mjs

import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import init from 'canvaskit-wasm/full';

const { resolve } = createRequire(import.meta.url);
const CanvasKit = await init({ locateFile: (file) => resolve(`canvaskit-wasm/bin/full/${file}`) });

const W = 1200;
const H = 630;
const PAD = 80; // matches `padding` in the OG route
const FOOTER_Y = 548;

// Palette from src/styles/tokens.css (light theme).
const paper = [247, 247, 245];
const ink = [24, 26, 27];
const subtle = [150, 155, 158];
const border = [220, 221, 217];
const accent = [53, 106, 138];

// Branding from src/consts.ts and the site URL in astro.config.mjs.
const name = 'BENJI TUSK';
const subtitle = 'ENGINEERING NOTEBOOK';
const domain = 'notebook.benjitusk.com';

const assets = './src/assets/og';
const color = (rgb, alpha = 1) => CanvasKit.Color(...rgb, alpha);

const surface = CanvasKit.MakeSurface(W, H);
const canvas = surface.getCanvas();

// Paper.
canvas.clear(color(paper));

// Graph paper: an 8px minor grid under a 32px major grid, as in notebook.css.
const line = (alpha) => {
    const paint = new CanvasKit.Paint();
    paint.setColor(color(accent, alpha));
    paint.setStrokeWidth(1);
    paint.setAntiAlias(false);
    return paint;
};
const minor = line(0.03);
const major = line(0.08);
for (let x = 0; x <= W; x += 8) canvas.drawLine(x + 0.5, 0, x + 0.5, H, x % 32 === 0 ? major : minor);
for (let y = 0; y <= H; y += 8) canvas.drawLine(0, y + 0.5, W, y + 0.5, y % 32 === 0 ? major : minor);

// Vignette fading the grid back to paper at the edges.
const vignette = new CanvasKit.Paint();
vignette.setShader(
    CanvasKit.Shader.MakeRadialGradient(
        [W / 2, H / 2],
        W * 0.75,
        [color(paper, 0), color(paper, 0), color(paper, 0.8)],
        [0, 0.4, 1],
        CanvasKit.TileMode.Clamp,
        CanvasKit.Matrix.multiply(
            CanvasKit.Matrix.translated(W / 2, H / 2),
            CanvasKit.Matrix.scaled(1, H / W),
            CanvasKit.Matrix.translated(-W / 2, -H / 2)
        )
    )
);
canvas.drawRect(CanvasKit.XYWHRect(0, 0, W, H), vignette);

// Accent rule down the left edge, and the footer divider.
const fill = (rgb) => {
    const paint = new CanvasKit.Paint();
    paint.setColor(color(rgb));
    return paint;
};
canvas.drawRect(CanvasKit.XYWHRect(0, 0, 16, H), fill(accent));
canvas.drawRect(CanvasKit.XYWHRect(PAD, FOOTER_Y, W - PAD * 2, 1), fill(border));

// Footer text in IBM Plex Mono.
const fontMgr = CanvasKit.FontMgr.FromData(
    await fs.readFile(`${assets}/IBMPlexMono-Regular.woff`),
    await fs.readFile(`${assets}/IBMPlexMono-SemiBold.woff`)
);
const families = Array.from({ length: fontMgr.countFamilies() }, (_, i) => fontMgr.getFamilyName(i));
const mono = ['IBM Plex Mono', 'IBM Plex Mono SmBld'];

function paragraph(runs, { size, weight, letterSpacing = 0 }) {
    const style = (rgb) => ({
        color: color(rgb),
        fontFamilies: mono,
        fontSize: size,
        fontStyle: { weight: CanvasKit.FontWeight[weight] },
        letterSpacing,
    });
    const builder = CanvasKit.ParagraphBuilder.Make(
        new CanvasKit.ParagraphStyle({ textStyle: style(runs[0][1]) }),
        fontMgr
    );
    for (const [text, rgb] of runs) {
        builder.pushStyle(new CanvasKit.TextStyle(style(rgb)));
        builder.addText(text);
        builder.pop();
    }
    const para = builder.build();
    para.layout(W);
    return para;
}

const footerMiddle = FOOTER_Y + (H - FOOTER_Y) / 2;
const brand = paragraph(
    [
        [name, ink],
        [`  ·  ${subtitle}`, subtle],
    ],
    { size: 20, weight: 'SemiBold', letterSpacing: 20 * 0.15 }
);
const url = paragraph([[domain, accent]], { size: 22, weight: 'Normal' });
canvas.drawParagraph(brand, PAD, footerMiddle - brand.getHeight() / 2);
canvas.drawParagraph(url, W - PAD - url.getMaxIntrinsicWidth(), footerMiddle - url.getHeight() / 2);

// Encode.
const bytes = surface.makeImageSnapshot().encodeToBytes(CanvasKit.ImageFormat.PNG, 100);
surface.dispose();
await fs.writeFile(`${assets}/background.png`, bytes);

console.log(`background.png ${W}×${H}, ${Math.round(bytes.length / 1024)} KB`);
console.log(`fonts loaded: ${families.join(', ')}`);
