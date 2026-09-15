// @ts-check
// Deterministic randomness for hero figures: the same seed always draws the
// same figure, on any machine.

/**
 * FNV-1a 32-bit hash.
 * @param {string} text
 */
export function hashString(text) {
    let hash = 0x811c9dc5;
    for (const char of text) {
        hash ^= /** @type {number} */ (char.codePointAt(0));
        hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
}

/**
 * Seeded PRNG (mulberry32). Seeds are hashed as strings, so `7` and `'7'`
 * produce the same figure.
 * @param {string | number} seed
 */
export function createRandom(seed) {
    let state = hashString(String(seed));

    const next = () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    return {
        /** Float in [0, 1). */
        next,
        /** Float in [min, max). */
        range: (/** @type {number} */ min, /** @type {number} */ max) => min + next() * (max - min),
        /** Integer in [min, max], inclusive. */
        int: (/** @type {number} */ min, /** @type {number} */ max) => Math.floor(min + next() * (max - min + 1)),
        /** True with probability `p`. */
        chance: (/** @type {number} */ p) => next() < p,
        /**
         * One item from a list.
         * @template T
         * @param {readonly T[]} items
         * @returns {T}
         */
        pick: (items) => items[Math.floor(next() * items.length)],
        /**
         * A shuffled copy of a list.
         * @template T
         * @param {readonly T[]} items
         * @returns {T[]}
         */
        shuffle: (items) => {
            const copy = [...items];
            for (let i = copy.length - 1; i > 0; i--) {
                const j = Math.floor(next() * (i + 1));
                [copy[i], copy[j]] = [copy[j], copy[i]];
            }
            return copy;
        },
    };
}

/** @typedef {ReturnType<typeof createRandom>} Random */
