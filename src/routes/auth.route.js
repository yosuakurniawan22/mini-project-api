import { Router } from "express";
import AuthController from "../controllers/auth.controller";

const router = Router();

router.post("/auth", AuthController.register);
router.patch("/auth/verify", AuthController.verifyAccount);
router.post("/auth/login", AuthController.login);
router.post("/auth/login", AuthController.login);
router.get("/auth", AuthController.keepLogin);

export default router;