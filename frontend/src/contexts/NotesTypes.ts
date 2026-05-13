export type Note = {
  _id: string;
  title: string;
  content: string;
  author: {
    name: string;
    email: string;
  } | null;
};

export type NotesState = {
  notes: Note[];
  notification: string;
};

export type NotesAction =
  | { type: 'SET_NOTES'; payload: Note[] }
  | { type: 'SET_NOTIFICATION'; payload: string };

export type NotesContextType = {
  state: NotesState;
  dispatch: React.Dispatch<NotesAction>;
};