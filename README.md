# Another Fussel (Astro)

A static photography portfolio/gallery built with Astro and TypeScript.

This is the Astro rewrite of the [earlier Gatsby-based version](https://github.com/Nambers/AnotherFussel/tree/gatsby).

## Features

- 100% static output
- Album index with responsive cards and optimized image rendering
- Album detail pages with masonry layout
- Photo detail pages with:
  - full-resolution zoom modal
  - downloadable original image
  - EXIF summary (camera/lens/settings/location fields)
- Dark/light theme toggle with persistent preference

## Tech stack

- [Astro](https://astro.build/)
- TypeScript
- React islands (`@astrojs/react`)
- Bulma + react-bulma-components
- `astro:assets` + Sharp for image optimization
- `exifr` for EXIF extraction

## Project structure

Main content location:

- `src/assets/images/*` → each subfolder is treated as an album

Example:

```text
src
├── images
│   └── input
│       ├── Album1 -> /mnt/real/path/to/album1
│       └── Album2 -> /mnt/real/path/to/album2
```

Routes:

- `/` albums list
- `/albums/[slug]/` album page
- `/albums/[album_slug]/[slug]/` photo page
- `/gear/` gear page
- `/map/` map page

## Configuration

Edit [src/config.tsx](src/config.tsx):

- `title`: site/page title
- `gears`: camera/lens data used by `/gear`
- `flatten_index`: navbar label/count behavior
- `enable_map_page`, `enable_gear_page`: toggle navbar entries
- `exifr_filter`: choose which EXIF keys are shown on photo detail pages

Site-level config:

- [astro.config.mjs](astro.config.mjs) (`site`, `base`, output mode, integrations)

## Getting started

1. Install dependencies `pnpm install`
2. Add your albums, Put album folders (or symlinks) under `src/assets/images/`.
3. Start development server `pnpm dev`
4. Build static site `pnpm build`. Build output goes to `dist/` and `pnpm preview`.

## Notes on EXIF and sorting

- Album and photo sorting are based on `DateTimeOriginal` when available.
- If EXIF parsing fails for a photo, it still gets included with fallback metadata.

## Credits

Inspired by Chris Benninger's project [fussel](https://github.com/cbenning/fussel), then rewritten in TypeScript for Gatsby, and now migrated to Astro.

## License

MIT — see [LICENSE](LICENSE).
