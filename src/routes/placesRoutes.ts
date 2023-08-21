import { Router } from "express";
import { check } from "express-validator";

import * as placesController from "../controllers/placesController";
import fileUpload from "../middleware/fileUpload";

const router = Router();

router
  .route("/:placeId")
  .get(placesController.getPlaceById)
  .patch(
    [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
    placesController.updatePlace
  )
  .delete(placesController.deletePlace);

router.get("/user/:userId", placesController.getPlacesByUserId);
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
