# FarmWise Desktop

This package wraps the existing FarmWise frontend in an Electron app so it can run locally as a desktop application.

## Run locally

1. From the project root:
   npm install
2. Start the app:
   npm run desktop

The app loads the live web frontend by default:
https://farmwise-6xtcdq5p5-prosperous-kls-projects.vercel.app

You can override the URL with an environment variable:

FARMWISE_WEB_URL=https://your-local-frontend-url npm run desktop

## Notes

- This wrapper does not replace the backend.
- It calls the same FarmWise API endpoints as the web app.
- The desktop app is a shell around the existing frontend, which is the fastest way to package the system without a full reimplementation.
