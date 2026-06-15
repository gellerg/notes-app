import { Note } from '../models/noteModel';

const escapeForRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getNotes = async (page: number, perPage: number) => {
  const count = await Note.countDocuments();

  const notes = await Note.find()
    .sort({ _id: -1 })
    .skip((page - 1) * perPage)
    .limit(perPage);

  return { notes, count };
};

export const createNote = async (noteData: {
  title: string;
  author: {
    name: string;
    email: string;
  } | null;
  content: string;
  user: string;
}) => {
  const newNote = await Note.create(noteData);
  return newNote;
};

export const deleteNoteById = async (id: string) => {
  const deletedNote = await Note.findByIdAndDelete(id);
  return deletedNote;
};

export const updateNoteById = async (
  id: string,
  noteData: {
    title?: string;
    content?: string;
  }
) => {
  const updatedNote = await Note.findByIdAndUpdate(id, noteData, {
    returnDocument: 'after',
    runValidators: true,
  });

  return updatedNote;
};

export const getNoteById = async (id: string) => {
  const note = await Note.findById(id);
  return note;
};

export const getNoteByIndex = async (index: number) => {
  const note = await Note.findOne()
    .sort({ _id: -1 })
    .skip(index);

  return note;
};

export const updateNoteByIndex = async (
  index: number,
  noteData: {
    title?: string;
    content?: string;
  }
) => {
  const note = await getNoteByIndex(index);

  if (!note) {
    return null;
  }

  const updatedNote = await Note.findByIdAndUpdate(note._id, noteData, {
    returnDocument: 'after',
    runValidators: true,
  });

  return updatedNote;
};

export const deleteNoteByIndex = async (index: number) => {
  const note = await getNoteByIndex(index);

  if (!note) {
    return null;
  }

  const deletedNote = await Note.findByIdAndDelete(note._id);

  return deletedNote;
};