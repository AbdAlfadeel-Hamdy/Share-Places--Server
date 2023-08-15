"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const httpError_1 = __importDefault(require("../models/httpError"));
const getCordsForAddress = async (location) => {
    const address = await axios_1.default.get(`https://geocode.xyz/${location}?json=1&auth=824759570046973493888x52643`);
    if (!address)
        throw new httpError_1.default("Could not find location for the specified address.", 404);
    console.log(address);
};
