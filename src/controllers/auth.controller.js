import { Op } from "sequelize";
import User from "../models/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

async function register(req, res) {
  try {
    const { username, email, phone, password, confirmPassword } = req.body;

    if(!(password === confirmPassword)) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Password and Confirm Password is not same",
        data: null,
        error: "Bad Request",
      });
    }

    const passwordRegexValidate = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if(!passwordRegexValidate.test(password)) {
      return res.status(400).json({
        status: 400,
        message: "Password must be at least 8 characters long and contain at least one uppercase letter and one number",
        data: null,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      phone,
      password: hashPassword,
    });

    const token = jwt.sign({
      id: user.id,
      username: user.username,
      email: user.email
    }, process.env.SECRET_KEY, { expiresIn: '1h'});

    return res.status(201).json({
      status: 201,
      message: "User success registered",
      data: user,
      token
    });
  } catch (error) {
    // Unique Column Error
    if (error.name === "SequelizeUniqueConstraintError") {
      let field = "";
      if (error.fields.email) {
        field = "email";
      } else if (error.fields.username) {
        field = "username";
      }

      return res.status(400).json({
        status: 400,
        message: `The ${field} is already exists`,
        data: null,
      });
    }

    return res.status(500).json({
      status: 500,
      message: `Internal server error`,
      data: null,
    });
  }
}

async function verifyAccount(req, res) {
  try {
    const id = req.id;

    const user = await User.findByPk(id);

    if(!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        data: null,
      });
    }

    // Update user verified_at
    user.verified_at = new Date();

    await user.save();

    return res.status(200).json({
      status: 200,
      message: "Your account success verified",
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: `Internal server error`,
      data: null,
    });
  }
}

async function login(req, res) {
  try {
    const { username, email, phone, password } = req.body;

    const user = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }, { phone }],
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        data: null,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 401,
        message: "Invalid password",
        data: null,
      });
    }

    const token = jwt.sign({ 
      id: user.id,
      username: user.username,
      email: user.email 
    }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    return res.status(200).json({
      status: 200,
      message: "Login successful",
      data: user,
      token
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: null,
    });
  }
}

async function keepLogin(req, res) {
  try {
    const id = req.id;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        data: null,
      });
    }

    const newToken = jwt.sign({
      id: user.id,
      username: user.username,
      email: user.email
    }, process.env.SECRET_KEY, { expiresIn: '1h'});


    return res.status(200).json({
      status: 200,
      message: "Keep login successful",
      data: user,
      token: newToken
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: null,
    });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email }});

    if(!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        data: null,
      });
    }

    const token = jwt.sign({
      id: user.id,
      username: user.username,
      email: user.email
    }, process.env.SECRET_KEY, { expiresIn: '1h'});

    const resetLink = `http://localhost:3005/reset-password?token=${token}`;

    return res.status(200).json({
      status: 200,
      message: "Password reset link sent",
      resetLink,
      data: token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: null,
    });
  }
}

async function resetPassword(req, res) {
  try {
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({
        status: 400,
        message: "Password or confirm password is empty",
        data: null,
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 400,
        message: "Password and confirm password not match",
        data: null,
      });
    }

    const passwordRegexValidate = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegexValidate.test(password)) {
      return res.status(400).json({
        status: 400,
        message:
          "Password must be at least 8 characters long and contain at least one uppercase letter and one number",
        data: null,
      });
    }

    // Get user id from token jwt
    const id = req.id;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        data: null,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    user.password = hashPassword;
    await user.save();

    return res.status(200).json({
      status: 200,
      message: "Password reset success",
      data: null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: null,
    });
  }
}

async function changePassword(req, res) {
  try {
    const { currentPassword, password, confirmPassword } = req.body;

    if (!currentPassword || !password || !confirmPassword) {
      return res.status(400).json({
        status: 400,
        message: "Please provide current password, password, and confirm password",
        data: null,
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 400,
        message: "Password and confirm password do not match",
        data: null,
      });
    }

    // Get User ID from JWT
    const id = req.id;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        data: null,
      });
    }

    // Compare the current password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 401,
        message: "Invalid current password",
        data: null,
      });
    }

    const passwordRegexValidate = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegexValidate.test(password)) {
      return res.status(400).json({
        status: 400,
        message:
          "Password must be at least 8 characters long and contain at least one uppercase letter and one number",
        data: null,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      status: 200,
      message: "Password change success",
      data: null,
    });
   
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: null,
    });
  }
}

export default { register, verifyAccount, login, keepLogin, forgotPassword, resetPassword, changePassword};
