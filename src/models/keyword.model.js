import { DataTypes } from "sequelize";
import database from "../db";

const Keyword = database.define("keyword", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Keyword;