import request from 'supertest';
import mongoose from 'mongoose';
import app from '../expressApp';
import { connectToDatabase } from '../config/db';
import { Note } from '../models/noteModel';
import { User } from '../models/userModel';
import { hashPassword } from '../services/authService';

let authToken: string;
let userId: string;

beforeAll(async () => {
  await connectToDatabase();
  await User.deleteMany({});
  await Note.deleteMany({});

  const user = await User.create({
    name: 'Crud User',
    email: 'crud@example.com',
    username: 'cruduser',
    passwordHash: await hashPassword('password123'),
  });

  userId = user._id.toString();
  const loginResponse = await request(app)
    .post('/login')
    .send({ username: 'cruduser', password: 'password123' })
    .expect(200);

  authToken = loginResponse.body.token;
});

afterEach(async () => {
  await Note.deleteMany({});
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Notes CRUD API', () => {
  test('creates a new note', async () => {
    const response = await request(app)
      .post('/notes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'test note',
        content: 'This is a test note',
      })
      .expect(201);

    expect(response.body.title).toBe('test note');
    expect(response.body.content).toBe('This is a test note');
    expect(response.body._id).toBeDefined();
    expect(response.body.author.email).toBe('crud@example.com');
  });

  test('reads notes', async () => {
    await Note.create({
      title: 'read note',
      author: {
        name: 'Crud User',
        email: 'crud@example.com',
      },
      content: 'Read test content',
      user: userId,
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
        name: 'Crud User',
        email: 'crud@example.com',
      },
      content: 'Old content',
      user: userId,
    });

    const response = await request(app)
      .put(`/notes/${note._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'old title',
        content: 'Updated content',
      })
      .expect(200);

    expect(response.body.content).toBe('Updated content');
  });

  test('deletes a note', async () => {
    const note = await Note.create({
      title: 'delete note',
      author: {
        name: 'Crud User',
        email: 'crud@example.com',
      },
      content: 'Delete test content',
      user: userId,
    });

    await request(app)
      .delete(`/notes/${note._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204);

    const deletedNote = await Note.findById(note._id);
    expect(deletedNote).toBeNull();
  });
});
