import { Handler } from "express";
import { startSession } from "mongoose";
import { validationResult } from "express-validator/src/validation-result";

import HttpError from "../models/httpError";
import { getCordsForAddress } from "../utils/location";
import Place from "../models/placeModel";
import User from "../models/userModel";

export const getPlaceById: Handler = async (req, res, next) => {
  const { placeId } = req.params;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not find a place.", 500)
    );
  }

  if (!place)
    return next(
      new HttpError("Could not find a place for the provided ID.", 404)
    );

  res.json({ place: place.toObject({ getters: true }) });
};

export const getPlacesByUserId: Handler = async (req, res, next) => {
  const { userId } = req.params;

  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    return next(
      new HttpError("Fetching places failed, please try again later.", 500)
    );
  }

  if (!places.length)
    return next(
      new HttpError("Could not find any places for the provided user ID.", 404)
    );

  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

export const createPlace: Handler = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );

  const { title, description, address, creator } = req.body;
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

  const createdPlace = new Place({
    title,
    description,
    image: "DummyURL",
    address,
    location: coordinates,
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
    if (!user)
      return next(new HttpError("Could not find user with that ID.", 401));
  } catch (err) {
    return next(new HttpError("Creating place failed, please try again.", 500));
  }

  try {
    const session = await startSession();
    session.startTransaction();
    await createdPlace.save({ session });
    // @ts-ignore
    user.places.push(createdPlace);
    await user.save({ session });
    await session.commitTransaction();
  } catch (err) {
    return next(
      new HttpError("Creating place failed, please try again later.", 500)
    );
  }

  res.status(201).json({ place: createdPlace });
};

export const updatePlace: Handler = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );

  const { title, description } = req.body;
  const { placeId } = req.params;

  let updatedPlace;
  try {
    updatedPlace = await Place.findByIdAndUpdate(
      placeId,
      {
        title,
        description,
      },
      {
        new: true,
        runValidators: true,
      }
    );
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not update place.", 500)
    );
  }

  if (!updatedPlace)
    return next(new HttpError("Could not find a place for that ID.", 404));

  res.status(200).json({ place: updatedPlace.toObject({ getters: true }) });
};

export const deletePlace: Handler = async (req, res, next) => {
  const { placeId } = req.params;

  const place = await Place.findById(placeId).populate("creator");
  if (!place)
    return next(new HttpError("Could not find a place for that ID.", 404));

  try {
    const session = await startSession();
    session.startTransaction();
    await place.deleteOne({ session });
    // @ts-ignore
    await place.creator.places.pull(place);
    // @ts-ignore
    await place.creator.save();
    await session.commitTransaction();
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not delete the place.", 500)
    );
  }

  res.status(200).json({ message: "Deleted the place successfully." });
};
