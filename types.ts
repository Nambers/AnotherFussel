export type ExifData = {
    [key: string]: string | object | number | undefined
}

export type PhotoData = {
    name: string
    exif: ExifData
    slug: string
    path: string,
    timestamp: number
}

export type AlbumData = {
    name: string
    photos: PhotoData[]
    slug: string
    cover: string,
    oldest_timestamp: number,
    locDict: { [key: string]: number }
}