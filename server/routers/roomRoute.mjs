import { Router } from "express";
import { getRoomInformation, postRoom, verifyPostRoomData, verifyInRoom, deleteRoom } from "../handlers/roomHandler.mjs";
import { deleteMember, postMember, verifyPostMember } from "..//handlers/memberHandler.mjs";
import { verifyUser } from "../handlers/userHandler.mjs";
import { getLatestMessage, getMessageList } from "../handlers/messageHanlder.mjs";

const router = Router();

router.use("/room", verifyUser)

router.get("/room/:roomID", [verifyInRoom, getRoomInformation]);
router.delete("/room/:roomID", [deleteRoom]);
router.post("/room", [verifyPostRoomData, postRoom]);

router.post("/room/:roomID/member", [verifyInRoom, verifyPostMember, postMember]);

router.delete("/room/:roomID/member/:username", deleteMember);

router.use("/room/:roomID/message", verifyInRoom)
router.get("/room/:roomID/message", getMessageList);
router.get("/room/:roomID/message/latest", getLatestMessage);

export default router;