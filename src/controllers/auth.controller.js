import { Op } from "sequelize";
import User from "../models/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { uploadSingleImage } from "../utils/uploadImage";
import { existsSync, unlink } from "fs";

async function register(req, res) {
  try {
    const { username, email, phone, password, confirmPassword } = req.body;

    if(!(password === confirmPassword)) {
      return res.status(400).json({
        status: 400,
        message: "Password and Confirm Password is not same",
      });
    }

    const passwordRegexValidate = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if(!passwordRegexValidate.test(password)) {
      return res.status(400).json({
        status: 400,
        message: "Password must be at least 8 characters long and contain at least one uppercase letter and one number",
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
      });
    }

    return res.status(500).json({
      status: 500,
      message: `Internal server error`,
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
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 401,
        message: "Invalid password",
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
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 400,
        message: "Password and confirm password not match",
      });
    }

    const passwordRegexValidate = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegexValidate.test(password)) {
      return res.status(400).json({
        status: 400,
        message:
          "Password must be at least 8 characters long and contain at least one uppercase letter and one number",
      });
    }

    // Get user id from token jwt
    const id = req.id;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    user.password = hashPassword;
    await user.save();

    return res.status(200).json({
      status: 200,
      message: "Password reset success",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
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
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 400,
        message: "Password and confirm password do not match",
      });
    }

    // Get User ID from JWT
    const id = req.id;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    // Compare the current password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 401,
        message: "Invalid current password",
      });
    }

    const passwordRegexValidate = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegexValidate.test(password)) {
      return res.status(400).json({
        status: 400,
        message:
          "Password must be at least 8 characters long and contain at least one uppercase letter and one number",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      status: 200,
      message: "Password change success",
    });
   
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
}

async function changeUsername(req, res) {
  try {
    const { currentUsername, newUsername } = req.body;

    // Get user id from jwt token
    const id = req.id; 

    if (!currentUsername || !newUsername) {
      return res.status(400).json({
        status: 400,
        message: "Please provide current username and new username",
      });
    }

    // Find the user by ID
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    if (user.username !== currentUsername) {
      return res.status(400).json({
        status: 400,
        message: "Invalid current username",
      });
    }

    user.username = newUsername;
    await user.save();

    return res.status(200).json({
      status: 200,
      message: "Username change success",
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
      });
    }

    return res.status(500).json({
      status: 500,
      message: `Internal server error`,
    });
  }
}

async function changePhone(req, res) {
  try {
    const { currentPhone, newPhone } = req.body;

    // Get User ID from JWT token
    const id = req.id; 

    if (!currentPhone || !newPhone) {
      return res.status(400).json({
        status: 400,
        message: "Please provide current phone and new phone",
      });
    }

    // Find the user by ID
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    if (user.phone !== currentPhone) {
      return res.status(400).json({
        status: 400,
        message: "Invalid current phone number",
      });
    }

    user.phone = newPhone;
    await user.save();

    return res.status(200).json({
      status: 200,
      message: "Phone number change success",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
}

async function changeEmail(req, res) {
  try {
    const { currentEmail, newEmail } = req.body;
    
    // Get user id from JWT Token
    const id = req.id;

    if (!currentEmail || !newEmail) {
      return res.status(400).json({
        status: 400,
        message: "Please provide current email and new email",
      });
    }

    // Find the user by ID
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    if (user.email !== currentEmail) {
      return res.status(400).json({
        status: 400,
        message: "Invalid current email",
      });
    }

    user.email = newEmail;
    await user.save();

    return res.status(200).json({
      status: 200,
      message: "Email change success",
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
      });
    }

    return res.status(500).json({
      status: 500,
      message: `Internal server error`,
    });
  }
}

async function changePhotoProfile(req, res) {
  const upload = uploadSingleImage("file");

  upload(req, res, async(err) => {
    if (err) {
      return res.status(400).json({ status: 400, message: "File upload failed" });
    }

    if (!req.file) {
      return res.status(400).json({
        status: 400,
        message: "Please provide a file",
      });
    }
    
    try {
      const id = req.id;
      
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User not found",
        });
      }

      if (user.photo_profile) {
        if (existsSync('Public/' + user.photo_profile)) {
          unlink('Public/' + user.photo_profile, (err) => {
            if (err) throw err;
          });
        }
      }

      user.photo_profile = req.file.filename;

      await user.save();

      return res.status(200).json({
        status: 200,
        message: "Photo profile change successful",
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        status: 500,
        message: `Internal server error`,
      });
    }
  })
}

export default { register, verifyAccount, login, keepLogin, forgotPassword, resetPassword, changePassword, changeUsername, changePhone, changeEmail, changePhotoProfile};
