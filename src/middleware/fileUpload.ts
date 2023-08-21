import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import HttpError from "../models/httpError";

const MIME_TYPE_MAP: {
  [key: string]: any;
} = {
  "image/jpg": "jpg",
  "image/png": "png",
  "image/jpeg": "jpeg",
};

const fileUpload = multer({
  limits: {
    fieldSize: 500 * 1000,
  },
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dest = "uploads/images";
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const extension = MIME_TYPE_MAP[file.mimetype];
      const fileName = `${uuidv4()}.${extension}`;
      cb(null, fileName);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!MIME_TYPE_MAP[file.mimetype])
      return cb(new HttpError("Invalid mime type!", 400));
    cb(null, true);
  },
});

export default fileUpload;
