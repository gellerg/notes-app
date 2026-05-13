import { useReducer, type ReactNode } from 'react';
import { NotesContext } from './NotesContext';
import type { NotesAction, NotesState } from './NotesTypes';

const initialState: NotesState = {
  notes: [],
  notification: 'Notification area',
};

const notesReducer = (
  state: NotesState,
  action: NotesAction
): NotesState => {
  switch (action.type) {
    case 'SET_NOTES':
      return {
        ...state,
        notes: action.payload,
      };

    case 'SET_NOTIFICATION':
      return {
        ...state,
        notification: action.payload,
      };

    default:
      return state;
  }
};

export const NotesProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(notesReducer, initialState);

  return (
    <NotesContext.Provider value={{ state, dispatch }}>
      {children}
    </NotesContext.Provider>
  );
};