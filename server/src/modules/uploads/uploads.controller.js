import { uploadsService } from './uploads.service.js';

/** POST /api/uploads — multipart/form-data with a `photo` field. */
export const uploadPhoto = async (req, res) => {
  const photo = await uploadsService.registerPhoto(req.file);
  res.status(201).json({ data: photo });
};
