import express, { NextFunction, Response, Request } from "express";

import placesRoutes from "./routes/placesRoutes";
import HttpError from "./models/httpError";

const app = express();

app.use("/api/places", placesRoutes);

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(err);
  res
    .status(err.statusCode || 500)
    .json({ message: err.message || "Something went wrong." });
});

app.listen(5000);
