import { Router } from "express";
import {checkData, loginHandler} from "../handlers/loginHandler.mjs"

const router = Router();

router.post("/login", checkData);
router.post("/login", loginHandler);

export default router;