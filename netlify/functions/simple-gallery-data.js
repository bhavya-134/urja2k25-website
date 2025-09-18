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

    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`,
      fields: 'files(id, name, mimeType)',
      orderBy: 'createdTime desc'
    });

    const files = response.data.files || [];
    
    // Alternative version that gets file content directly
    const photos = [];
    for (const file of files) {
      try {
        // Make sure file is public
        await drive.permissions.create({
          fileId: file.id,
          resource: { role: 'reader', type: 'anyone' }
        });
        
        // Use direct content URL
        photos.push({
          id: file.id,
          name: file.name,
          url: `https://lh3.googleusercontent.com/d/${file.id}=w800-h600`
        });
      } catch (err) {
        console.log(`Error with file ${file.id}: ${err.message}`);
      }
    }

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