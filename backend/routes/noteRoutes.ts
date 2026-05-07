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
} from '../controllers/noteController';

const router = express.Router();

router.get('/', getAllNotes);
router.post('/', createNote);

router.get('/by-index/:i', getNoteByIndex);
router.put('/by-index/:i', updateNoteByIndex);
router.delete('/by-index/:i', deleteNoteByIndex);

router.get('/:id', getNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;