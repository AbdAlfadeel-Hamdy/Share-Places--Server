import { Handler } from "express";
import { faker } from "@faker-js/faker";

import HttpError from "../models/httpError";

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

export const getPlaceById: Handler = (req, res, next) => {
  const { placeId } = req.params;
  const place = DUMMMY_PLACES.find((place) => place.id === placeId);
  if (!place)
    return next(
      new HttpError("Could not find a place for the provided ID.", 404)
    );
  res.json({ place });
};

export const getPlaceByUserId: Handler = (req, res, next) => {
  const { userId } = req.params;
  const places = DUMMMY_PLACES.filter((place) => place.creator === userId);
  if (!places.length)
    return next(
      new HttpError("Could not find any places for the provided user ID.", 404)
    );
  res.json({ places });
};
