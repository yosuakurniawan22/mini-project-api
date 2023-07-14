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
    unique: false,
  },
  KeywordId: { 
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Keyword,
      key: "id",
    },
    unique: false,
  },
});

Blog.belongsToMany(Keyword, {
  through: BlogKeyword,
  foreignKey: "BlogId",
  as: "Keywords",
});
Keyword.belongsToMany(Blog, {
  through: BlogKeyword,
  foreignKey: "KeywordId",
  as: "Blogs",
});

BlogKeyword.belongsTo(Blog, {
  foreignKey: "BlogId",
  as: "Blog",
});
Blog.hasMany(BlogKeyword, {
  foreignKey: "BlogId",
  as: "Blog_Keywords",
});

BlogKeyword.belongsTo(Keyword, {
  foreignKey: "KeywordId",
  as: "Keywords",
});
Keyword.hasMany(BlogKeyword, {
  foreignKey: "KeywordId",
  as: "BlogKeywords",
});

export default BlogKeyword;