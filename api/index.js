const handler = require('../server');

// Vercel rewrites every /api/* URL to this function and passes the original
// route in __path so the existing REST router can handle it.
module.exports = (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const apiPath = requestUrl.searchParams.get('__path');
  if (apiPath) req.url = `/api/${apiPath}`;
  return handler(req, res);
};
