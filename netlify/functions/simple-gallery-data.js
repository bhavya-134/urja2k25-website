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

    // Google Drive API setup
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/drive']
    });

    const drive = google.drive({ version: 'v3', auth });

    // Get files from the folder
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`,
      fields: 'files(id, name, mimeType)',
      orderBy: 'createdTime desc'
    });

    const files = response.data.files || [];
    
    // Convert to public URLs and ensure public access
    const photos = [];
    for (const file of files) {
      try {
        // Make sure file is publicly readable
        await drive.permissions.create({
          fileId: file.id,
          resource: {
            role: 'reader',
            type: 'anyone'
          }
        });
      } catch (permError) {
        console.log(`Permission already exists for ${file.id} or couldn't set: ${permError.message}`);
        // Continue anyway - file might already be public
      }

      photos.push({
        id: file.id,
        name: file.name,
        url: `https://drive.google.com/uc?export=view&id=${file.id}`
      });
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