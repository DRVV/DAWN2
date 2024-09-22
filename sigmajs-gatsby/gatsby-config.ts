import type { GatsbyConfig } from "gatsby"
import { resolve } from "path"
import { urlToHttpOptions } from "url";

const config: GatsbyConfig = {
  siteMetadata: {
    title: `sigmajs-gatsby`,
    siteUrl: `https://www.yourdomain.tld`,
  },
  // More easily incorporate content into your pages through automatic TypeScript type generation and better GraphQL IntelliSense.
  // If you use VSCode you can also use the GraphQL plugin
  // Learn more at: https://gatsby.dev/graphql-typegen
  graphqlTypegen: true,
  plugins: [
    "gatsby-plugin-image",
    "gatsby-plugin-sharp"
  ],
}

module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `projects`,
        path: `${__dirname}/static/content/projects`, // Path to your project JSON files,
        
      },
    },
    {
      resolve: `gatsby-transformer-json`, // Transforms JSON files into nodes
      options: {
        typeName: `ProjectsJson`
      }
    },
    "gatsby-plugin-image",
    "gatsby-plugin-sharp",
    `gatsby-transformer-sharp`,
  ],
};

export default config
