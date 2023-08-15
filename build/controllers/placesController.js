"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlace = exports.updatePlace = exports.createPlace = exports.getPlacesByUserId = exports.getPlaceById = void 0;
const faker_1 = require("@faker-js/faker");
const uuid_1 = require("uuid");
const validation_result_1 = require("express-validator/src/validation-result");
const httpError_1 = __importDefault(require("../models/httpError"));
const DUMMMY_PLACES = [
    {
        id: "p1",
        creator: "u1",
        description: faker_1.faker.lorem.sentence(),
        location: {
            lat: faker_1.faker.location.latitude(),
            lng: faker_1.faker.location.longitude(),
        },
        title: faker_1.faker.word.noun(),
        address: faker_1.faker.location.secondaryAddress(),
    },
];
const getPlaceById = (req, res, next) => {
    const { placeId } = req.params;
    const place = DUMMMY_PLACES.find((place) => place.id === placeId);
    if (!place)
        return next(new httpError_1.default("Could not find a place for the provided ID.", 404));
    res.json({ place });
};
exports.getPlaceById = getPlaceById;
const getPlacesByUserId = (req, res, next) => {
    const { userId } = req.params;
    const places = DUMMMY_PLACES.filter((place) => place.creator === userId);
    if (!places.length)
        return next(new httpError_1.default("Could not find any places for the provided user ID.", 404));
    res.json({ places });
};
exports.getPlacesByUserId = getPlacesByUserId;
const createPlace = (req, res, next) => {
    const errors = (0, validation_result_1.validationResult)(req);
    if (!errors.isEmpty())
        return next(new httpError_1.default("Invalid inputs passed, please check your data.", 422));
    const { title, address, description, creator, coordinates } = req.body;
    const createdPlace = {
        id: (0, uuid_1.v5)("https://www.w3.org/", uuid_1.v5.URL),
        title,
        address,
        description,
        creator,
        location: coordinates,
    };
    res.status(201).json({ place: createdPlace });
};
exports.createPlace = createPlace;
const updatePlace = (req, res, next) => {
    const errors = (0, validation_result_1.validationResult)(req);
    if (!errors.isEmpty())
        return next(new httpError_1.default("Invalid inputs passed, please check your data.", 422));
    const { title, description } = req.body;
    const { placeId } = req.params;
    const updatedPlace = {
        ...DUMMMY_PLACES.find((place) => place.id === placeId),
    };
    const placeIndex = DUMMMY_PLACES.findIndex((place) => place.id === placeId);
    if (updatedPlace) {
        updatedPlace.title = title;
        updatedPlace.description = description;
        DUMMMY_PLACES[placeIndex] = updatedPlace;
    }
    res.status(200).json({ place: updatedPlace });
};
exports.updatePlace = updatePlace;
const deletePlace = (req, res, next) => {
    const { placeId } = req.params;
    const placeIndex = DUMMMY_PLACES.findIndex((place) => place.id === placeId);
    DUMMMY_PLACES.splice(placeIndex, 1);
    res.status(200).json({ message: "Deleted Successfully." });
};
exports.deletePlace = deletePlace;
