import Blog from "../models/blog.model";
import BlogKeyword from "../models/blog_keyword.model";
import Category from "../models/category.model";
import Keyword from "../models/keyword.model";
import Like from "../models/like.model";
import User from "../models/user.model";
import { uploadSingleImage } from "../utils/uploadImage";
import { Op } from "sequelize";

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
      });
    }

    try {
      const { title, content, country, CategoryId, keywords } = JSON.parse(req.body.data);

      const keywordNames = keywords.split(" ");

      const imageURL = req.file ? `Public/${req.file.filename}` : "";
      const videoURL = req.body.data.videoURL ? req.body.data.videoURL : "";

      const category = await Category.findByPk(CategoryId);
      const UserId = req.id;

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
        UserId
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
      });
    }
  });
}

async function deleteBlog(req, res) {
  const { id } = req.params;

  try {
    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({
        status: 404,
        message: "Blog not found",
        data: null,
      });
    }

    await blog.destroy();

    return res.status(200).json({
      status: 200,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
}

async function likeBlog(req, res) {
  const { BlogId } = req.body;
  const UserId = req.id;

  try {
    const blog = await Blog.findByPk(BlogId);

    if(!blog) {
      return res.status(404).json({
        status: 404,
        message: "Blog not found",
        data: null,
      });
    }

    const alreadyLiked = await Like.findOne({
      where: { UserId, BlogId },
    });

    if (alreadyLiked) {
      return res.status(400).json({
        status: 400,
        message: "Blog already liked",
        data: null,
      });
    }

    const like = await Like.create({ BlogId, UserId});

    return res.status(201).json({
      status: 201,
      message: "Blog liked",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
}

async function unlikeBlog(req, res) {
  const { BlogId } = req.body;
  const UserId = req.id;

  try {
    const likedBlog = await Like.findOne({
      where: { UserId, BlogId }
    });

    if (!likedBlog) {
      return res.status(404).json({
        status: 404,
        message: "You are not already like this blog",
      });
    }

    await likedBlog.destroy();

    return res.status(200).json({
      status: 200,
      message: "Unlike successful",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
}

async function getBlog(req, res) {
  const { id_cat, sort, page = 1, search, sortBy, size } = req.query;

  const options = {
    where: {},
    include: [
      {
        model: Category,
        as: "Category",
      },
      {
        model: User,
        as: "User",
        attributes: ["username", "photo_profile"],
      },
      {
        model: BlogKeyword,
        as: "Blog_Keywords",
        include: [
          {
            model: Keyword,
            as: "Keywords",
          },
        ],
      },
      {
        model: Like,
        include: [
          {
            model: User,
            as: "User",
            attributes: ["username"],
          },
        ],
      },
    ],
    order: [],
    offset: 0,
    limit: 10,
  };

  if (id_cat) {
    options.where.CategoryId = id_cat;
  }

  if (sort && sortBy) {
    const order = [[sortBy, sort.toUpperCase() === "DESC" ? "DESC" : "ASC"]];
    options.order.push(...order);
  }

  if (page && size) {
    const offset = (page - 1) * size;
    const limit = parseInt(size);
    options.offset = offset;
    options.limit = limit;
  }

  if (search) {
    options.where.title = { [Op.like]: `%${search}%` };
  }

  try {
    const totalRows = await Blog.count({ where: options.where });

    const totalPages = Math.ceil(totalRows / options.limit);

    if (page > totalPages) {
      return res.status(200).json({
        page: page,
        rows: totalRows,
        blogPage: totalPages,
        listLimit: options.limit,
        result: [],
      });
    }

    const blogs = await Blog.findAll(options);

    return res.status(200).json({
      page: parseInt(page),
      rows: totalRows,
      blogPage: totalPages,
      listLimit: options.limit,
      result: blogs,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
}

async function getBlogByUserLogin(req, res) {
  const { id_cat, sort, page = 1, search, sortBy, size } = req.query;

  const options = {
    where: {},
    include: [
      {
        model: Category,
        as: "Category",
      },
      {
        model: User,
        as: "User",
        attributes: ["username", "photo_profile"],
      },
      {
        model: BlogKeyword,
        as: "Blog_Keywords",
        include: [
          {
            model: Keyword,
            as: "Keywords",
          },
        ],
      },
      {
        model: Like,
        include: [
          {
            model: User,
            as: "User",
            attributes: ["username"],
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]], // Order by createdAt column in descending order
    offset: 0,
    limit: 10,
  };

  if (id_cat) {
    options.where.CategoryId = id_cat;
  }

  if (sort && sortBy) {
    const order = [[sortBy, sort.toUpperCase() === "DESC" ? "DESC" : "ASC"]];
    options.order.push(...order);
  }

  if (page && size) {
    const offset = (page - 1) * size;
    const limit = parseInt(size);
    options.offset = offset;
    options.limit = limit;
  }

  if (search) {
    options.where.title = { [Op.like]: `%${search}%` };
  }

  try {
    // Get USER Id From token
    const userId = req.id;
    options.where.UserId = userId;

    const totalRows = await Blog.count({ where: options.where });

    const totalPages = Math.ceil(totalRows / options.limit);

    if (page > totalPages) {
      return res.status(200).json({
        page: page,
        rows: totalRows,
        blogPage: totalPages,
        listLimit: options.limit,
        result: [],
      });
    }

    const blogs = await Blog.findAll(options);

    return res.status(200).json({
      page: parseInt(page),
      rows: totalRows,
      blogPage: totalPages,
      listLimit: options.limit,
      result: blogs,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
}

async function getLikedBlog(req, res) {
  const { id_cat, sort, page = 1, search, sortBy, size } = req.query;

  //User ID
  const userId = req.id;

  const options = {
    where: {},
    include: [
      {
        model: Category,
        as: "Category",
      },
      {
        model: User,
        as: "User",
        attributes: ["username", "photo_profile"],
      },
      {
        model: BlogKeyword,
        as: "Blog_Keywords",
        include: [
          {
            model: Keyword,
            as: "Keywords",
          },
        ],
      },
      {
        model: Like,
        include: [
          {
            model: User,
            as: "User",
            attributes: ["username"],
            where: { id: userId },
          },
        ],
      },
    ],
    order: [],
    offset: 0,
    limit: 10,
  };

  if (id_cat) {
    options.where.CategoryId = id_cat;
  }

  if (sort && sortBy) {
    const order = [[sortBy, sort.toUpperCase() === "DESC" ? "DESC" : "ASC"]];
    options.order.push(...order);
  }

  if (page && size) {
    const offset = (page - 1) * size;
    const limit = parseInt(size);
    options.offset = offset;
    options.limit = limit;
  }

  if (search) {
    options.where.title = { [Op.like]: `%${search}%` };
  }

  try {
    const likedBlogIds = await Like.findAll({
      attributes: ["BlogId"],
      where: { UserId: userId },
    });

    const blogIds = likedBlogIds.map((like) => like.BlogId);

    options.where.id = blogIds;

    const totalRows = await Blog.count({ where: options.where });


    const totalPages = Math.ceil(totalRows / options.limit);

    if (page > totalPages) {
      return res.status(200).json({
        page: page,
        rows: totalRows,
        blogPage: totalPages,
        listLimit: options.limit,
        result: [],
      });
    }

    const blogs = await Blog.findAll(options);

    return res.status(200).json({
      page: parseInt(page),
      rows: totalRows,
      blogPage: totalPages,
      listLimit: options.limit,
      result: blogs,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
}

async function getMostFavoriteBlog(req, res) {
  const { id_cat, sort, page = 1, search, sortBy, size } = req.query;

  const options = {
    where: {},
    include: [
      {
        model: Category,
        as: "Category",
      },
      {
        model: User,
        as: "User",
        attributes: ["username", "photo_profile"],
      },
      {
        model: BlogKeyword,
        as: "Blog_Keywords",
        include: [
          {
            model: Keyword,
            as: "Keywords",
          },
        ],
      },
    ],
    order: [],
    offset: 0,
    limit: 10,
  };

  if (id_cat) {
    options.where.CategoryId = id_cat;
  }

  if (sort && sortBy) {
    const order = [[sortBy, sort.toUpperCase() === "DESC" ? "DESC" : "ASC"]];
    options.order.push(...order);
  }

  if (page && size) {
    const offset = (page - 1) * size;
    const limit = parseInt(size);
    options.offset = offset;
    options.limit = limit;
  }

  if (search) {
    options.where.title = { [Op.like]: `%${search}%` };
  }

  try {
    options.order.push(['total_fav', 'DESC']);

    const totalRows = await Blog.count({ where: options.where });

    const totalPages = Math.ceil(totalRows / options.limit);

    if (page > totalPages) {
      return res.status(200).json({
        page: page,
        rows: totalRows,
        blogPage: totalPages,
        listLimit: options.limit,
        result: [],
      });
    }

    const blogs = await Blog.findAll(options);

    return res.status(200).json({
      page: parseInt(page),
      rows: totalRows,
      blogPage: totalPages,
      listLimit: options.limit,
      result: blogs,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
}

export default {createBlog, deleteBlog, likeBlog, unlikeBlog, getBlog, getBlogByUserLogin, getLikedBlog, getMostFavoriteBlog } 