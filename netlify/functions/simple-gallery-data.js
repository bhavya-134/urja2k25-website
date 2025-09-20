// netlify/functions/simple-gallery-data.js
const { google } = require('googleapis');

exports.handler = async (event, context) => {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { folderId } = event.queryStringParameters || {};
    
    if (!folderId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'folderId is required' })
      };
    }

    // Initialize Google Drive API with service account
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });

    const drive = google.drive({ version: 'v3', auth });

    // Get files from the specified folder
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`,
      fields: 'files(id, name, mimeType, size)',
      orderBy: 'name'
    });

    const files = response.data.files || [];

    // FIXED: Use public-accessible Google Drive URLs instead of thumbnail URLs
    const photos = files.map(file => ({
      name: file.name,
      // OLD (BROKEN): url: `https://drive.google.com/thumbnail?id=${file.id}&sz=w800`
      // NEW (WORKING): Use lh3.googleusercontent.com for public access
      url: `https://lh3.googleusercontent.com/d/${file.id}=s800-c`
      // Alternative that also works: url: `https://drive.google.com/uc?export=view&id=${file.id}`
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(photos)
    };

  } catch (error) {
    console.error('Error fetching photos:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch photos',
        details: error.message 
      })
    };
  }
};