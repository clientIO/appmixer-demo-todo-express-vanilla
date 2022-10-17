# appmixer-demo-todo-express-vanilla

[Live demo](http://am-demo-todo-express-vanilla.herokuapp.com).

![App](assets/todo-demo-app.png?raw=true "App")

A demo app implemented in ExpressJS and Vanilla JS on FE showcasing Appmixer embedding. The app shows the 3 most common use cases for Appmixer embedding:

## Integration templates

Embed a marketplace of prebuilt integration templates. End user can select a template, fill in the last missing details and run an integration.

![Integrations](assets/todo-demo-app-integrations.png?raw=true "Integrations")
![Wizard](assets/todo-demo-app-wizard.png?raw=true "Wizard")


## Workflow automation

Embed the full featured workflow designer UI allowing the end user to build custom workflow automations.

![Workflow Designer](assets/todo-demo-app-workflow-designer.png?raw=true "Workflow Designer")
![Workflows](assets/todo-demo-app-flows.png?raw=true "Flows")

## Automation actions

Add action buttons anywhere in your application to trigger showing Appmixer Wizard UI for the end user to fill in required fields and start a prebuilt automation.

![Actions](assets/todo-demo-app-actions.png?raw=true "Actions")
![Action Wizard](assets/todo-demo-app-action-wizard.png?raw=true "Action Wizard")

# How to navigate this repository

* `app.js`: Application entry point.
* `appmixer-components/`: Appmixer components working against the Todo demo app API (defined in `routes/api.js`). See [Appmixer Component Basic Structure](https://docs.appmixer.com/appmixer/component-definition/basic-structure) and [Example Component](https://docs.appmixer.com/appmixer/component-definition/example-component) for more details.
* `middleware/`: Todo Demo app authentication middleware.
* `models/`: Todo Demo app data models.
* `public/`: Front-end JavaScript and Stylesheets. The `public/js/automation.js` is especially useful to see how the Appmixer SDK can be used to embed Appmixer in your apps.
* `routes/`: The Todo demo application and API URL routes. The `routes/api.js` is defines the public api-key secured API of the Todo demo application.
* `views/`: The HTML views for the Todo demo application implemented using [EJS](https://ejs.co/). See the `views/automation-*.ejs` files to see the HTML for pages where Appmixer UIs are embedded.

# Deploy

The app can be deployed to any cloud with a NodeJS runtime and MongoDB database. For example, one option is to use the free hosting on Heroku (https://www.heroku.com) with free MongoDB Atlas database (https://www.mongodb.com). The app uses the dotenv (https://github.com/motdotla/dotenv) package to load environment variables from `.env` file located in the root of the project with the following variables:

```
PORT=
MONGO_URI=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
APPMIXER_TEMPLATE_XLSX_GDRIVE_ID=
APPMIXER_TEMPLATE_IMPORT_GOOGLE_SPREADSHEET_ID=
```

## Environment variables

### `PORT`

The application port.

### `MONGO_URI`

MongoDB connection string.

### `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

Google OAuth app credentials. Create an web app OAuth credentials in your Google Developer Console (https://console.developers.google.com/). The credentials are used to let users log in with their Google account in the demo app.

![Google signin](assets/todo-demo-app-google-signin.png?raw=true "Google signin")

Create a Google OAuth web client in your Google Developer console and use the Client ID and Client secret.

![Google OAuth client](assets/todo-demo-app-google-console-oauth-client.png?raw=true "Google OAuth client")
![Google OAuth setting](assets/todo-demo-app-google-console-oauth-setting.png?raw=true "Google OAuth setting")



### `APPMIXER_TEMPLATE_XLSX_GDRIVE_ID`

ID of the Appmixer integration template that the user can run on the "Actions" page for the *"Export To-Do list in MS-Excel file format to Google Drive"* action button.

> Important note: In order to use the integration template below, make sure you have all the modules installed in your Appmixer instance (CSV, Controls, Converters, Google Drive, Email and the Todo Demo app components - see below "Publish Appmixer Components"). Also, make sure that your Google Drive module is configured, i.e. you properly configured the module in the Backoffice > Services by adding "appmixer:google" service configuration with your own `clientId` and `clientSecret` properties pointing to your OAuth credentials in your Google Developer Console. See [Google App Registration documentation](https://docs.appmixer.com/appmixer/app-registration/google) for more details.

To create the integration template in your own Appmixer instance, use the Appmixer CLI command to import the [GDrive XLSX Export template JSON](assets/integration-template-gdrive-xlsx-export.json) file to your Appmixer Studio:

```
$ appmixer url [YOUR_APPMIXER_API_BASE_URL]   # This is only necessary to do once before using the CLI.
$ appmixer login [YOUR_ADMIN_USERNAME]   # This is only necessary to do once before using the CLI.
$ appmixer import assets/integration-template-gdrive-xlsx-export.json
```

(Copy the Flow ID returned from the `appmixer import` command or look up the Flow ID in your Appmixer Studio when opening the flow and reading the Flow ID from the browser address bar.)

You should see the following flow in your Appmixer studio:

![Gdrive XLSX Export Flow](assets/integration-template-gdrive-xlsx-export.png?raw=true "Gdrive XLSX Export Flow")

If you open the Wizard Builder (click on the "Options" arrow next to your flow name in the Studio, then "Wizard Builder"), you should see the pre-configured Wizard for your end-users to customize the details of the integration when they run the integration under their own user context:

![Gdrive XLSX Export Flow Wizard Builder](assets/integration-template-gdrive-xlsx-export-wizard-builder.png?raw=true "Gdrive XLSX Export Flow Wizard Builder")

Don't forget to publish the integration template for your end-users with the "Publish" button in the Wizard Builder. Otherwise, the integration template won't be accessible to your end-users.

Indeed, when an end-user clicks on the action button, they'll be presented with the pre-configured wizard:

![Gdrive XLSX Export Flow Wizard](assets/integration-template-gdrive-xlsx-export-wizard.png?raw=true "Gdrive XLSX Export Flow Wizard")



### `APPMIXER_TEMPLATE_IMPORT_GOOGLE_SPREADSHEET_ID`

ID of the Appmixer integration template that the user can run on the "Actions" page for the *"Import Google Spreadsheet"* action button.

> Important note: In order to use the integration template below, make sure you have all the modules installed in your Appmixer instance (Controls, Google Sheets and the Todo Demo app components - see below "Publish Appmixer Components"). Also, make sure that your Google Sheets module is configured, i.e. you properly configured the module in the Backoffice > Services by adding "appmixer:google" service configuration with your own `clientId` and `clientSecret` properties pointing to your OAuth credentials in your Google Developer Console. See [Google App Registration documentation](https://docs.appmixer.com/appmixer/app-registration/google) for more details.

To create the integration template in your own Appmixer instance, use the Appmixer CLI command to import the [Import GDrive Spreadsheet template JSON](assets/integration-template-gdrive-xlsx-import.json) file to your Appmixer Studio:

```
$ appmixer url [YOUR_APPMIXER_API_BASE_URL]   # This is only necessary to do once before using the CLI.
$ appmixer login [YOUR_ADMIN_USERNAME]  # This is only necessary to do once before using the CLI.
$ appmixer import assets/integration-template-gdrive-xlsx-import.json
```

(Copy the Flow ID returned from the `appmixer import` command or look up the Flow ID in your Appmixer Studio when opening the flow and reading the Flow ID from the browser address bar.)

You should see the following flow in your Appmixer studio:

![Gdrive XLSX Import Flow](assets/integration-template-gdrive-xlsx-import.png?raw=true "Gdrive XLSX Import Flow")

If you open the Wizard Builder (click on the "Options" arrow next to your flow name in the Studio, then "Wizard Builder"), you should see the pre-configured Wizard for your end-users to customize the details of the integration when they run the integration under their own user context:

![Gdrive XLSX Import Flow Wizard Builder](assets/integration-template-gdrive-xlsx-import-wizard-builder.png?raw=true "Gdrive XLSX Import Flow Wizard Builder")

Don't forget to publish the integration template for your end-users with the "Publish" button in the Wizard Builder. Otherwise, the integration template won't be accessible to your end-users.

Indeed, when an end-user clicks on the action button, they'll be presented with the pre-configured wizard:

![Gdrive XLSX Import Flow Wizard](assets/integration-template-gdrive-xlsx-import-wizard.png?raw=true "Gdrive XLSX Import Flow Wizard")



# Publish Appmixer components

See [Appmixer CLI Documentation](https://docs.appmixer.com/appmixer/appmixer-cli/appmixer-cli) for more details.

```
$ appmixer pack appmixer-components
$ appmixer publish appmixer.tododemoapp.zip
```

# License

This demo app is licensed under the [MIT License](https://opensource.org/licenses/MIT).