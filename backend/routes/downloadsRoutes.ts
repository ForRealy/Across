import express from "express";
import { checkDownload, getDownloads, deleteDownload, downloadGame } from "../controllers/downloadsController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", getDownloads);
router.get("/check/:gameId", checkDownload);
router.get("/:id", downloadGame);
router.delete("/:id", deleteDownload);

export default router;
