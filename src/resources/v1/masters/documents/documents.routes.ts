import authenticate from "@/middlewares/authentication-validation.middleware";
import express from "express";
import { Delete, Show, uploadFile } from "./documents.controller";
import { upload } from "@/utils/helpers/multer.helper";

const router = express.Router();
router.post("/", authenticate, upload.single("file"), uploadFile);
router.get("/:id", authenticate, Show);
router.delete("/:id", authenticate, Delete);

export default router;
