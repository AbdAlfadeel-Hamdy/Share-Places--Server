"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = exports.getAllUsers = void 0;
const httpError_1 = __importDefault(require("../models/httpError"));
const validation_result_1 = require("express-validator/src/validation-result");
const userModel_1 = __importDefault(require("../models/userModel"));
const getAllUsers = async (req, res, next) => {
    let users;
    try {
        users = await userModel_1.default.find().select("-password");
    }
    catch (err) {
        return next(new httpError_1.default("Fetching users failed, please try again later.", 500));
    }
    res.json({
        users: users.map((user) => user.toObject({ getters: true })),
    });
};
exports.getAllUsers = getAllUsers;
const signup = async (req, res, next) => {
    var _a;
    const errors = (0, validation_result_1.validationResult)(req);
    if (!errors.isEmpty())
        return next(new httpError_1.default("Invalid inputs passed, please check your data.", 422));
    const { name, email, password } = req.body;
    try {
        const existingUser = await userModel_1.default.findOne({ email });
        if (existingUser)
            return next(new httpError_1.default("There is a user with that email, try with a different one.", 422));
    }
    catch (err) {
        return next(new httpError_1.default("Signing up failed, please try again later.", 500));
    }
    let createdUser;
    try {
        createdUser = await userModel_1.default.create({
            name,
            email,
            password,
            image: (_a = req.file) === null || _a === void 0 ? void 0 : _a.path,
            places: [],
        });
    }
    catch (err) {
        return new httpError_1.default("Signing up failed, please try again later.", 500);
    }
    res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};
exports.signup = signup;
const login = async (req, res, next) => {
    const errors = (0, validation_result_1.validationResult)(req);
    if (!errors.isEmpty())
        return next(new httpError_1.default("Invalid inputs passed, please check your data.", 422));
    const { email, password } = req.body;
    let existingUser;
    try {
        existingUser = await userModel_1.default.findOne({ email });
    }
    catch (err) {
        return next(new httpError_1.default("Logging in failed, please try again later.", 500));
    }
    if (!existingUser || existingUser.password !== password)
        return next(new httpError_1.default("Invalid credentials, could not log you in.", 401));
    res.status(200).json({
        message: "Logged user in!",
        user: existingUser.toObject({ getters: true }),
    });
};
exports.login = login;
