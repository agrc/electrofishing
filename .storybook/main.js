const DojoWebpackPlugin = require("dojo-webpack-plugin");

module.exports = {
  stories: [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
  webpackFinal: async (config) => {
    config.plugins.push(
      new DojoWebpackPlugin({
        loaderConfig: {
          baseUrl: 'src/',
          packages: [
            {
              name: "agrc",
              location: ".agrc"
            },
            {
              name: "app",
              location: "./app"
            },
            {
              name: "dgrid",
              location: "./dgrid"
            },
            {
              name: "dijit",
              location: ".dijit"
            },
            {
              name: "dojo",
              location: "./dojo"
            },
            {
              name: "dojox",
              location: "./dojox"
            },
            {
              name: "dstore",
              location: ".dstore"
            },
            {
              name: "handlebars",
              location: "./handlebars"
            },
            {
              name: "ijit",
              location: "./ijit"
            },
            {
              name: "papaparse",
              location: "./papaparse"
            },
            {
              name: "react-app",
              location: "./react-app"
            },
            {
              name: "bootstrap",
              location: "./bootstrap",
              main: "dist/js/bootstrap",
            },
            {
              name: "bootstrap-combobox",
              location: "./bootstrap-combobox",
            },
            {
              name: "esri-leaflet",
              location: "./esri-leaflet",
            },
            {
              name: "jquery",
              location: "./jquery/dist",
              main: "jquery",
            },
            {
              name: "leaflet",
              location: "./leaflet",
              main: "dist/leaflet-src",
            },
            {
              name: "localforage",
              location: "./localforage/dist",
              main: "localforage",
            },
            {
              name: "proj4",
              location: "./proj4/dist",
              main: "proj4",
            },
            {
              name: "proj4leaflet",
              location: "./Proj4Leaflet/src",
              main: "proj4leaflet",
            },
            {
              name: "toaster",
              location: "./toaster",
              main: "dist/Toaster",
            },
          ],
        },
      })
    );

    return config;
  },
};
