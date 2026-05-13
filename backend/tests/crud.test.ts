import request from 'supertest';
import mongoose from 'mongoose';
import app from '../expressApp';
import { connectToDatabase } from '../config/db';
import { Note } from '../models/noteModel';

beforeAll(async () => {
  await connectToDatabase();
});

afterEach(async () => {
  await Note.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Notes CRUD API', () => {
  test('creates a new note', async () => {
    const response = await request(app)
      .post('/notes')
      .send({
        title: 'test note',
        author: {
          name: 'Test Author',
          email: 'test@example.com',
        },
        content: 'This is a test note',
      })
      .expect(201);

    expect(response.body.title).toBe('test note');
    expect(response.body.content).toBe('This is a test note');
    expect(response.body._id).toBeDefined();
  });

  test('reads notes', async () => {
    await Note.create({
      title: 'read note',
      author: {
        name: 'Test Author',
        email: 'test@example.com',
      },
      content: 'Read test content',
    });

    const response = await request(app)
      .get('/notes?_page=1&_per_page=10')
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe('read note');
    expect(response.headers['x-total-count']).toBe('1');
  });

  test('updates a note', async () => {
    const note = await Note.create({
      title: 'old title',
      author: {
        name: 'Test Author',
        email: 'test@example.com',
      },
      content: 'Old content',
    });

    const response = await request(app)
      .put(`/notes/${note._id}`)
      .send({
        title: 'old title',
        author: note.author,
        content: 'Updated content',
      })
      .expect(200);

    expect(response.body.content).toBe('Updated content');
  });

  test('deletes a note', async () => {
    const note = await Note.create({
      title: 'delete note',
      author: {
        name: 'Test Author',
        email: 'test@example.com',
      },
      content: 'Delete test content',
    });

    await request(app).delete(`/notes/${note._id}`).expect(204);

    const deletedNote = await Note.findById(note._id);
    expect(deletedNote).toBeNull();
  });
});