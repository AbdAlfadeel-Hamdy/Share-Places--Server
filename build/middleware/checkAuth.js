"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const httpError_1 = __importDefault(require("../models/httpError"));
const checkAuth = (req, res, next) => {
    var _a;
    // if (req.method === "OPTIONS") return next();
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token)
            throw new httpError_1.default("Authentication failed.", 401);
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_KEY);
        req.userData = { userId: decodedToken.userId };
    }
    catch (err) {
        return next(new httpError_1.default("Authentication failed.", 401));
    }
    next();
};
exports.default = checkAuth;
