// send-verification.js
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
    
    const { email, eventId } = JSON.parse(event.body || '{}');
    if (!email || !eventId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing email or eventId' }) };
    }
    
    // Optional domain restriction (ENV: AUTHORIZED_DOMAINS = example.edu,another.edu)
    if (process.env.AUTHORIZED_DOMAINS) {
      const allowed = process.env.AUTHORIZED_DOMAINS.split(',').map(s => s.trim().toLowerCase());
      const domain = (email.split('@')[1] || '').toLowerCase();
      if (!allowed.includes(domain)) {
        return { statusCode: 403, body: JSON.stringify({ error: 'Email domain not authorized' }) };
      }
    }
    
    // create a JWT token (stateless verification). expires in 15 minutes
    const token = jwt.sign({ email, eventId }, process.env.VERIFICATION_SECRET, { expiresIn: '15m' });
    
    // Build a link for convenience (set SITE_URL in Netlify to your site base like https://urja2k25.netlify.app)
    const site = process.env.SITE_URL || process.env.URL || '';
    const link = site ? `${site.replace(/\/$/, '')}/gallery.html?token=${encodeURIComponent(token)}` : null;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'URJA — Upload verification',
      text: `You requested to upload photos for "${eventId}".\n\nUse this token (valid 15 minutes):\n\n${token}\n\nOr click this link to open the upload page with the token:\n${link || '(copy the token into the upload page)'}\n\nIf you did not request this, ignore this email.`,
      html: `<p>You requested to upload photos for <strong>${eventId}</strong>.</p>
             <p><b>Token (valid 15 min):</b></p>
             <pre style="word-break:break-all;">${token}</pre>
             <p>Or click to open the upload page: ${ link ? `<a href="${link}">Verify & Upload</a>` : 'No site URL configured' }</p>
             <p>If you did not request this, ignore this email.</p>`
    };
    
    await transporter.sendMail(mailOptions);
    
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, message: 'Verification email sent' })
    };
  } catch (err) {
    console.error('send-verification error', err);
    return { statusCode: 500, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Server error' }) };
  }
};