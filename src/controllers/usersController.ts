import { Handler } from "express";
import HttpError from "../models/httpError";
import { validationResult } from "express-validator/src/validation-result";

import User from "../models/userModel";

export const getAllUsers: Handler = async (req, res, next) => {
  let users;
  try {
    users = await User.find().select("-password");
  } catch (err) {
    return next(
      new HttpError("Fetching users failed, please try again later.", 500)
    );
  }
  res.json({
    users: users.map((user) => user.toObject({ getters: true })),
  });
};

export const signup: Handler = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );

  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return next(
        new HttpError(
          "There is a user with that email, try with a different one.",
          422
        )
      );
  } catch (err) {
    return next(
      new HttpError("Signing up failed, please try again later.", 500)
    );
  }

  let createdUser;
  try {
    createdUser = await User.create({
      name,
      email,
      password,
      image: "Image",
      places: [],
    });
  } catch (err) {
    return new HttpError("Signing up failed, please try again later.", 500);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

export const login: Handler = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );

  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    return next(
      new HttpError("Logging in failed, please try again later.", 500)
    );
  }

  if (!existingUser || existingUser.password !== password)
    return next(
      new HttpError("Invalid credentials, could not log you in.", 401)
    );

  res.status(200).json({ message: "Logged user in!" });
};
