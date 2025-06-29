const { app, server } = require('../../server');
const request = require('supertest');
const { instance } = require('../../utils/funcs');
const MockAdapter = require("axios-mock-adapter");
const mock = new MockAdapter(instance);
const { dbSync } = require('../../db/db')
mock.onPost().reply(209, {
    message: 'Request to schedule pipeline processing-pipeline accepted'
});


describe('API routes', function () {
    beforeAll(()=>{
        return dbSync;
    })
    afterAll(done => {
        if (server) {
            server.close();
        }
        done();
    });

    it('triggers pipeline', async function () {
        const res = await request(app)
            .post('/pipeline/trigger')
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .send({
                title: 'title',
                event:'Freifunk summit',
                date:'21-01-2022',
                language:'German',
                persons:['vijay','Andi'],
                tags:['test','videoodyssee'],
                subtitle: 'subtile',
                url: 'http://techslides.com/demos/sample-videos/small.mp4',
                name: 'vijay',
                email: 'vijay@gmail.com'
            });
        expect(res.body.message).toContain('accepted');

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