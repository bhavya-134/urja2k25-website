// verify-code.js
const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
    
    const { token } = JSON.parse(event.body || '{}');
    if (!token) return { statusCode: 400, body: JSON.stringify({ error: 'Missing token' }) };
    
    // Verify the token signed by send-verification
    let payload;
    try {
      payload = jwt.verify(token, process.env.VERIFICATION_SECRET);
    } catch (err) {
      console.error('verify-code jwt error', err);
      return { statusCode: 401, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Invalid or expired token' }) };
    }
    
    // Create a short-lived upload token (10 minutes) used to authorize uploads
    const uploadToken = jwt.sign({ email: payload.email, eventId: payload.eventId }, process.env.VERIFICATION_SECRET, { expiresIn: '10m' });
    
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ uploadToken, email: payload.email, eventId: payload.eventId })
    };
  } catch (err) {
    console.error('verify-code error', err);
    return { statusCode: 500, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Server error' }) };
  }
};