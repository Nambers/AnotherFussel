/*
 * Build-time only. Turns the bundled Natural Earth topology into SVG path data
 * so the map page ships as plain inline SVG: no tiles, no map library, no
 * network requests from the browser.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);

/*
 * Equal Earth projection (Šavrič, Patterson & Jenny, 2018), the same polynomial
 * d3-geo-projection uses. Inlined so the build does not need d3. Input degrees,
 * output projection units centred on (0, 0).
 *
 * Equal-area: every country covers a share of the plate equal to its share of
 * the globe, so nothing is inflated the way Mercator inflates the far north.
 * Note x depends on latitude as well as longitude, which is what gives the map
 * its rounded outline rather than a rectangle.
 */
const A1 = 1.340264;
const A2 = -0.081106;
const A3 = 0.000893;
const A4 = 0.003796;
const M = Math.sqrt(3) / 2;

const equalEarth = (lonDeg: number, latDeg: number): [number, number] => {
    const lambda = (lonDeg * Math.PI) / 180;
    const phi = (latDeg * Math.PI) / 180;
    const l = Math.asin(M * Math.sin(phi));
    const l2 = l * l;
    const l6 = l2 * l2 * l2;
    return [
        (lambda * Math.cos(l)) / (M * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2))),
        l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2)),
    ];
};

// Projection extents, derived rather than hardcoded so the numbers stay honest.
const [X_MAX] = equalEarth(180, 0);

/*
 * Cropped top and bottom the way web maps usually are. Antarctica is enormous
 * in an equal-area projection and the far north is empty ocean; spending a fifth
 * of the figure's height on them shrinks everywhere photos actually come from.
 * Widen these if the library ever reaches further.
 */
const LAT_TOP = 84;
const LAT_BOTTOM = -56;
const [, Y_TOP] = equalEarth(0, LAT_TOP);
const [, Y_BOTTOM] = equalEarth(0, LAT_BOTTOM);

export const MAP_WIDTH = 1000;
const SCALE = MAP_WIDTH / (2 * X_MAX);
export const MAP_HEIGHT = Math.round((Y_TOP - Y_BOTTOM) * SCALE);

/** Longitude/latitude in degrees to a point in the map's viewBox coordinates. */
export const project = (lon: number, lat: number): [number, number] => {
    const [x, y] = equalEarth(lon, lat);
    return [x * SCALE + MAP_WIDTH / 2, (Y_TOP - y) * SCALE];
};

/**
 * The neatline: the boundary of the projected, cropped world. Because Equal
 * Earth narrows towards the poles this is a rounded shape, not the viewBox
 * rectangle, so it doubles as the clip for the sea and the land.
 */
export const buildOutline = (): string => {
    const pts: [number, number][] = [];
    for (let lat = LAT_BOTTOM; lat <= LAT_TOP; lat += 1) pts.push(project(-180, lat));
    pts.push(project(-180, LAT_TOP), project(180, LAT_TOP));
    for (let lat = LAT_TOP; lat >= LAT_BOTTOM; lat -= 1) pts.push(project(180, lat));
    pts.push(project(180, LAT_BOTTOM), project(-180, LAT_BOTTOM));
    const r = (n: number) => Math.round(n * 10) / 10;
    return pts.map((q, i) => `${i ? "L" : "M"}${r(q[0])} ${r(q[1])}`).join("") + "Z";
};

type Ring = [number, number][];

/*
 * Sutherland-Hodgman against one vertical edge. sign 1 keeps x <= bound,
 * sign -1 keeps x >= bound. A vertical strip is convex, so this is exact.
 */
const clipX = (pts: Ring, sign: 1 | -1, bound: number): Ring => {
    const inside = (p: [number, number]) => sign * (p[0] - bound) <= 0;
    const out: Ring = [];
    for (let i = 0; i < pts.length; i++) {
        const cur = pts[i]!;
        const prev = pts[(i + pts.length - 1) % pts.length]!;
        if (inside(cur) !== inside(prev)) {
            const t = (bound - prev[0]) / (cur[0] - prev[0]);
            out.push([bound, prev[1] + t * (cur[1] - prev[1])]);
        }
        if (inside(cur)) out.push(cur);
    }
    return out;
};

