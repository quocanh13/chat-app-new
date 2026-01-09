import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path"

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @type {import("webpack").Configuration} 
 */
export default {
    mode : "development",
    devtool: "source-map",
    entry : {
        "login" : "./server/src/login/dist/index"
    },
    output : {
        filename : "login.mjs",
        path : path.resolve(__dirname, "..", "server", "public", "login"),
        publicPath : "./",
        library : {
            type : "module"
        }
    },
    module : {
        rules : [
            {
                test : /\.css$/i,
                use : ["style-loader", "css-loader"]
            },
            {
                test: /\.(png|jpe?g|gif|svg|webp)$/i,
                type: 'asset/resource',
                generator: {
                    filename: '../images/[name][ext]'
                }
            }
        ]
    },
    devtool: 'inline-source-map',
    experiments : {
        outputModule : true
    },
    optimization : {
        minimize : false
    },
    plugins : [
        new HtmlWebpackPlugin({
            template : "./server/src/login/login.html",
            filename : "login.html",
            scriptLoading: "module"
        })
    ]
}