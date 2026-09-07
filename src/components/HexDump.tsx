import { useCallback, useMemo, useRef, useState } from 'react';
import styles from './HexDump.module.css';

/**
 * HexDump — an interactive hex + ASCII inspector for captured byte streams
 * (I²C / USB / serial). Hover or focus a byte to cross-highlight its ASCII
 * cell and read its offset and value.
 *
 * This doubles as the reference for writing React islands in this project:
 *   - typed props with sensible defaults
 *   - pure helpers kept outside the component
 *   - useMemo for derived data, useCallback for stable handlers
 *   - roving-tabindex keyboard support (arrows / home / end) + aria labels
 *   - styling via a co-located CSS Module that consumes the design tokens
 *     (see HexDump.module.css) — no Tailwind, no inline colours
 *
 * Usage (in an .astro/.mdx file), hydrated as an island:
 *   <HexDump client:visible data="53 46 3A 01 00 12" caption="Init packet" />
 */
export interface HexDumpProps {
    /** Bytes as a hex string ("53 46 3A" or "53463a") or a byte array. */
    data: string | number[];
    /** Bytes per row. Default 16. */
    bytesPerRow?: number;
    /** First offset shown in the gutter. Default 0. */
    startOffset?: number;
    /** Optional caption rendered beneath the dump. */
    caption?: string;
}

/** Normalise either input form into a clamped byte array. */
function parseBytes(data: string | number[]): number[] {
    if (Array.isArray(data)) {
        return data.map((b) => b & 0xff);
    }
    const cleaned = data.replace(/0x/gi, '').replace(/[^0-9a-fA-F]/g, '');
    const pairs = cleaned.match(/.{1,2}/g) ?? [];
    return pairs.map((pair) => parseInt(pair.padEnd(2, '0'), 16));
}

const toHex = (value: number, width: number): string => value.toString(16).toUpperCase().padStart(width, '0');

/** Printable ASCII maps to itself; everything else to a placeholder dot. */
const toGlyph = (byte: number): string => (byte >= 0x20 && byte <= 0x7e ? String.fromCharCode(byte) : '.');

export function HexDump({ data, bytesPerRow = 16, startOffset = 0, caption }: HexDumpProps) {
    const bytes = useMemo(() => parseBytes(data), [data]);
    const [active, setActive] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Rows are padded out to a full bytesPerRow so the grid stays rectangular.
    // Pad slots hold 0 as a placeholder; the render detects them by index
    // (index >= bytes.length) and shows them as blank, non-interactive cells —
    // they are NOT real bytes and never get a value, aria label, or focus.
    const rows = useMemo(() => {
        const chunks: number[][] = [];
        for (let i = 0; i < bytes.length; i += bytesPerRow) {
            const chunk = bytes.slice(i, i + bytesPerRow);
            while (chunk.length < bytesPerRow) chunk.push(0);
            chunks.push(chunk);
        }
        return chunks;
    }, [bytes, bytesPerRow]);

    const offsetWidth = Math.max(4, toHex(startOffset + Math.max(bytes.length - 1, 0), 1).length);

    const focusByte = useCallback((index: number) => {
        containerRef.current?.querySelector<HTMLButtonElement>(`[data-byte="${index}"]`)?.focus();
    }, []);

    const onKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (active === null || bytes.length === 0) return;
            const last = bytes.length - 1;
            let next = active;
            switch (event.key) {
                case 'ArrowRight':
                    next = Math.min(active + 1, last);
                    break;
                case 'ArrowLeft':
                    next = Math.max(active - 1, 0);
                    break;
                case 'ArrowDown':
                    next = Math.min(active + bytesPerRow, last);
                    break;
                case 'ArrowUp':
                    next = Math.max(active - bytesPerRow, 0);
                    break;
                case 'Home':
                    next = 0;
                    break;
                case 'End':
                    next = last;
                    break;
                default:
                    return;
            }
            event.preventDefault();
            setActive(next);
            focusByte(next);
        },
        [active, bytes.length, bytesPerRow, focusByte]
    );

    // Roving tabindex: exactly one byte is tabbable at a time.
    const tabIndexFor = (index: number): 0 | -1 => (index === (active ?? 0) ? 0 : -1);

    const status =
        active !== null && bytes[active] !== undefined
            ? `offset 0x${toHex(startOffset + active, offsetWidth)} · byte 0x${toHex(bytes[active], 2)} · ${bytes[active]} · '${toGlyph(bytes[active])}'`
            : `${bytes.length} bytes · hover or focus a byte`;

    if (bytes.length === 0) {
        return <div className={styles.empty}>No bytes to display.</div>;
    }

    return (
        <figure className={styles.dump}>
            <div
                ref={containerRef}
                className={styles.grid}
                role="grid"
                aria-label="Hex dump"
                onKeyDown={onKeyDown}
                onMouseLeave={() => setActive(null)}
            >
                <div className={styles.headerRow} aria-hidden="true">
                    <span className={styles.offset} />
                    <div className={styles.hex}>
                        {Array.from({ length: bytesPerRow }, (_, i) => (
                            <span key={i} className={styles.colLabel}>
                                {toHex(i, 2)}
                            </span>
                        ))}
                    </div>
                </div>

                {rows.map((row, rowIndex) => {
                    const base = rowIndex * bytesPerRow;
                    return (
                        <div key={base} className={styles.row} role="row">
                            <span className={styles.offset}>{toHex(startOffset + base, offsetWidth)}</span>

                            <div className={styles.hex}>
                                {row.map((byte, col) => {
                                    const index = base + col;
                                    if (index >= bytes.length) {
                                        return (
                                            <span
                                                key={index}
                                                className={`${styles.byte} ${styles.pad}`}
                                                aria-hidden="true"
                                            />
                                        );
                                    }
                                    const isActive = index === active;
                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            data-byte={index}
                                            className={`${styles.byte} ${isActive ? styles.active : ''}`}
                                            tabIndex={tabIndexFor(index)}
                                            aria-label={`Offset ${toHex(startOffset + index, offsetWidth)}, value ${toHex(byte, 2)}`}
                                            onMouseEnter={() => setActive(index)}
                                            onFocus={() => setActive(index)}
                                        >
                                            {toHex(byte, 2)}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className={styles.ascii}>
                                {row.map((byte, col) => {
                                    const index = base + col;
                                    if (index >= bytes.length) {
                                        return (
                                            <span
                                                key={index}
                                                className={`${styles.glyph} ${styles.pad}`}
                                                aria-hidden="true"
                                            />
                                        );
                                    }
                                    return (
                                        <span
                                            key={index}
                                            className={`${styles.glyph} ${index === active ? styles.active : ''}`}
                                        >
                                            {toGlyph(byte)}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <figcaption className={styles.status} aria-live="polite">
                {status}
            </figcaption>
            {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
        </figure>
    );
}
