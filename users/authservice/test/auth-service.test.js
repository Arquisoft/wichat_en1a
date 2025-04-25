const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcrypt');
const User = require('../src/models/auth-model');
const mongoose = require('mongoose');

let mongoServer;
let app;

const user = {
  username: 'testuser',
  password: 'testpassword',
};

async function addUser(user) {
  const hashedPassword = await bcrypt.hash(user.password, 10);
  const newUser = new User({
    username: user.username,
    password: hashedPassword,
  });

  await newUser.save();
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;

  await mongoose.connect(mongoUri);
  app = require('../src/app');

  await addUser(user);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Auth Service', () => {
  it('Should perform a login operation /login', async () => {
    const response = await request(app).post('/login').send(user);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('username', 'testuser');
  });
  it('should return 401 for incorrect password', async () => {
    const response = await request(app).post('/login').send({
      username: 'testuser',
      password: 'wrongpassword',
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid credentials');
  });

  it('should return 401 for non-existent user', async () => {
    const response = await request(app).post('/login').send({
      username: 'nonexistent',
      password: 'somepassword',
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid credentials');
  });

  it('should return 400 for missing username', async () => {
    const response = await request(app).post('/login').send({
      password: 'somepassword',
    });

    expect(response.status).toBe(400);
  });

  it('should return 400 for missing password', async () => {
    const response = await request(app).post('/login').send({
      username: 'testuser',
    });

    expect(response.status).toBe(400);
  });

  it('should return 400 for username too short', async () => {
    const response = await request(app).post('/login').send({
      username: 'ab',
      password: 'somepassword',
    });

    expect(response.status).toBe(400);
  });

  it('should return 400 for password too short', async () => {
    const response = await request(app).post('/login').send({
      username: 'testuser',
      password: '12',
    });

    expect(response.status).toBe(400);
  });


});

describe('Health Check Endpoints', () => {
  test('should return OK for /health', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });
});
