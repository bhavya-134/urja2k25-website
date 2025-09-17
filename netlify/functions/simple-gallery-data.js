// netlify/functions/simple-gallery-data.js
const { google } = require('googleapis');

function folderIdForEvent(eventId) {
  if (!eventId) return null;
  const map = {
    'aavishar': process.env.AAVISHAR_FOLDER_ID,
    'abhivyakthi': process.env.ABHIVYAKTHI_FOLDER_ID,
    'code-to-circuit': process.env.CODE_TO_CIRCUIT_FOLDER_ID,
    'cultural': process.env.CULTURAL_FOLDER_ID,
    'sports': process.env.SPORTS_FOLDER_ID,
    'workshops': process.env.WORKSHOPS_FOLDER_ID,
    'competitions': process.env.COMPETITIONS_FOLDER_ID
  };
  return map[eventId] || null;
}

function driveClient() {
  const key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  const auth = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    null,
    key,
    ['https://www.googleapis.com/auth/drive.readonly']
  );
  return google.drive({ version: 'v3', auth });
}

exports.handler = async (event) => {
  try {
    const qs = event.queryStringParameters || {};
    // support either folderId (direct) or eventId (friendly)
    let folderId = qs.folderId || '';
    if (!folderId && qs.eventId) folderId = folderIdForEvent(qs.eventId);

    if (!folderId) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing folderId or eventId (and no env mapping found)' })
      };
    }

    const drive = driveClient();

    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`,
      fields: 'files(id, name, mimeType, thumbnailLink, webViewLink)',
      orderBy: 'createdTime desc',
      pageSize: 1000
    });

    const files = response.data.files || [];

    const photos = files.map(f => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      webViewLink: f.webViewLink,
      thumbnailLink: f.thumbnailLink,
      // direct view URL
      url: `https://drive.google.com/uc?export=view&id=${f.id}`
    }));

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
      body: JSON.stringify(photos)
    };

  } catch (error) {
    console.error('simple-gallery-data error:', error && (error.message || error));
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to load photos', details: (error && error.message) })
    };
  }
};