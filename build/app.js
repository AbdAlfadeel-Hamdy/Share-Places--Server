"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import fs from 'fs';
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
// ROUTERS
const places_1 = __importDefault(require("./routes/places"));
const users_1 = __importDefault(require("./routes/users"));
const httpError_1 = __importDefault(require("./models/httpError"));
// .env files
dotenv_1.default.config();
const app = (0, express_1.default)();
// Body Parser
app.use(express_1.default.json());
// CORS
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
// Security Packages
app.use((0, helmet_1.default)());
app.use((0, express_mongo_sanitize_1.default)());
// Static Files
app.use('/uploads/images', express_1.default.static(path_1.default.join('uploads', 'images')));
// app.use(express.static(path.join('uploads', 'images')));
// ROUTERS
app.use('/api/v1/places', places_1.default);
app.use('/api/v1/users', users_1.default);
// NOT FOUND ROUTE
app.use((req, res, next) => {
    next(new httpError_1.default('Could not find this route.', 404));
});
// Global Error Handler
app.use((err, req, res, next) => {
    if (res.headersSent)
        return next(err);
    // if (req.file)
    //   fs.unlink(req.file.path, err => {
    //     if (err) return console.log(err);
    //     console.log(`${req.file?.path} was deleted.`);
    //   });
    res
        .status(err.statusCode || 500)
        .json({ message: err.message || 'Something went wrong.' });
});
// Database Connection
const port = process.env.PORT || 5000;
mongoose_1.default
    .connect(process.env.MONGO_URL)
    .then(() => {
    app.listen(port);
    console.log(`Server started listening on port ${port}`);
})
    .catch(err => console.log(err));
