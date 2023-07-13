import jwt from "jsonwebtoken";

export async function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized. Invalid token",
        data: null,
      });
    }

    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized. No token provided",
        data: null,
      });
    }
   
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          status: 401,
          message: "Unauthorized. Invalid token",
          data: null,
        });
      }

      req.id = decoded.id;

      next();
    });
  } catch (error) {
    return res.status(401).json({
      status: 401,
      message: "Unauthorized. Invalid token",
      data: null,
    });
  }
}