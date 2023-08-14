import { Router } from "express";

import * as placesController from "../controllers/placesController";

const router = Router();

router.get("/:placeId", placesController.getPlaceById);

router.get("/user/:userId", placesController.getPlaceByUserId);

export default router;
