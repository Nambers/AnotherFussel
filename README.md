# Another Fussel

## Feature

- 100% Static Site & Smooth Navigation, powered by [Gatsby](https://www.gatsbyjs.com/docs/conceptual/gatsby-core-philosophy/)
- Optimized Image Processing, leverages [Gatsby's image optimization](https://www.gatsbyjs.com/docs/conceptual/using-gatsby-image/) to automatically generate responsive images, WebP format conversion, and lazy loading for enhanced user experience.
- Photo Zoom Functionality, interactive zoom feature allowing visitors to view photos at their original resolution, perfect for showcasing high-quality photography details.
- \[DISABLE-able\] Interactive Map Page, to gather geolocation of photos(need to fill City/State/Country EXIF info)
- \[DISABLE-able\] Photo Detail Info page, to show EXIF details of photos(also EXIF filter available)
- \[DISABLE-able\] Gear spec Info page

## What is this

This work is largely inspired ny Chris Benninger([cbenning](https://github.com/cbenning))'s project [Fuseel](https://github.com/cbenning/fussel) written in Python and React, published under MIT License.  
I rewrote it in TypeScript with Gatsby.  

## How to use

0. list your albums under `src/images/input`, e.g. I placed symbol links under it

```text
src
├── images
│   └── input
│       ├── Album1 -> /mnt/real/path/to/album1
│       └── Album2 -> /mnt/real/path/to/album2

```

1. install deps `npm i`/`pnpm i`.
2. copy `config-template.ts` to `config.ts`
3. `gatsby develop`.
4. `gatsby build`, then files should be listed under `public`.

## How to config

- Modify `./config.ts` and `./gatsby-config.ts`
- If you want to change avatar, overwrite `src/images/icon.png` or change `StaticImage` in `src/components/header.tsx` and fav icon setting `./gatsby-config.ts` pointing to your file.
