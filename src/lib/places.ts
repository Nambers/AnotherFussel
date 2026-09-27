/*
 * Turns photo metadata into the points the map page draws.
 *
 * The library has no GPS coordinates, only City / State / Country strings, so a
 * place name has to be resolved to a position through the tables in config.tsx.
 * Photos that *do* carry coordinates skip the tables entirely.
 */
import { place_coords, album_locations, photo_locations } from "../config.tsx";
import type { ExifData } from "../types.ts";

type Fields = { City: string; State: string; Country: string };

export type PlaceGroup = {
    key: string;
    label: string;
    /** Broader place this sits in, e.g. "Illinois, United States". */
    detail: string;
    lon: number;
    lat: number;
    count: number;
    albums: { name: string; slug: string }[];
    /** True when the position came from the photos' own coordinates. */
    exact: boolean;
    /** Earliest photo taken here, so the map can reveal places in travel order. */
    firstVisit: number;
};

export type PlaceSummary = {
    places: PlaceGroup[];
    /** Photos with no usable location at all. */
    unplaced: number;
    /**
     * Place names more specific than anything in place_coords, so they are drawn
     * at their parent's position. Adding a row to place_coords pins them properly.
     */
    imprecise: { key: string; shownAs: string; count: number }[];
    total: number;
};

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
const num = (v: unknown): number | null =>
    typeof v === "number" && Number.isFinite(v) ? v : null;

/*
 * Per-field merge: an explicit override wins, then the photo's own metadata,
 * then the album default. A photo that knows its city but not its country
 * borrows only the country.
 */
const resolveFields = (exif: ExifData, albumName: string, fileName: string): Fields => {
    const override = photo_locations[`${albumName}/${fileName}`] ?? {};
    const fallback = album_locations[albumName] ?? {};
    const pick = (f: keyof Fields): string =>
        str(override[f]) || str(exif[f]) || str(fallback[f]);
    return { City: pick("City"), State: pick("State"), Country: pick("Country") };
};

/** "US/OH/Columbus", dropping the parts the photo does not know. */
const placeKey = (f: Fields): string =>
    [f.Country, f.State, f.City].filter(Boolean).join("/");

/** Most specific entry in place_coords that covers this key, or null. */
const lookup = (key: string) => {
    const parts = key.split("/");
    for (let i = parts.length; i > 0; i--) {
        const k = parts.slice(0, i).join("/");
        const hit = place_coords[k];
        if (hit) return { ...hit, key: k };
    }
    return null;
};

/** "Illinois, United States" — the labels of every broader key, outward. */
const describe = (key: string): string => {
    const parts = key.split("/");
    const out: string[] = [];
    for (let i = parts.length - 1; i > 0; i--) {
        const parent = place_coords[parts.slice(0, i).join("/")];
        if (parent) out.push(parent.label);
    }
    return out.join(", ");
};

type PhotoInput = {
    exif: ExifData;
    album_name: string;
    name: string;
    album_slug: string;
    sort_timestamp: number;
};

export const summarisePlaces = (photos: PhotoInput[]): PlaceSummary => {
    type Acc = {
        label: string;
        detail: string;
        lon: number;
        lat: number;
        count: number;
        albums: Map<string, string>;
        coords: [number, number][];
        first: number;
    };
    const groups = new Map<string, Acc>();
    const imprecise = new Map<string, { shownAs: string; count: number }>();
    let unplaced = 0;

    for (const p of photos) {
        const fields = resolveFields(p.exif, p.album_name, p.name);
        const raw = placeKey(fields);
        const lat = num(p.exif["latitude"]);
        const lon = num(p.exif["longitude"]);
        const hit = raw ? lookup(raw) : null;

        // A photo with coordinates but no place name still deserves a point.
        const key = hit?.key ?? (lat !== null && lon !== null ? `@${lat.toFixed(2)},${lon.toFixed(2)}` : null);
        if (!key) {
            unplaced++;
            continue;
        }

        if (hit && hit.key !== raw) {
            const seen = imprecise.get(raw) ?? { shownAs: hit.label, count: 0 };
            seen.count++;
            imprecise.set(raw, seen);
        }

        let g = groups.get(key);
        if (!g) {
            g = {
                label: hit?.label ?? `${lat!.toFixed(2)}, ${lon!.toFixed(2)}`,
                detail: hit ? describe(hit.key) : "",
                lon: hit?.lon ?? lon!,
                lat: hit?.lat ?? lat!,
                count: 0,
                albums: new Map(),
                coords: [],
                first: Infinity,
            };
            groups.set(key, g);
        }
        g.count++;
        g.albums.set(p.album_slug, p.album_name);
        // 0 means the photo had no parseable date; it should not win "earliest".
        if (p.sort_timestamp > 0) g.first = Math.min(g.first, p.sort_timestamp);
        if (lat !== null && lon !== null) g.coords.push([lon, lat]);
    }

    const places: PlaceGroup[] = [...groups.entries()].map(([key, g]) => {
        // Real coordinates beat the lookup table; average them for the group.
        const exact = g.coords.length > 0;
        const lon = exact ? g.coords.reduce((a, c) => a + c[0], 0) / g.coords.length : g.lon;
        const lat = exact ? g.coords.reduce((a, c) => a + c[1], 0) / g.coords.length : g.lat;
        return {
            key,
            label: g.label,
            detail: g.detail,
            lon,
            lat,
            count: g.count,
            albums: [...g.albums.entries()]
                .map(([slug, name]) => ({ slug, name }))
                .sort((a, b) => a.name.localeCompare(b.name)),
            exact,
            firstVisit: Number.isFinite(g.first) ? g.first : 0,
        };
    });

    // Biggest first for the list; the SVG draws in reverse so small dots land on top.
    places.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

    return {
        places,
        unplaced,
        imprecise: [...imprecise.entries()]
            .map(([key, v]) => ({ key, ...v }))
            .sort((a, b) => b.count - a.count),
        total: photos.length,
    };
};
