import express from 'express';
import {
  getAllNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  getNoteByIndex,
  updateNoteByIndex,
  deleteNoteByIndex,
  filterNotesHandler,
} from '../controllers/noteController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/filter', filterNotesHandler);

router.get('/', getAllNotes);
router.post('/', authMiddleware, createNote);

router.get('/by-index/:i', getNoteByIndex);
router.put('/by-index/:i', authMiddleware, updateNoteByIndex);
router.delete('/by-index/:i', authMiddleware, deleteNoteByIndex);

router.get('/:id', getNote);
router.put('/:id', authMiddleware, updateNote);
router.delete('/:id', authMiddleware, deleteNote);

export default router;