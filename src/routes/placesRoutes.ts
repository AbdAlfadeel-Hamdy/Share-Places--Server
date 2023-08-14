import { Router } from "express";
import { faker } from "@faker-js/faker";

const DUMMMY_PLACES = [
  {
    id: "p1",
    creator: "u1",
    description: faker.lorem.sentence(),
    location: {
      lat: faker.location.latitude(),
      lng: faker.location.longitude(),
    },
    title: faker.word.noun(),
    address: faker.location.secondaryAddress(),
  },
];

const router = Router();

router.get("/:placeId", (req, res, next) => {
  const { placeId } = req.params;
  const place = DUMMMY_PLACES.find((place) => place.id === placeId);
  res.json({ place });
});

router.get("/user/:userId", (req, res, next) => {
  const { userId } = req.params;
  const places = DUMMMY_PLACES.filter((place) => place.creator === userId);
  res.json({ places });
});

export default router;
