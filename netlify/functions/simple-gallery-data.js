// netlify/functions/simple-gallery-data.js
const { google } = require('googleapis');

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

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/drive']
    });

    const drive = google.drive({ version: 'v3', auth });

    // Get files from the folder
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`,
      fields: 'files(id, name, mimeType, thumbnailLink)',
      orderBy: 'createdTime desc'
    });

    const files = response.data.files || [];
    
    // Use thumbnail URLs which are more reliable for display
    const photos = files.map(file => ({
      id: file.id,
      name: file.name,
      // Use the thumbnail URL with a larger size parameter
      url: file.thumbnailLink ? file.thumbnailLink.replace('=s220', '=s800') : `https://drive.google.com/thumbnail?id=${file.id}&sz=w800-h600`
    }));

    return {
      statusCode: 200,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(photos)
    };

  } catch (error) {
    console.error('Gallery data error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to load photos' })
    };
  }
};