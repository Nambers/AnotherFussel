/*global console*/
/* eslint no-console: "off" */

import { CreateSchemaCustomizationArgs, SourceNodesArgs } from "gatsby";
import type { AlbumData, ExifData, PhotoData } from "./types";
import { photos_sort, photo_exts, flatten_index, enable_photo_info_page, enable_map_page, enable_gear_page, albums_sort, gears } from "./config";
import fs from 'fs';
import exifr from 'exifr';
import path from 'path';
import slugify from 'slugify';
import { exifr_options, exifr_filter, sub_album_sep } from './config';
import type { GatsbyNode } from "gatsby";

export const createSchemaCustomization = ({ actions: { createTypes } }: CreateSchemaCustomizationArgs): void => {
    const typeDefs = `
        type PhotoAlbum implements Node @dontInfer {
            sortIndex: Int!
            name: String!
            photos: [PhotoData!]!
            slug: String!
            cover: String!
            coverFile: File @link(by: "relativePath", from: "cover")
            locDict: JSON
        }
        type PhotoData {
            name: String!
            exif: JSON!
            slug: String!
            path: String!
            imageFile: File @link(by: "relativePath", from: "path")
        }
        `
    createTypes(typeDefs)
}

const get_date = (inp: any): number => {
    if (!inp) return 0;
    return inp instanceof Date ? inp.getTime() : 0;
}

const get_album_oldest_timestamp = (photos: PhotoData[]): number => {
    const timestamps = photos
        .map(p => p.timestamp)
        .filter(t => t > 0);
    return timestamps.length > 0 ? Math.min(...timestamps) : 0;
};

const build_loc = (exif: ExifData): string => {
    // city,state,country
    return String(exif["City"] ?? "") + "," + String(exif["State"] ?? "") + "," + String(exif["Country"] ?? "");
}

const parsePhotos = async (albumPath: string, displayName: string | null): Promise<AlbumData[]> => {
    const files = fs.readdirSync(albumPath);
    let locDict: { [key: string]: number } = {};

    const [photoFiles, subAlbums] = files.reduce((acc: [string[], string[]], file: string) => {
        const fullPath = `${albumPath}/${file}`;
        if (fs.statSync(fullPath).isDirectory()) {
            acc[1].push(file);
        } else if (photo_exts.test(file)) {
            acc[0].push(file);
        }
        return acc;
    }, [[], []] as [string[], string[]]);

    console.log(`Found ${photoFiles.length} photos, ${subAlbums.length} sub-albums in album ${albumPath}`);

    const processPhoto = async (photo: string): Promise<PhotoData> => {
        const photoPath = `${albumPath}/${photo}`;
        const relPhotoPath = path.relative(`${__dirname}/src/images/`, photoPath);
        console.log(`Processing photo: ${relPhotoPath}`);

        try {
            const exif = exifr_filter((await exifr.parse(photoPath, exifr_options)) || {});
            locDict[build_loc(exif)] = (locDict[build_loc(exif)] || 0) + 1;
            return {
                name: photo,
                path: relPhotoPath,
                exif,
                slug: slugify(photo, { lower: true, strict: true }),
                timestamp: get_date(exif.DateTimeOriginal)
            };
        } catch (error) {
            console.error(`Error parsing EXIF for ${photoPath}:`, error);
            return {
                name: photo,
                path: relPhotoPath,
                exif: {},
                slug: slugify(photo, { lower: true, strict: true }),
                timestamp: 0
            };
        }
    };

    const photos = await Promise.all(photoFiles.map(processPhoto));

    photos.sort(photos_sort);

    const currentAlbum: AlbumData[] = photos.length ? [{
        name: displayName!,
        photos,
        slug: slugify(path.basename(albumPath), { lower: true, strict: true }),
        cover: photos[0].path,
        oldest_timestamp: get_album_oldest_timestamp(photos),
        locDict: locDict
    }] : [];

    const subAlbumResults = await Promise.all(
        subAlbums.map((subAlbum: string) => parsePhotos(`${albumPath}/${subAlbum}`, displayName ? `${displayName}${sub_album_sep}${subAlbum}` : subAlbum))
    );

    return currentAlbum.concat(...subAlbumResults);
};

