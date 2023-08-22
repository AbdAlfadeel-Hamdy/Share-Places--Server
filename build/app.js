"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const placesRoutes_1 = __importDefault(require("./routes/placesRoutes"));
const usersRoutes_1 = __importDefault(require("./routes/usersRoutes"));
const httpError_1 = __importDefault(require("./models/httpError"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config({ path: "./config.env" });
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.use("/uploads/images", express_1.default.static(path_1.default.join("uploads", "images")));
app.use("/api/places", placesRoutes_1.default);
app.use("/api/users", usersRoutes_1.default);
app.use((req, res, next) => {
    next(new httpError_1.default("Could not find this route.", 404));
});
app.use((err, req, res, next) => {
    if (res.headersSent)
        return next(err);
    if (req.file)
        fs_1.default.unlink(req.file.path, (err) => {
            var _a, _b;
            console.log((_a = req.file) === null || _a === void 0 ? void 0 : _a.path);
            if (err)
                return console.log(err);
            console.log(`${(_b = req.file) === null || _b === void 0 ? void 0 : _b.path} was deleted.`);
        });
    res
        .status(err.statusCode || 500)
        .json({ message: err.message || "Something went wrong." });
});
mongoose_1.default
    .connect("mongodb+srv://abdel-fadeel:6KC8dcqKfmtACaWG@cluster0.5413src.mongodb.net/places?retryWrites=true&w=majority")
    .then(() => {
    app.listen(5000);
    console.log("Connected to the database successfully.");
})
    .catch((err) => console.log(err));
