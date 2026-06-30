import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api';
import Pagination from '../components/Pagination';
import type { Note } from '../contexts/NotesTypes';
import { useNotesContext } from '../contexts/useNotesContext';
import { useAuth } from '../contexts/AuthContext';
import { sanitizeHtml } from '../utils/sanitizeHtml';

const NOTES_URL = '/notes';
const POSTS_PER_PAGE = 10;
const CACHE_KEY = 'notes_cache_v2';
const PAGE_WINDOW_SIZE = 5;

type PageCache = {
  notes: Note[];
  totalCount: number;
  timestamp: number;
};

type NotesCache = {
  [page: number]: PageCache;
};

function Home() {
  const { state, dispatch } = useNotesContext();
  const { notes, notification } = state;
  const { currentUser } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sanitizerEnabled, setSanitizerEnabled] = useState(true);

  const cacheRef = useRef<NotesCache>({});
  const inFlightRef = useRef<Map<number, Promise<void>>>(new Map());

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');

  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');

  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAiText, setIsGeneratingAiText] = useState(false);

  const loadCacheFromStorage = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);

      if (cached) {
        cacheRef.current = JSON.parse(cached);
      }
    } catch {
      console.log('Error loading cache from localStorage');
    }
  };

  const saveCacheToStorage = () => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheRef.current));
    } catch {
      console.log('Error saving cache to localStorage');
    }
  };

  const clearStoredCache = () => {
    cacheRef.current = {};
    inFlightRef.current.clear();
    localStorage.removeItem(CACHE_KEY);
  };

  const getVisiblePageNumbers = (page: number, total: number) => {
    let start = Math.max(1, page - 2);
    let end = start + PAGE_WINDOW_SIZE - 1;

    if (end > total) {
      end = total;
      start = Math.max(1, end - PAGE_WINDOW_SIZE + 1);
    }

    const pages: number[] = [];

    for (let p = start; p <= end; p++) {
      pages.push(p);
    }

    return pages;
  };

  const keepOnlyVisiblePagesInCache = useCallback((visiblePages: number[]) => {
    const visibleSet = new Set(visiblePages);
    const newCache: NotesCache = {};

    for (const pageString of Object.keys(cacheRef.current)) {
      const page = Number(pageString);

      if (visibleSet.has(page)) {
        newCache[page] = cacheRef.current[page];
      }
    }

    cacheRef.current = newCache;
    saveCacheToStorage();
  }, []);

  const showCachedPage = useCallback(
    (page: number) => {
      const cached = cacheRef.current[page];

      if (!cached) {
        return;
      }

      dispatch({ type: 'SET_NOTES', payload: cached.notes });
    },
    [dispatch]
  );

  const fetchPage = useCallback(
    (page: number, isBackground = false, forceRefresh = false) => {
      const cached = cacheRef.current[page];

      if (cached && !isBackground && !forceRefresh) {
        showCachedPage(page);
      }

      if (cached && isBackground && !forceRefresh) {
        return Promise.resolve();
      }

      const existingRequest = inFlightRef.current.get(page);

      if (existingRequest) {
        return existingRequest.then(() => {
          if (!isBackground) {
            showCachedPage(page);
          }
        });
      }

      const request = api
        .get(`${NOTES_URL}?_page=${page}&_per_page=${POSTS_PER_PAGE}`)
        .then((response) => {
          const totalCountHeader = response.headers['x-total-count'];
          const totalCount = totalCountHeader ? Number(totalCountHeader) : 0;
          const calculatedTotalPages =
            Math.ceil(totalCount / POSTS_PER_PAGE) || 1;

          cacheRef.current[page] = {
            notes: response.data,
            totalCount,
            timestamp: Date.now(),
          };

          saveCacheToStorage();
          setTotalPages(calculatedTotalPages);

          if (!isBackground) {
            dispatch({ type: 'SET_NOTES', payload: response.data });
          }
        })
        .catch((error) => {
          console.log('Encountered an error: ' + error);
        })
        .finally(() => {
          inFlightRef.current.delete(page);
        });

      inFlightRef.current.set(page, request);

      return request;
    },
    [dispatch, showCachedPage]
  );

  const preloadVisiblePages = useCallback(
    (page: number, total: number) => {
      const visiblePages = getVisiblePageNumbers(page, total);

      const pagesToPreload = visiblePages.filter(
        (p) =>
          p !== page &&
          !cacheRef.current[p] &&
          !inFlightRef.current.has(p)
      );

      pagesToPreload.forEach((p) => {
        fetchPage(p, true);
      });

      keepOnlyVisiblePagesInCache(visiblePages);
    },
    [fetchPage, keepOnlyVisiblePagesInCache]
  );

  useEffect(() => {
    loadCacheFromStorage();
  }, []);

  useEffect(() => {
    fetchPage(currentPage, false);
  }, [currentPage, fetchPage]);

  useEffect(() => {
    preloadVisiblePages(currentPage, totalPages);
  }, [currentPage, totalPages, preloadVisiblePages]);

  const clearCacheAndReloadFirstPage = () => {
    clearStoredCache();
    setCurrentPage(1);
    fetchPage(1, false, true);
  };

  const deleteNote = (id: string) => {
    api
      .delete(`${NOTES_URL}/${id}`)
      .then(() => {
        dispatch({ type: 'SET_NOTIFICATION', payload: 'Note deleted' });
        clearCacheAndReloadFirstPage();
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
    api
      .put(`${NOTES_URL}/${note._id}`, {
        title: note.title,
        content: editedContent,
      })
      .then(() => {
        dispatch({ type: 'SET_NOTIFICATION', payload: 'Note updated' });
        setEditingNoteId(null);
        setEditedContent('');
        clearCacheAndReloadFirstPage();
      })
      .catch((error) => {
        console.log('Encountered an error while updating note: ' + error);
      });
  };

  const startAddingNote = () => {
    setIsAddingNote(true);
    setNewNoteContent('');
    setShowAiPrompt(false);
    setAiPrompt('');
  };

  const cancelAddingNote = () => {
    setIsAddingNote(false);
    setNewNoteContent('');
    setShowAiPrompt(false);
    setAiPrompt('');
  };

  const saveNewNote = () => {
    if (!newNoteContent.trim()) {
      return;
    }

    api
      .post(NOTES_URL, {
        title: 'new note',
        content: newNoteContent,
      })
      .then(() => {
        dispatch({ type: 'SET_NOTIFICATION', payload: 'Added a new note' });
        setIsAddingNote(false);
        setNewNoteContent('');
        setShowAiPrompt(false);
        setAiPrompt('');
        clearCacheAndReloadFirstPage();
      })
      .catch((error) => {
        console.log('Encountered an error while adding note: ' + error);
      });
  };

  const generateAiText = () => {
    const prompt = aiPrompt.trim();

    if (!prompt) {
      return;
    }

    setIsGeneratingAiText(true);

    api
      .post('/ai/complete', { prompt })
      .then((response) => {
        const generatedText = response.data.text ?? '';

        setNewNoteContent((previousContent) => {
          if (!previousContent.trim()) {
            return generatedText;
          }

          return `${previousContent}\n${generatedText}`;
        });
      })
      .catch((error) => {
        console.log('Encountered an error while generating AI text: ' + error);
      })
      .finally(() => {
        setIsGeneratingAiText(false);
      });
  };

  return (
    <div className="app">
      <h1>Fun Facts</h1>

      <div className="notification">{notification}</div>

      <button
        type="button"
        className="sanitizer-toggle"
        data-testid="sanitizer_toggle"
        onClick={() => setSanitizerEnabled((currentValue) => !currentValue)}
      >
        Sanitizer: {sanitizerEnabled ? 'ON' : 'OFF'}
      </button>

      {currentUser && (
        <button
          className="add-note-button"
          name="add_new_note"
          data-testid="add_new_note"
          onClick={startAddingNote}
        >
          Add new note
        </button>
      )}

      {currentUser && isAddingNote && (
        <div className="add-note-area">
          <input
            type="text"
            value={newNoteContent}
            name="text_input_new_note"
            data-testid="text_input_new_note"
            onChange={(event) => setNewNoteContent(event.target.value)}
          />

          <button
            type="button"
            data-testid="help_me_write"
            onClick={() => setShowAiPrompt((currentValue) => !currentValue)}
          >
            ★
          </button>

          {showAiPrompt && (
            <div className="ai-helper-area">
              <input
                type="text"
                data-testid="help_me_write_prompt"
                value={aiPrompt}
                onChange={(event) => setAiPrompt(event.target.value)}
                placeholder="Ask the AI for help..."
              />

              <button
                type="button"
                data-testid="help_me_write_submit"
                onClick={generateAiText}
                disabled={isGeneratingAiText}
              >
                {isGeneratingAiText ? 'Generating...' : 'Generate'}
              </button>
            </div>
          )}

          <button
            name="text_input_save_new_note"
            data-testid="text_input_save_new_note"
            onClick={saveNewNote}
          >
            Save
          </button>

          <button
            name="text_input_cancel_new_note"
            data-testid="text_input_cancel_new_note"
            onClick={cancelAddingNote}
          >
            Cancel
          </button>
        </div>
      )}

      {notes.map((note) => {
        const isEditing = editingNoteId === note._id;
        const isAuthor = note.author?.email === currentUser?.email;
        const noteBodyHtml = sanitizerEnabled
          ? sanitizeHtml(note.content)
          : note.content;

        return (
          <div key={note._id} className="note" data-testid={note._id}>
            <h2>{note.title}</h2>

            <small>By {note.author?.name ?? 'Unknown'}</small>

            <br />

            <div
              data-testid="note_body"
              dangerouslySetInnerHTML={{ __html: noteBodyHtml }}
            />

            <br />

            {isAuthor && (
              <>
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
              </>
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

export default Home;