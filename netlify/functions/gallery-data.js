// netlify/functions/gallery-data.js
const { google } = require('googleapis');

exports.handler = async (event, context) => {
  try {
    // 1. Which event?
    const params = event.queryStringParameters || {};
    const eventId = params.eventId;
    if (!eventId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing eventId' }),
      };
    }

    // 2. Map eventId -> folder ID from env
    const folderMap = {
      'aavishar': process.env.AAVISHAR_FOLDER_ID,
      'abhivyakthi': process.env.ABHIVYAKTHI_FOLDER_ID,
      'code-to-circuit': process.env.CODE_TO_CIRCUIT_FOLDER_ID,
      'cultural': process.env.CULTURAL_FOLDER_ID,
      'sports': process.env.SPORTS_FOLDER_ID,
      'workshops': process.env.WORKSHOPS_FOLDER_ID,
      'competitions': process.env.COMPETITIONS_FOLDER_ID,
    };

    const folderId = folderMap[eventId];
    if (!folderId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid eventId' }),
      };
    }

    // 3. Google auth
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    const drive = google.drive({ version: 'v3', auth });

    // 4. List files in folder
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType)',
    });

    const files = res.data.files || [];

    // 5. Build public URLs
    const urls = files.map(f => ({
      id: f.id,
      name: f.name,
      publicUrl: `https://drive.google.com/uc?id=${f.id}`,
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(urls),
    };
  } catch (err) {
    console.error('gallery-data error', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};