// Vercel serverless entry point.
// This wraps the same Express app used locally (backend/app.js) with
// serverless-http, so all existing routes/controllers/middleware work
// unchanged. Local dev still uses backend/server.js + app.listen().
const serverless = require('serverless-http');
const app = require('../backend/app');

module.exports = serverless(app);
