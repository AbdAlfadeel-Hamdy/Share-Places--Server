import path from 'path';
import multer from 'multer';
import HttpError from '../models/httpError';
import DataParser from 'datauri/parser';

const MIME_TYPE_MAP: {
  [key: string]: string;
} = {
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/jpeg': 'jpeg',
};

const storage = multer.memoryStorage();

const fileUpload = multer({
  limits: {
    fieldSize: 500 * 1000,
  },
  storage,
  fileFilter: (req, file, cb) => {
    console.log(file.mimetype);
    if (!MIME_TYPE_MAP[file.mimetype])
      return cb(new HttpError('Invalid mime type!', 400));
    cb(null, true);
  },
});

const parser = new DataParser();

export const formatImage = (file: Express.Multer.File) => {
  const fileExtension = path.extname(file.originalname).toString();
  return parser.format(fileExtension, file.buffer).content;
};

export default fileUpload;
