import { Router } from "express";
import { getUserInformation, verifyUser, postUser, checkData, getRoomList, verifyAvatar, updateAvatar } from "../handlers/userHandler.mjs";
import multer from "multer";

const upload = multer({storage : multer.memoryStorage()})

const router = Router();

router.post("/user", checkData)
router.post("/user", postUser)

router.use("/user/:username", verifyUser);
router.get("/user/:username", getUserInformation);

router.get("/user/:username/room", getRoomList);

router.post("/user/:username/avatar", [upload.single("avatar"), verifyAvatar, updateAvatar]);
// router.get("/user/:id/room-list")

export default router;