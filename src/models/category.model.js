import { DataTypes } from "sequelize";
import database from "../db";

const Category = database.define("category", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: false
});

export default Category;