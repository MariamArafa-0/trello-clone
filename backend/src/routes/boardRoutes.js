
import express from "express";
import { createBoard, getMyBoards,getBoardById,updateBoard,addBoardMember,removeBoardMember,toggleStarBoard,deleteBoard } from "../controllers/boardController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createBoard);
router.get("/", authMiddleware, getMyBoards);
router.get("/:id", authMiddleware, getBoardById);
router.put("/:id", authMiddleware, updateBoard);
router.post("/:id/members", authMiddleware, addBoardMember);
router.delete("/:id/members/:userId",authMiddleware,removeBoardMember);
router.patch("/:id/star", authMiddleware, toggleStarBoard);
router.delete("/:id", authMiddleware, deleteBoard);
export default router;
