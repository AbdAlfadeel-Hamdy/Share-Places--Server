"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = exports.getAllUsers = void 0;
const uuid_1 = require("uuid");
const httpError_1 = __importDefault(require("../models/httpError"));
const validation_result_1 = require("express-validator/src/validation-result");
const DUMMY_USERS = [
    {
        id: "u1",
        name: "Gonz",
        email: "test@test.com",
        password: "test1234",
    },
];
const getAllUsers = (req, res, next) => {
    const users = DUMMY_USERS;
    res.status(200).json({
        users,
    });
};
exports.getAllUsers = getAllUsers;
const signup = (req, res, next) => {
    const errors = (0, validation_result_1.validationResult)(req);
    if (!errors.isEmpty())
        return next(new httpError_1.default("Invalid inputs passed, please check your data.", 422));
    const { name, email, password } = req.body;
    if (DUMMY_USERS.find((user) => user.email === email))
        return next(new httpError_1.default("There us a user with that email", 422));
    const createdUser = {
        id: (0, uuid_1.v5)("https://www.w3.org/", uuid_1.v5.URL),
        name,
        email,
        password,
    };
    DUMMY_USERS.push(createdUser);
    res.status(201).json({ user: createdUser });
};
exports.signup = signup;
const login = (req, res, next) => {
    const errors = (0, validation_result_1.validationResult)(req);
    if (!errors.isEmpty())
        return next(new httpError_1.default("Invalid inputs passed, please check your data.", 422));
    const { email, password } = req.body;
    const identifiedUser = DUMMY_USERS.find((user) => user.email === email);
    if (!identifiedUser || identifiedUser.password !== password)
        return next(new httpError_1.default("Could not log user in", 401));
    res.status(200).json({ message: "Logged user in!" });
};
exports.login = login;
