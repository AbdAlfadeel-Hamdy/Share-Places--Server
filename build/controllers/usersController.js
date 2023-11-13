"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = exports.getAllUsers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validation_result_1 = require("express-validator/src/validation-result");
const cloudinary_1 = require("cloudinary");
const fileUpload_1 = require("../middleware/fileUpload");
const httpError_1 = __importDefault(require("../models/httpError"));
const userModel_1 = __importDefault(require("../models/userModel"));
const getAllUsers = async (req, res, next) => {
    let users;
    try {
        users = await userModel_1.default.find().select('-password');
    }
    catch (err) {
        return next(new httpError_1.default('Fetching users failed, please try again later.', 500));
    }
    res.json({
        users: users.map(user => user.toObject({ getters: true })),
    });
};
exports.getAllUsers = getAllUsers;
const signup = async (req, res, next) => {
    const errors = (0, validation_result_1.validationResult)(req);
    if (!errors.isEmpty())
        return next(new httpError_1.default('Invalid inputs passed, please check your data.', 422));
    const { email, password } = req.body;
    try {
        const existingUser = await userModel_1.default.findOne({ email });
        if (existingUser)
            return next(new httpError_1.default('There is a user with that email, try with a different one.', 422));
    }
    catch (err) {
        return next(new httpError_1.default('Signing up failed, please try again later.', 500));
    }
    let hashedPassword;
    try {
        hashedPassword = await bcryptjs_1.default.hash(password, 12);
    }
    catch (err) {
        return next(new httpError_1.default('Could not create user, please try again.', 500));
    }
    req.body.password = hashedPassword;
    req.body.places = [];
    if (req.file) {
        const file = (0, fileUpload_1.formatImage)(req.file);
        if (file) {
            const { secure_url } = await cloudinary_1.v2.uploader.upload(file);
            req.body.image = secure_url;
        }
    }
    let createdUser;
    try {
        createdUser = await userModel_1.default.create(req.body);
    }
    catch (err) {
        return next(new httpError_1.default('Signing up failed, please try again later.', 500));
    }
    let token;
    try {
        token = jsonwebtoken_1.default.sign({ userId: createdUser.id, email: createdUser.email }, process.env.JWT_SECRET_KEY, {
            expiresIn: '1h',
        });
    }
    catch (err) {
        return next(new httpError_1.default('Signing up failed, please try again later.', 500));
    }
    res
        .status(201)
        .json({ userId: createdUser.id, email: createdUser.email, token });
};
exports.signup = signup;
const login = async (req, res, next) => {
    const errors = (0, validation_result_1.validationResult)(req);
    if (!errors.isEmpty())
        return next(new httpError_1.default('Invalid inputs passed, please check your data.', 422));
    const { email, password } = req.body;
    let existingUser;
    try {
        existingUser = await userModel_1.default.findOne({ email });
    }
    catch (err) {
        return next(new httpError_1.default('Logging in failed, please try again later.', 500));
    }
    if (!existingUser)
        return next(new httpError_1.default('Invalid credentials, could not log you in.', 401));
    let isValidPassword = false;
    try {
        isValidPassword = await bcryptjs_1.default.compare(password, existingUser.password);
    }
    catch (err) {
        return next(new httpError_1.default('Could not log you in, please check your credentials and try again.', 500));
    }
    if (!isValidPassword)
        return next(new httpError_1.default('Invalid credentials, could not log you in.', 401));
    let token;
    try {
        token = jsonwebtoken_1.default.sign({ userId: existingUser.id, email: existingUser.email }, process.env.JWT_SECRET_KEY, {
            expiresIn: '1h',
        });
    }
    catch (err) {
        return next(new httpError_1.default('Logging in failed, please try again later.', 500));
    }
    res.status(200).json({
        userId: existingUser.id,
        email: existingUser.email,
        token,
    });
};
exports.login = login;
