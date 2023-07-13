import { DataTypes } from "sequelize";
import database from "../db";
import Blog from "./blog.model";
import Keyword from "./keyword.model";

const BlogKeyword = database.define("blog_keyword", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  BlogId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Blog,
      key: "id",
    },
  },
  KeywordId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Keyword,
      key: "id",
    },
  },
});

export default BlogKeyword;