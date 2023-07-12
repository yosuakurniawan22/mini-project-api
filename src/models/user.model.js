import { DataTypes } from "sequelize";
import database from "../db";

const User = database.define("user", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  photo_profile: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

export default User;