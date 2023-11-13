"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatImage = void 0;
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const httpError_1 = __importDefault(require("../models/httpError"));
const parser_1 = __importDefault(require("datauri/parser"));
const MIME_TYPE_MAP = {
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/jpeg': 'jpeg',
};
const storage = multer_1.default.memoryStorage();
const fileUpload = (0, multer_1.default)({
    limits: {
        fieldSize: 500 * 1000,
    },
    storage,
    fileFilter: (req, file, cb) => {
        if (!MIME_TYPE_MAP[file.mimetype])
            return cb(new httpError_1.default('Invalid mime type!', 400));
        cb(null, true);
    },
});
const parser = new parser_1.default();
const formatImage = (file) => {
    const fileExtension = path_1.default.extname(file.originalname).toString();
    return parser.format(fileExtension, file.buffer).content;
};
exports.formatImage = formatImage;
exports.default = fileUpload;
