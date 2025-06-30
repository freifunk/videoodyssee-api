const { app, server } = require('../../server');
const request = require('supertest');
const { instance } = require('../../utils/funcs');
const MockAdapter = require("axios-mock-adapter");
const mock = new MockAdapter(instance);
const { dbSync } = require('../../db/db');

describe('API Routes Tests', () => {
    beforeEach(() => {
        mock.reset();
    });

    describe('Health Endpoint', () => {
        it('should return health status successfully', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body).toMatchObject({
                status: 'healthy',
                timestamp: expect.any(String),
                uptime: expect.any(Number),
                environment: expect.any(String)
            });

            // Validate timestamp is a valid ISO string
            expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
            
            // Validate uptime is positive
            expect(response.body.uptime).toBeGreaterThan(0);
        });

        it('should return correct environment', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(['test', 'development', 'production']).toContain(response.body.environment);
        });
    });

    describe('Pipeline Routes', () => {
        it('should trigger pipeline successfully', async () => {
            mock.onPost().reply(202, {
                message: 'Request to schedule pipeline processing-pipeline accepted'
            });

            const validPipelineData = {
                title: 'Test Video',
                event: 'TestConf2024',
                language: 'English',
                date: '2024-01-15',
                url: 'https://example.com/video.mp4',
                name: 'Test User',
                email: 'test@example.com',
                persons: ['Speaker 1'],
                tags: ['tag1']
            };

            const response = await request(app)
                .post('/pipeline/trigger')
                .send(validPipelineData)
                .expect(202);

            expect(response.body.data).toContain('accepted');
        });

        it('should handle pipeline trigger with non-202 response', async () => {
            mock.onPost().reply(500, {
                message: 'Pipeline service unavailable'
            });

            const validPipelineData = {
                title: 'Test Video',
                event: 'TestConf2024',
                language: 'English',
                date: '2024-01-15',
                url: 'https://example.com/video.mp4',
                name: 'Test User',
                email: 'test@example.com',
                persons: ['Speaker 1'],
                tags: ['tag1']
            };

            const response = await request(app)
                .post('/pipeline/trigger')
                .send(validPipelineData)
                .expect(500);

            expect(response.body.message).toBe('Pipeline service unavailable');
        });
    });

    describe('Error Handling', () => {
        it('should handle 404 for unknown routes', async () => {
            const response = await request(app)
                .post('/invalid-route')
                .expect(404);

            expect(response.body.message).toBe('Route not found!');
        });

        it('should handle JSON parse errors', async () => {
            const response = await request(app)
                .post('/video')
                .set('Content-Type', 'application/json')
                .send('invalid json}')
                .expect(400);

            expect(response.body.message).toBe('JSON parse error!');
        });
    });
});

describe('API routes', function () {
    beforeAll(async () => {
        await dbSync;
    });

    beforeEach(() => {
        mock.onPost().reply(202, {
            message: 'Request to schedule pipeline processing-pipeline accepted'
        });
    });

    it('triggers pipeline', async () => {
        const data = {
            title: 'Test Title',
            event: 'TestConf2024',
            language: 'English',
            date: '2024-01-15',
            url: 'http://techslides.com/demos/sample-videos/small.mp4',
            name: 'Test User',
            email: 'test@example.com',
            persons: ['Speaker 1'],
            tags: ['tag1']
        };

        const res = await request(app).post('/pipeline/trigger').send(data);
        expect(res.status).toBe(202);
        expect(res.body.data).toContain('accepted');
    });

    it('Route not found error test', async function () {
        const res = await request(app)
            .post('/invalid-route')
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .send({
                title: 'title',
                event:'Freifunk summit',
            });
        expect(res.body.message).toContain('Route not found!');

    });
});