/*
 * Russia, Fiji and Antarctica each have a ring that runs across the 180th
 * meridian, stored as a jump from +180 to -180. Projected as-is, the jump draws
 * a band straight across the map. Unwrap the ring into continuous longitudes,
 * then cut it back into one piece per 360-degree strip.
 */
const splitAtAntimeridian = (ring: Ring): Ring[] => {
    let offset = 0;
    const unwrapped: Ring = [];
    for (let i = 0; i < ring.length; i++) {
        if (i > 0) {
            const step = ring[i]![0] - ring[i - 1]![0];
            if (step > 180) offset -= 360;
            else if (step < -180) offset += 360;
        }
        unwrapped.push([ring[i]![0] + offset, ring[i]![1]]);
    }

    const xs = unwrapped.map((p) => p[0]);
    const lo = Math.min(...xs);
    const hi = Math.max(...xs);
    if (lo >= -180 && hi <= 180) return [ring]; // the common case, untouched

    const pieces: Ring[] = [];
    for (let k = Math.floor((lo + 180) / 360); k <= Math.floor((hi + 180) / 360); k++) {
        const piece = clipX(clipX(unwrapped, -1, k * 360 - 180), 1, k * 360 + 180);
        if (piece.length >= 3) {
            pieces.push(piece.map(([x, y]) => [x - k * 360, y] as [number, number]));
        }
    }
    return pieces;
};
type Geom =
    | { type: "Polygon"; coordinates: Ring[] }
    | { type: "MultiPolygon"; coordinates: Ring[][] };

/*
 * Shoelace area in viewBox units. Used to drop specks that cost path bytes but
 * render as less than a pixel.
 */
const ringArea = (pts: [number, number][]): number => {
    let a = 0;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        a += pts[j]![0] * pts[i]![1] - pts[i]![0] * pts[j]![1];
    }
    return Math.abs(a / 2);
};

const MIN_RING_AREA = 1.5; // viewBox units², ~0.15% of map width squared

const ringToPath = (ring: Ring): string | null => {
    const pts = ring.map(([lon, lat]) => project(lon, lat));
    if (pts.length < 4 || ringArea(pts) < MIN_RING_AREA) return null;
    // Clipped away by the viewBox anyway — emitting it would be dead bytes.
    const ys = pts.map((p) => p[1]);
    if (Math.min(...ys) > MAP_HEIGHT || Math.max(...ys) < 0) return null;
    // Integer precision on a 1000-unit viewBox is sub-pixel at any render size,
    // and costs a third fewer bytes than one decimal place.
    const fmt = (n: number) => Math.round(n).toString();
    let d = `M${fmt(pts[0]![0])} ${fmt(pts[0]![1])}`;
    let [px, py] = [fmt(pts[0]![0]), fmt(pts[0]![1])];
    let distinct = 1;
    for (const [x, y] of pts.slice(1)) {
        const [cx, cy] = [fmt(x), fmt(y)];
        if (cx === px && cy === py) continue; // collapsed by rounding
        d += `L${cx} ${cy}`;
        [px, py] = [cx, cy];
        distinct++;
    }
    // Rounding can flatten a thin ring into a line; it would render as nothing.
    return distinct >= 3 ? `${d}Z` : null;
};

export type CountryPath = { name: string; d: string };

/** SVG path data for every country outline, ready to drop into an <svg>. */
export const buildCountryPaths = (): CountryPath[] => {
    const topo = JSON.parse(
        readFileSync(require.resolve("world-atlas/countries-110m.json"), "utf8"),
    );
    const fc = feature(topo, topo.objects.countries) as unknown as {
        features: { properties: { name: string }; geometry: Geom | null }[];
    };

    const out: CountryPath[] = [];
    for (const f of fc.features) {
        if (!f.geometry) continue;
        const polys: Ring[][] =
            f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
        const d = polys
            .flat()
            .flatMap(splitAtAntimeridian)
            .map(ringToPath)
            .filter((s): s is string => s !== null)
            .join("");
        if (d) out.push({ name: f.properties.name, d });
    }
    return out;
};

