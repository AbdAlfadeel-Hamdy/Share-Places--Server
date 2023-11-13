import fs from 'fs';
import { Handler } from 'express';
import { startSession } from 'mongoose';
import { validationResult } from 'express-validator/src/validation-result';
import { v2 as cloudinary } from 'cloudinary';
import { formatImage } from '../middleware/fileUpload';
import HttpError from '../models/httpError';
import { getCordsForAddress } from '../utils/location';
import Place from '../models/placeModel';
import User from '../models/userModel';
import { RequestWithUserData } from '../middleware/checkAuth';

export const getPlaceById: Handler = async (req, res, next) => {
  const { placeId } = req.params;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(
      new HttpError('Something went wrong, could not find a place.', 500)
    );
  }

  if (!place)
    return next(
      new HttpError('Could not find a place for the provided ID.', 404)
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
      new HttpError('Fetching places failed, please try again later.', 500)
    );
  }

  res.json({
    places: places.map(place => place.toObject({ getters: true })),
  });
};

export const createPlace: Handler = async (
  req: RequestWithUserData,
  res,
  next
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );

  const { address } = req.body;
  let coordinates;
  try {
    const data: any = await getCordsForAddress(address);
    coordinates = {
      lat: +data.latt,
      lng: +data.longt,
    };
    req.body.location = coordinates;
  } catch (err) {
    return next(err);
  }
  req.body.creator = req.userData?.userId;
  if (req.file) {
    const file = formatImage(req.file);
    if (file) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(file);
      req.body.image = secure_url;
      req.body.imagePublicId = public_id;
    }
  }

  const createdPlace = new Place(req.body);

  let user;
  try {
    user = await User.findById(req.userData?.userId);
    if (!user)
      return next(new HttpError('Could not find user with that ID.', 401));
  } catch (err) {
    return next(new HttpError('Creating place failed, please try again.', 500));
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
      new HttpError('Creating place failed, please try again later.', 500)
    );
  }

  res.status(201).json({ place: createdPlace });
};

export const updatePlace: Handler = async (
  req: RequestWithUserData,
  res,
  next
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );

  const { title, description } = req.body;
  const { placeId } = req.params;

  let updatedPlace;
  try {
    updatedPlace = await Place.findById(placeId);
    if (!updatedPlace)
      return next(new HttpError('Could not find a place for that ID.', 404));

    if (updatedPlace?.creator.toString() !== req.userData?.userId)
      return next(
        new HttpError('You are not allowed to edit this place.', 401)
      );
    updatedPlace.title = title;
    updatedPlace.description = description;

    updatedPlace.save();
  } catch (err) {
    return next(
      new HttpError('Something went wrong, could not update place.', 500)
    );
  }

  res.status(200).json({ place: updatedPlace.toObject({ getters: true }) });
};

export const deletePlace: Handler = async (
  req: RequestWithUserData,
  res,
  next
) => {
  const { placeId } = req.params;

  const place = await Place.findById(placeId).populate('creator');
  if (!place)
    return next(new HttpError('Could not find a place for that ID.', 404));
  if ((place?.creator as any).id.toString() !== req.userData?.userId)
    return next(
      new HttpError('You are not allowed to delete this place.', 401)
    );

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
      new HttpError('Something went wrong, could not delete the place.', 500)
    );
  }

  if (place?.imagePublicId)
    await cloudinary.uploader.destroy(place.imagePublicId);

  res.status(200).json({ message: 'Deleted the place successfully.' });
};
