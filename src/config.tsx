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

const keys = new Set(["DateTimeOriginal", "Make", "Model", "LensModel", "FocalLength", "FNumber", "ExposureTime", "ISO",
    "Software", "Artist", "ImageDescription", "Copyright",
    "City", "Country", "GPSLatitude", "GPSLongitude", "GPSAltitude", "State"]);

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
