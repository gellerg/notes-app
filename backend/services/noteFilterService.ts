import { Note } from '../models/noteModel';

const escapeForRegex = (value: string) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const filterNotes = async (query: string) => {
  const safeQuery = escapeForRegex(query);
  const regex = new RegExp(safeQuery, 'i');

  const count = await Note.countDocuments({ content: regex });

  const notes = await Note.find({ content: regex })
    .sort({ _id: 1 })
    .limit(10);

  return { notes, count };
};