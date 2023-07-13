import { Router } from "express";
import CategoryController from "../controllers/category.controller";
import { authenticateJWT } from "../middlewares/authenticateJwt";
import BlogController from "../controllers/blog.controller";

const router = Router();

router.get("/blog/allCategory", CategoryController.getAllCategory);
router.post("/blog", authenticateJWT, BlogController.createBlog);
router.patch("/blog/remove/:id", authenticateJWT, BlogController.deleteBlog);
router.post("/blog/like", authenticateJWT, BlogController.likeBlog);
router.delete("/blog/unlike", authenticateJWT, BlogController.unlikeBlog);


export default router;