'use strict';

module.exports = {

    async receive(context) {

        const { apiKey } = context.auth;
        const { item } = context.messages.in.content;
        const url = context.config.baseUrl + '/todo';

        const { data } = await context.httpRequest.post(url, { item }, {
            headers: {
                'X-Api-Key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        return context.sendJson(data, 'out');
    }
};
