"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const httpError_1 = __importDefault(require("../models/httpError"));
const MIME_TYPE_MAP = {
    "image/jpg": "jpg",
    "image/png": "png",
    "image/jpeg": "jpeg",
};
const fileUpload = (0, multer_1.default)({
    limits: {
        fieldSize: 500 * 1000,
    },
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            const dest = "uploads/images";
            cb(null, dest);
        },
        filename: (req, file, cb) => {
            const extension = MIME_TYPE_MAP[file.mimetype];
            const fileName = `${(0, uuid_1.v4)()}.${extension}`;
            cb(null, fileName);
        },
    }),
    fileFilter: (req, file, cb) => {
        if (!MIME_TYPE_MAP[file.mimetype])
            return cb(new httpError_1.default("Invalid mime type!", 400));
        cb(null, true);
    },
});
exports.default = fileUpload;
