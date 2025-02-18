export type ExifData = {
    [key: string]: string | number | undefined
}

export type PhotoData = {
    name: string
    exif: ExifData
    slug: string
    path: string
}

export type AlbumData = {
    name: string
    photos: PhotoData[]
    slug: string
    cover: string
}