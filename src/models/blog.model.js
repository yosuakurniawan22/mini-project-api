import { DataTypes } from "sequelize";
import database from "../db";
import Category from "./category.model";
import Keyword from "./keyword.model";

const Blog = database.define("blog", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  imageURL: {
    type: DataTypes.STRING,
  },
  content: {
    type: DataTypes.TEXT,
  },
  videoURL: {
    type: DataTypes.STRING,
  },
  country: {
    type: DataTypes.STRING,
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
  },
  createdAt: {
    type: DataTypes.DATE,
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
  CategoryId: {
    type: DataTypes.INTEGER,
  },
  total_fav: {
    type: DataTypes.INTEGER,
  },
},);

Blog.belongsTo(Category);
Category.hasMany(Blog);

Blog.belongsToMany(Keyword, { through: "BlogKeyword", foreignKey: "BlogId" });
Keyword.belongsToMany(Blog, { through: "BlogKeyword", foreignKey: "KeywordId" });


export default Blog;