import express from "express";

import placesRoutes from "./routes/placesRoutes";

const app = express();

app.use("/api/places", placesRoutes);

app.listen(5000);
