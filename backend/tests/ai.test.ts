import request from 'supertest';
import mongoose from 'mongoose';
import app from '../expressApp';
import { connectToDatabase } from '../config/db';
import { User } from '../models/userModel';
import { Note } from '../models/noteModel';
import { hashPassword } from '../services/authService';

afterEach(async () => {
  await User.deleteMany({});
  await Note.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('AI assistant endpoint', () => {
  beforeAll(async () => {
    await connectToDatabase();
  });

  test('POST /ai/complete returns text containing the note keyword', async () => {
    const keyword = 'cryptographic-handshake-v7';

    const user = await User.create({
      name: 'AI User',
      email: 'aiuser@example.com',
      username: 'aiuser',
      passwordHash: await hashPassword('password123'),
    });

    await Note.create({
      title: 'AI note',
      author: {
        name: 'AI User',
        email: 'aiuser@example.com',
      },
      content: `Important note: my project uses ${keyword} as the auth identifier.`,
      user: user._id.toString(),
    });

    const loginResponse = await request(app)
      .post('/login')
      .send({ username: 'aiuser', password: 'password123' })
      .expect(200);

    const token = loginResponse.body.token;
    expect(token).toBeDefined();

    const prompt = `Search the notes for the exact keyword '${keyword}' and answer with a sentence that includes that keyword.`;

    const response = await request(app)
      .post('/ai/complete')
      .set('Authorization', `Bearer ${token}`)
      .send({ prompt })
      .expect(200);

    expect(response.body.text).toContain(keyword);
  }, 30000);
});
