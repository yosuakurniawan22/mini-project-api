import Blog from "../models/blog.model";
import Category from "../models/category.model";
import Keyword from "../models/keyword.model";
import { uploadSingleImage } from "../utils/uploadImage";

async function createBlog(req, res) {
  const upload = uploadSingleImage("file");

  upload(req, res, async(err) => {
    if (err) {
      return res.status(400).json({ status: 400, message: "File upload failed", data: null });
    }

    if (!req.file) {
      return res.status(400).json({
        status: 400,
        message: "Please provide a file",
        data: null,
      });
    }

    try {
      const { title, content, country, CategoryId, keywords } = JSON.parse(req.body.data);

      const keywordNames = keywords.split(" ");

      const imageURL = req.file ? `Public/${req.file.filename}` : "";
      const videoURL = req.body.data.videoURL ? req.body.data.videoURL : "";

      const category = await Category.findByPk(CategoryId);

      if (!category) {
        return res.status(404).json({
          status: 404,
          message: "Category not found",
          data: null,
        });
      }

      const blog = await Blog.create({
        title,
        imageURL,
        videoURL,
        content,
        country,
        CategoryId,
      });

      const keywordsToAdd = [];
      for (const keywordName of keywordNames) {
        const [keyword] = await Keyword.findOrCreate({
          where: { name: keywordName },
        });
        keywordsToAdd.push(keyword);
      }

      await blog.addKeywords(keywordsToAdd);

      return res.status(201).json({
        status: 201,
        message: "Blog created successfully",
        data: blog,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: `Internal server error`,
        data: null,
      });
    }
  });
}

export default {createBlog } 