"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const placesController = __importStar(require("../controllers/placesController"));
const fileUpload_1 = __importDefault(require("../middleware/fileUpload"));
const checkAuth_1 = __importDefault(require("../middleware/checkAuth"));
const router = (0, express_1.Router)();
router.get("/:placeId", placesController.getPlaceById);
router.get("/user/:userId", placesController.getPlacesByUserId);
router.use(checkAuth_1.default);
router
    .route("/:placeId")
    .patch([(0, express_validator_1.check)("title").not().isEmpty(), (0, express_validator_1.check)("description").isLength({ min: 5 })], placesController.updatePlace)
    .delete(placesController.deletePlace);
router.post("/", fileUpload_1.default.single("image"), [
    (0, express_validator_1.check)("title").not().isEmpty(),
    (0, express_validator_1.check)("description").isLength({ min: 5 }),
    (0, express_validator_1.check)("address").not().isEmpty(),
], placesController.createPlace);
exports.default = router;
