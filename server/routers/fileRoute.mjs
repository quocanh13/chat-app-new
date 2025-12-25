import { Router } from "express";
import {verifyUser} from "../handlers/userHandler.mjs"
import { canAccessFile, checkPostFile, downloadFile, getFileData, getFileDataFromDB, getFileInfromation, postFile } from "../handlers/fileHandler.mjs";
import multer from "multer";

const upload = multer({storage : multer.memoryStorage()});

const router = Router();

router.use("/file", verifyUser)
router.post("/file", [upload.single("attach"), checkPostFile, postFile]);
// router.post("/file")

router.use("/file/:id/", canAccessFile);
router.get("/file/:id", getFileInfromation);

router.get("/file/:id/view", [getFileDataFromDB, getFileData]);
router.get("/file/:id/download", [getFileDataFromDB, downloadFile]);


export default router;