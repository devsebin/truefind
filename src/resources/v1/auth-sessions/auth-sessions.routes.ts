import express from "express";
import authSessionsController from "./auth-sessions.controller";

const router = express.Router();

router.post("/", authSessionsController.Store);
router.get("/", authSessionsController.Index);

export default router;
