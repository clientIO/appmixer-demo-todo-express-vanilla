'use strict';

module.exports = {

    type: 'apiKey',

    definition: {

        auth: {
            apiKey: {
                type: 'text',
                name: 'API Key',
                tooltip: 'Your Todo app account API key.'
            }
        },

        validate: {
            method: 'GET',
            url: '{{config.baseUrl}}/me',
            headers: {
                'X-Api-Key': '{{apiKey}}'
            }
        }
    }
};
