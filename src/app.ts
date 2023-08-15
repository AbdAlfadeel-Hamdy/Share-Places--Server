import express, { NextFunction, Response, Request } from "express";

import placesRoutes from "./routes/placesRoutes";
import usersRoutes from "./routes/usersRoutes";
import HttpError from "./models/httpError";

const app = express();
app.use(express.json());

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  next(new HttpError("Could not find this route.", 404));
});

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(err);
  res
    .status(err.statusCode || 500)
    .json({ message: err.message || "Something went wrong." });
});

app.listen(5000);
