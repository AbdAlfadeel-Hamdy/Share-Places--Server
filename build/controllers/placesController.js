"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlace = exports.updatePlace = exports.createPlace = exports.getPlacesByUserId = exports.getPlaceById = void 0;
const fs_1 = __importDefault(require("fs"));
const mongoose_1 = require("mongoose");
const validation_result_1 = require("express-validator/src/validation-result");
const httpError_1 = __importDefault(require("../models/httpError"));
const location_1 = require("../utils/location");
const placeModel_1 = __importDefault(require("../models/placeModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const getPlaceById = async (req, res, next) => {
    const { placeId } = req.params;
    let place;
    try {
        place = await placeModel_1.default.findById(placeId);
    }
    catch (err) {
        return next(new httpError_1.default("Something went wrong, could not find a place.", 500));
    }
    if (!place)
        return next(new httpError_1.default("Could not find a place for the provided ID.", 404));
    res.json({ place: place.toObject({ getters: true }) });
};
exports.getPlaceById = getPlaceById;
const getPlacesByUserId = async (req, res, next) => {
    const { userId } = req.params;
    let places;
    try {
        places = await placeModel_1.default.find({ creator: userId });
    }
    catch (err) {
        return next(new httpError_1.default("Fetching places failed, please try again later.", 500));
    }
    res.json({
        places: places.map((place) => place.toObject({ getters: true })),
    });
};
exports.getPlacesByUserId = getPlacesByUserId;
const createPlace = async (req, res, next) => {
    var _a, _b, _c;
    const errors = (0, validation_result_1.validationResult)(req);
    if (!errors.isEmpty())
        return next(new httpError_1.default("Invalid inputs passed, please check your data.", 422));
    const { title, description, address } = req.body;
    let coordinates;
    try {
        const data = await (0, location_1.getCordsForAddress)(address);
        coordinates = {
            lat: +data.latt,
            lng: +data.longt,
        };
    }
    catch (err) {
        return next(err);
    }
    const createdPlace = new placeModel_1.default({
        title,
        description,
        image: (_a = req.file) === null || _a === void 0 ? void 0 : _a.path,
        address,
        location: coordinates,
        creator: (_b = req.userData) === null || _b === void 0 ? void 0 : _b.userId,
    });
    let user;
    try {
        user = await userModel_1.default.findById((_c = req.userData) === null || _c === void 0 ? void 0 : _c.userId);
        if (!user)
            return next(new httpError_1.default("Could not find user with that ID.", 401));
    }
    catch (err) {
        return next(new httpError_1.default("Creating place failed, please try again.", 500));
    }
    try {
        const session = await (0, mongoose_1.startSession)();
        session.startTransaction();
        await createdPlace.save({ session });
        // @ts-ignore
        user.places.push(createdPlace);
        await user.save({ session });
        await session.commitTransaction();
    }
    catch (err) {
        return next(new httpError_1.default("Creating place failed, please try again later.", 500));
    }
    res.status(201).json({ place: createdPlace });
};
exports.createPlace = createPlace;
const updatePlace = async (req, res, next) => {
    var _a;
    const errors = (0, validation_result_1.validationResult)(req);
    if (!errors.isEmpty())
        return next(new httpError_1.default("Invalid inputs passed, please check your data.", 422));
    const { title, description } = req.body;
    const { placeId } = req.params;
    let updatedPlace;
    try {
        updatedPlace = await placeModel_1.default.findById(placeId);
        if (!updatedPlace)
            return next(new httpError_1.default("Could not find a place for that ID.", 404));
        if ((updatedPlace === null || updatedPlace === void 0 ? void 0 : updatedPlace.creator.toString()) !== ((_a = req.userData) === null || _a === void 0 ? void 0 : _a.userId))
            return next(new httpError_1.default("You are not allowed to edit this place.", 401));
        updatedPlace.title = title;
        updatedPlace.description = description;
        updatedPlace.save();
    }
    catch (err) {
        return next(new httpError_1.default("Something went wrong, could not update place.", 500));
    }
    res.status(200).json({ place: updatedPlace.toObject({ getters: true }) });
};
exports.updatePlace = updatePlace;
const deletePlace = async (req, res, next) => {
    var _a;
    const { placeId } = req.params;
    const place = await placeModel_1.default.findById(placeId).populate("creator");
    if (!place)
        return next(new httpError_1.default("Could not find a place for that ID.", 404));
    if ((place === null || place === void 0 ? void 0 : place.creator).id.toString() !== ((_a = req.userData) === null || _a === void 0 ? void 0 : _a.userId))
        return next(new httpError_1.default("You are not allowed to delete this place.", 401));
    try {
        const session = await (0, mongoose_1.startSession)();
        session.startTransaction();
        await place.deleteOne({ session });
        // @ts-ignore
        await place.creator.places.pull(place);
        // @ts-ignore
        await place.creator.save();
        await session.commitTransaction();
    }
    catch (err) {
        return next(new httpError_1.default("Something went wrong, could not delete the place.", 500));
    }
    fs_1.default.unlink(place.image, (err) => {
        if (err)
            console.log(err);
    });
    res.status(200).json({ message: "Deleted the place successfully." });
};
exports.deletePlace = deletePlace;
