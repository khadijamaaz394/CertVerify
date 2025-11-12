import { Router } from "express";
import { register, verify } from "../controllers/certController.js";

const router = Router();
router.post("/register", register);
router.post("/verify", verify);

export default router;
