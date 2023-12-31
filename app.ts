import dotenv from 'dotenv';
import express, { NextFunction, Response, Request } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import { v2 as cloudinary } from 'cloudinary';
// ROUTERS
import placesRouter from './routes/places';
import usersRouter from './routes/users';
import HttpError from './models/httpError';
// .env files
dotenv.config();
// Create HTTP Server
const app = express();
// Body Parser
app.use(express.json());
// CORS
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
// Security Packages
app.use(helmet());
app.use(mongoSanitize());
// Setting Up Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
// ROUTERS
app.use('/api/v1/places', placesRouter);
app.use('/api/v1/users', usersRouter);
// NOT FOUND ROUTE
app.use((req, res, next) => {
  next(new HttpError('Could not find this route.', 404));
});
// Global Error Handler
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(err);
  res
    .status(err.statusCode || 500)
    .json({ message: err.message || 'Something went wrong.' });
});
// Database Connection
const port = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URL!)
  .then(() => {
    app.listen(port);
    console.log(`Server started listening on port ${port}`);
  })
  .catch(err => console.log(err));
