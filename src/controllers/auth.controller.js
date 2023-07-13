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
    const header = req.headers.authorization;

    if(!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized. No token provided",
        data: null,
      });
    }

    // Get token from Bearer token
    const token = header.split(" ")[1];
  
    jwt.verify(token, process.env.SECRET_KEY, async(error, decoded) => {
      if(error) {
        return res.status(401).json({
          status: 401,
          message: "Unauthorized. Invalid token",
          data: null,
        });
      }

      const { id } = decoded;

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
    })
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
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized. No token provided",
        data: null,
      });
    }

    const token = header.split(" ")[1];

    jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          status: 401,
          message: "Unauthorized. Invalid token",
          data: null,
        });
      }

      const { id } = decoded;

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

export default { register, verifyAccount, login, keepLogin, forgotPassword};
