import { Router } from "express";
import AuthController from "../controllers/auth.controller";

const router = Router();

router.post("/auth", AuthController.register);
router.patch("/verify", AuthController.verifyAccount);

export default router;