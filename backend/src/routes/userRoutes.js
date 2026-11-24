import express from "express";
import {getMe} from "../controllers/userController.js";
import {authMiddleware} from "../middleware/authMiddleware.js";
import {updateMe} from "../controllers/userController.js";
import {searchUsers} from "../controllers/userController.js";

const router=express.Router();

router.get("/me",authMiddleware,getMe);
router.put("/me",authMiddleware,updateMe);
router.get("/search",authMiddleware,searchUsers);

export default router;