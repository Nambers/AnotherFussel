import type { ImageMetadata } from "astro"

export type ExifData = {
    [key: string]: string | object | number | undefined
}

export type PhotoData = {
    name: string
    exif: ExifData
    slug: string
    path: ImageMetadata,
}

export type AlbumData = {
    name: string
    photos: PhotoData[]
    slug: string
    coverFile: ImageMetadata,
    size: number,
    locDict: { [key: string]: number }
}