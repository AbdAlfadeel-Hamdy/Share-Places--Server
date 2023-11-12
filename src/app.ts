import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import express, { NextFunction, Response, Request } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
// ROUTERS
import placesRouter from './routes/places';
import usersRouter from './routes/users';
import HttpError from './models/httpError';
// .env files
dotenv.config();

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
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept, Authorization'
//   );
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
//   next();
// });
// Security Packages
app.use(helmet());
app.use(mongoSanitize());
// Static Files
app.use('/uploads/images', express.static(path.join('uploads', 'images')));
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
  if (req.file)
    fs.unlink(req.file.path, err => {
      if (err) return console.log(err);
      console.log(`${req.file?.path} was deleted.`);
    });
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
