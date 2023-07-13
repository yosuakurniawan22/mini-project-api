import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import { authenticateJWT } from "../middlewares/authenticateJwt";

const router = Router();

router.post("/auth", AuthController.register);
router.patch("/auth/verify", authenticateJWT, AuthController.verifyAccount);
router.post("/auth/login", AuthController.login);
router.get("/auth", authenticateJWT, AuthController.keepLogin);
router.put("/auth/forgotPass", AuthController.forgotPassword);
router.patch("/auth/resetPass", authenticateJWT, AuthController.resetPassword);
router.patch("/auth/changePass", authenticateJWT, AuthController.changePassword);
router.patch("/auth/changeUsername", authenticateJWT, AuthController.changeUsername);
router.patch("/auth/changePhone", authenticateJWT, AuthController.changePhone);

export default router;