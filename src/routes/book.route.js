import { Router } from "express";
import create from "../controllers/book.controller";

const router = Router();

router.post("/", create);

export default router;