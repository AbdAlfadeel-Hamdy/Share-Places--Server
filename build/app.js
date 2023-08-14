"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const placesRoutes_1 = __importDefault(require("./routes/placesRoutes"));
const app = (0, express_1.default)();
app.use("/api/places", placesRoutes_1.default);
app.use((err, req, res, next) => {
    if (res.headersSent)
        return next(err);
    res
        .status(err.statusCode || 500)
        .json({ message: err.message || "Something went wrong." });
});
app.listen(5000);
