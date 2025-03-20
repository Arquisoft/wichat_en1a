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

describe('User Service', () => {
  it('should add a new user on POST /adduser', async () => {
    const newUser = {
      username: 'testuser',
      password: 'Testpassword1!',
      repeatPassword: 'Testpassword1!',
    };

    const response = await request(app).post('/adduser').send(newUser);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('username', 'testuser');

    // Check if the user is inserted into the database
    const userInDb = await User.findOne({ username: 'testuser' });

    // Assert that the user exists in the database
    expect(userInDb).not.toBeNull();
    expect(userInDb.username).toBe('testuser');

    // Assert that the password is encrypted
    const isPasswordValid = await bcrypt.compare('Testpassword1!', userInDb.password);
    expect(isPasswordValid).toBe(true);
  });
  it('should return an error if passwords do not match', async () => {
    const newUser = {
      username: 'testuser2',
      password: 'Testpassword1!',
      repeatPassword: 'Wrongpassword!',
    };

    const response = await request(app).post('/adduser').send(newUser);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Passwords must match');
  });

  it('should return an error if required fields are missing', async () => {
    const newUser = {
      username: 'testuser3',
    };

    const response = await request(app).post('/adduser').send(newUser);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Missing required field: password');
  });

  it('should return an error if the password is too short', async () => {
    const newUser = {
      username: 'testuser4',
      password: 'short',
      repeatPassword: 'short',
    };

    const response = await request(app).post('/adduser').send(newUser);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Password must be at least 8 characters long');
  });

  it('should return an error if the password does not meet strength requirements', async () => {
    const newUser = {
      username: 'testuser5',
      password: 'weakpassword',
      repeatPassword: 'weakpassword',
    };

    const response = await request(app).post('/adduser').send(newUser);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character');
  });

  it('should return an error if the username is already taken', async () => {
    const newUser = {
      username: 'testuser6',
      password: 'Testpassword1!',
      repeatPassword: 'Testpassword1!',
    };
    await request(app).post('/adduser').send(newUser);

    // Try to create the same user
    const response = await request(app).post('/adduser').send(newUser);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Username already taken');
  });
});
