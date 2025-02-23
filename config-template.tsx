import * as React from "react";
import type { PhotoData, AlbumData, ExifData } from "./types";
import { Link } from "gatsby";
import { FaCreativeCommons, FaCreativeCommonsBy, FaCreativeCommonsSa } from "react-icons/fa6";

const get_date = (inp: any): number => {
    return inp ? new Date(inp).getTime() : 0;
}

// Sort photos inside album
// default sort by date, ascending order
export const photos_sort = ((a: PhotoData, b: PhotoData): number => {
    return get_date(a.exif.DateTimeOriginal) - get_date(b.exif.DateTimeOriginal);
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
    return a.photos.reduce((max, item) => Math.max(max, get_date(item.exif.DateTimeOriginal)), 0)
        - b.photos.reduce((max, item) => Math.max(max, get_date(item.exif.DateTimeOriginal)), 0);
});

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

// Flatten album in index page to show all photos
export const flatten_index = false;

// Separator before sub-album name in display name
export const sub_album_sep = " > ";
