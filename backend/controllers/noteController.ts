import { Request, Response } from 'express';
import * as noteService from '../services/noteService';

export const getAllNotes = async (req: Request, res: Response) => {
  const page = Number(req.query._page) || 1;
  const perPage = Number(req.query._per_page) || 10;

  const { notes, count } = await noteService.getNotes(page, perPage);

  res.set('X-Total-Count', String(count));
  res.status(200).json(notes);
};

export const createNote = async (req: Request, res: Response) => {
  const { title, author, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  const newNote = await noteService.createNote({
    title,
    author: author ?? null,
    content,
  });

  res.status(201).json(newNote);
};

export const deleteNote = async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid note id' });
  }

  const deletedNote = await noteService.deleteNoteById(id);

  if (!deletedNote) {
    return res.status(404).json({ message: 'Note not found' });
  }

  return res.status(204).send();
};

export const updateNote = async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid note id' });
  }

  const { title, author, content } = req.body;

  if (!title && !content && author === undefined) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  const updatedNote = await noteService.updateNoteById(id, {
    title,
    author,
    content,
  });

  if (!updatedNote) {
    return res.status(404).json({ message: 'Note not found' });
  }

  return res.status(200).json(updatedNote);
};

export const getNote = async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid note id' });
  }

  const note = await noteService.getNoteById(id);

  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }

  return res.status(200).json(note);
};

const parseIndex = (rawIndex: string | string[] | undefined) => {
  if (!rawIndex || Array.isArray(rawIndex)) {
    return null;
  }

  const index = Number(rawIndex);

  if (!Number.isInteger(index) || index < 0) {
    return null;
  }

  return index;
};

export const getNoteByIndex = async (req: Request, res: Response) => {
  const index = parseIndex(req.params.i);

  if (index === null) {
    return res.status(400).json({ message: 'Invalid note index' });
  }

  const note = await noteService.getNoteByIndex(index);

  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }

  return res.status(200).json(note);
};

export const updateNoteByIndex = async (req: Request, res: Response) => {
  const index = parseIndex(req.params.i);

  if (index === null) {
    return res.status(400).json({ message: 'Invalid note index' });
  }

  const { title, author, content } = req.body;

  if (!title && !content && author === undefined) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  const updatedNote = await noteService.updateNoteByIndex(index, {
    title,
    author,
    content,
  });

  if (!updatedNote) {
    return res.status(404).json({ message: 'Note not found' });
  }

  return res.status(200).json(updatedNote);
};

export const deleteNoteByIndex = async (req: Request, res: Response) => {
  const index = parseIndex(req.params.i);

  if (index === null) {
    return res.status(400).json({ message: 'Invalid note index' });
  }

  const deletedNote = await noteService.deleteNoteByIndex(index);

  if (!deletedNote) {
    return res.status(404).json({ message: 'Note not found' });
  }

  return res.status(204).send();
};