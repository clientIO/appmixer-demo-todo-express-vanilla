'use strict';

module.exports = {

    async receive(context) {

        const { apiKey } = context.auth;
        const { item, status } = context.messages.in.content;
        const url = context.config.baseUrl + '/todo';

        const { data } = await context.httpRequest.post(url, { item, status }, {
            headers: {
                'X-Api-Key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        return context.sendJson(data, 'out');
    }
};
