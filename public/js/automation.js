const BASE_URL = 'https://api.qa.appmixer.com';

const appmixer = new Appmixer({ baseUrl: BASE_URL });

async function getUserProfile() {
    const res = await fetch('/api/me');
    return res.json();
}

async function ensureAppmixerVirtualUser() {

    const userinfo = await getUserProfile();
    const apiKey = userinfo.apiKey;
    const appmixerUserUsername = userinfo._id + '@appmixertodoapp.com';
    const appmixerUserPassword = apiKey;

    let auth;
    try {
        auth = await appmixer.api.authenticateUser(appmixerUserUsername, appmixerUserPassword);
        appmixer.set('accessToken', auth.token);
    } catch (err) {
        if (err.response && err.response.status === 403) {
            // Virtual user not yet created in Appmixer. Create one with a random password and save the password in YOUR system
            // so that you can authenticate the user later.
            try {
                auth = await appmixer.api.signupUser(appmixerUserUsername, appmixerUserPassword);
                appmixer.set('accessToken', auth.token);
                // Inject api key as an account to the Appmixer virtual user.
                //await appmixer.api.getAccounts({ filter: 'service:slack' });
            } catch (err) {
                onerror(err);
            }
        } else {
            onerror('Something went wrong.');
        }
    }

    await ensureAppmixerTodoAppServiceAccount(apiKey);
}

async function ensureAppmixerTodoAppServiceAccount(apiKey) {

    // This function makes sure that the user has their own Todo App user account registered with Appmixer. This is useful so that
    // the user does not have to authenticate to Todo App in Appmixer Integratins/Wizard again. This would not make sense since the
    // user is already signed in and so we don't want to request their API key again in Appmixer Wizard. Instead, assuming
    // we know the user API key here, we can automatically inject their account to Appmixer.
    // See https://docs.appmixer.com/appmixer/tutorials/integration-templates#injecting-user-accounts for details.

    const serviceAuth = await appmixer.api.getAuth('appmixer.tododemoapp');
    const validAccount = serviceAuth.accounts && serviceAuth.accounts[Object.keys(serviceAuth.accounts)[0]].accessTokenValid === true;

    if (!validAccount) {
        await appmixer.api.createAccount(
            // Setting requestProfileInfo to false makes Appmixer bypass requesting user profile from the TodoApp API.
            // Instead, we provide the use profile info (profileInfo) directly.
            { requestProfileInfo: false },
            {
                name: 'Your Account',
                service: 'appmixer:tododemoapp',
                token: { apiKey },
                profileInfo: { id: 'TodoApp' }
            }
        );
    }
}

async function showFlows() {

    await ensureAppmixerVirtualUser();

    const flowManager = appmixer.ui.FlowManager({
        el: '#my-flowmanager',
        options: {
            menu: [ { label: 'Delete', event: 'flow:remove' } ],
            customFilter: {
                sharedWith: []
            }
        }
    });
    /*
    flowManager.state('query', {
        shared: false
    });
    */
    const designer = appmixer.ui.Designer({
        el: '#my-designer',
        options: {
            showHeader: true,
            showButtonHome: false,
            showButtonInsights: false,
            showButtonConnectors: false,
            menu: [
                { event: 'flow:rename', label: 'Rename' }
            ]
        }
    });

    // Note: flow:start, flow:stop is handled implicitely since we're not overriding the behaviour here.

    flowManager.on('flow:create', async () => {
        try {
            flowManager.state('loader', true);
            const flowId = await appmixer.api.createFlow('New flow');
            flowManager.state('loader', false);
            designer.set('flowId', flowId);
            flowManager.close();
            designer.open();
        } catch (err) { onerror(err) }
    });

    flowManager.on('flow:open', (flowId) => {
        designer.set('flowId', flowId);
        flowManager.close();
        designer.open();
    });

    flowManager.on('flow:remove', async (flowId) => {
        try {
            flowManager.state('loader', true);
            await appmixer.api.deleteFlow(flowId);
            flowManager.state('loader', false);
            flowManager.reload();
        } catch (err) { onerror(err) }
    });

    flowManager.open();
}

let wizard;

function openWizard(integrationId, deleteOnClose, onChange) {

    const btnCloseWizard = document.querySelector('.btn-close-wizard');

    if (!wizard) {
        wizard = appmixer.ui.Wizard({ el: '#my-wizard' });

        btnCloseWizard.addEventListener('click', async (evt) => {
            if (btnCloseWizard.dataset.newFlowId) {
                // If new configuration was not finished and the user closed the wizard, immediately remove the flow.
                await appmixer.api.deleteFlow(btnCloseWizard.dataset.newFlowId);
                onChange();
            }
            closeWizard(wizard, btnCloseWizard);
        }, false)

        wizard.on('cancel', async () => {
            if (btnCloseWizard.dataset.newFlowId) {
                // If new configuration was not finished and the user closed the wizard, immediately
                // remove the flow.
                await appmixer.api.deleteFlow(btnCloseWizard.dataset.newFlowId);
                onChange();
            }
            closeWizard(wizard, btnCloseWizard);
        });

        wizard.on('flow:start', async (integrationId) => {
            try {
                await appmixer.api.startFlow(integrationId);
                closeWizard(wizard, btnCloseWizard);
                onChange();
            } catch (err) {
                onerror('Integration configuration errors: ' + err);
            }
        });
    }

    if (deleteOnClose) {
        btnCloseWizard.dataset.newFlowId = integrationId;
    }
    wizard.set('flowId', integrationId);
    wizard.open();
    var containerEl = document.querySelector('#my-wizard-container');
    containerEl.style.display = 'block';
}

function closeWizard(wizard, btnCloseWizard) {
    wizard.close();
    var containerEl = document.querySelector('#my-wizard-container');
    containerEl.style.display = 'none';
    btnCloseWizard.dataset.newFlowId = '';
}


async function showIntegrations() {

    await ensureAppmixerVirtualUser();

    const integrations = appmixer.ui.Integrations({ el: '#my-integrations' });

    integrations.on('integration:create', async (templateId) => {
        const integrationId = await appmixer.api.cloneFlow(templateId, { connectAccounts: false });
        await appmixer.api.updateFlow(integrationId, { templateId: templateId });
        integrations.reload();
        openWizard(integrationId, true, () => integrations.reload());
    });

    integrations.on('integration:edit', (integrationId) => {
        openWizard(integrationId, false, () => integrations.reload());
    });
    integrations.open();
}

async function initializeActions() {

    const actionButtons = document.querySelectorAll('[data-appmixer-template-id]');

    actionButtons.forEach(btn => btn.attributes.disabled = true);
    await ensureAppmixerVirtualUser();
    actionButtons.forEach(btn => btn.attributes.disabled = false);

    actionButtons.forEach(btn => btn.addEventListener('click', async (evt) => {

        evt.stopPropagation();
        evt.preventDefault();

        const btn = evt.target;
        const templateId = btn.dataset.appmixerTemplateId;

        const actionId = await appmixer.api.cloneFlow(templateId, { connectAccounts: false });
        await appmixer.api.updateFlow(actionId, { templateId: templateId });
        openWizard(actionId, true, () => {});
    }));
}

async function showLogs() {

    await ensureAppmixerVirtualUser();

    const logs = appmixer.ui.InsightsLogs({ el: '#my-logs' });
    logs.open();
}

function onerror(err) {
    alert(err);
}
