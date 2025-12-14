import type { ImageMetadata } from "astro"

export type ExifData = {
    [key: string]: string | object | number | undefined
}

export type PhotoData = {
    name: string
    exif: ExifData
    slug: string
    path: ImageMetadata,
    timestamp: number
}

export type AlbumData = {
    name: string
    photos: PhotoData[]
    slug: string
    coverFile: ImageMetadata,
    size: number,
    oldest_timestamp: number,
    locDict: { [key: string]: number }
}