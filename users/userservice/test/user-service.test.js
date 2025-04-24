const request = require('supertest');
const bcrypt = require('bcrypt');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

const User = require('../src/models/user-model');

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;

  // Carga la app y conecta a MongoDB manualmente
  app = require('../src/app');
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
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
  password: 'Testpassword1!', // NOSONAR: Mocked data
  repeatPassword: 'Testpassword1!', // NOSONAR: Mocked data
};

const invalidPasswordTests = [
  { password: 'short', error: 'Password must be at least 8 characters long' },
  { password: 'weakpassword', error: 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character' },
  { password: 'TestPassword!', error: 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character' },
  { password: 'Testpassword1', error: 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character' },
  { password: '', error: 'Password must be at least 8 characters long' },
];

describe('User Service', () => {
  it('should add a new user on POST /adduser', async () => {
    const response = await registerUser(baseUser);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('username', baseUser.username);

    const userInDb = await User.findOne({ username: baseUser.username });
    expect(userInDb).not.toBeNull();
    expect(userInDb.username).toBe(baseUser.username);

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

  it('should return an error if the password does not meet strength requirements', async () => {
    for (const { password, error } of invalidPasswordTests) {
      const invalidPassword = { ...baseUser, password, repeatPassword: password };
      const response = await registerUser(invalidPassword);
      expectError(response, 400, error);
    }
  });

  it('should return an error if the username is already taken', async () => {
    await registerUser(baseUser);
    const response = await registerUser(baseUser);
    expectError(response, 400, 'Username already taken');
  });

  it('should return an error if username contains special characters', async () => {
    const invalidUsername = { ...baseUser, username: 'test@user!' };
    const response = await registerUser(invalidUsername);
    expectError(response, 400, 'Username can only contain alphanumeric characters and underscores');
  });

  it('should return an error if username is too short', async () => {
    const shortUsername = { ...baseUser, username: 'ab' };
    const response = await registerUser(shortUsername);
    expectError(response, 400, 'User validation failed: username: Path `username` (`ab`) is shorter than the minimum allowed length (3).');
  });

  it('should return an error if username is too long', async () => {
    const longUsername = { ...baseUser, username: 'a'.repeat(51) };
    const response = await registerUser(longUsername);
    expectError(response, 400, `User validation failed: username: Path \`username\` (\`${longUsername.username}\`) is longer than the maximum allowed length (30).`);
  });
});

describe('Health Check Endpoints', () => {
  test('should return OK for /health', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });
});
