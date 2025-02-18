import { CreateSchemaCustomizationArgs, SourceNodesArgs } from "gatsby";
import { FileNode } from 'gatsby-plugin-image/dist/src/components/hooks'

const fs = require('fs');
const exifr = require('exifr');
const path = require('path');
const slugify = require('slugify');

export type ExifData = {
    [key: string]: string | number | Date | undefined
}

export type PhotoData = {
    name: string
    path: string
    exif: ExifData
    slug: string
}

export type AlbumData = {
    name: string
    photos: PhotoData[]
    slug: string
    cover: string
}

export const createSchemaCustomization = ({ actions: { createTypes } }: CreateSchemaCustomizationArgs): void => {
    const typeDefs = `
        type PhotoAlbum implements Node {
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

export const sourceNodes = async ({
    actions: { createNode },
    createContentDigest
}: SourceNodesArgs): Promise<void> => {
    const albumsPath = `${__dirname}/src/images/input/`

    try {
        const albumDirs = fs.readdirSync(albumsPath)

        await Promise.all(
            albumDirs.map(async (albumName: string) => {
                const albumPath = `${albumsPath}${albumName}`
                const photoFiles = fs.readdirSync(albumPath)
                    // TODO more type?
                    .filter((file: string) => /\.(jpg|jpeg|png)$/i.test(file))

                const photos: PhotoData[] = await Promise.all(
                    photoFiles.map(async (photo: string): Promise<PhotoData> => {
                        const photoPath = `${albumPath}/${photo}`
                        const relPhotoPath = path.relative(`${__dirname}/src/images/`, photoPath)
                        console.log(`Processing photo: ${relPhotoPath}`)
                        try {
                            const rawExif = await exifr.parse(photoPath)
                            const exif = rawExif || {}
                            return { name: photo, path: relPhotoPath, exif, slug: slugify(photo, { lower: true }) }
                        } catch (error) {
                            console.error(`Error parsing EXIF for ${photoPath}:`, error)
                            return { name: photo, path: relPhotoPath, exif: {}, slug: slugify(photo, { lower: true }) }
                        }
                    })
                )
                // TODO expose to config
                // sort by date
                photos.sort((a, b) => {
                    const dateA = a.exif.DateTimeOriginal ? new Date(a.exif.DateTimeOriginal).getTime() : 0
                    const dateB = b.exif.DateTimeOriginal ? new Date(b.exif.DateTimeOriginal).getTime() : 0
                    return dateA - dateB
                })

                const album: AlbumData = {
                    name: albumName,
                    photos,
                    slug: slugify(albumName, { lower: true }),
                    cover: photos[photos.length - 1].path
                }

                createNode({
                    id: albumName,
                    ...album,
                    internal: {
                        type: 'PhotoAlbum',
                        contentDigest: createContentDigest(album)
                    }
                })
            })
        )
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
    const albums = await graphql(`
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
                            }
                        }
                    }
                    }
                }
            }
        }`)
    albums.data.allPhotoAlbum.edges.forEach(({ node }) => {
        createPage({
            path: `/albums/${node.slug}`,
            component: path.resolve(`./src/templates/album.tsx`),
            context: {
                album: node
            }
        })
    })
}