export const sourceNodes = async ({
    actions: { createNode },
    createContentDigest
}: SourceNodesArgs): Promise<void> => {
    const albumsPath = `${__dirname}/src/images/input`

    try {
        const albums = await parsePhotos(albumsPath, null);

        albums.sort(albums_sort).forEach((album, i) => {
            createNode({
                id: album.name,
                sortIndex: i,
                ...album,
                internal: {
                    type: 'PhotoAlbum',
                    contentDigest: createContentDigest(album)
                }
            });
        });
    } catch (error) {
        console.error('Error processing albums:', error)
    }
}

export const createPages = async ({ actions: { createSlice, createPage }, graphql }: any): Promise<void> => {
    createSlice({
        id: "header",
        component: path.resolve(`./src/components/header.tsx`),
    })
    createSlice({
        id: "footer",
        component: path.resolve(`./src/components/footer.tsx`),
    })
    createSlice({
        id: "navbar",
        component: path.resolve(`./src/components/navbar.tsx`),
    })
    const albums: Queries.albumsQueryQuery = (await graphql(`
        query albumsQuery {
            allPhotoAlbum {
                edges {
                    node {
                        name
                        slug
                        photos {
                            exif
                            slug
                            path
                            imageFile {
                                childImageSharp {
                                    thumbnail: gatsbyImageData(width:500, layout: CONSTRAINED, transformOptions: {fit: CONTAIN})
                                    large: gatsbyImageData(width:1600, layout: CONSTRAINED, transformOptions: {fit: CONTAIN})
                                    single: gatsbyImageData(layout: FULL_WIDTH, transformOptions: {fit: CONTAIN})
                                    original: gatsbyImageData(layout: FIXED)
                                }
                            }
                        }
                        locDict
                    }
                }
            }
        }`)).data

    const flattenedAlbum: {
        name: string;
        slug: string;
        photos: any[];
        cover: string;
    } = {
        name: "All Photos",
        slug: "flatten",
        photos: [],
        cover: ""
    }
    if (flatten_index) {
        const allPhotos = albums.allPhotoAlbum.edges.flatMap(edge => edge.node.photos);
        flattenedAlbum.photos = allPhotos;
        createPage({
            path: `/`,
            component: path.resolve(`./src/templates/album.tsx`),
            context: {
                album: flattenedAlbum,
                flatten: true
            }
        })
    } else {
        createPage({
            path: `/`,
            component: path.resolve(`./src/templates/index.tsx`),
        })
        albums.allPhotoAlbum.edges.forEach(({ node }) => {
            createPage({
                path: `/albums/${node.slug}`,
                component: path.resolve(`./src/templates/album.tsx`),
                context: {
                    album: node
                }
            })
        })
    }
    if (enable_photo_info_page)
        albums.allPhotoAlbum.edges.forEach(({ node }) => {
            node.photos.forEach((photo) => {
                createPage({
                    path: `/albums/${(flatten_index ? flattenedAlbum : node).slug}/${photo.slug}`,
                    component: path.resolve(`./src/templates/photo.tsx`),
                    context: {
                        album: (flatten_index ? flattenedAlbum : node).name,
                        album_slug: (flatten_index ? flattenedAlbum : node).slug,
                        photo
                    }
                })
            })
        })
    if (enable_map_page)
        createPage({
            path: `/map`,
            component: path.resolve(`./src/templates/map.tsx`),
            context: {
                locDicts: albums.allPhotoAlbum.edges.reduce((acc, edge) => {
                    acc[edge.node.slug] = { name: edge.node.name, locDict: edge.node.locDict as Record<string, number> };
                    return acc;
                }, {} as { [slug: string]: { name: string, locDict: Record<string, number> } })
            }
        });
    if (enable_gear_page)
        createPage({
            path: `/gear`,
            component: path.resolve(`./src/templates/gear.tsx`),
            context: { gears: gears }
        });
}

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = ({
    stage,
    loaders,
    actions
}) => {
    if (stage === "build-html" || stage === "develop-html") {
        const regex = [/node_modules\/leaflet/, /node_modules\\leaflet/];
        actions.setWebpackConfig({
            module: {
                rules: [{
                    test: regex,
                    use: loaders.null()
                }]
            }
        });
    }
};