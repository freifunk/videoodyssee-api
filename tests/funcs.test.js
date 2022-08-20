require('dotenv').config()
const { triggerPipeline, instance } = require('../utils/funcs');
const MockAdapter = require("axios-mock-adapter");
const mock = new MockAdapter(instance);
mock.onPost().reply(209, {
    message: 'Request to schedule pipeline processing-pipeline accepted'
});



it("triggerPipeline function", async () => {
    const data = {
        id: 1,
        title: 'title',
        subtitle: 'subtile',
        url: 'http://techslides.com/demos/sample-videos/small.mp4',
        name: 'vijay',
        email: 'vijay@gmail.com'
    }
    const response = await triggerPipeline(data);
    expect(response.data.message).toContain('accepted');
});