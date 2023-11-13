import axios from 'axios';
import HttpError from '../models/httpError';

export const getCordsForAddress = async (location: string) => {
  const result: any = await axios.get(
    `https://geocode.xyz/${location}?json=1&auth=${process.env.GEOCODE_API_KEY}`
  );

  if (result.data.error)
    throw new HttpError(
      'Could not find location for the specified address.',
      404
    );
  return result.data;
};
