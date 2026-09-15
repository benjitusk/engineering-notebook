// @ts-check
// Colours for hero figures. On the site, figures reference the design tokens
// (so they follow light/dark mode); scripts that rasterise need literal values.

/** Palette key → CSS custom property in src/styles/tokens.css. */
export const TOKENS = {
    paper: 'background',
    surface: 'surface',
    ink: 'text',
    muted: 'text-muted',
    subtle: 'text-subtle',
    rule: 'border',
    ruleStrong: 'border-strong',
    accent: 'accent',
    accentWash: 'accent-subtle',
    warning: 'warning',
    warningWash: 'warning-subtle',
    code: 'code-background',
};

const MONO = "'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace";

/** Light theme values, mirroring tokens.css. */
export const LIGHT = {
    paper: '#f7f7f5',
    surface: '#ffffff',
    ink: '#181a1b',
    muted: '#686d70',
    subtle: '#969b9e',
    rule: '#dcddd9',
    ruleStrong: '#c5c7c3',
    accent: '#356a8a',
    accentWash: '#e7eff3',
    warning: '#985d11',
    warningWash: '#f5ebdd',
    code: '#ecedea',
    mono: MONO,
};

/** Dark theme values, mirroring tokens.css. */
export const DARK = {
    paper: '#16181a',
    surface: '#1e2124',
    ink: '#f2f3f2',
    muted: '#a8adb0',
    subtle: '#7c8184',
    rule: '#2c2f31',
    ruleStrong: '#3a3e40',
    accent: '#6fa3c2',
    accentWash: '#1d2a33',
    warning: '#d29a5b',
    warningWash: '#2c2519',
    code: '#232629',
    mono: MONO,
};

/** @typedef {typeof LIGHT} Palette */

/**
 * `'css'` → token references with light-theme fallbacks; a palette object → as is.
 * @param {'css' | Palette} mode
 * @returns {Palette}
 */
export function resolvePalette(mode) {
    if (mode !== 'css') return mode;
    const entries = Object.entries(TOKENS).map(([key, token]) => [
        key,
        `var(--${token}, ${LIGHT[/** @type {keyof typeof TOKENS} */ (key)]})`,
    ]);
    return /** @type {Palette} */ ({ ...Object.fromEntries(entries), mono: `var(--font-mono, ${MONO})` });
}
