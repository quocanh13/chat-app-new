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
        "chat-app" : "./server/src/chat-app/dist/index"
    },
    output : {
        filename : "chat-app.mjs",
        path : path.resolve(__dirname, "..", "server", "public", "chat-app"),
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
            template : "./server/src/chat-app/chat-app.html",
            filename : "chat-app.html",
            scriptLoading: "module"
        })
    ]
}