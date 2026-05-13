import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import Pagination from './components/Pagination';
import type { Note } from './contexts/NotesTypes';
import { useNotesContext } from './contexts/useNotesContext';
const NOTES_URL = 'http://localhost:3001/notes';
const POSTS_PER_PAGE = 10;

function App() {
  const { state, dispatch } = useNotesContext();
  const { notes, notification } = state;

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');

  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');

  const fetchNotes = useCallback(() => {
    axios
      .get(`${NOTES_URL}?_page=${currentPage}&_per_page=${POSTS_PER_PAGE}`)
      .then((response) => {
        dispatch({ type: 'SET_NOTES', payload: response.data });

        const totalCountHeader = response.headers['x-total-count'];
        const totalCount = totalCountHeader ? Number(totalCountHeader) : 0;
        const calculatedTotalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

        setTotalPages(calculatedTotalPages || 1);
      })
      .catch((error) => {
        console.log('Encountered an error: ' + error);
      });
  }, [currentPage, dispatch]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const deleteNote = (id: string) => {
    axios
      .delete(`${NOTES_URL}/${id}`)
      .then(() => {
        dispatch({ type: 'SET_NOTIFICATION', payload: 'Note deleted' });
        fetchNotes();
      })
      .catch((error) => {
        console.log('Encountered an error while deleting note: ' + error);
      });
  };

  const startEditing = (note: Note) => {
    setEditingNoteId(note._id);
    setEditedContent(note.content);
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditedContent('');
  };

  const saveEditedNote = (note: Note) => {
    axios
      .put(`${NOTES_URL}/${note._id}`, {
        title: note.title,
        author: note.author,
        content: editedContent,
      })
      .then(() => {
        dispatch({ type: 'SET_NOTIFICATION', payload: 'Note updated' });
        setEditingNoteId(null);
        setEditedContent('');
        fetchNotes();
      })
      .catch((error) => {
        console.log('Encountered an error while updating note: ' + error);
      });
  };

  const startAddingNote = () => {
    setIsAddingNote(true);
    setNewNoteContent('');
  };

  const cancelAddingNote = () => {
    setIsAddingNote(false);
    setNewNoteContent('');
  };

  const saveNewNote = () => {
    if (!newNoteContent.trim()) {
      return;
    }

    axios
      .post(NOTES_URL, {
        title: 'new note',
        author: {
          name: 'Gal',
          email: 'gal@example.com',
        },
        content: newNoteContent,
      })
      .then(() => {
        dispatch({ type: 'SET_NOTIFICATION', payload: 'Added a new note' });
        setIsAddingNote(false);
        setNewNoteContent('');
        setCurrentPage(1);
        fetchNotes();
      })
      .catch((error) => {
        console.log('Encountered an error while adding note: ' + error);
      });
  };

  return (
    <div className="app">
      <h1>Fun Facts</h1>

      <div className="notification">{notification}</div>

      <button
        className="add-note-button"
        name="add_new_note"
        onClick={startAddingNote}
      >
        Add new note
      </button>

      {isAddingNote && (
        <div className="add-note-area">
          <input
            type="text"
            value={newNoteContent}
            name="text_input_new_note"
            onChange={(event) => setNewNoteContent(event.target.value)}
          />

          <button name="text_input_save_new_note" onClick={saveNewNote}>
            Save
          </button>

          <button name="text_input_cancel_new_note" onClick={cancelAddingNote}>
            Cancel
          </button>
        </div>
      )}

      {notes.map((note) => {
        const isEditing = editingNoteId === note._id;

        return (
          <div key={note._id} className="note" data-testid={note._id}>
            <h2>{note.title}</h2>
            <small>By {note.author?.name ?? 'Unknown'}</small>
            <br />
            {note.content}
            <br />

            <button
              data-testid={`delete-${note._id}`}
              onClick={() => deleteNote(note._id)}
            >
              Delete
            </button>

            {!isEditing && (
              <button
                data-testid={`edit-${note._id}`}
                onClick={() => startEditing(note)}
              >
                Edit
              </button>
            )}

            {isEditing && (
              <div className="edit-area">
                <textarea
                  data-testid={`text_input-${note._id}`}
                  value={editedContent}
                  onChange={(event) => setEditedContent(event.target.value)}
                />

                <button
                  data-testid={`text_input_save-${note._id}`}
                  onClick={() => saveEditedNote(note)}
                >
                  Save
                </button>

                <button
                  data-testid={`text_input_cancel-${note._id}`}
                  onClick={cancelEditing}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        );
      })}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default App;