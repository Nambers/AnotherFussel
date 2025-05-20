import * as React from "react";
import type { PhotoData, AlbumData, ExifData } from "./types";
import { Link } from "gatsby";
import { FaCreativeCommons, FaCreativeCommonsBy, FaCreativeCommonsSa } from "react-icons/fa6";

//#region photo settings

// Sort photos inside album
// default sort by date, ascending order
export const photos_sort = ((a: PhotoData, b: PhotoData): number => {
    return b.timestamp - a.timestamp;
});

// Photo file filter extensions
export const photo_exts = /\.(jpg|jpeg|png|webp|tif|tiff)$/i;

// exifr options
export const exifr_options = {
    exif: true,
    tiff: true,
    ifd0: false,
    xmp: true,
    mergeOutput: true
};

const keys = new Set(["DateTimeOriginal", "Make", "Model", "LensModel", "FocalLength", "FNumber", "ExposureTime", "ISO",
    "Software", "Artist", "ImageDescription", "Copyright",
    "City", "Country", "GPSLatitude", "GPSLongitude", "GPSAltitude", "State"]);

// exifr filter
export const exifr_filter = (exif: ExifData): ExifData => {
    return Object.fromEntries(Object.entries(exif).filter(([key, _]) => keys.has(key))) as ExifData;
}

// Sort album
// default sort by oldest date of photo inside, ascending order
export const albums_sort = ((a: AlbumData, b: AlbumData): number => {
    return b.oldest_timestamp - a.oldest_timestamp;
});

// Separator before sub-album name in display name
export const sub_album_sep = " > ";

//#endregion photo settings

//#region layout settings

// custom_header, you can place tracking script here
export const custom_header = (<script></script>);

// custom_footer, you can place footer text here
export const custom_footer = (
    <p>
        All works made by&nbsp;
        <Link to="/"><strong>ME</strong></Link>
        &nbsp;and licensed under&nbsp;
        <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>
        &nbsp;
        <FaCreativeCommons />&nbsp;
        <FaCreativeCommonsBy />&nbsp;
        <FaCreativeCommonsSa />
    </p>
);

//#endregion layout settings

//#region website settings

// Flatten album in index page to show all photos
export const flatten_index = false;

// you can add something for analytics here
// e.g. for umami
// export const swiper_hash_listener = () => {
//     const umami: { trackView: any } | undefined = (window as any).umami
//     umami?.trackView(window.location.pathname + window.location.hash);
// }
export const swiper_hash_listener = () => { };

export const enable_photo_info_page = true;
export const enable_map_page = false;

//#endregion website settings
