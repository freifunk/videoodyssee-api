const { triggerPipeline, instance, sendError, sendSuccess, generateSlug } = require('../../utils/funcs');
const MockAdapter = require("axios-mock-adapter");

// Mock axios instance
const mock = new MockAdapter(instance);

// Mock environment variables
process.env.VOCTOWEB_URL = 'https://mock-voctoweb.com';

describe('Utils Functions Tests', () => {
    beforeEach(() => {
        mock.reset();
    });

    describe('triggerPipeline', () => {
        it('should trigger pipeline successfully', async () => {
            mock.onPost().reply(202, {
                message: 'Request to schedule pipeline processing-pipeline accepted'
            });

            const data = {
                id: 1,
                title: 'Test Video',
                subtitle: 'Test Subtitle',
                url: 'http://techslides.com/demos/sample-videos/small.mp4',
                name: 'Test User',
                email: 'test@example.com',
                persons: 'Speaker 1, Speaker 2',
                tags: 'tag1, tag2',
                conference: 'TestConf',
                language: 'English',
                slug: 'test-video',
                date: '2024-01-15',
                link: 'https://example.com',
                description: 'Test description'
            };

            const response = await triggerPipeline(data);
            expect(response.status).toBe(202);
            expect(response.data.message).toContain('accepted');
        });
    });

    describe('Response Functions', () => {
        describe('sendError', () => {
            it('should send error response with default values', () => {
                const res = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                    end: jest.fn()
                };

                sendError(res);

                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    code: 500,
                    message: 'Internal server error !'
                });
                expect(res.end).toHaveBeenCalled();
            });

            it('should send error response with custom message and code', () => {
                const res = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                    end: jest.fn()
                };

                sendError(res, 'Custom error message', 404);

                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({
                    code: 404,
                    message: 'Custom error message'
                });
            });

            it('should handle non-string error', () => {
                const res = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                    end: jest.fn()
                };

                sendError(res, { error: 'object error' }, 400);

                expect(res.json).toHaveBeenCalledWith({
                    code: 400,
                    message: 'Internal server error!'
                });
            });
        });

        describe('sendSuccess', () => {
            it('should send success response with default values', () => {
                const res = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                    end: jest.fn()
                };

                sendSuccess(res);

                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.json).toHaveBeenCalledWith({
                    code: 200,
                    data: {}
                });
                expect(res.end).toHaveBeenCalled();
            });

            it('should send success response with custom data and code', () => {
                const res = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                    end: jest.fn()
                };
                const data = { message: 'Success!' };

                sendSuccess(res, data, 201);

                expect(res.status).toHaveBeenCalledWith(201);
                expect(res.json).toHaveBeenCalledWith({
                    code: 201,
                    data: data
                });
            });

            it('should handle string data', () => {
                const res = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                    end: jest.fn()
                };

                sendSuccess(res, 'String response');

                expect(res.json).toHaveBeenCalledWith({
                    code: 200,
                    data: 'String response'
                });
            });
        });
    });

    describe('generateSlug', () => {
        it('should generate slug without VOCTOWEB_URL', async () => {
            const originalUrl = process.env.VOCTOWEB_URL;
            delete process.env.VOCTOWEB_URL;

            const slug = await generateSlug('Test Video Title');
            expect(slug).toBe('test-video-title');

            process.env.VOCTOWEB_URL = originalUrl;
        });

        it('should generate unique slug when no duplicates exist', async () => {
            mock.onGet().reply(200, {
                events: [
                    { slug: 'existing-slug' },
                    { slug: 'another-slug' }
                ]
            });

            const slug = await generateSlug('New Video Title');
            expect(slug).toBe('new-video-title');
        });

        it('should generate unique slug when duplicate exists', async () => {
            mock.onGet().reply(200, {
                events: [
                    { slug: 'test-title' },
                    { slug: 'test-title-1' }
                ]
            });

            const slug = await generateSlug('Test Title');
            expect(slug).toBe('test-title-1-2');
        });

        it('should handle API error and return original slug', async () => {
            mock.onGet().reply(500, { error: 'Server error' });

            const slug = await generateSlug('Test Title');
            expect(slug).toBe('test-title');
        });

        it('should handle malformed API response', async () => {
            mock.onGet().reply(200, { invalid: 'response' });

            const slug = await generateSlug('Test Title');
            expect(slug).toBe('test-title');
        });

        it('should handle network error', async () => {
            mock.onGet().networkError();

            const slug = await generateSlug('Test Title');
            expect(slug).toBe('test-title');
        });
    });
});