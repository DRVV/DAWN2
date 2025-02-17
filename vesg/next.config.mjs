/** @type {import('next').NextConfig} */
const nextConfig = {

    reactStrictMode: true,
     experimental: {
       turbo: {
         resolveAlias: {
           canvas: './empty-module.ts',
         },
       },
     },

};

// module.exports = {
//     reactStrictMode: true,
//      experimental: {
//        turbo: {
//          resolveAlias: {
//            canvas: './empty-module.ts',
//          },
//        },
//      },
//     }

export default nextConfig;
