import { DataTypes } from "sequelize";
import database from "../db";
import Blog from "./blog.model";
import User from "./user.model";

const Like = database.define("Like", {
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
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
});

Like.belongsTo(User, { foreignKey: "UserId", as: "User" });
User.hasMany(Like, { foreignKey: "UserId" });

export default Like;