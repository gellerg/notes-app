import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import Pagination from './components/Pagination';

type Note = {
  id: number;
  title: string;
  content: string;
  author: string;
};

const NOTES_URL = 'http://localhost:3001/notes';
const POSTS_PER_PAGE = 10;

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    axios
      .get(`${NOTES_URL}?_page=${currentPage}&_limit=${POSTS_PER_PAGE}`)
      .then((response) => {
        setNotes(response.data);

        const totalCountHeader = response.headers['x-total-count'];
        const totalCount = totalCountHeader ? Number(totalCountHeader) : 0;
        const calculatedTotalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

        setTotalPages(calculatedTotalPages || 1);
      })
      .catch((error) => {
        console.log('Encountered an error: ' + error);
      });
  }, [currentPage]);

  return (
    <div className="app">
      <h1>Fun Facts</h1>

      {notes.map((note) => (
        <div key={note.id} className="note" id={String(note.id)}>
          <h2>{note.title}</h2>
          <small>By {note.author}</small>
          <br />
          {note.content}
        </div>
      ))}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default App;