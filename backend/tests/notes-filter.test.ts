import request from 'supertest';
import mongoose from 'mongoose';
import app from '../expressApp';
import { connectToDatabase } from '../config/db';
import { Note } from '../models/noteModel';

afterEach(async () => {
  await Note.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Notes filter API', () => {
  beforeAll(async () => {
    await connectToDatabase();
  });

  test('returns notes matching the query and X-Total-Count', async () => {
    await Note.create({
      title: 'Filter note',
      author: {
        name: 'Tester',
        email: 'tester@example.com',
      },
      content: 'This note contains special-keyword for filtering',
    });

    const response = await request(app)
      .get('/notes/filter')
      .query({ query: 'special-keyword' })
      .expect(200);

    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].content).toContain('special-keyword');
    expect(response.headers['x-total-count']).toBe('1');
  });

  test('returns 400 when query is missing', async () => {
    await request(app).get('/notes/filter').expect(400);
  });
});
