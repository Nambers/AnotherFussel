# Another Fussel

## What is this

This work is largely based on Chris Benninger([cbenning](https://github.com/cbenning))'s project [Fuseel](https://github.com/cbenning/fussel) written in Python and React, and published under MIT License.  
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

1. install deps `npm i`.
2. `gatsby develop`.
3. `gatsby build`, then files should be listed under `public`.
