import { DataTypes } from "sequelize";
import database from "../db";
import Category from "./category.model";
import Like from "./like.model";
import User from "./user.model";

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
    defaultValue: false,
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
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
    defaultValue: 0,
  },
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
});

Blog.belongsTo(Category, { foreignKey: "CategoryId", as: "Category" });
Category.hasMany(Blog, { foreignKey: "CategoryId" });

Blog.hasMany(Like, { foreignKey: "BlogId" });
Blog.belongsTo(User, { foreignKey: "UserId", as: "User"});

export default Blog;