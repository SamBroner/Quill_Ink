/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = env => {
    const htmlTemplate = "./src/index.html";
    const plugins = [new HtmlWebpackPlugin({ template: htmlTemplate })];

    const mode = "development";

    return {
        devtool: "inline-source-map",
        entry: {
            app: "./src/app.ts",
        },
        mode,
        module: {
            rules: [{
                test: /\.tsx?$/,
                loader: "ts-loader"
            }]
        },
        output: {
            filename: "[name].[contenthash].js",
        },
        plugins,
        resolve: {
            extensions: [".ts", ".tsx", ".js"],
            alias: {
                vue$: "vue/dist/vue.esm-bundler.js",
            },
        },
        devServer: {
            open: true
        }
    };
};
