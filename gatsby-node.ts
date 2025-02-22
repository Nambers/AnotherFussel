import { CreateSchemaCustomizationArgs, SourceNodesArgs } from "gatsby";
import type { AlbumData, PhotoData } from "./types";
import { albums_sort, photos_sort, photo_exts } from "./config";
import fs from 'fs';
import exifr from 'exifr';
import path from 'path';
import slugify from 'slugify';
import { exifr_options, exifr_filter } from './config';

export const createSchemaCustomization = ({ actions: { createTypes } }: CreateSchemaCustomizationArgs): void => {
    const typeDefs = `
        type PhotoAlbum implements Node @dontInfer {
            name: String!
            photos: [PhotoData!]!
            slug: String!
            cover: String!
            coverFile: File @link(by: "relativePath", from: "cover")
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

const parsePhotos = async (albumPath: string): Promise<AlbumData[]> => {
    const files = fs.readdirSync(albumPath);

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
            const exif = await ((exifr.parse(photoPath, exifr_options) || {}).then(exifr_filter));
            return {
                name: photo,
                path: relPhotoPath,
                exif,
                slug: slugify(photo, { lower: true })
            };
        } catch (error) {
            console.error(`Error parsing EXIF for ${photoPath}:`, error);
            return {
                name: photo,
                path: relPhotoPath,
                exif: {},
                slug: slugify(photo, { lower: true })
            };
        }
    };

    const photos = await Promise.all(photoFiles.map(processPhoto));

    photos.sort(photos_sort);

    const currentAlbum: AlbumData[] = photos.length ? [{
        name: path.relative(`${__dirname}/src/images/input`, albumPath),
        photos,
        slug: slugify(path.basename(albumPath), { lower: true }),
        cover: photos[0].path
    }] : [];

    const subAlbumResults = await Promise.all(
        subAlbums.map((subAlbum: string) => parsePhotos(`${albumPath}/${subAlbum}`))
    );

    return currentAlbum.concat(...subAlbumResults);
};

exports.onCreateNode = ({ node, actions }) => {
    const { createNodeField } = actions
    if (node.internal.type === 'File') {
        createNodeField({
            node,
            name: 'slug',
            value: node.name,
        })
    }
}


export const sourceNodes = async ({
    actions: { createNode },
    createContentDigest
}: SourceNodesArgs): Promise<void> => {
    const albumsPath = `${__dirname}/src/images/input`

    try {
        (await parsePhotos(albumsPath)).sort(albums_sort).map((album: AlbumData) => {
            createNode({
                id: album.name,
                ...album,
                internal: {
                    type: 'PhotoAlbum',
                    contentDigest: createContentDigest(album)
                }
            })
        })
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
                    }
                }
            }
        }`)).data
    albums.allPhotoAlbum.edges.forEach(({ node }) => {
        createPage({
            path: `/albums/${node.slug}`,
            component: path.resolve(`./src/templates/album.tsx`),
            context: {
                album: node
            }
        })
    })
    albums.allPhotoAlbum.edges.forEach(({ node }) => {
        node.photos.forEach((photo) => {
            createPage({
                path: `/albums/${node.slug}/${photo.slug}`,
                component: path.resolve(`./src/templates/photo.tsx`),
                context: {
                    album: node.name,
                    album_slug: node.slug,
                    photo
                }
            })
        })
    })
}