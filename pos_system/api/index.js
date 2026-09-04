// Vercel serverless entry point.
// Vercel's Node.js runtime can invoke an Express app directly —
// no need to wrap it in serverless-http (that's for AWS Lambda).
const app = require('../backend/app');

module.exports = app;