import { Handler } from "express";
import { faker } from "@faker-js/faker";
import { v5 as uuidv5 } from "uuid";
import { validationResult } from "express-validator/src/validation-result";

import HttpError from "../models/httpError";
import { getCordsForAddress } from "../utils/location";

interface Place {
  id: string;
  creator: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  title: string;
  address: string;
}

const DUMMMY_PLACES: Place[] = [
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

export const getPlacesByUserId: Handler = (req, res, next) => {
  const { userId } = req.params;
  const places = DUMMMY_PLACES.filter((place) => place.creator === userId);
  if (!places.length)
    return next(
      new HttpError("Could not find any places for the provided user ID.", 404)
    );
  res.json({ places });
};

export const createPlace: Handler = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );

  const { title, address, description, creator } = req.body;
  let coordinates;
  try {
    const data: any = await getCordsForAddress(address);
    coordinates = {
      lat: +data.latt,
      lng: +data.longt,
    };
  } catch (err) {
    return next(err);
  }

  const createdPlace = {
    id: uuidv5("https://www.w3.org/", uuidv5.URL),
    title,
    address,
    description,
    creator,
    location: coordinates,
  };

  res.status(201).json({ place: createdPlace });
};

export const updatePlace: Handler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );

  const { title, description } = req.body;
  const { placeId } = req.params;

  const updatedPlace = {
    ...DUMMMY_PLACES.find((place) => place.id === placeId),
  };
  const placeIndex = DUMMMY_PLACES.findIndex((place) => place.id === placeId);

  if (updatedPlace) {
    updatedPlace.title = title;
    updatedPlace.description = description;
    DUMMMY_PLACES[placeIndex] = updatedPlace as Place;
  }

  res.status(200).json({ place: updatedPlace });
};

export const deletePlace: Handler = (req, res, next) => {
  const { placeId } = req.params;
  const place = DUMMMY_PLACES.find((place) => place.id === placeId);
  if (!place)
    return next(new HttpError("Could not find a place for that ID.", 404));

  const placeIndex = DUMMMY_PLACES.findIndex((place) => place.id === placeId);
  DUMMMY_PLACES.splice(placeIndex, 1);

  res.status(200).json({ message: "Deleted place successfully." });
};
