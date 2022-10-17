'use strict';

module.exports = {

    async receive(context) {

        const { apiKey } = context.auth;
        const url = context.config.baseUrl + '/todo';

        const { data } = await context.httpRequest.get(url, {
            headers: {
                'X-Api-Key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        return context.sendJson({ todoList: data }, 'out');
    }
};
