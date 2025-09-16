const nodemailer = require('nodemailer');

const verificationCodes = new Map();

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email, authorizedEvents } = JSON.parse(event.body);
    const code = generateCode();
    verificationCodes.set(email, {
      code,
      timestamp: Date.now(),
      authorizedEvents
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'URJA Gallery Upload Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff;">URJA Gallery Upload Verification</h2>
          <p>Your verification code is:</p>
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px;">
            <h1 style="color: #007bff; font-size: 2em; margin: 0;">${code}</h1>
          </div>
          <p>This code expires in 10 minutes.</p>
        </div>
      `
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to send verification code' })
    };
  }
};