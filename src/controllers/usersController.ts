import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Handler } from 'express';
import { validationResult } from 'express-validator/src/validation-result';
import { v2 as cloudinary } from 'cloudinary';
import { formatImage } from '../middleware/fileUpload';
import HttpError from '../models/httpError';
import User from '../models/userModel';

export const getAllUsers: Handler = async (req, res, next) => {
  let users;
  try {
    users = await User.find().select('-password');
  } catch (err) {
    return next(
      new HttpError('Fetching users failed, please try again later.', 500)
    );
  }
  res.json({
    users: users.map(user => user.toObject({ getters: true })),
  });
};

export const signup: Handler = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );

  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return next(
        new HttpError(
          'There is a user with that email, try with a different one.',
          422
        )
      );
  } catch (err) {
    return next(
      new HttpError('Signing up failed, please try again later.', 500)
    );
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError('Could not create user, please try again.', 500));
  }

  req.body.password = hashedPassword;
  req.body.places = [];

  if (req.file) {
    const file = formatImage(req.file);
    if (file) {
      const { secure_url } = await cloudinary.uploader.upload(file);
      req.body.image = secure_url;
    }
  }
  let createdUser;
  try {
    createdUser = await User.create(req.body);
  } catch (err) {
    return next(
      new HttpError('Signing up failed, please try again later.', 500)
    );
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_SECRET_KEY as string,
      {
        expiresIn: '1h',
      }
    );
  } catch (err) {
    return next(
      new HttpError('Signing up failed, please try again later.', 500)
    );
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token });
};

export const login: Handler = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );

  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    return next(
      new HttpError('Logging in failed, please try again later.', 500)
    );
  }

  if (!existingUser)
    return next(
      new HttpError('Invalid credentials, could not log you in.', 401)
    );

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    return next(
      new HttpError(
        'Could not log you in, please check your credentials and try again.',
        500
      )
    );
  }

  if (!isValidPassword)
    return next(
      new HttpError('Invalid credentials, could not log you in.', 401)
    );

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_SECRET_KEY as string,
      {
        expiresIn: '1h',
      }
    );
  } catch (err) {
    return next(
      new HttpError('Logging in failed, please try again later.', 500)
    );
  }

  res.status(200).json({
    userId: existingUser.id,
    email: existingUser.email,
    token,
  });
};
