import { createContext } from 'react';
import type { NotesContextType } from './NotesTypes';

export const NotesContext = createContext<NotesContextType | undefined>(
  undefined
);