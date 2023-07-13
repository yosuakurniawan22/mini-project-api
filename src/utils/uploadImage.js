import multer from "multer";
import path from "path";
import fs from "fs";

function uploadSingleImage(fieldName) {
  const uploadDirectory = path.join(__dirname, '../../', 'Public/');

  if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory);
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDirectory);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 2},
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
        return cb(null, false);
      }

      return cb(null, true);
    }
  }).single(fieldName);

  return upload;
}

export { uploadSingleImage }