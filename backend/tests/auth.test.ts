import request from 'supertest';
import mongoose from 'mongoose';
import app from '../expressApp';
import { connectToDatabase } from '../config/db';
import { User } from '../models/userModel';

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Authentication API', () => {
  beforeAll(async () => {
    await connectToDatabase();
  });

  test('creates a new user', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        name: 'Alice',
        email: 'alice@example.com',
        username: 'alice123',
        password: 'password123',
      })
      .expect(201);

    expect(response.body.username).toBe('alice123');
    expect(response.body.email).toBe('alice@example.com');

    const persistedUser = await User.findOne({ username: 'alice123' });
    expect(persistedUser).not.toBeNull();
    expect(persistedUser?.email).toBe('alice@example.com');
  });

  test('logs in with valid credentials', async () => {
    await request(app).post('/users').send({
      name: 'Bob',
      email: 'bob@example.com',
      username: 'bob123',
      password: 'securepass',
    });

    const response = await request(app)
      .post('/login')
      .send({
        username: 'bob123',
        password: 'securepass',
      })
      .expect(200);

    expect(response.body.token).toBeDefined();
    expect(response.body.user?.username).toBe('bob123');
  });
});
