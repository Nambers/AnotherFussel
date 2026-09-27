import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import fs from 'fs/promises';
import slugify from 'slugify';
import exifr from 'exifr';
import type { ExifData } from "./types.ts";


const get_date = (inp: any): number => {
    if (!inp) return 0;
    return inp instanceof Date ? inp.getTime() : 0;
}

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

export const exifr_filter = (exif: ExifData): ExifData => {
    return Object.fromEntries(Object.entries(exif).filter(([key,]) => keys.has(key))) as ExifData;
}

const photosPath = 'src/assets/images'; // Replace with your actual path

const albums = defineCollection({
    schema: ({ image }) => z.object({
        slug: z.string().min(1),
        name: z.string().min(1),
        path: z.string().min(1),
        coverFile: image(),
        size: z.number().min(0),
        sort_timestamp: z.number().min(0),
    }),
    loader: async () => {
        const entries = await fs.readdir(photosPath, { withFileTypes: true });
        const folders = entries
            .filter(entry => (entry.isDirectory() || entry.isSymbolicLink()))
            .map(folder => folder.name);

        console.log(`Found ${folders.length} albums`);

        const results = await Promise.all(folders.map(async (folderName) => {
            const folderPath = `${photosPath}/${folderName}`;
            const files = await fs.readdir(folderPath, { withFileTypes: true });

            const photoTimestamps: number[] = [];
            const photoNames: string[] = [];
            for (const fileEntry of files) {
                if (fileEntry.isFile() || fileEntry.isSymbolicLink()) {
                    const filePath = `${folderPath}/${fileEntry.name}`;
                    try {
                        const exifData: ExifData = exifr_filter(await exifr.parse(filePath, exifr_options) || {});
                        const dateTimestamp = get_date(exifData.DateTimeOriginal);
                        photoTimestamps.push(dateTimestamp);
                        photoNames.push(`../src/assets/images/${folderName}/${fileEntry.name}`);
                    } catch (error) {
                        console.error(`Error reading EXIF data from ${filePath}:`, error);
                    }
                }
            }
            const sort_timestamp = Math.max(...photoTimestamps);
            const coverPath = photoNames[photoTimestamps.indexOf(sort_timestamp)];

            console.log(`Processing album: ${folderName}, found ${photoTimestamps.length} photos, cover ${coverPath}, sort_timestamp: ${sort_timestamp}`);

            return {
                id: folderName,
                slug: slugify(folderName, { lower: true, strict: true }),
                name: folderName,
                path: folderPath,
                coverFile: coverPath,
                size: photoTimestamps.length,
                sort_timestamp: sort_timestamp,
            };
        }));

        return results;
    }
});

const photos = defineCollection({
    schema: ({ image }) => z.object({
        slug: z.string().min(1),
        name: z.string().min(1),
        album_slug: z.string().min(1),
        // Folder name as it sits on disk. album_slug is lossy (slugify strips the
        // apostrophes and case in names like "US_26'_AZ"), and the map page's
        // location overrides in config.tsx are keyed by the real folder name.
        album_name: z.string().min(1),
        exif: z.record(z.string(), z.any()),
        sort_timestamp: z.number().min(0),
        path: image()
    }),
    loader: async () => {
        console.log(`Loading photos from ${photosPath}`);
        const albumDirs = await fs.readdir(photosPath, { withFileTypes: true });

        const results = await Promise.all(albumDirs.map(
            async (dirent) => {
                if (dirent.isDirectory() || dirent.isSymbolicLink()) {
                    const albumName = dirent.name;
                    const albumPath = `${photosPath}/${albumName}`;
                    const files = await fs.readdir(albumPath, { withFileTypes: true });

                    const res = await (Promise.all(files.map(
                        async (fileEntry) => {
                            if (fileEntry.isFile() || fileEntry.isSymbolicLink()) {
                                const filePath = `${albumPath}/${fileEntry.name}`;
                                try {
                                    const exifData: ExifData = exifr_filter(await exifr.parse(filePath, exifr_options) || {});
                                    return {
                                        id: `${albumName}/${fileEntry.name}`,
                                        slug: slugify(fileEntry.name, { lower: true, strict: true }),
                                        album_slug: slugify(albumName, { lower: true, strict: true }),
                                        album_name: albumName,
                                        name: fileEntry.name,
                                        path: `../src/assets/images/${albumName}/${fileEntry.name}`,
                                        exif: exifData,
                                        sort_timestamp: get_date(exifData.DateTimeOriginal),
                                    };
                                } catch (error) {
                                    console.error(`Error reading EXIF data from ${filePath}:`, error);
                                    return {
                                        id: `${albumName}/${fileEntry.name}`,
                                        slug: slugify(fileEntry.name, { lower: true, strict: true }),
                                        album_slug: slugify(albumName, { lower: true, strict: true }),
                                        album_name: albumName,
                                        name: fileEntry.name,
                                        path: `../src/assets/images/${albumName}/${fileEntry.name}`,
                                        exif: {},
                                        sort_timestamp: 0,
                                    };
                                }
                            }
                        }
                    )).then((photos) => photos.filter((p) => p != undefined)));
                    return res.sort((a, b) => b.sort_timestamp - a.sort_timestamp);
                }
                return [];
            }
        ));

        return results.flat();
    }
});

export const collections = { albums, photos };