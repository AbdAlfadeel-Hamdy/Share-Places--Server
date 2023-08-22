import { Router } from "express";
import { check } from "express-validator";

import * as placesController from "../controllers/placesController";
import fileUpload from "../middleware/fileUpload";
import checkAuth from "../middleware/checkAuth";

const router = Router();

router.get("/:placeId", placesController.getPlaceById);
router.get("/user/:userId", placesController.getPlacesByUserId);

router.use(checkAuth);

router
  .route("/:placeId")
  .patch(
    [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
    placesController.updatePlace
  )
  .delete(placesController.deletePlace);

router.post(
  "/",
  fileUpload.single("image"),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placesController.createPlace
);

export default router;
