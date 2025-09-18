const { google } = require('googleapis');

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
    const { folderId } = event.queryStringParameters || {};
    if (!folderId) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing folderId parameter' })
      };
    }

    const drive = driveClient();

    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`,
      fields: 'files(id, name, mimeType, thumbnailLink)',
      orderBy: 'createdTime desc',
      pageSize: 1000
    });

    const files = response.data.files || [];

    const photos = files.map(f => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      // Use thumbnail URL - much more reliable
      url: f.thumbnailLink || `https://drive.google.com/thumbnail?id=${f.id}&sz=w400`
    }));

    return {
      statusCode: 200,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(photos)
    };

  } catch (error) {
    console.error('simple-gallery-data error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to load photos', details: error.message })
    };
  }
};