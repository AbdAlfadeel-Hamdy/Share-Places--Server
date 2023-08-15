import { Handler } from "express";
import { v5 as uuidv5 } from "uuid";
import HttpError from "../models/httpError";
import { validationResult } from "express-validator/src/validation-result";

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Gonz",
    email: "test@test.com",
    password: "test1234",
  },
];

export const getAllUsers: Handler = (req, res, next) => {
  const users = DUMMY_USERS;
  res.status(200).json({
    users,
  });
};

export const signup: Handler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );

  const { name, email, password } = req.body;

  if (DUMMY_USERS.find((user) => user.email === email))
    return next(new HttpError("There us a user with that email", 422));

  const createdUser = {
    id: uuidv5("https://www.w3.org/", uuidv5.URL),
    name,
    email,
    password,
  };
  DUMMY_USERS.push(createdUser);

  res.status(201).json({ user: createdUser });
};

export const login: Handler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );

  const { email, password } = req.body;

  const identifiedUser = DUMMY_USERS.find((user) => user.email === email);
  if (!identifiedUser || identifiedUser.password !== password)
    return next(new HttpError("Could not log user in", 401));

  res.status(200).json({ message: "Logged user in!" });
};
