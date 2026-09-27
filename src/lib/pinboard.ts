/*
 * Build-time layout for the map's pins, so a crowded region stays readable.
 *
 * Two passes. Places whose pins would sit on top of each other are merged into
 * one pin (a city folds into its own state rather than getting a separate tack
 * a pixel away). Pins that are close but not stacked keep their own tack and
 * lean apart instead, as tacks crammed onto a real board do: the needle tip
 * stays on the place, only the head moves.
 */
import type { PlaceGroup } from "./places.ts";
import { project } from "./worldmap.ts";

export type PinLine = { label: string; count: number };

export type Cluster = {
    /** Every place in the pin, most photographs first. */
    members: PlaceGroup[];
    /**
     * What the pin's label lists: the places not already inside another member
     * (Columbus is inside Ohio), each counting the photos of what folded into it.
     */
    lines: PinLine[];
    count: number;
    lon: number;
    lat: number;
    /** Needle tip, in plate coordinates. */
    x: number;
    y: number;
    firstVisit: number;
};

const within = (key: string, parent: string) => key.startsWith(parent + "/");

const summarise = (members: PlaceGroup[]): Cluster => {
    members = [...members].sort((a, b) => b.count - a.count);
    const count = members.reduce((a, m) => a + m.count, 0);
    // Weighted by photographs, so the pin leans towards where most were taken.
    const lon = members.reduce((a, m) => a + m.lon * m.count, 0) / count;
    const lat = members.reduce((a, m) => a + m.lat * m.count, 0) / count;
    const [x, y] = project(lon, lat);

    const tops = members.filter((m) => !members.some((o) => within(m.key, o.key)));
    const lines = tops
        .map((t) => ({
            label: t.label,
            count: members
                .filter((m) => m === t || within(m.key, t.key))
                .reduce((a, m) => a + m.count, 0),
        }))
        .sort((a, b) => b.count - a.count);

    return {
        members,
        lines,
        count,
        lon,
        lat,
        x,
        y,
        firstVisit: Math.min(...members.map((m) => m.firstVisit)),
    };
};

/**
 * Merges pins whose needle tips are closer than their heads are wide, closest
 * pair first, until none are left. `radius` is the head size for a photo count.
 */
export const clusterPlaces = (
    places: PlaceGroup[],
    radius: (count: number) => number,
): Cluster[] => {
    let clusters = places.map((p) => summarise([p]));
    for (;;) {
        let best: [number, number] | null = null;
        let bestGap = Infinity;
        for (let i = 0; i < clusters.length; i++) {
            for (let j = i + 1; j < clusters.length; j++) {
                const a = clusters[i]!;
                const b = clusters[j]!;
                const d = Math.hypot(a.x - b.x, a.y - b.y);
                const gap = d - 0.85 * (radius(a.count) + radius(b.count));
                if (gap < 0 && gap < bestGap) {
                    bestGap = gap;
                    best = [i, j];
                }
            }
        }
        if (!best) return clusters;
        const [i, j] = best;
        const merged = summarise([...clusters[i]!.members, ...clusters[j]!.members]);
        clusters = clusters.filter((_, k) => k !== i && k !== j);
        clusters.push(merged);
    }
};

/*
 * The resting lean: head up and to the left of the tip. Each pin is also turned
 * a little off it, fixed per place, so the board looks stuck by hand rather than
 * stamped. Alternatives swing either way from there, nearest first, all the way
 * round if a crowd needs it.
 */
const REST = Math.atan2(-1.85, -0.6);
const REACH = Math.hypot(0.6, 1.85);
const WOBBLE = (18 * Math.PI) / 180;
const SWINGS = [0, -25, 25, -50, 50, -75, 75, -100, 100, -130, 130, -160, 160, 180].map(
    (d) => (d * Math.PI) / 180,
);
/** Clearance kept between neighbouring heads, as a fraction of their radii. */
const GAP = 0.45;

/** A stable value in [-1, 1] per place, so rebuilds don't reshuffle the board. */
const wobble = (key: string) => {
    let h = 2166136261;
    for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
    return ((h >>> 0) / 0xffffffff) * 2 - 1;
};

/**
 * Picks where each pin's head goes. Largest pins choose first and so keep their
 * resting lean; smaller ones swing away from heads already placed and from
 * other pins' needle tips, which a head must not cover.
 */
export const leanHeads = (
    pins: { key: string; x: number; y: number; r: number; count: number }[],
): { hx: number; hy: number }[] => {
    const heads: ({ hx: number; hy: number } | undefined)[] = pins.map(() => undefined);
    const order = pins.map((_, i) => i).sort((a, b) => pins[b]!.count - pins[a]!.count);

    for (const i of order) {
        const p = pins[i]!;
        const rest = REST + wobble(p.key) * WOBBLE;
        let best = { hx: 0, hy: 0 };
        let bestCost = Infinity;
        for (const s of SWINGS) {
            const hx = p.x + Math.cos(rest + s) * REACH * p.r;
            const hy = p.y + Math.sin(rest + s) * REACH * p.r;
            let cost = Math.abs(s) * 0.25;
            pins.forEach((o, k) => {
                if (k === i) return;
                const h = heads[k];
                const clear = (p.r + o.r) * (1 + GAP);
                if (h) cost += 10 * Math.max(0, clear - Math.hypot(hx - h.hx, hy - h.hy));
                cost += 6 * Math.max(0, p.r * (1 + GAP) - Math.hypot(hx - o.x, hy - o.y));
            });
            if (cost < bestCost) {
                bestCost = cost;
                best = { hx, hy };
            }
        }
        heads[i] = best;
    }
    return heads as { hx: number; hy: number }[];
};
