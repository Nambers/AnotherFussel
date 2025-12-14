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
const keys = new Set(["DateTimeOriginal", "Make", "Model", "LensModel", "FocalLength", "FNumber", "ExposureTime", "ISO",
    "Software", "Artist", "ImageDescription", "Copyright",
    "City", "Country", "GPSLatitude", "GPSLongitude", "GPSAltitude", "State"]);

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
        oldest_timestamp: z.number().min(0),
    }),
    loader: async () => {
        const entries = await fs.readdir(photosPath, { withFileTypes: true });
        const folders = entries
            .filter(entry => (entry.isDirectory() || entry.isSymbolicLink()))
            .map(folder => folder.name);

        console.log(`Found ${folders.length} albums`);

        const results = Promise.all(folders.map(async (folderName) => {
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
            const coverPath = photoNames[photoTimestamps.indexOf(Math.max(...photoTimestamps))];

            console.log(`Processing album: ${folderName}, found ${photoTimestamps.length} photos, cover ${coverPath}`);

            return {
                id: folderName,
                slug: slugify(folderName, { lower: true, strict: true }),
                name: folderName,
                path: folderPath,
                coverFile: coverPath,
                size: photoTimestamps.length,
                oldest_timestamp: Math.min(...photoTimestamps),
            };
        })).then(results => results.sort((a, b) => b.oldest_timestamp - a.oldest_timestamp));

        return await results;
    }
});

const build_loc = (exif: ExifData): string => {
    // city,state,country
    return String(exif["City"] ?? "") + "," + String(exif["State"] ?? "") + "," + String(exif["Country"] ?? "");
}

const photos = defineCollection({
    schema: ({ image }) => z.object({
        slug: z.string().min(1),
        name: z.string().min(1),
        exif: z.record(z.string(), z.any()),
        timestamp: z.number().min(0),
        path: image()
    }),
    loader: async () => {
        console.log(`Loading photos from ${photosPath}`);
        const albumDirs = await fs.readdir(photosPath, { withFileTypes: true });
        let locDict: { [key: string]: number } = {};

        const results = await Promise.all(albumDirs.map(
            async (dirent) => {
                if (dirent.isDirectory() || dirent.isSymbolicLink()) {
                    const albumName = dirent.name;
                    const albumPath = `${photosPath}/${albumName}`;
                    const files = await fs.readdir(albumPath, { withFileTypes: true });

                    return Promise.all(files.map(
                        async (fileEntry) => {
                            if (fileEntry.isFile() || fileEntry.isSymbolicLink()) {
                                const filePath = `${albumPath}/${fileEntry.name}`;
                                try {
                                    const exifData: ExifData = exifr_filter(await exifr.parse(filePath, exifr_options) || {});
                                    const locString = build_loc(exifData);
                                    locDict[locString] = (locDict[locString] || 0) + 1;
                                    return {
                                        id: `${albumName}/${fileEntry.name}`,
                                        slug: slugify(fileEntry.name, { lower: true, strict: true }),
                                        name: fileEntry.name,
                                        path: `../src/assets/images/${albumName}/${fileEntry.name}`,
                                        exif: exifData,
                                        timestamp: get_date(exifData.DateTimeOriginal),
                                        locString: locString
                                    };
                                } catch (error) {
                                    console.error(`Error reading EXIF data from ${filePath}:`, error);
                                    return {
                                        id: `${albumName}/${fileEntry.name}`,
                                        slug: slugify(fileEntry.name, { lower: true, strict: true }),
                                        name: fileEntry.name,
                                        path: `../src/assets/images/${albumName}/${fileEntry.name}`,
                                        exif: {},
                                        timestamp: 0,
                                        locString: "unknown"
                                    };
                                }
                            }
                        }
                    )).then((photos) => photos.filter((p) => p != undefined).sort((a, b) => b.timestamp - a.timestamp));
                }
                return [];
            }
        ));

        return results.flat();
    }
});

export const collections = { albums, photos };