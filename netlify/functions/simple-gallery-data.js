// Updated simple-gallery-data.js with better URL options
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
    
    // First, let's check if we can access the folder at all
    try {
      await drive.files.get({ fileId: folderId });
    } catch (folderError) {
      console.error('Cannot access folder:', folderId, folderError.message);
      return {
        statusCode: 403,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          error: 'Cannot access folder. Check if folder is shared publicly.',
          folderId: folderId,
          details: folderError.message
        })
      };
    }
    
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`,
      fields: 'files(id, name, mimeType, webViewLink, webContentLink, thumbnailLink, permissions)',
      orderBy: 'createdTime desc',
      pageSize: 1000
    });
    
    const files = response.data.files || [];
    console.log(`Found ${files.length} images in folder ${folderId}`);
    
    const photos = files.map(f => {
      // Provide multiple URL options for debugging
      const urls = {
        // Standard direct view (requires public sharing)
        directView: `https://drive.google.com/uc?export=view&id=${f.id}`,
        
        // Thumbnail (often works even with restricted sharing)
        thumbnail: f.thumbnailLink,
        
        // Alternative direct link format
        altDirect: `https://drive.google.com/file/d/${f.id}/view`,
        
        // Web view link (opens in Drive interface)
        webView: f.webViewLink
      };
      
      return {
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        
        // Use Google Drive embed URL - more reliable than direct view
        url: `https://drive.google.com/thumbnail?id=${f.id}&sz=w400`,
        
        // Include all URL options for debugging
        urls: urls,
        
        // Debug info
        hasPermissions: f.permissions ? f.permissions.length : 0
      };
    });
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({
        photos: photos,
        debug: {
          folderAccess: 'success',
          totalFiles: files.length,
          sampleUrls: photos.slice(0, 2).map(p => p.urls)
        }
      })
    };
    
  } catch (error) {
    console.error('simple-gallery-data error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to load photos',
        details: error.message,
        stack: error.stack
      })
    };
  }
};