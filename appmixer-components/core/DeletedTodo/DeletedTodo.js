'use strict';

module.exports = {

    async receive(context) {

        if (context.messages.webhook) {
            const data = context.messages.webhook.content.data;
            if (data.event === 'todo-deleted') {
                return context.sendJson(data.data, 'out');
            }
        }
    },

    async start(context) {

        const { apiKey } = context.auth;
        const url = context.config.baseUrl + '/webhooks';

        const { data } = await context.httpRequest.post(url, { url: context.getWebhookUrl() }, {
            headers: {
                'X-Api-Key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        return context.saveState({ _id: data._id });
    },

    async stop(context) {

        const { apiKey } = context.auth;
        const url = context.config.baseUrl + '/webhooks';

        return context.httpRequest.delete(url + '/' + context.state._id, {
            headers: {
                'X-Api-Key': apiKey
            }
        });
    }
};