/**
 * Latitude/longitude grid. Parallels are straight in this projection (y depends
 * only on latitude) so two points do; meridians curve, so they get sampled.
 */
export const buildGraticule = (step = 30): { d: string; equator: boolean }[] => {
    const fmt = (n: number) => Math.round(n).toString();
    const poly = (pts: [number, number][]) =>
        pts.map((p, i) => `${i ? "L" : "M"}${fmt(p[0])} ${fmt(p[1])}`).join("");

    const lines: { d: string; equator: boolean }[] = [];

    for (let lon = -180; lon <= 180; lon += step) {
        const pts: [number, number][] = [];
        for (let lat = LAT_BOTTOM; lat < LAT_TOP; lat += 2) pts.push(project(lon, lat));
        pts.push(project(lon, LAT_TOP));
        lines.push({ d: poly(pts), equator: false });
    }

    const first = Math.ceil(LAT_BOTTOM / step) * step;
    for (let lat = first; lat <= LAT_TOP; lat += step) {
        lines.push({
            d: poly([project(-180, lat), project(180, lat)]),
            equator: lat === 0,
        });
    }

    return lines;
};

export type RouteSegment = { paths: { d: string; len: number }[] };

/**
 * Thread joining stops in order, drawn as poleward arcs the way flight paths
 * are. Each hop takes the shorter way round the globe, so a Guangzhou → Ohio
 * leg crosses the Pacific instead of doubling back over Eurasia; where that
 * runs off the edge of the plate the segment is cut and resumes on the far side.
 *
 * Lengths come back with the paths because the draw-on animation needs them for
 * stroke-dasharray, and measuring a path in the browser would mean shipping JS.
 */
export const buildRoute = (stops: { lon: number; lat: number }[]): RouteSegment[] => {
    const SAMPLES = 40;

    const toPath = (pts: [number, number][]) => {
        const r = (n: number) => Math.round(n);
        let d = `M${r(pts[0]![0])} ${r(pts[0]![1])}`;
        let len = 0;
        for (let i = 1; i < pts.length; i++) {
            d += `L${r(pts[i]![0])} ${r(pts[i]![1])}`;
            len += Math.hypot(pts[i]![0] - pts[i - 1]![0], pts[i]![1] - pts[i - 1]![1]);
        }
        return { d, len: Math.ceil(len) };
    };

    const segments: RouteSegment[] = [];
    for (let i = 1; i < stops.length; i++) {
        const a = stops[i - 1]!;
        const b = stops[i]!;
        // Shortest signed longitude delta: picks the short way round.
        const dLon = ((b.lon - a.lon + 540) % 360) - 180;
        const bulge = Math.min(22, Math.hypot(dLon, b.lat - a.lat) * 0.16);

        const pts: [number, number][] = [];
        for (let k = 0; k <= SAMPLES; k++) {
            const t = k / SAMPLES;
            const lon = ((a.lon + dLon * t + 540) % 360) - 180;
            const lat = a.lat + (b.lat - a.lat) * t + bulge * Math.sin(Math.PI * t);
            pts.push(project(lon, Math.min(LAT_TOP, lat)));
        }

        const paths: { d: string; len: number }[] = [];
        let run: [number, number][] = [pts[0]!];
        for (let k = 1; k < pts.length; k++) {
            // A jump of half the plate means the arc wrapped past the edge.
            if (Math.abs(pts[k]![0] - pts[k - 1]![0]) > MAP_WIDTH / 2) {
                if (run.length > 1) paths.push(toPath(run));
                run = [pts[k]!];
            } else {
                run.push(pts[k]!);
            }
        }
        if (run.length > 1) paths.push(toPath(run));
        segments.push({ paths });
    }
    return segments;
};
