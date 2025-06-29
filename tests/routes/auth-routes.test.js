const { app, server } = require('../../server');
const request = require('supertest');
const { dbSync } = require('../../db/db');

describe('Auth Routes', function () {
    beforeAll(async () => {
        await dbSync;
        // Set environment variables for testing
        process.env.EMAIL = 'admin@test.com';
        process.env.PASSWORD = 'testpassword123';
    });

    afterAll(done => {
        if (server) {
            server.close();
        }
        done();
    });

    describe('POST /auth/login', () => {
        it('should login successfully with correct credentials', async () => {
            const loginData = {
                email: 'admin@test.com',
                password: 'testpassword123'
            };

            const res = await request(app)
                .post('/auth/login')
                .send(loginData)
                .expect(200);

            expect(res.body.code).toBe(200);
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data).toBe('string'); // JWT token should be a string
            expect(res.body.data.length).toBeGreaterThan(0);
        });

        it('should return error with incorrect email', async () => {
            const loginData = {
                email: 'wrong@test.com',
                password: 'testpassword123'
            };

            const res = await request(app)
                .post('/auth/login')
                .send(loginData)
                .expect(500);

            expect(res.body.message).toBe('Authentication Failed');
        });

        it('should return error with incorrect password', async () => {
            const loginData = {
                email: 'admin@test.com',
                password: 'wrongpassword'
            };

            const res = await request(app)
                .post('/auth/login')
                .send(loginData)
                .expect(500);

            expect(res.body.message).toBe('Authentication Failed');
        });

        it('should return error when email is missing', async () => {
            const loginData = {
                password: 'testpassword123'
            };

            const res = await request(app)
                .post('/auth/login')
                .send(loginData)
                .expect(404);

            expect(res.body.message).toBe('Missing some required fields');
        });

        it('should return error when password is missing', async () => {
            const loginData = {
                email: 'admin@test.com'
            };

            const res = await request(app)
                .post('/auth/login')
                .send(loginData)
                .expect(404);

            expect(res.body.message).toBe('Missing some required fields');
        });

        it('should return error when both email and password are missing', async () => {
            const loginData = {};

            const res = await request(app)
                .post('/auth/login')
                .send(loginData)
                .expect(404);

            expect(res.body.message).toBe('Missing some required fields');
        });

        it('should return error with empty string credentials', async () => {
            const loginData = {
                email: '',
                password: ''
            };

            const res = await request(app)
                .post('/auth/login')
                .send(loginData)
                .expect(404);

            expect(res.body.message).toBe('Missing some required fields');
        });

        it('should return error with null credentials', async () => {
            const loginData = {
                email: null,
                password: null
            };

            const res = await request(app)
                .post('/auth/login')
                .send(loginData)
                .expect(404);

            expect(res.body.message).toBe('Missing some required fields');
        });
    });
}); 