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

## Note: 10-bit / HDR AVIF sources need a system libvips

Sharp's prebuilt binaries bundle libheif with the **aom** AV1 decoder, which cannot
decode some AVIF streams (e.g. 10-bit / YUV 4:4:4 HDR exports). Such images fail to
decode at build time, so Astro silently falls back to the original file
(`Sharp could not optimize image ... Sharp doesn't support this format`) and emits the
full-size source for every responsive width — i.e. no resizing/cropping.

The fix is to make Sharp use a **system libvips** whose libheif has the **dav1d**
decoder:

1. Install system libvips (it pulls in libheif + dav1d), e.g. on Arch:
   `sudo pacman -S libvips`
2. `node-addon-api` and `node-gyp` are kept in `devDependencies` so Sharp can build
   from source. On `pnpm install`, Sharp auto-detects the global libvips (when
   `>= 8.17.3`) and compiles against it instead of downloading the aom-only prebuilt.

Caveat: this ties the build to a system libvips. If libvips is missing at install
time, Sharp silently reverts to the bundled aom build and the issue returns — so any
other build machine / CI must install libvips first.

Upstream tracking: replacing the bundled aom with dav1d (decoder) + rav1e/svt-av1
(encoder) is proposed but not yet shipped — see
[lovell/sharp-libvips#97](https://github.com/lovell/sharp-libvips/issues/97). Until
that lands, all published `@img/sharp-libvips-*` prebuilts remain aom-only.

## Credits

Inspired by Chris Benninger's project [fussel](https://github.com/cbenning/fussel), then rewritten in TypeScript for Gatsby, and now migrated to Astro.

## License

MIT — see [LICENSE](LICENSE).
