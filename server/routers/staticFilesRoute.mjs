import { Router } from "express";
import { getIndex, getChatApp, getRegister } from "../handlers/staticFilesHandler.mjs";

const router = Router();

router.get(["/", "/index"], getIndex);
router.get("/resgister", getRegister);
router.get("/chat-app", getChatApp);

export default router;