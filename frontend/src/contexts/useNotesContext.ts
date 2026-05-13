import { useContext } from 'react';
import { NotesContext } from './NotesContext';

export const useNotesContext = () => {
  const context = useContext(NotesContext);

  if (!context) {
    throw new Error('useNotesContext must be used inside NotesProvider');
  }

  return context;
};