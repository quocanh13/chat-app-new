import express from "express";
import cookieParser from "cookie-parser";

import socketServer from "./services/socket/sockerServer.mjs";

import indexRouter from "./routers/loginRoute.mjs";
// import registerRouter from "./routers/registerRoute.mjs";
import userRouter from "./routers/userRoute.mjs";
import roomRouter from "./routers/roomRoute.mjs";
import staticFilesRouter from "./routers/staticFilesRoute.mjs"
import fileRouter from "./routers/fileRoute.mjs"

const server = express();

server.use(express.static("./server/public"));
server.use(cookieParser());
server.use(express.json());

server.use((req, res, next)=>{
    console.log(req.url);
    
    next();
});
server.use([staticFilesRouter, indexRouter, userRouter, roomRouter, fileRouter]);

server.listen(80, '::', ()=>{
    console.log("Server Is Listening");
});

