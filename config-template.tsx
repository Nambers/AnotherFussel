import * as React from "react";
import type { PhotoData, AlbumData } from "./types";

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
        All works made by <strong>ME</strong> and licensed under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>
    </p>
);
