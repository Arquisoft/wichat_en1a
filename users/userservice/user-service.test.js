const request = require('supertest');
const bcrypt = require('bcrypt');
const { MongoMemoryServer } = require('mongodb-memory-server');

const User = require('./user-model');

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;
  app = require('./user-service');
});

afterAll(async () => {
  app.close();
  await mongoServer.stop();
});

const registerUser = async (userData) => {
  return await request(app).post('/adduser').send(userData);
};

const expectError = (response, status, message) => {
  expect(response.status).toBe(status);
  expect(response.body).toHaveProperty('error', message);
};

const baseUser = {
  username: 'testuser',
  password: 'Testpassword1!',
  repeatPassword: 'Testpassword1!',
};

describe('User Service', () => {
  it('should add a new user on POST /adduser', async () => {
    const response = await registerUser(baseUser);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('username', baseUser.username);

    // Check if the user is inserted into the database
    const userInDb = await User.findOne({ username: baseUser.username });
    expect(userInDb).not.toBeNull();
    expect(userInDb.username).toBe(baseUser.username);

    // Assert that the password is encrypted
    const isPasswordValid = await bcrypt.compare(baseUser.password, userInDb.password);
    expect(isPasswordValid).toBe(true);
  });

  it('should return an error if passwords do not match', async () => {
    const response = await registerUser({ ...baseUser, repeatPassword: 'Wrongpassword!' });
    expectError(response, 400, 'Passwords must match');
  });

  it('should return an error if required fields are missing', async () => {
    const response = await registerUser({ username: 'testuser3' });
    expectError(response, 400, 'Missing required field: password');
  });

  it('should return an error if the password is too short', async () => {
    const response = await registerUser({ ...baseUser, password: 'short', repeatPassword: 'short' });
    expectError(response, 400, 'Password must be at least 8 characters long');
  });

  it('should return an error if the password does not meet strength requirements', async () => {
    const response = await registerUser({ ...baseUser, password: 'weakpassword', repeatPassword: 'weakpassword' });
    expectError(response, 400, 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character');
  });

  it('should return an error if the username is already taken', async () => {
    await registerUser(baseUser);
    const response = await registerUser(baseUser);
    expectError(response, 400, 'Username already taken');
  });
});
