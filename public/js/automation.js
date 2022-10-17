const BASE_URL = 'https://api.qa.appmixer.com';

const appmixer = new Appmixer({ baseUrl: BASE_URL });

// See https://docs.appmixer.com/appmixer/customizing-ui/custom-theme.
appmixer.set('theme', {
    variables: {
        font: {
            family: 'Roboto,sans-serif',
            familyMono: '\'SF Mono\', \'ui-monospace\', Menlo, monospace',
            weightRegular: 300,
            weightMedium: 400,
            weightSemibold: 500,
            size: 16
        },
        colors: {
            base: '#FFFFFF',
            neutral: '#000000',
            focus: '#1266f1',
            error: '#DE3123',
            warning: '#B56C09',
            success: '#00b74a',
            modifier: '#C558CF',
            highlighter: '#FFA500'
        },
        shadows: {
            backdrop: 'rgba(0 0 0 / 6%)',
            popover: '0 3px 9px rgba(0 0 0 / 12%)',
            icon: '0 1px 3px rgb(0 0 0 / 6%)'
        },
        corners: {
            radiusSmall: '4px',
            radiusMedium: '6px',
            radiusLarge: '9px'
        },
        dividers: {
            regular: '1px',
            medium: '2px',
            semibold: '3px',
            bold: '6px',
            extrabold: '9px'
        }
    }
});

async function getUserProfile() {

    const res = await fetch('/api/me');
    return res.json();
}

async function ensureAppmixerVirtualUser() {

    const userinfo = await getUserProfile();
    const apiKey = userinfo.apiKey;
    // Appmixer username can be any, even non-existing, email address. We're using the user ID
    // together with a fictional domain name. Appmixer does not send anything to these email addresses.
    // They are just used as a virtual user credentials pair.
    const appmixerUserUsername = userinfo._id + '@appmixertodoapp.com';
    // For simplicity, we just use the user API key as the Appmixer virtual user password. Alternatively,
    // you can use any random string as the password.
    const appmixerUserPassword = apiKey;

    let auth;
    try {
        auth = await appmixer.api.authenticateUser(appmixerUserUsername, appmixerUserPassword);
        appmixer.set('accessToken', auth.token);
    } catch (err) {
        if (err.response && err.response.status === 403) {
            // Virtual user not yet created in Appmixer. Create one.
            try {
                auth = await appmixer.api.signupUser(appmixerUserUsername, appmixerUserPassword);
                appmixer.set('accessToken', auth.token);
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
    // the user does not have to authenticate to Todo App in Appmixer Integrations/Wizard again. This would not make sense since the
    // user is already signed in and so we don't want to request their API key again in Appmixer Wizard. Instead, assuming
    // we know the user API key here, we can automatically inject their account to Appmixer.
    // See https://docs.appmixer.com/appmixer/tutorials/integration-templates#injecting-user-accounts for details.

    const APPMIXER_COMPONENTS_BUNDLE = 'appmixer.tododemoapp';
    const serviceAuth = await appmixer.api.getAuth(APPMIXER_COMPONENTS_BUNDLE);
    // Check if the user has a valid account (i.e. if we already injected their account in the past or not).
    const validAccount = serviceAuth.accounts && serviceAuth.accounts[Object.keys(serviceAuth.accounts)[0]].accessTokenValid === true;

    if (!validAccount) {
        await appmixer.api.createAccount(
            // Setting requestProfileInfo to false makes Appmixer bypass requesting user profile from the TodoApp API.
            // Instead, we provide the user profile info (profileInfo) directly.
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

// Page /automation/flows
async function showFlows() {

    await ensureAppmixerVirtualUser();

    const flowManager = appmixer.ui.FlowManager({
        el: '#my-flowmanager',
        options: {
            menu: [ { label: 'Delete', event: 'flow:remove' } ],
            customFilter: {
                userId: appmixer.get('user').id, // Show only my flows.
                'wizard.fields': '!'     // Filter out integration templates (i.e. flows that have a Wizard defined).
            }
        }
    });
    const designer = appmixer.ui.Designer({
        el: '#my-designer',
        options: {
            showHeader: true,
            showButtonHome: false,
            showButtonInsights: false,
            showButtonConnectors: false,
            menu: [
                { event: 'flow:rename', label: 'Rename' }
            ],
            toolbar: [
                ['undo', 'redo'],
                ['zoom-to-fit', 'zoom-in', 'zoom-out'],
                ['logs']
            ]
        }
    });

    // Note: flow:start, flow:stop, flow:remove is handled implicitely since we're not overriding the behaviour here.

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

    flowManager.open();
}

// Page /automation/integrations
async function showIntegrations() {

    await ensureAppmixerVirtualUser();

    const integrations = appmixer.ui.Integrations({
        el: '#my-integrations',
        options: {
            customFilter: {
                'sharedWith.0.domain': 'appmixertodoapp.com'
            }
        }
    });

    const wizard = appmixer.ui.Wizard();

    wizard.on('flow:start', async (flowId) => {
        wizard.state('loader', true);
        appmixer.api.startFlow(flowId).then(() => {
            wizard.state('loader', false);
            wizard.close();
            integrations.reload();
        }).catch((error) => {
            wizard.state('error', 'Starting flow failed.');
        });
    });

    integrations.on('integration:create', async (templateId) => {
        wizard.close();
        wizard.set('flowId', templateId);
        wizard.open();
    });

    integrations.on('integration:edit', (integrationId) => {
        wizard.close();
        wizard.set('flowId', integrationId);
        wizard.open();
    });
    integrations.open();
}

// Page /automation/actions
async function initializeActions() {

    const actionButtons = document.querySelectorAll('[data-appmixer-template-id]');
    // Disable action buttons until the virtual user is created to make sure the user can't click them before proper initialization.
    actionButtons.forEach(btn => btn.disabled = true);
    await ensureAppmixerVirtualUser();
    actionButtons.forEach(btn => btn.disabled = false);

    const wizard = appmixer.ui.Wizard();

    actionButtons.forEach(btn => btn.addEventListener('click', async (evt) => {

        evt.stopPropagation();
        evt.preventDefault();

        // Each button has a data-appmixer-template-id attribute that points to the integration template we want to run
        // when the user clicks the action button.
        const templateId = evt.target.dataset.appmixerTemplateId;

        wizard.close();
        wizard.set('flowId', templateId);
        wizard.open();
    }));
}

// Page /automation/logs
async function showLogs() {

    await ensureAppmixerVirtualUser();
    const logs = appmixer.ui.InsightsLogs({ el: '#my-logs' });
    logs.open();
}

function onerror(err) {

    alert(err);
}
