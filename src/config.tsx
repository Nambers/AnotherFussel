import type { ExifData } from "./types.ts";

export const title = "Eritque arcus Photos";
// Photo file filter extensions
export const photo_exts = /\.(jpg|jpeg|png|webp|tif|tiff)$/i;

// exifr options
export const exifr_options = {
    exif: true,
    tiff: true,
    xmp: true,
    mergeOutput: true
};

// NOTE: kept byte-identical in src/config.tsx and src/content.config.ts.
// The loaders use content.config.ts's copy; editing only config.tsx changes nothing.
// "latitude"/"longitude" are exifr's decimal-degree values, already signed by the
// GPS*Ref tags. The raw GPSLatitude/GPSLongitude tags are unusable here: they are
// DMS arrays like [35, 40, 30.12] whose hemisphere lives in GPSLatitudeRef, which
// this allowlist drops.
const keys = new Set(["DateTimeOriginal", "Make", "Model", "LensModel", "FocalLength", "FNumber", "ExposureTime", "ISO",
    "Software", "Artist", "ImageDescription", "Copyright",
    "City", "Country", "State", "latitude", "longitude", "GPSAltitude"]);

// exifr filter
export const exifr_filter = (exif: ExifData): ExifData => {
    return Object.fromEntries(Object.entries(exif).filter(([key,]) => keys.has(key))) as ExifData;
}

export const gears = {
    cameras:
        [
            {
                Brand: "Sony",
                Type: "a6000",
                Focus: "DSLR",
                Date: "Aug 2022 - May 2023",
                Gone: true,
            },
            {
                Brand: "Sony",
                Type: "a7M II",
                Focus: "DSLR",
                Date: "May 2023 - Aug 2025",
                Gone: true,
            },
            {
                Brand: "Pentax",
                Type: "SP II",
                Focus: "SLR Film",
                Date: "Feb 2025 - Present",
            },
            {
                Brand: "Sony",
                Type: "a7R III",
                Focus: "DSLR",
                Date: "Aug 2025 - Present",
            },
        ],
    lens:
        [
            {
                Brand: "Asahi Opt. Co.",
                Type: "Super-Takumar",
                Focus: "1:1.8/55",
                Date: "May 2023 - Aug 2025",
                Gone: true,
            },
            {
                Brand: "Schneider-Kreuznach",
                Type: "Curtagon",
                Focus: "1:4/28",
                Date: "Sep 2023 - Present",
                SerialNum: "11 799 902",
                ProducedDate: "Jul 1970 - Sep 1972",
            },
            {
                Brand: "Asahi Opt. Co.",
                Type: "Tele-Takumar",
                Focus: "1:5.6/200",
                Date: "Feb 2025 - Present",
                SerialNum: "3877385",
                ProducedDate: "Oct 1965 - 1969",
            },
        ]
};

// Flatten album in index page to show all photos
export const flatten_index = false;

export const sub_album_sep = " > ";


// Enable photo info page
export const enable_photo_info_page = true;
export const enable_map_page = true;
export const enable_gear_page = true;


// ---------------------------------------------------------------------------
// Map page
// ---------------------------------------------------------------------------
// The map is built from the City / State / Country strings in each photo's
// metadata, because the library carries no GPS coordinates. If a photo *does*
// have coordinates, they are used directly and these tables are skipped.

/**
 * Where a place sits on the globe. Keys are the photo's Country, State and City
 * joined by "/" with empty parts dropped, most specific first:
 *   "US/OH/Columbus" -> "US/OH" -> "US"
 * The map uses the most specific key it can find, so a photo tagged only with a
 * country still lands somewhere sensible. Anything with no match at all is
 * listed as unplaced on /map, which is the cue to add a row here.
 */
export const place_coords: Record<
    string,
    { lon: number; lat: number; label: string }
> = {
    // Countries
    CH: { lon: 8.23, lat: 46.82, label: "Switzerland" },
    CN: { lon: 104.2, lat: 35.9, label: "China" },
    DE: { lon: 10.45, lat: 51.17, label: "Germany" },
    GB: { lon: -2.0, lat: 54.0, label: "United Kingdom" },
    JP: { lon: 138.25, lat: 36.2, label: "Japan" },
    US: { lon: -98.6, lat: 39.8, label: "United States" },

    // US states
    "US/AZ": { lon: -111.7, lat: 34.3, label: "Arizona" },
    "US/CA": { lon: -119.4, lat: 37.2, label: "California" },
    "US/FL": { lon: -81.7, lat: 27.8, label: "Florida" },
    "US/IL": { lon: -89.2, lat: 40.0, label: "Illinois" },
    "US/MI": { lon: -85.0, lat: 44.3, label: "Michigan" },
    "US/OH": { lon: -82.8, lat: 40.3, label: "Ohio" },
    "US/WI": { lon: -89.7, lat: 44.5, label: "Wisconsin" },

    // Cities
    "CN/Chengdu": { lon: 104.07, lat: 30.57, label: "Chengdu" },
    "CN/Guangzhou": { lon: 113.26, lat: 23.13, label: "Guangzhou" },
    "CN/Shanghai": { lon: 121.47, lat: 31.23, label: "Shanghai" },
    "GB/London": { lon: -0.13, lat: 51.51, label: "London" },
    "US/FL/Miami": { lon: -80.19, lat: 25.76, label: "Miami" },
    "US/IL/Champaign": { lon: -88.24, lat: 40.11, label: "Champaign" },
    "US/IL/Chicago": { lon: -87.63, lat: 41.88, label: "Chicago" },
    "US/OH/Columbus": { lon: -83.0, lat: 39.96, label: "Columbus" },
};

/**
 * Fill in location for photos whose metadata is missing it, keyed by album
 * folder name. This is per-field: a photo that already knows its City keeps it
 * and only borrows the State and Country. Editing this is the cheap alternative
 * to re-tagging photos in Lightroom.
 */
export const album_locations: Record<
    string,
    { City?: string; State?: string; Country?: string }
> = {
    "CH_25'": { Country: "CH" },
    "CN_22'_GZ": { City: "Guangzhou", Country: "CN" },
    "CN_23'_Shanghai": { City: "Shanghai", Country: "CN" },
    "DE_25'": { Country: "DE" },
    "JP_24'": { Country: "JP" },
    "JP_24'_here": { Country: "JP" },
    "UK_24'": { Country: "GB" },
    "US_22'_OH": { State: "OH", Country: "US" },
    "US_23'_CA": { State: "CA", Country: "US" },
    "US_23'_OH": { State: "OH", Country: "US" },
    "US_24'_AZ": { State: "AZ", Country: "US" },
    "US_24'_FL": { City: "Miami", State: "FL", Country: "US" },
    "US_24'_IL": { State: "IL", Country: "US" },
    "US_24'_OH": { State: "OH", Country: "US" },
    "US_25'_AZ": { State: "AZ", Country: "US" },
    "US_25'_CA": { State: "CA", Country: "US" },
    "US_25'_IL": { State: "IL", Country: "US" },
    "US_25'_MI": { State: "MI", Country: "US" },
    "US_25'_WI": { State: "WI", Country: "US" },
    "US_26'_AZ": { State: "AZ", Country: "US" },
    "US_26'_IL": { State: "IL", Country: "US" },
    "portrait23": { Country: "CN" },
};

/**
 * Same idea, for one photo at a time. Keys are "<album folder>/<file name>".
 * Wins over both the photo's own metadata and the album default, so this is the
 * place to correct a wrongly tagged shot.
 */
export const photo_locations: Record<
    string,
    { City?: string; State?: string; Country?: string }
> = {};
