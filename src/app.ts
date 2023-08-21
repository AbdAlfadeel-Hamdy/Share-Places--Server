import fs from "fs";
import path from "path";

import express, { NextFunction, Response, Request } from "express";
import mongoose from "mongoose";

import placesRoutes from "./routes/placesRoutes";
import usersRoutes from "./routes/usersRoutes";
import HttpError from "./models/httpError";
import cors from "cors";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  next(new HttpError("Could not find this route.", 404));
});

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(err);
  if (req.file)
    fs.unlink(req.file.path, (err) => {
      console.log(req.file?.path);
      if (err) return console.log(err);
      console.log(`${req.file?.path} was deleted.`);
    });
  res
    .status(err.statusCode || 500)
    .json({ message: err.message || "Something went wrong." });
});

mongoose
  .connect(
    "mongodb+srv://abdel-fadeel:6KC8dcqKfmtACaWG@cluster0.5413src.mongodb.net/places?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(5000);
    console.log("Connected to the database successfully.");
  })
  .catch((err) => console.log(err));
