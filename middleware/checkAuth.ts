import { Handler, Request } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import HttpError from '../models/httpError';

export interface RequestWithUserData extends Request {
  userData?: {
    userId: string | undefined;
  };
}

interface JwtPayloadWithUserId extends JwtPayload {
  userId?: string;
}

const checkAuth: Handler = (req: RequestWithUserData, res, next) => {
  // if (req.method === "OPTIONS") return next();
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new HttpError('Authentication failed.', 401);
    const decodedToken: JwtPayloadWithUserId | string = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string
    );
    req.userData = { userId: (decodedToken as JwtPayloadWithUserId).userId };
  } catch (err) {
    return next(new HttpError('Authentication failed.', 401));
  }
  next();
};

export default checkAuth;
