const { app, server } = require('../../server');
const request = require('supertest');
const { instance } = require('../../utils/funcs');
const MockAdapter = require("axios-mock-adapter");
const mock = new MockAdapter(instance);
const { dbSync } = require('../../db/db');
const db = require('../../db/db');

describe('Video Routes', function () {  
    beforeAll(async () => {
        await dbSync;
        // Mock external pipeline service
        mock.onPost().reply(202, {
            message: 'Request to schedule pipeline processing-pipeline accepted'
        });
    });

    afterAll(done => {
        if (server) {
            server.close();
        }
        done();
    });

    beforeEach(async () => {
        // Clean up database before each test
        await db.Video.destroy({ where: {} });
    });

    describe('POST /video - Create Video', () => {
        it('should create a video successfully with all required fields', async () => {
            const videoData = {
                title: 'Test Video',
                subtitle: 'Test Subtitle',
                persons: ['John Doe', 'Jane Doe'],
                tags: ['tag1', 'tag2'],
                conference: 'TestConf2024',
                language: 'English',
                date: '2024-01-15',
                url: 'https://example.com/video.mp4',
                name: 'Test User',
                email: 'test@example.com',
                link: 'https://example.com',
                description: 'Test video description'
            };

            const res = await request(app)
                .post('/video')
                .send(videoData)
                .expect(200);

            expect(res.body.code).toBe(200);
            expect(res.body.data).toBe('Video submitted successfully !');

            // Verify video was created in database
            const createdVideo = await db.Video.findOne({ where: { title: 'Test Video' } });
            expect(createdVideo).toBeTruthy();
            expect(createdVideo.status).toBe('pending');
            expect(createdVideo.persons).toBe('John Doe Jane Doe');
            expect(createdVideo.tags).toBe('tag1 tag2');
        });

        it('should return error when required fields are missing', async () => {
            const incompleteData = {
                title: 'Test Video',
                // Missing required fields: conference, language, date, url, name, email
            };

            const res = await request(app)
                .post('/video')
                .send(incompleteData)
                .expect(406);

            expect(res.body.message).toBe('Missing some required fields !');
        });

        it('should handle missing title', async () => {
            const dataWithoutTitle = {
                conference: 'TestConf2024',
                language: 'English', 
                date: '2024-01-15',
                url: 'https://example.com/video.mp4',
                name: 'Test User',
                email: 'test@example.com'
            };

            await request(app)
                .post('/video')
                .send(dataWithoutTitle)
                .expect(406);
        });
    });

    describe('POST /video/list - List Videos', () => {
        it('should return empty list when no videos exist', async () => {
            const res = await request(app)
                .post('/video/list')
                .expect(200);

            expect(res.body.code).toBe(200);
            expect(res.body.data).toEqual([]);
        });

        it('should return list of videos ordered by updatedAt DESC', async () => {
            // Create test videos
            const video1 = await db.Video.create({
                title: 'Video 1',
                conference: 'Conf1',
                language: 'English',
                date: '2024-01-01',
                url: 'https://example.com/video1.mp4',
                name: 'User 1',
                email: 'user1@example.com',
                status: 'pending'
            });

            const video2 = await db.Video.create({
                title: 'Video 2', 
                conference: 'Conf2',
                language: 'German',
                date: '2024-01-02',
                url: 'https://example.com/video2.mp4',
                name: 'User 2',
                email: 'user2@example.com',
                status: 'approved'
            });

            const res = await request(app)
                .post('/video/list')
                .expect(200);

            expect(res.body.code).toBe(200);
            expect(res.body.data).toHaveLength(2);
            expect(res.body.data[0].title).toBe('Video 2'); // Most recent first
            expect(res.body.data[1].title).toBe('Video 1');
        });
    });

    describe('POST /video/approve - Approve Video', () => {
        let testVideo;

        beforeEach(async () => {
            testVideo = await db.Video.create({
                title: 'Test Video for Approval',
                conference: 'TestConf',
                language: 'English',
                date: '2024-01-15',
                url: 'https://example.com/video.mp4',
                name: 'Test User',
                email: 'test@example.com',
                status: 'pending'
            });
        });

        it('should approve a pending video successfully', async () => {
            const res = await request(app)
                .post('/video/approve')
                .send({ id: testVideo.id })
                .expect(202);

            expect(res.body.code).toBe(202);
            expect(res.body.data).toContain('accepted');

            // Verify video status was updated
            await testVideo.reload();
            expect(testVideo.status).toBe('approved');
            expect(testVideo.slug).toBeTruthy();
        });

        it('should return error when video ID is missing', async () => {
            const res = await request(app)
                .post('/video/approve')
                .send({})
                .expect(404);

            expect(res.body.message).toBe('Missing some required fields !');
        });

        it('should return error when video is not found', async () => {
            const res = await request(app)
                .post('/video/approve')
                .send({ id: 'non-existent-id' })
                .expect(404);

            expect(res.body.message).toBe('Video not found');
        });

        it('should return error when trying to approve already approved video', async () => {
            // Set video status to approved
            testVideo.status = 'approved';
            await testVideo.save();

            const res = await request(app)
                .post('/video/approve')
                .send({ id: testVideo.id })
                .expect(406);

            expect(res.body.message).toBe('Cannot approve already approved video !');
        });

        it('should return error when trying to approve rejected video', async () => {
            // Set video status to rejected
            testVideo.status = 'rejected';
            await testVideo.save();

            const res = await request(app)
                .post('/video/approve')
                .send({ id: testVideo.id })
                .expect(406);

            expect(res.body.message).toBe('Cannot approve already rejected video !');
        });
    });

    describe('POST /video/reject - Reject Video', () => {
        let testVideo;

        beforeEach(async () => {
            testVideo = await db.Video.create({
                title: 'Test Video for Rejection',
                conference: 'TestConf',
                language: 'English',
                date: '2024-01-15',
                url: 'https://example.com/video.mp4',
                name: 'Test User',
                email: 'test@example.com',
                status: 'pending'
            });
        });

        it('should reject a pending video successfully', async () => {
            const res = await request(app)
                .post('/video/reject')
                .send({ id: testVideo.id })
                .expect(200);

            expect(res.body.code).toBe(200);
            expect(res.body.data).toBe('Rejected Video Sucessfully');

            // Verify video status was updated
            await testVideo.reload();
            expect(testVideo.status).toBe('rejected');
        });

        it('should return error when video ID is missing', async () => {
            const res = await request(app)
                .post('/video/reject')
                .send({})
                .expect(404);

            expect(res.body.message).toBe('Missing some required fields !');
        });

        it('should return error when video is not found', async () => {
            const res = await request(app)
                .post('/video/reject')
                .send({ id: 'non-existent-id' })
                .expect(404);

            expect(res.body.message).toBe('Video not found');
        });

        it('should return error when trying to reject already approved video', async () => {
            // Set video status to approved
            testVideo.status = 'approved';
            await testVideo.save();

            const res = await request(app)
                .post('/video/reject')
                .send({ id: testVideo.id })
                .expect(406);

            expect(res.body.message).toBe('Cannot reject already approved video !');
        });

        it('should return error when trying to reject already rejected video', async () => {
            // Set video status to rejected  
            testVideo.status = 'rejected';
            await testVideo.save();

            const res = await request(app)
                .post('/video/reject')
                .send({ id: testVideo.id })
                .expect(406);

            expect(res.body.message).toBe('Cannot reject already rejected video !');
        });
    });
}); 