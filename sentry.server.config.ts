// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { openAIIntegration } from "@sentry/nextjs";

Sentry.init({
  dsn: "https://0a622ac6184894cfcdda1ebe5e87d6c9@o4511671546085376.ingest.us.sentry.io/4511671653498880",


  integrations: [Sentry.vercelAIIntegration({
    recordInputs: true,
    recordOutputs: true,
  }),
  Sentry.consoleLoggingIntegration({
    levels: ["log", "warn", "error"]
  })
],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
