import type { GatsbyConfig } from "gatsby";

const config: GatsbyConfig = {
  // https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/#sitemetadata
  siteMetadata: {
    title: `Photos of Eritque arcus`,
    siteUrl: `https://photos.ikuyo.dev`,
    description: `A photo gallery`,
  },
  // More easily incorporate content into your pages through automatic TypeScript type generation and better GraphQL IntelliSense.
  // If you use VSCode you can also use the GraphQL plugin
  // Learn more at: https://gatsby.dev/graphql-typegen
  graphqlTypegen: {
    generateOnBuild: false,
    documentSearchPaths: [`./src/**/*.{ts,tsx}`, `./gatsby-node.ts`],
  },
  plugins: ["gatsby-plugin-image", "gatsby-transformer-sharp",
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        "name": "images",
        "path": `${__dirname}/src/images/`
      },
      __key: "images"
    },
    {
      resolve: "gatsby-plugin-sharp",
      options: {
        defaults: {
          quality: 100,
        }
      }
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        icon: `src/images/icon.png`,
      },
    },],
  flags: {
    PARALLEL_SOURCING: true,
    // PARTIAL_HYDRATION: true,
    DEV_SSR: true,
    FAST_DEV: true,
  }
};

export default config;
