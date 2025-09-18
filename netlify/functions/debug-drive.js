const { google } = require('googleapis');

exports.handler = async (event) => {
  try {
    const folderId = '1O7_zJIocqBOdBJTPbesLq7O9vVLXe5_M';

    const key = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      key,
      ['https://www.googleapis.com/auth/drive.readonly']
    );

    const drive = google.drive({ version: 'v3', auth });

    // Get ALL files in folder (not just images)
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, size, createdTime)',
      pageSize: 100
    });

    const allFiles = response.data.files || [];

    // Separate images from other files
    const imageFiles = allFiles.filter(f => f.mimeType && f.mimeType.includes('image/'));
    const otherFiles = allFiles.filter(f => !f.mimeType || !f.mimeType.includes('image/'));

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        folderId: folderId,
        totalFiles: allFiles.length,
        imageFiles: imageFiles.length,
        otherFiles: otherFiles.length,
        allFiles: allFiles.map(f => ({
          name: f.name,
          mimeType: f.mimeType,
          id: f.id,
          size: f.size
        })),
        imageFilesDetails: imageFiles,
        queryUsed: `'${folderId}' in parents and trashed = false`
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.message,
        stack: error.stack
      })
    };
  }
};