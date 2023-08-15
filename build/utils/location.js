"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCordsForAddress = void 0;
const axios_1 = __importDefault(require("axios"));
const httpError_1 = __importDefault(require("../models/httpError"));
const API_KEY = "824759570046973493888x52643";
const getCordsForAddress = async (location) => {
    const result = await axios_1.default.get(`https://geocode.xyz/${location}?json=1&auth=${API_KEY}`);
    if (result.data.error)
        throw new httpError_1.default("Could not find location for the specified address.", 404);
    return result.data;
};
exports.getCordsForAddress = getCordsForAddress;
